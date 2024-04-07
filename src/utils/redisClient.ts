// src/utils/redisClient.ts
import { createClient, RedisClientType } from "redis";

const redisClient: RedisClientType = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

redisClient.on("error", (err: Error) =>
  console.error("Redis Client Error", err)
);

// redisClient.connect();

export default redisClient;
