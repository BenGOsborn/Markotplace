import redis from "redis";

// Initialize and authorize with Redis
export const redisClient = redis.createClient({
    host:
        process.env.ENVIRONMENT === "production"
            ? process.env.REDIS_HOST
            : "0.0.0.0",
});
redisClient.auth(process.env.REDIS_PASSWORD as string);
