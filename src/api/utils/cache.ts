import { redisClient } from "./redis";

// Cache the data if it doesnt match the excluded value
export const cacheData = <T>(
    expiry: number,
    key: string,
    callback: () => Promise<T | undefined>
) => {
    return new Promise<T | undefined>((resolve, reject) => {
        redisClient.get(key, async (error, cachedData) => {
            // Reject if there was an error
            if (error) reject(error);
            // Return the cached data
            else if (cachedData != null) resolve(JSON.parse(cachedData));
            else {
                // Cache the data if it doesnt match the value specified
                const freshData = await callback();
                if (typeof freshData !== "undefined") {
                    redisClient.setex(key, expiry, JSON.stringify(freshData));
                }
                resolve(freshData);
            }
        });
    });
};

// Delete cached data
export const clearCache = (key: string) => {
    return new Promise<void>((resolve, reject) => {
        redisClient.del(key, async (error, reply) => {
            // Reject if there was an error
            if (error) reject(error);
            // Resolve if successful
            else resolve();
        });
    });
};
