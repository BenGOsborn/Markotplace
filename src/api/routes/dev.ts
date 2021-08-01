import axios from "axios";
import express from "express";
import { Dev } from "../entities/dev";
import { User } from "../entities/user";
import { stripe } from "../utils/stripe";
import { clearCache } from "../utils/cache";

// Initialize the router
const router = express.Router();

// Authorize user with GitHub
router.get("/authorize/github", async (req, res) => {
    // Return the authorization URL
    const redirectURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;
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

        // Get the username of the user
        const {
            data: { login: username },
        } = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `token ${access_token}` },
        });

        // Check if the user already has a dev account
        if (typeof user.dev === "undefined") {
            // Create a new Stripe Connect account for the dev account
            const stripeConnectID = (
                await stripe.accounts.create({
                    type: "express",
                })
            ).id;

            // Make a new dev account for the user
            const dev = Dev.create({
                ghAccessToken: access_token,
                ghUsername: username,
                stripeConnectID,
                user,
            });
            await dev.save();

            // Update the users dev account
            // await User.update(user.id, { dev }); // I believe this is the broken line
        } else {
            // Update the users existing dev account
            await Dev.update(user.dev.id, {
                ghAccessToken: access_token,
                ghUsername: username,
            });
        }

        // Clear the cached user
        await clearCache(`user:${user.id}`);

        // Return success
        res.sendStatus(200);
    } catch (e) {
        console.log(
            "***************\n***************\n***************\n***************"
        );
        console.log(e.message);
        console.log(
            "***************\n***************\n***************\n***************"
        );
        console.log(e.stack);
        console.log(
            "***************\n***************\n***************\n***************"
        );
        res.sendStatus(500);
    }
});

// Export the router
export default router;
