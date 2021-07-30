import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import { redisClient } from "./utils/redis";
import devRoute from "./routes/dev";
import userRoute from "./routes/user";
import paymentRoute from "./routes/payment";
import appRoute from "./routes/app";
import { protectedMiddleware } from "./utils/middleware";
import { connectDB } from "./utils/db";
import cors from "cors";

// Initialize the app and middleware
const app = express();
app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: (origin, callback) => {
            // In reality this should be whitelisted to the different routes
            callback(null, true);
        },
    })
);

// Initialize database
connectDB();

// Initialize sessions with redis
app.use(
    session({
        store: new (connectRedis(session))({ client: redisClient }),
        secret: process.env.SERVER_SECRET || "secret",
        saveUninitialized: false,
        resave: false,
        cookie: {
            secure: process.env.ENVIRONMENT === "production",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    })
);

// Initialize the routes
app.use("/api/user", userRoute);
app.use("/api/dev", protectedMiddleware, devRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/app", appRoute);

// Start the server on the specified port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
