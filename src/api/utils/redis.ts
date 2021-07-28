import redis from "redis";

// Initialize and authorize with Redis
export const redisClient = redis.createClient({
    host: process.env.ENVIRONMENT === "production" ? "redis" : "0.0.0.0",
});
redisClient.auth(process.env.REDIS_PASSWORD as string);
