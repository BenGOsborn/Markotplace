import express from "express";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";
import { PrismaClient } from "@prisma/client";

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

// Login endpoint
app.post("/register", async (req, res) => {
    // Get params
    const {
        username,
        email,
        password,
    }: { username: string; email: string; password: string } = req.body;

    // Validate these using Joi

    // Create a mew user in the database
    const user = await prisma.user.create({
        data: {
            username,
            email,
            password,
        },
    });

    // Store value in the session

    // Return success
    res.json(user);
});

// Protected route
app.get("/protected", async (req, res) => {
    return res.json(req.session);
});

// Listen on specified port
const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
