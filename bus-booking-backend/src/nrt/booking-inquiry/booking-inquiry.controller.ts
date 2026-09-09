import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingInquiryService } from './booking-inquiry.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
@ApiTags('Booking Inquiries') @Controller('booking-inquiries')
export class BookingInquiryController {
    constructor(private readonly svc: BookingInquiryService) { }
    @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth() findAll(@Query('seen') seen?: string) { return this.svc.findAll(seen); }
    @Post() create(@Body() body: any) { return this.svc.create(body); }
    @Patch(':id/seen') @UseGuards(JwtAuthGuard) @ApiBearerAuth() toggleSeen(@Param('id') id: string, @Body('seen') seen: boolean) { return this.svc.toggleSeen(id, seen); }
}
