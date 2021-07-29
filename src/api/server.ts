import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import { redisClient } from "./utils/redis";
import devRoute from "./routes/dev";
import userRoute from "./routes/user";
import paymentRoute from "./routes/payment";
import { protectedMiddleware } from "./utils/middleware";
import { connectDB } from "./utils/db";

// Initialize the app and middleware
const app = express();
app.use(express.json());

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

// Start the server on the specified port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
