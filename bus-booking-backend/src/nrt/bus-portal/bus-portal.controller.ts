import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BusPortalService } from './bus-portal.service';

@ApiTags('Bus Portal')
@Controller('bus-portal')
export class BusPortalController {
    constructor(private readonly busPortalService: BusPortalService) { }

    @Get('routes')
    @ApiOperation({ summary: 'Fetch available route locations from bus portal' })
    fetchRoutes() {
        return this.busPortalService.fetchRoutes();
    }

    @Post('trips')
    @ApiOperation({ summary: 'Search available trips between locations' })
    searchTrips(
        @Body() dto: { from_location: string; to_location: string; date: string },
    ) {
        return this.busPortalService.fetchTrips(
            dto.from_location,
            dto.to_location,
            dto.date,
        );
    }

    @Post('hold-seat')
    @ApiOperation({ summary: 'Hold selected seats (returns ticket/holding number)' })
    holdSeat(@Body() dto: { seat: string; totalseat: string; busno: string }) {
        return this.busPortalService.holdSeat(dto.seat, dto.totalseat, dto.busno);
    }

    @Post('cancel-hold')
    @ApiOperation({ summary: 'Cancel a held seat by holding number' })
    cancelHold(@Body() dto: { holdingnumber: string }) {
        return this.busPortalService.cancelHolding(dto.holdingnumber);
    }

    @Post('passenger-detail')
    @ApiOperation({ summary: 'Fill passenger details for a booking' })
    fillPassengerDetail(
        @Body()
        dto: {
            name: string;
            contact: string;
            pickup: string;
            drop: string;
            TicketNo: string;
        },
    ) {
        return this.busPortalService.fillPassengerDetail(
            dto.name,
            dto.contact,
            dto.pickup,
            dto.drop,
            dto.TicketNo,
        );
    }

    @Post('passenger-detail/query')
    @ApiOperation({ summary: 'Get passenger details by ticket number' })
    getPassengerDetail(@Body() dto: { TicketNo: string }) {
        return this.busPortalService.getPassengerDetail(dto.TicketNo);
    }

    @Post('payment-confirm')
    @ApiOperation({ summary: 'Confirm payment for a ticket' })
    confirmPayment(
        @Body() dto: { TicketNo: string; pidx: string; cashbackamount: string },
    ) {
        return this.busPortalService.confirmPayment(
            dto.TicketNo,
            dto.pidx,
            dto.cashbackamount,
        );
    }

    @Post('ticket-status')
    @ApiOperation({ summary: 'Query ticket confirmation status' })
    queryTicket(@Body() dto: { TicketNo: string }) {
        return this.busPortalService.queryTicket(dto.TicketNo);
    }
}
