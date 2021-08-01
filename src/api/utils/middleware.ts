import express, { NextFunction } from "express";
import { User } from "../entities/user";

// User authenticated middleware
export const protectedMiddleware = async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
) => {
    // Get the userID from the session and check if it is valid
    // @ts-ignore
    const { userID }: { userID: number } = req.session;

    // If the user ID exists the user is authenticated else no
    if (typeof userID === "undefined") return res.sendStatus(401);

    // Also do a check of the user ID to make sure it exists - if it doesnt then void the session and return error
    const user = await User.findOne(userID, {
        relations: ["dev", "apps", "dev.apps"],
    });

    // Pass on the user
    // @ts-ignore
    req.locals = { user };

    // Call next
    next();
};

// Check if a user is a developer
export const devMiddleware = async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
) => {
    // Get the user data from the request
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Check if the user is a developer, if not block the request
    const dev = user.dev;
    if (dev === null)
        return res.status(401).send("Only developers may access this");
    next();
};
