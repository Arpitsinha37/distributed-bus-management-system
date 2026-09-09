import { StaffRole } from '@prisma/client';
import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    UseGuards,
    UsePipes,
    ValidationPipe,
    HttpCode,
    HttpStatus,
    NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { OfflineBookingService } from './offline-booking.service';
import { OfflineBookingApiKeyGuard } from './offline-booking.guard';
import { CreateOfflineBookingDto } from './offline-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; import { Roles } from '../../common/decorators/roles.decorator'; import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Offline Bookings')
@Controller('offline-bookings')
export class OfflineBookingController {
    constructor(private readonly offlineBookingService: OfflineBookingService) {}

    // ═══════════════════════════════════════════
    // External API (for the API holder company)
    // ═══════════════════════════════════════════

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(OfflineBookingApiKeyGuard)
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    @ApiOperation({
        summary: 'Receive an offline booking from the API holder company',
        description: 'Protected by x-api-key header. Creates a payment record for an offline/counter booking so the passenger gets a ticket and the data appears in the CMS dashboard.',
    })
    @ApiHeader({ name: 'x-api-key', required: true, description: 'Offline booking API key' })
    async createOfflineBooking(@Body() dto: CreateOfflineBookingDto) {
        return this.offlineBookingService.createOfflineBooking(dto);
    }

    // ═══════════════════════════════════════════
    // Admin endpoints (CMS dashboard)
    // ═══════════════════════════════════════════

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'List all offline bookings (admin dashboard)' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.offlineBookingService.findAll(
            Number(page) || 1,
            Number(limit) || 20,
        );
    }

    @Get('stats')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'Get offline booking statistics' })
    getStats() {
        return this.offlineBookingService.getStats();
    }

    @Get(':ticketNo')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'Get a specific offline booking by ticket number' })
    async findByTicketNo(@Param('ticketNo') ticketNo: string) {
        const booking = await this.offlineBookingService.findByTicketNo(ticketNo);
        if (!booking) {
            throw new NotFoundException(`Offline booking with ticket ${ticketNo} not found.`);
        }
        return booking;
    }
}




