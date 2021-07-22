import express from "express";
import { createConnection } from "typeorm";
import { User } from "./entities/user";
import axios from "axios";
import { Dev } from "./entities/dev";
import cookieParser from "cookie-parser";
import cors from "cors";
import { cacheData } from "./utils/cache";
import { App } from "./entities/app";
import { registerSchema } from "./utils/joiSchema";

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
    entities: [User, Dev, App],
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

        // Get the user
        const user = await cacheData(EXPIRY, `dev-all:${userID}`, async () => {
            return await User.findOne(userID);
        });

        // Set the user data on the request
        // @ts-ignore
        req.locals = { user };

        // Go to the next route
        next();
    } catch (e) {
        // Return error code
        return res.sendStatus(e.response.status);
    }
});

// Authorize user with GitHub
app.get("/dev/authorize/github", async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // If the user is already connected then return error
    if (typeof user.dev !== "undefined")
        return res.status(400).end("GitHub account already connected");

    // Declare the rediret URL
    const redirectURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=http://localhost:5000/dev/authorize/github/callback&scope=repo`;

    // Redirect the user to GitHub
    res.redirect(redirectURL);
});

// Callback for GitHub authorization
app.get("/dev/authorize/github/callback", async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // If the user is already connected then return error
    if (typeof user.dev !== "undefined")
        return res.status(400).end("GitHub account already connected");

    // Extract the code from the callback
    const { code } = req.query;

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

    // Make a new dev account for the user
    const dev = Dev.create({
        token: access_token,
        ghUsername: username,
        user,
    });
    await dev.save();

    // Update the users dev account
    await User.update(user.id, { dev });

    // Return success
    return res.sendStatus(200);
});

// **** Come up with a better system of allowing a user to connect their accounts (whats wrong with letting them reset ?)

// Add an app
app.post("/dev/app/create", async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Check that the user has a dev account
    if (typeof user.dev === "undefined")
        return res.status(400).end("A dev account is required");

    // Get the data for the app
    const {
        name,
        title,
        description,
        price,
    }: { name: string; title: string; description: string; price: number } =
        req.body;

    // Validate the app data
    const { error } = registerSchema.validate({
        name,
        title,
        description,
        price,
    });
    if (error) return res.status(400).end(error.details[0].message);

    // Check that an app with the same name does not exist
    const exists = await cacheData(
        EXPIRY,
        `dev-app-create:${name}`,
        async () => {
            return await App.findOne({ where: { name } });
        }
    );
    if (typeof exists !== "undefined")
        return res.status(400).end("An app with that name already exists");

    // Create a new app and assign it to the dev account
    const app = App.create({ name, title, description, price });
    await app.save();
    let newApps: App[] = [app];
    if (typeof user.apps !== "undefined") newApps = [...user.apps, ...newApps];
    await User.update(user.id, { apps: newApps });

    // Add an app
    res.sendStatus(200);
});

// Edit an app
app.patch("/dev/app/edit", async (req, res) => {
    // Edit an app
    res.sendStatus(200);
});

// Start the server on the specified port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
