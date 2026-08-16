import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

// Short-lived distributed lock so two customers can never both select the
// same seat during checkout. This is a first line of defence — the DB
// transaction in BookingsService.holdSeats is the real source of truth,
// this just fails fast and cheaply before hitting Postgres.
@Injectable()
export class SeatLockService implements OnModuleDestroy {
  private readonly logger = new Logger(SeatLockService.name);
  private redis: Redis | null = null;
  private holdSeconds = Number(process.env.SEAT_HOLD_MINUTES ?? 8) * 60;

  private getRedis(): Redis | null {
    if (this.redis) return this.redis;
    try {
      const url = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL;
      if (!url) {
        this.logger.warn('No REDIS_URL set — seat locking disabled (Postgres is still the source of truth)');
        return null;
      }
      this.redis = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
        lazyConnect: true,
      });
      this.redis.connect().catch((err) => {
        this.logger.warn(`Redis connection failed: ${err.message} — seat locking disabled`);
        this.redis = null;
      });
      return this.redis;
    } catch (err) {
      this.logger.warn(`Redis init failed: ${(err as Error).message}`);
      return null;
    }
  }

  private key(tripId: string, seatNumber: string) {
    return `seat-lock:${tripId}:${seatNumber}`;
  }

  // Returns true if the lock was acquired, false if someone else holds it.
  async acquire(tripId: string, seatNumber: string, holderId: string): Promise<boolean> {
    const redis = this.getRedis();
    if (!redis) return true; // no Redis = allow (DB tx is the real guard)
    try {
      const result = await redis.set(
        this.key(tripId, seatNumber),
        holderId,
        'EX',
        this.holdSeconds,
        'NX',
      );
      return result === 'OK';
    } catch {
      return true; // fail open
    }
  }

  // Only releases the lock if it's still owned by the same holder
  async release(tripId: string, seatNumber: string, holderId: string): Promise<void> {
    const redis = this.getRedis();
    if (!redis) return;
    try {
      const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        end
        return 0
      `;
      await redis.eval(script, 1, this.key(tripId, seatNumber), holderId);
    } catch {
      // swallow — Postgres is the source of truth
    }
  }

  async onModuleDestroy() {
    if (this.redis) await this.redis.quit();
  }
}

