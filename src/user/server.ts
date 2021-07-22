import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import { createConnection } from "typeorm";
import { registerSchema } from "./utils/joiSchema";
import { cacheData, cacheDataIfNot } from "./utils/cache";
import bcrypt from "bcrypt";
import { User } from "./entities/user";
import { Dev } from "./entities/dev";
import { redisClient } from "./utils/redis";
import cors from "cors";

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
    entities: [User, Dev],
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
    const exists = await cacheDataIfNot(
        EXPIRY,
        `user-register:${username}${email}`,
        undefined,
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
    if (!match) {
        res.sendStatus(400);
    }

    // Set the session and the userID
    // @ts-ignore
    req.session.userID = user.id;
    res.json({ userID: user.id });
});

// Validate a users session
app.get("/user/authorized", async (req, res) => {
    // Get the user ID from the session and check if it is valid
    // @ts-ignore
    const { userID }: { userID: number } = req.session;

    // If the user ID exists the user is authenticated else no
    if (!userID) return res.sendStatus(403);

    // Also do a check of the user ID to make sure it exists - if it doesnt then void the session
    const user = await cacheData(
        EXPIRY,
        `user-authenticated:${userID}`,
        async () => {
            const existingUser = await User.findOne(userID);
            return existingUser;
        }
    );
    if (typeof user === "undefined") {
        req.session.destroy((err) => {});
        return res.sendStatus(403);
    }

    // Return the userID
    return res.json({ userID });
});

// **** Provide a way where a user can delete their account

// **** Provide a way where a user can edit their account

// Start the server on the specified port
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
