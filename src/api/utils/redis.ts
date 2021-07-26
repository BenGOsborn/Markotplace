import redis from "redis";

// Initialize and authorize with Redis
export const redisClient = redis.createClient({
    host: "redis",
});
redisClient.auth(process.env.REDIS_PASSWORD as string);
