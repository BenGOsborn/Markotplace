import express from "express";
import { createConnection } from "typeorm";
import { User } from "./entities/user";
import axios from "axios";
import { Dev } from "./entities/dev";

// Initialize express
const app = express();
app.use(express.json());

// Initialize ORM
createConnection({
    type: "postgres",
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: true,
    entities: [User, Dev],
});

// Initialize the auth middleware
app.use(async (req, res, next) => {
    // Get the authentication URL
    const authURL = `http://${
        process.env.NODE_ENV !== "production" ? "localhost" : "auth"
    }:4000/authenticated`;

    // *** Maybe find a better way of storing sessions without the need for cookies ?
    // Maybe I should use JWT instead of sessions or a hybrid of both for a better stateless experience ?
    console.log(req.cookies);

    try {
        // Get the userID from the user
        const response = await axios.get(authURL);

        console.log(response.data);
    } catch (e) {
        console.log(e.response.data);
        return res.sendStatus(403);
    }

    // Go to the next route
    next();
});

// Authorize user with GitHub
app.get("/authorize/github", async (req, res) => {
    // Declare the rediret URL
    const redirectURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=http://localhost:5000/authorize/github/callback&scope=repo`;

    // Redirect the user to GitHub
    res.redirect(redirectURL);
});

// Callback for GitHub authorization
app.get("/authorize/github/callback", async (req, res) => {
    // Extract the code from the callback
    const { code } = req.query;

    // Get the access token
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

    // **** The response from this should be saved
    // **** It should also track failed requests and then reset the access token auth (should be easy enough)

    // **** Set up webhooks and repository connections
    // **** We also need some way of authenticating here and tracking the users ID (simple stateless middleware)
    // **** Add in a new deployment too

    // Fetch the users GitHub username
    const {
        data: { login: username },
    } = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `token ${access_token}` },
    });

    // The user has to actually enable my app first

    // Fetch the users repositories
    const { data: repos } = await axios.get(
        "https://api.github.com/user/repos",
        {
            headers: { Authorization: `token ${access_token}` },
        }
    );

    // This only gets me a list of public - I NEED PRIVATE TOO
    const repoNames = repos.map((repo: any) => {
        return repo.name;
    });

    res.json({ access_token, username, repoNames });
});

// Start the server on the specified port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
