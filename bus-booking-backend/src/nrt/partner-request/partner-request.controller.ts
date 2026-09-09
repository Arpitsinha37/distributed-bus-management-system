import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PartnerRequestService } from './partner-request.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
@ApiTags('Partner Requests') @Controller('partner-requests')
export class PartnerRequestController {
    constructor(private readonly svc: PartnerRequestService) { }
    @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth() findAll(@Query('status') status?: string) { return this.svc.findAll(status); }
    @Post() create(@Body() body: any) { return this.svc.create(body); }
    @Patch(':id/status') @UseGuards(JwtAuthGuard) @ApiBearerAuth() updateStatus(@Param('id') id: string, @Body('status') status: string) { return this.svc.updateStatus(id, status); }
}
