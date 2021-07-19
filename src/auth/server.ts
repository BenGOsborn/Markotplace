import express from "express";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";

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

// Login endpoint
app.post("/login", (req, res) => {
    // Get params
    const { email, password }: { email: string; password: string } = req.body;

    // Store values in the session
    // @ts-ignore
    req.session.email = email;
    // @ts-ignore
    req.session.password = password;

    // Return success
    res.sendStatus(200);
});

// Protected route
app.get("/protected", (req, res) => {
    return res.json(req.session);
});

// Listen on specified port
const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
