import express from "express";
import { User } from "../entities/user";
import { protectedMiddleware } from "../utils/middleware";

// Initialize the router
const router = express.Router();

// View all of the users current apps
router.get("/owned", protectedMiddleware, async (req, res) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Get the users owned apps
    const ownedApps = user.apps;
    if (typeof ownedApps === "undefined")
        return res.status(200).json({ apps: [] });

    // FIlter out the unused data and return the owned apps
    const apps = ownedApps.map((app) => {
        return {
            name: app.name,
            title: app.title,
            description: app.description,
        };
    });
    res.status(200).json({ apps });
});

// Verify that a user is authorized and return their data
router.post("/owns-app", protectedMiddleware, async (req, res) => {
    // Get the user
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Get the name of the app
    const { appName }: { appName: string } = req.body;

    // Check that the users apps are not undefined
    if (typeof user.apps === "undefined") return res.sendStatus(403);

    // Check that the user owns the app
    const filtered = user.apps.filter((app) => app.name === appName);
    if (filtered.length === 0) return res.sendStatus(403);

    // Return success
    res.sendStatus(200);
});

// Export the router
export default router;
