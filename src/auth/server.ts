import express from "express";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";

const app = express();

// Initialize Redis connection
const RedisStore = connectRedis(session);
const redisClient = redis.createClient({
    host: process.env.NODE_ENV !== "production" ? "localhost" : "redis",
});

// Initialize middleware
app.use(express.json());
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: process.env.SECRET || "secret",
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
        },
    })
);
