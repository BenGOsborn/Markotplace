import express, { NextFunction } from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import { createConnection } from "typeorm";
import { registerSchema, updateSchema } from "./utils/joiSchema";
import { cacheData, clearCache } from "./utils/cache";
import bcrypt from "bcrypt";
import { User } from "./entities/user";
import { Dev } from "./entities/dev";
import { redisClient } from "./utils/redis";
import cors from "cors";
import { App } from "./entities/app";

// Initialize express
const app = express();
app.use(express.json());
app.use(cors());

// Initialize ORM
createConnection({
    type: "postgres",
    host: process.env.NODE_ENV !== "production" ? "localhost" : "db",
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: true,
    entities: [User, Dev, App],
});

// Initialize sessions with redis
app.use(
    session({
        store: new (connectRedis(session))({ client: redisClient }),
        secret: process.env.SECRET || "secret",
        saveUninitialized: false,
        resave: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    })
);

// Initialize constants
const EXPIRY = 60 * 60 * 12;

// Register a new user
app.post("/user/register", async (req, res) => {
    // Get data from request
    const {
        username,
        email,
        password,
    }: { username: string; email: string; password: string } = req.body;

    // Validate the data against the schema
    const { error } = registerSchema.validate({ username, email, password });
    if (error) return res.status(400).end(error.details[0].message);

    // Check if the username and email are unique
    const exists = await cacheData(
        EXPIRY,
        `user-register:${username}${email}`,
        async () => {
            const existingUser = await User.findOne({
                where: [{ username }, { email }],
            });
            return existingUser;
        }
    );
    if (typeof exists !== "undefined")
        return res.status(400).end("Username or email already taken");

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const user = User.create({
        username,
        email,
        password: hashedPassword,
    });
    await user.save();

    // Set the ID of the user in the session
    // @ts-ignore
    req.session.userID = user.id;

    // Return the userID
    res.json({ userID: user.id });
});

// Login a user
app.post("/user/login", async (req, res) => {
    // Get data from request
    const {
        username,
        password,
    }: { username: string; email: string; password: string } = req.body;

    // Get the user if they exist
    const user = await cacheData(EXPIRY, `user-login:${username}`, async () => {
        const existingUser = await User.findOne({
            where: { username },
        });
        return existingUser;
    });
    if (typeof user === "undefined")
        return res.status(400).end("User does not exist");

    // Check that the passwords match
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.sendStatus(400);

    // Set the session and the userID
    // @ts-ignore
    req.session.userID = user.id;
    res.json({ userID: user.id });
});

// Authenticated middleware
const authMiddleware = async (
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
        EXPIRY,
        `user-authorized:${userID}`,
        async () => {
            const existingUser = await User.findOne(userID);
            return existingUser;
        }
    );
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

// Validate a users session
app.get("/user/authorized", authMiddleware, async (req, res) => {
    // Return the userID
    // @ts-ignore
    return res.json({ userID: req.locals.user.id });
});

// Provide a way for the user to edit their account
app.patch("/user/edit", authMiddleware, async (req, res) => {
    // Get the user and extract the userID
    // @ts-ignore
    const { user }: { user: User } = req.locals;
    const { id: userID } = user;

    // Get the data to update
    const {
        email,
        username,
        password,
    }: {
        username: string | undefined;
        email: string | undefined;
        password: string | undefined;
    } = req.body;

    // Check that at least one parameter is specified
    if (
        typeof username === "undefined" &&
        typeof email === "undefined" &&
        typeof password === "undefined"
    )
        return res
            .status(400)
            .end("At least one parameter to modify is required");

    // Verify the data against the schema
    const { error } = updateSchema.validate({ username, email, password });
    if (error) return res.status(400).end(error.details[0].message);

    // Set the data to update
    const updateData: any = {};
    if (typeof username !== "undefined") updateData.username = username;
    if (typeof email !== "undefined") updateData.email = email;
    if (typeof password !== "undefined") {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        updateData.password = hashedPassword;
    }

    // Update the user
    await User.update(userID, updateData);

    // Get the old username and email
    const { username: oldUsername, email: oldEmail } = user;

    // Clear the cached data for the user
    await clearCache(`user-register:${oldUsername}${oldEmail}`);
    await clearCache(`user-login:${oldUsername}`);
    await clearCache(`user-authorized:${oldUsername}`);

    // Return success
    return res.sendStatus(200);
});

// Allow a user to view their apps

// Authenticate a user for accessing an app

// Start the server on the specified port
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
