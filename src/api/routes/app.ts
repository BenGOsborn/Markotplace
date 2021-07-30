import express from "express";
import { User } from "../entities/user";
import { protectedMiddleware } from "../utils/middleware";

// Initialize the router
const router = express.Router();

// View all of the users current apps
router.get("/library", protectedMiddleware, async (req, res) => {
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

// Export the router
export default router;
