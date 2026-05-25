import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

// Parse the Redis URL to detect if TLS is needed (rediss:// for Upstash)
const redisUrl = env.redisUrl;
const useTLS = redisUrl.startsWith('rediss://');

// Build base options for all Redis connections
function getRedisOptions(): Record<string, unknown> {
  const options: Record<string, unknown> = {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    retryStrategy(times: number) {
      const delay = Math.min(times * 200, 5000);
      logger.warn(`Redis reconnecting... attempt ${times}`);
      return delay;
    },
  };

  if (useTLS) {
    options.tls = {
      rejectUnauthorized: false,
    };
  }

  return options;
}

// Main Redis client
export const redis = new Redis(redisUrl, getRedisOptions());

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('Redis error:', err.message);
});

// Create a separate connection for BullMQ (BullMQ recommends separate connections)
export function createBullMQConnection(): Redis {
  return new Redis(redisUrl, getRedisOptions());
}
