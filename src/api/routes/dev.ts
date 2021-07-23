import axios from "axios";
import express from "express";
import { App } from "../entities/app";
import { Dev } from "../entities/dev";
import { User } from "../entities/user";
import { createAppSchema, editAppSchema } from "../utils/joiSchema";

// Initialize the router
const router = express.Router();

// Authorize user with GitHub
router.get("/authorize/github", async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Declare the rediret URL
    const redirectURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=http://localhost:5000/dev/authorize/github/callback&scope=repo`;

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

    // Make a new dev account for the user
    const dev = Dev.create({
        token: access_token,
        ghUsername: username,
        user,
    });
    await dev.save();

    // Update the users dev account
    await User.update(user.id, { dev });

    // Return success **** I SHOULD ALSO REDIRECT BACK TO THE CORRECT PAGE
    return res.sendStatus(200);
});

// **** Come up with a better system of allowing a user to connect their accounts (whats wrong with letting them reset ?)

// Add an app
router.post("/app/create", async (req, res) => {
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
    }: // Add an option for the repo
    { name: string; title: string; description: string; price: number } =
        req.body;

    // Validate the app data
    const { error } = createAppSchema.validate({
        name,
        title,
        description,
        price,
    });
    if (error) return res.status(400).end(error.details[0].message);

    // Check that an app with the same name does not exist
    const exists = await App.findOne({ where: { name } });
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
router.patch("/app/edit", async (req, res) => {
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
    }: // Edit the repo
    {
        name: string;
        title: string | undefined;
        description: string | undefined;
        price: number | undefined;
    } = req.body;

    // Validate the edit app data
    const { error } = editAppSchema.validate({
        name,
        title,
        description,
        price,
    });
    if (error) return res.status(400).end(error.details[0].message);

    // Find the app with the existing name - **** MAYBE I SHOULDNT CACHE THIS ONE ? (I could also do this WITHOUT checking the ID)
    const existingApp = await App.findOne({ where: { name } });
    if (typeof existingApp === "undefined")
        return res.status(400).end("No app with this name exists");
    if (existingApp.dev.id !== user.dev.id)
        return res.status(403).end("You are not able to edit this app");

    // Set the data to update
    const updateData: any = {};
    if (typeof title !== "undefined") updateData.title = title;
    if (typeof description !== "undefined")
        updateData.description = description;
    if (typeof price !== "undefined") updateData.price = price;

    // Update the app
    await App.update(existingApp.id, updateData);

    // Edit an app
    res.sendStatus(200);
});

// Export the router
export default router;
