import express from "express";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";
import { PrismaClient } from "@prisma/client";
import { registerSchema } from "./utils/joiSchema";
import { cacheData, cacheDataIfNot } from "./utils/cache";
import bcrypt from "bcrypt";

// Auth with Nginx - https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/

const app = express();

// Initialize Redis connection - https://youtu.be/mzG3tpZmRUE (Redis sessions) - https://youtu.be/jgpVdJB2sKQ (Redis tutorial)
const RedisStore = connectRedis(session);
const redisClient = redis.createClient({
    host: process.env.NODE_ENV !== "production" ? "localhost" : "redis",
});
redisClient.auth(process.env.REDIS_PASSWORD as string);

// Initialize middleware
app.use(express.json());
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
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

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize constants
const EXPIRY = 60 * 60 * 12;

// Register a new user
app.post("/register", async (req, res) => {
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
        redisClient,
        EXPIRY,
        `register:${username}${email}`,
        null,
        async () => {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: { equals: username } },
                        { email: { equals: email } },
                    ],
                },
            });
            return existingUser;
        }
    );
    if (exists) return res.status(400).end("Username or email already taken");

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });

    // Set the ID of the user in the session
    // @ts-ignore
    req.session.userID = user.id;

    // Return the userID
    res.json({ userID: user.id });
});

// Login a user
app.post("/login", async (req, res) => {
    // Get data from request
    const {
        username,
        password,
    }: { username: string; email: string; password: string } = req.body;

    // Get the user if they exist
    const user = await cacheData(
        redisClient,
        EXPIRY,
        `login:${username}`,
        async () => {
            const existingUser = await prisma.user.findUnique({
                where: { username },
            });
            return existingUser;
        }
    );
    if (!user) return res.status(400).end("User does not exist");

    // Compare the passwords and return success
    const match = await bcrypt.compare(password, user.password);
    if (match) return res.sendStatus(200);
    res.sendStatus(400);
});

// Validate a users session
app.get("/authenticated", async (req, res) => {
    // Get the user ID from the session and check if it is valid
    // @ts-ignore
    const userID: string = req.session.userID;

    // If the user ID exists the user is authenticated else no
    if (userID) return res.sendStatus(403);
    return res.sendStatus(200);
});

// Listen on specified port
const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
