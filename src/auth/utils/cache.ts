import { redisClient } from "./redis";

// Checkout caching problems

// Attempt to get the data from the cache if it exists otherwise create it
export const cacheData = <T>(
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

// Cache the data if it doesnt match the excluded value
export const cacheDataIfNot = <T>(
    expiry: number,
    key: string,
    exclude: any,
    callback: () => Promise<T>
) => {
    return new Promise<T>((resolve, reject) => {
        redisClient.get(key, async (error, cachedData) => {
            // Reject if there was an error
            if (error) reject(error);
            // Return the cached data
            else if (cachedData != null) resolve(JSON.parse(cachedData));
            else {
                // Cache the data if it doesnt match the value specified
                const freshData = await callback();
                if (freshData !== exclude) {
                    redisClient.setex(key, expiry, JSON.stringify(freshData));
                }
                resolve(freshData);
            }
        });
    });
};
