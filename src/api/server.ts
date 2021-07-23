import express from "express";
import cors from "cors";
import { createConnection } from "typeorm";
import { User } from "./entities/user";
import { Dev } from "./entities/dev";
import { App } from "./entities/app";
import session from "express-session";
import connectRedis from "connect-redis";
import { redisClient } from "./utils/redis";
import devRoute from "./routes/dev";
import userRoute from "./routes/user";
import { protectedMiddleware } from "./utils/middleware";

// Initialize the app and middleware
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

// Initialize the routes
app.use("/api/user", userRoute);
app.use("/api/dev", protectedMiddleware, devRoute);

// Start the server on the specified port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
