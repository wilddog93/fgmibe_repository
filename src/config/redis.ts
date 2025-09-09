import { createClient } from 'redis';
import config from './config';

const redis = createClient({
  url:
    config.env !== 'production'
      ? `${config.redis.host}:${config.redis.port}`
      : `${config.redis.password ? `:${config.redis.password}@` : ''}${config.redis.host}:${
          config.redis.port
        }`
});

redis.on('error', (err) => console.error('❌ Redis Client Error:', err));

export const initRedis = async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
      console.log('✅ Redis connected');
    }
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err);
  }
};

export default redis;
