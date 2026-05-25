import { redis } from '../config/redis';
import { logger } from '../utils/logger';

const DEFAULT_TTL = 3600; // 1 hour
const PAPER_TTL = 86400;  // 24 hours

export const cacheService = {
  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(key);
    } catch (err) {
      logger.error('Cache get error:', err);
      return null;
    }
  },

  async set(key: string, value: string, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      await redis.set(key, value, 'EX', ttl);
    } catch (err) {
      logger.error('Cache set error:', err);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (err) {
      logger.error('Cache del error:', err);
    }
  },

  // Job-specific helpers
  async setJobStatus(jobId: string, status: Record<string, unknown>): Promise<void> {
    await this.set(`job:${jobId}:status`, JSON.stringify(status), DEFAULT_TTL);
  },

  async getJobStatus(jobId: string): Promise<Record<string, unknown> | null> {
    const data = await this.get(`job:${jobId}:status`);
    if (!data) return null;
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return null;
    }
  },

  // Paper-specific helpers
  async setPaper(assignmentId: string, paper: Record<string, unknown>): Promise<void> {
    await this.set(`paper:${assignmentId}`, JSON.stringify(paper), PAPER_TTL);
  },

  async getPaper(assignmentId: string): Promise<Record<string, unknown> | null> {
    const data = await this.get(`paper:${assignmentId}`);
    if (!data) return null;
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return null;
    }
  },

  async delPaper(assignmentId: string): Promise<void> {
    await this.del(`paper:${assignmentId}`);
  },
};
