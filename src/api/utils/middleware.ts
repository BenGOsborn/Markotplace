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
    const user = await cacheData(`user-authorized:${userID}`, async () => {
        const existingUser = await User.findOne(userID);
        return existingUser;
    });
    if (typeof user === "undefined") {
        req.session.destroy((err) => {});
        return res.sendStatus(403);
    }

    // Pass on the user
    // @ts-ignore
    req.locals = { user };

    // Return the userID
    next();
};