import { RedisClient } from "redis";

// Cache data to redis
const cacheData = async (
    redisClient: RedisClient,
    key: string,
    callback: () => Promise<any>
) => {
    // Attempt to get the key from redis
    // Otherwise use the callback to get the data and store it in the cache

    // How can I make a custom type from this ?

    return new Promise((resolve, object) => {
        redisClient.get(key, (error, data) => {
            if (error) return PromiseRejectionEvent(error);
        });
    });
};
