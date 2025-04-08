import Redlock from 'redlock';
import redis from './redis.provider';

export const redlock = new Redlock([redis], {
  retryCount: 0, // No retries; fail fast if already locked
  retryDelay: 200,
  retryJitter: 200,
});