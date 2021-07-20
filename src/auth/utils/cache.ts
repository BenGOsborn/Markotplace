import { RedisClient } from "redis";

// Attempt to get the data from the cache if it exists
const cacheData = <T>(
    redisClient: RedisClient,
    seconds: number,
    key: string,
    callback: () => Promise<T>
) => {
    return new Promise<T>((resolve, reject) => {
        redisClient.get(key, async (error, cachedData) => {
            // Reject if there was en error
            if (error) return reject(error);
            // Return the cached data
            if (cachedData != null) resolve(JSON.parse(cachedData));
            else {
                // Get the cached data from the callback, store it in the cache and return it
                const freshData = await callback();
                redisClient.setex(key, seconds, JSON.stringify(freshData));
                resolve(freshData);
            }
        });
    });
};
