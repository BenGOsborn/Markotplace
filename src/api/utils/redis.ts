import redis from "redis";

// Initialize and authorize with Redis
export const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
});
redisClient.auth(process.env.REDIS_PASSWORD as string);
