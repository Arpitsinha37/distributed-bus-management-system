import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

// Short-lived distributed lock so two customers can never both select the
// same seat during checkout. This is a first line of defence — the DB
// transaction in BookingsService.holdSeats is the real source of truth,
// this just fails fast and cheaply before hitting Postgres.
@Injectable()
export class SeatLockService implements OnModuleDestroy {
  private redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  private holdSeconds = Number(process.env.SEAT_HOLD_MINUTES ?? 8) * 60;

  private key(tripId: string, seatNumber: string) {
    return `seat-lock:${tripId}:${seatNumber}`;
  }

  // Returns true if the lock was acquired, false if someone else holds it.
  async acquire(tripId: string, seatNumber: string, holderId: string): Promise<boolean> {
    const result = await this.redis.set(
      this.key(tripId, seatNumber),
      holderId,
      'EX',
      this.holdSeconds,
      'NX',
    );
    return result === 'OK';
  }

  // Only releases the lock if it's still owned by the same holder — avoids
  // one request releasing a lock a later, unrelated hold just acquired.
  async release(tripId: string, seatNumber: string, holderId: string): Promise<void> {
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      end
      return 0
    `;
    await this.redis.eval(script, 1, this.key(tripId, seatNumber), holderId);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
