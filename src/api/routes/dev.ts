import axios from "axios";
import express from "express";
import { Dev } from "../entities/dev";
import { User } from "../entities/user";
import { clearCache } from "../utils/cache";
import { devMiddleware, protectedMiddleware } from "../utils/middleware";
import { stripe } from "../utils/stripe";

// Initialize the router
const router = express.Router();

// Authorize user with GitHub
router.get("/authorize/github", async (req, res) => {
    // Return the authorization URL
    const redirectURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${process.env.FRONTEND_URL}/user/dev/authorize-github`;
    res.status(200).send(redirectURL);
});

// Callback for GitHub authorization
router.post("/authorize/github", async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Extract the code from the body and check it exists
    const { code } = req.body;
    if (typeof code === "undefined")
        return res.status(400).send("Code is missing");

    // Get the access token
    let accessToken;
    try {
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
        accessToken = access_token;
    } catch {
        return res.status(500).send("Unable to get access token");
    }

    // Get the username of the user
    const {
        data: { login: username },
    } = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `token ${accessToken}` },
    });

    // Check if the user already has a dev account
    if (user.dev === null) {
        // Create a new Stripe Connect account for the dev account
        const stripeConnectID = (
            await stripe.accounts.create({
                type: "express",
            })
        ).id;

        // Make a new dev account for the user
        // **** BROKEN !!!!!
        const dev = Dev.create({
            ghAccessToken: accessToken,
            ghUsername: username,
            stripeConnectID,
            user,
        });
        await dev.save();
        // user.dev = dev;
        // await user.save();
    } else {
        // Update the users existing dev account
        user.dev.ghAccessToken = accessToken;
        user.dev.ghUsername = username;
        await user.dev.save();
    }

    // Clear the cache
    clearCache(`user:${user.id}`);

    // Return success
    res.sendStatus(200);
});

// Verify that a user is a developer
router.get(
    "/is-authorized",
    protectedMiddleware,
    devMiddleware,
    async (req, res) => {
        res.sendStatus(200);
    }
);

// Export the router
export default router;
