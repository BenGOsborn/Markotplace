import axios from "axios";
import express from "express";
import { App } from "../entities/app";
import { Dev } from "../entities/dev";
import { User } from "../entities/user";
import { cacheData, clearCache } from "../utils/cache";
import { createAppSchema, editAppSchema } from "../utils/joiSchema";
import { devMiddleware, protectedMiddleware } from "../utils/middleware";
import { stripe } from "../utils/stripe";
import validEnv from "../utils/validEnv";

// Initialize the router
const router = express.Router();

// View all of the users current apps
router.get("/owned", protectedMiddleware, async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Filter out the unused data and return the owned apps
    const apps = user.apps.map((app) => {
        return {
            name: app.name,
            title: app.title,
            description: app.description,
        };
    });

    res.status(200).json({ apps });
});

// Verify that a user is authorized and return their data
router.post("/owns", protectedMiddleware, async (req, res) => {
    // Get the user
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Get the name of the app
    const { appName }: { appName: string } = req.body;

    // Check that the users apps are not undefined
    if (typeof appName === "undefined")
        return res.status(400).send("App name is required");

    // Check that the user owns the app
    const filtered = user.apps.filter((app) => app.name === appName);
    if (filtered.length === 0) return res.sendStatus(401);

    // Return success
    res.sendStatus(200);
});

// Get a list of apps
router.get("/list", async (req, res) => {
    // Get a list of apps
    const existingApps = await cacheData(`apps`, async () => {
        return await App.find({ relations: ["dev", "dev.user"] });
    });

    // Filter the data out of the apps
    const apps = existingApps.map((app) => {
        return {
            name: app.name,
            title: app.title,
            description: app.description,
            author: app.dev.user.username,
            price: app.price,
        };
    });

    // Return the apps
    res.status(200).json({ apps });
});

// Get the details for an app
router.get("/details/:appname", async (req, res) => {
    // Get the app name from the url
    const appName = req.params.appname;

    // Find the app with the specified app name
    const existingApp = await cacheData(`apps:${appName}`, async () => {
        return await App.findOne({
            where: { name: appName },
            relations: ["dev", "dev.user"],
        });
    });
    if (typeof existingApp === "undefined")
        return res.status(400).send("Invalid app name");

    // Filter the data out of the app and return it
    const app = {
        name: existingApp.name,
        title: existingApp.title,
        description: existingApp.description,
        author: existingApp.dev.user.username,
        price: existingApp.price,
    };
    return res.status(200).json({ app });
});

// Get the apps for the users dev account
router.get("/dev", protectedMiddleware, devMiddleware, async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Filter out the data for the apps
    const apps = user.dev.apps.map((app) => {
        return {
            name: app.name,
            title: app.title,
            description: app.description,
            price: app.price,
            ghRepoOwner: app.ghRepoOwner,
            ghRepoName: app.ghRepoName,
            ghRepoBranch: app.ghRepoBranch,
            env: app.env,
        };
    });

    // Return the app data
    res.status(200).json({ apps });
});

// Get the dev details of an app
router.get(
    "/dev/details/:appname",
    protectedMiddleware,
    devMiddleware,
    async (req, res) => {
        // Get the user data from the request
        // @ts-ignore
        const { user }: { user: User } = req.locals;

        // Get the app name from the url
        const appName = req.params.appname;

        // Find the developers app that matches the app name
        if (user.dev.apps === null) return res.sendStatus(401);
        const appIndex = user.dev.apps.findIndex((app) => app.name === appName);
        if (appIndex === -1) return res.sendStatus(401);

        // Get the app and filter out the unused data, then return it
        const appRaw = user.dev.apps[appIndex];
        const app = {
            name: appRaw.name,
            title: appRaw.title,
            description: appRaw.description,
            price: appRaw.price,
            ghRepoOwner: appRaw.ghRepoOwner,
            ghRepoName: appRaw.ghRepoName,
            ghRepoBranch: appRaw.ghRepoBranch,
            env: appRaw.env,
        };
        res.status(200).json({ app });
    }
);

// Add an app
router.post(
    "/dev/create",
    protectedMiddleware,
    devMiddleware,
    async (req, res) => {
        // Get the user data from the request
        // @ts-ignore
        const { user }: { user: User } = req.locals;

        // Get the data for the app
        const {
            name,
            title,
            description,
            price,
            ghRepoOwner,
            ghRepoName,
            ghRepoBranch,
            env,
        }: {
            name: string;
            title: string;
            description: string;
            price: number;
            ghRepoOwner: string;
            ghRepoName: string;
            ghRepoBranch: string;
            env: string;
        } = req.body;

        // Validate the app data
        const { error } = createAppSchema.validate({
            name,
            title,
            description,
            price,
            ghRepoOwner,
            ghRepoName,
            ghRepoBranch,
            env,
        });
        if (error) return res.status(400).send(error.details[0].message);

        // Check that an app with the same name does not exist
        const exists = await App.findOne({
            where: { name },
        });
        if (typeof exists !== "undefined")
            return res.status(400).send("An app with that name already exists");

        // Check that the dev has submitted their payment details if they wish to charge for their app
        const detailsSubmitted = (
            await stripe.accounts.retrieve(user.dev.stripeConnectID)
        ).details_submitted;
        if (!detailsSubmitted && price > 0)
            return res
                .status(400)
                .send(
                    "To charge more than $0 for your app you must first finish setting up your Stripe account"
                );

        // Validate the env
        if (!validEnv(env)) return res.status(400).send("Invalid env JSON");

        // Initialize a new webhook in the repository for the user
        let ghWebhookID;
        try {
            const {
                data: { id },
            } = await axios.post<{ id: string }>(
                `https://api.github.com/repos/${ghRepoOwner}/${ghRepoName}/hooks`,
                {
                    config: {
                        // url: `${process.env.BACKEND_URL}/api/apps/hook`,
                        url: `https://www.google.com/api/apps/hook`,
                        content_type: "json",
                    },
                },
                {
                    headers: {
                        Authorization: `token ${user.dev.ghAccessToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );
            ghWebhookID = id;
        } catch {
            return res.status(500).send("Unable to register webhook");
        }

        // Create a new app and assign it to the dev account
        const app = App.create({
            name,
            title,
            description,
            price: Math.floor(price * 100),
            ghRepoOwner,
            ghRepoName,
            ghRepoBranch,
            ghWebhookID,
            env,
            dev: user.dev,
        });
        await app.save();

        // Add the new app to the users account
        user.apps = [...user.apps, app];
        await user.save();

        // Clear the cached user
        await clearCache(`user:${user.id}`);

        // Add an app
        res.sendStatus(200);
    }
);

// Edit an app
router.patch(
    "/dev/edit",
    protectedMiddleware,
    devMiddleware,
    async (req, res) => {
        // Get the user data from the request
        // @ts-ignore
        const { user }: { user: User } = req.locals;

        // Get the data for the app
        const {
            name,
            title,
            description,
            price,
            ghRepoOwner,
            ghRepoName,
            ghRepoBranch,
            env,
        }: {
            name: string;
            title: string | undefined;
            description: string | undefined;
            price: number | undefined;
            ghRepoOwner: string | undefined;
            ghRepoName: string | undefined;
            ghRepoBranch: string | undefined;
            env: string | undefined;
        } = req.body;

        // Validate the edit app data
        const { error } = editAppSchema.validate({
            title,
            description,
            price,
            ghRepoOwner,
            ghRepoName,
            ghRepoBranch,
            env,
        });
        if (error) return res.status(400).send(error.details[0].message);

        // Validate the env
        if (typeof env !== "undefined" && !validEnv(env))
            return res.status(400).send("Invalid env JSON");

        // Find the app with the existing name
        const existingApp = await App.findOne({
            where: { name },
            relations: ["dev"],
        });
        if (typeof existingApp === "undefined")
            return res.status(400).send("No app with this name exists");

        // Check that the dev owns the app
        if (existingApp.dev.id !== user.dev.id)
            return res.status(401).send("You are not able to edit this app");

        // Set the data to update
        if (typeof title !== "undefined") existingApp.title = title;
        if (typeof description !== "undefined")
            existingApp.description = description;
        if (typeof price !== "undefined") {
            // Check that the dev has submitted their payment details if they wish to charge for their app
            const detailsSubmitted = (
                await stripe.accounts.retrieve(user.dev.stripeConnectID)
            ).details_submitted;
            if (!detailsSubmitted && price > 0)
                return res
                    .status(400)
                    .send(
                        "To charge more than $0 for your app you must first finish setting up your Stripe account"
                    );

            // Set the new price for the app
            existingApp.price = Math.floor(price * 100);
        }
        if (typeof env !== "undefined") existingApp.env = env;
        if (
            typeof ghRepoOwner !== "undefined" ||
            typeof ghRepoName !== "undefined"
        ) {
            try {
                // Delete the existing webhook if the repo was changed
                await axios.delete<any>(
                    `https://api.github.com/repos/${existingApp.ghRepoOwner}/${existingApp.ghRepoName}/hooks/${existingApp.ghWebhookID}`,
                    {
                        headers: {
                            Authorization: `token ${user.dev.ghAccessToken}`,
                            Accept: "application/vnd.github.v3+json",
                        },
                    }
                );

                // Create the new webhook in the new repo
                const {
                    data: { id: ghWebhookID },
                } = await axios.post<{ id: string }>(
                    `https://api.github.com/repos/${
                        ghRepoOwner || existingApp.ghRepoOwner
                    }/${ghRepoName || existingApp.ghRepoName}/hooks`,
                    {
                        config: {
                            // url: `${process.env.BACKEND_URL}/api/apps/hook`,
                            url: `https://www.google.com/api/apps/hook`,
                            content_type: "json",
                        },
                    },
                    {
                        headers: {
                            Authorization: `token ${user.dev.ghAccessToken}`,
                            Accept: "application/vnd.github.v3+json",
                        },
                    }
                );
                existingApp.ghWebhookID = ghWebhookID;
            } catch {
                return res.status(500).send("Unable to update webhook");
            }
        }
        if (typeof ghRepoOwner !== "undefined")
            existingApp.ghRepoOwner = ghRepoOwner;
        if (typeof ghRepoName !== "undefined")
            existingApp.ghRepoName = ghRepoName;
        if (typeof ghRepoBranch !== "undefined")
            existingApp.ghRepoBranch = ghRepoBranch;
        if (
            typeof ghRepoOwner !== "undefined" ||
            typeof ghRepoName !== "undefined" ||
            typeof ghRepoBranch !== "undefined"
        ) {
            // Increment the version of the app if the repo changed
            existingApp.version += 1;
        }

        // Update the app
        await existingApp.save();

        // Clear the cached user
        await clearCache(`user:${user.id}`);

        // Edit an app
        res.sendStatus(200);
    }
);

// Hook for the repository updates
router.post("/hook", async (req, res) => {
    // Get the webhook ID from the header
    const hookID = req.headers["X-GitHub-Hook-ID"];
    // Get the branch from the body
    const { ref }: { ref: string } = req.body;

    // Validate that the ref and hookID are specified
    if (typeof hookID === "undefined" || typeof ref === "undefined")
        return res.status(400).send("Missing webhook ID or ref");

    // Get the branch from the ref
    const splitRef = ref.split("/");
    const branch = splitRef[splitRef.length - 1];

    // Find the app with the hookID and check that it matches the branch
    const existingApp = await App.findOne({
        where: { ghRepoBranch: branch, ghWebhookID: hookID },
    });
    if (typeof existingApp === "undefined") {
        return res.status(400).send("Invalid webhook ID or branch");
    } else {
        // Update the version of the app
        existingApp.version += 1;
        await existingApp.save();
    }

    // Return succes
    res.sendStatus(200);
});

// Export the router
export default router;
