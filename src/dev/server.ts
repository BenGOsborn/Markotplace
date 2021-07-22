import express from "express";
import { createConnection } from "typeorm";
import { User } from "./entities/user";
import axios from "axios";
import { Dev } from "./entities/dev";
import cookieParser from "cookie-parser";
import cors from "cors";

// Initialize express
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Initialize ORM
createConnection({
    type: "postgres",
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: true,
    entities: [User, Dev],
});

// Initialize constants
const EXPIRY = 60 * 60 * 12;

// Initialize the auth middleware
app.use(async (req, res, next) => {
    // Get the authentication URL
    const authURL = `http://${
        process.env.NODE_ENV !== "production" ? "localhost" : "auth"
    }:4000/user/authorized`;

    try {
        // Get the userID from the user
        const {
            data: { userID },
        } = await axios.get<{ userID: string }>(authURL, {
            headers: { Cookie: `connect.sid=${req.cookies["connect.sid"]}` },
        });

        // Set the userID for the request
        // @ts-ignore
        req.locals = { userID };

        // Go to the next route
        next();
    } catch (e) {
        // Return error code
        return res.sendStatus(e.response.status);
    }
});

// Authorize user with GitHub
app.get("/dev/authorize/github", async (req, res) => {
    // Declare the rediret URL
    const redirectURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=http://localhost:5000/dev/authorize/github/callback&scope=repo`;

    // Redirect the user to GitHub
    res.redirect(redirectURL);
});

// Callback for GitHub authorization
app.get("/dev/authorize/github/callback", async (req, res) => {
    // Extract the code from the callback
    const { code } = req.query;

    // Get the userID from the request
    // @ts-ignore
    const { userID }: { userID: string } = req.locals;

    // // Get the access token
    const {
        data: { access_token },
    } = await axios.post<{
        access_token: string;
        token_type: string;
        scope: string;
    }>(
        "https://github.com/login/oauth/access_token",
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        },
        { headers: { Accept: "application/json" } }
    );

    // **** Set up webhooks and repository connections
    // **** We also need some way of authenticating here and tracking the users ID (simple stateless middleware)
    // **** Add in a new deployment too

    // **** I SHOULD ALSO REDIRECT BACK TO THE CORRECT PAGE

    // Get the username of the user
    // ********* Try and find some way of caching this
    const {
        data: { login: username },
    } = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `token ${access_token}` },
    });

    // Check if the user has a dev account
    const user = await User.findOne(userID);
    if (typeof user?.dev === "undefined") {
        // Make a new dev account for the user
        const dev = Dev.create({
            token: access_token,
            gh_username: username,
            user,
        });
        await dev.save();

        // Update the users dev account
        await User.update(userID, { dev });

        // Return success
        return res.sendStatus(200);
    }

    // Update a users existing dev account
    const devID = user?.dev.id as number;
    await Dev.update(devID, { token: access_token, gh_username: username });

    // Return success
    res.sendStatus(200);
});

// Start the server on the specified port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
