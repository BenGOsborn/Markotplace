import express, { NextFunction } from "express";
import { User } from "../entities/user";
import { cacheData } from "./cache";

// Authenticated middleware
export const protectedMiddleware = async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
) => {
    // Get the userID from the session and check if it is valid
    // @ts-ignore
    const { userID }: { userID: number } = req.session;

    // If the user ID exists the user is authenticated else no
    if (typeof userID === "undefined") return res.sendStatus(403);

    // Also do a check of the user ID to make sure it exists - if it doesnt then void the session and return error
    const user = await cacheData(
        `user:${userID}`,
        async () => await User.findOne(userID)
    );

    // Pass on the user
    // @ts-ignore
    req.locals = { user };

    // Call next
    next();
};

// Used for verifying that a request was made by the server
export const serverMiddleware = async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
) => {
    // Verify that the request came from the server
    const serverSecret = req.headers["Server-Secret"];

    // Check that the server secret is valid
    if (!serverSecret || serverSecret !== process.env.SERVER_SECRET) return res.sendStatus(403);

    // Call next
    next();
};
