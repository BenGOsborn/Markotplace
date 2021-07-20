import { RedisClient } from "redis";

// Attempt to get the data from the cache if it exists otherwise create it
export const cacheData = <T>(
    redisClient: RedisClient,
    expiry: number,
    key: string,
    callback: () => Promise<T>
) => {
    return new Promise<T>((resolve, reject) => {
        redisClient.get(key, async (error, cachedData) => {
            // Reject if there was en error
            if (error) reject(error);
            // Return the cached data
            else if (cachedData != null) resolve(JSON.parse(cachedData));
            else {
                // Get the cached data from the callback, store it in the cache and return it
                const freshData = await callback();
                redisClient.setex(key, expiry, JSON.stringify(freshData));
                resolve(freshData);
            }
        });
    });
};

// I should have another function which should set the cache on success
export const setCacheIfExists = <T>(
    redisClient: RedisClient,
    expiry: number,
    key: string,
    callback: () => Promise<T>
) => {
    return new Promise<T>((resolve, reject) => {
        redisClient.get(key, async (error, cachedData) => {
            // Reject if there was an error
            if (error) reject(error);
            // Return the cached data
            else if (cachedData != null) resolve(JSON.parse(cachedData));
            else {
                // Create the new cached data and store it in the cache if it exists
                const freshData = await callback();
                if (freshData) {
                    redisClient.setex(key, expiry, JSON.stringify(freshData));
                }
                resolve(freshData);
            }
        });
    });
};
