import { RedisClient } from "redis";

// Cache data to redis
const cacheData = async <T>(
    redisClient: RedisClient,
    seconds: number,
    key: string,
    callback: () => Promise<T>
) => {
    return new Promise<T>((resolve, reject) => {
        redisClient.get(key, async (error, cachedData) => {
            if (error) return reject(error);
            if (cachedData != null) resolve(JSON.parse(cachedData));
            else {
                const freshData = await callback();
                redisClient.setex(key, seconds, JSON.stringify(freshData));
                resolve(freshData);
            }
        });
    });
};
