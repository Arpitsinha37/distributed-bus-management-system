import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';

/**
 * API Key Guard for Offline Booking endpoints.
 * 
 * Validates the `x-api-key` header against the OFFLINE_BOOKING_API_KEY
 * environment variable. This protects the inbound webhook from unauthorized
 * callers — only the API holder company should have this key.
 */
@Injectable()
export class OfflineBookingApiKeyGuard implements CanActivate {
    private readonly logger = new Logger(OfflineBookingApiKeyGuard.name);
    private readonly apiKey: string;

    constructor() {
        this.apiKey = process.env.OFFLINE_BOOKING_API_KEY || '';
        if (!this.apiKey) {
            this.logger.warn('⚠️ OFFLINE_BOOKING_API_KEY is not set! Offline booking endpoint will reject all requests.');
        }
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const providedKey = request.headers['x-api-key'];

        if (!this.apiKey) {
            this.logger.error('OFFLINE_BOOKING_API_KEY is not configured on the server.');
            throw new UnauthorizedException('Offline booking API is not configured. Contact the administrator.');
        }

        if (!providedKey) {
            throw new UnauthorizedException('Missing x-api-key header.');
        }

        if (providedKey !== this.apiKey) {
            this.logger.warn(`Invalid API key attempt from IP: ${request.ip}`);
            throw new UnauthorizedException('Invalid API key.');
        }

        return true;
    }
}
