import axios from "axios";
import express from "express";
import { App } from "../entities/app";
import { Dev } from "../entities/dev";
import { User } from "../entities/user";
import { createAppSchema, editAppSchema } from "../utils/joiSchema";
import { stripe } from "../utils/stripe";
import bcrypt from "bcrypt";
import { cacheData, clearCache } from "../utils/cache";

// Initialize the router
const router = express.Router();

// Authorize user with GitHub
router.get("/authorize/github", async (req, res) => {
    // Declare the rediret URL
    const redirectURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;

    // Redirect the user to GitHub
    res.redirect(redirectURL);
});

// Callback for GitHub authorization
router.get("/authorize/github/callback", async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

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
            token: access_token,
            ghUsername: username,
            stripeConnectID,
            user,
        });
        await dev.save();

        // Update the users dev account
        await User.update(user.id, { dev });
    } else {
        // Update the users existing dev account
        await Dev.update(user.dev.id, {
            token: access_token,
            ghUsername: username,
        });
    }

    // Clear the cached user
    await clearCache(`user:${user.id}`);

    // Return success
    res.sendStatus(200);
});

// Add an app
router.post("/app/create", async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Check that the user has a dev account
    if (typeof user.dev === "undefined")
        return res.status(400).send("A dev account is required");

    // Get the data for the app
    const {
        name,
        title,
        description,
        price,
        ghRepoOwner,
        ghRepoName,
    }: {
        name: string;
        title: string;
        description: string;
        price: number;
        ghRepoOwner: string;
        ghRepoName: string;
    } = req.body;

    // Validate the app data
    const { error } = createAppSchema.validate({
        name,
        title,
        description,
        price,
        ghRepoOwner,
        ghRepoName,
    });
    if (error) return res.status(400).send(error.details[0].message);

    // Check that an app with the same name does not exist
    const exists = await App.findOne({ where: { name } });
    if (typeof exists !== "undefined")
        return res.status(400).send("An app with that name already exists");

    // Check that the dev has submitted their payment details if they wish to charge for their app
    const detailsSubmitted = await cacheData(
        `onboarded:${user.dev.id}`,
        async () =>
            (
                await stripe.accounts.retrieve(user.dev.stripeConnectID)
            ).details_submitted
    );
    if (!detailsSubmitted && price > 0)
        return res
            .status(400)
            .send(
                "To charge more than $0 for your app you must first finish setting up your Stripe account"
            );

    // Create a new app and assign it to the dev account
    const app = App.create({
        name,
        title,
        description,
        price: price * 100,
        ghRepoOwner,
        ghRepoName,
    });
    await app.save();

    // Cache the new app
    await cacheData(`app:${app.id}`, async () => app);

    let newApps: App[] = [app];
    if (typeof user.apps !== "undefined") newApps = [...user.apps, ...newApps];
    await User.update(user.id, { apps: newApps });

    // Clear the cached user
    await clearCache(`user:${user.id}`);

    // Add an app
    res.sendStatus(200);
});

// Edit an app
router.patch("/app/edit", async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Check that the user has a dev account
    if (typeof user.dev === "undefined")
        return res.status(400).send("A dev account is required");

    // Get the data for the app
    const {
        name,
        title,
        description,
        price,
        ghRepoOwner,
        ghRepoName,
    }: {
        name: string;
        title: string | undefined;
        description: string | undefined;
        price: number | undefined;
        ghRepoOwner: string | undefined;
        ghRepoName: string | undefined;
    } = req.body;

    // Validate the edit app data
    const { error } = editAppSchema.validate({
        name,
        title,
        description,
        price,
        ghRepoOwner,
        ghRepoName,
    });
    if (error) return res.status(400).send(error.details[0].message);

    // Find the app with the existing name **** There is probably a better way of doing this
    const existingApp = await App.findOne({ where: { name } });
    if (typeof existingApp === "undefined")
        return res.status(400).send("No app with this name exists");
    if (existingApp.dev.id !== user.dev.id)
        return res.status(403).send("You are not able to edit this app");

    // Set the data to update
    const updateData: any = {};
    if (typeof title !== "undefined") updateData.title = title;
    if (typeof description !== "undefined")
        updateData.description = description;
    if (typeof price !== "undefined") {
        // Check that the dev has submitted their payment details if they wish to charge for their app
        const detailsSubmitted = await cacheData(
            `onboarded:${user.dev.id}`,
            async () =>
                (
                    await stripe.accounts.retrieve(user.dev.stripeConnectID)
                ).details_submitted
        );
        if (!detailsSubmitted && price > 0)
            return res
                .status(400)
                .send(
                    "To charge more than $0 for your app you must first finish setting up your Stripe account"
                );

        // Set the new price for the app
        updateData.price = price * 100;
    }
    if (typeof ghRepoOwner !== "undefined")
        updateData.ghRepoOwner = ghRepoOwner;
    if (typeof ghRepoName !== "undefined") updateData.ghRepoName = ghRepoName;

    // Update the app
    await App.update(existingApp.id, updateData);

    // Clear the cached data
    await clearCache(`user:${user.id}`);
    await clearCache(`app:${existingApp.id}`);

    // Edit an app
    res.sendStatus(200);
});

// Export the router
export default router;
