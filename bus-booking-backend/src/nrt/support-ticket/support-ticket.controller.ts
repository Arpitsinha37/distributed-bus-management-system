import { StaffRole } from '@prisma/client';
import { Controller, Get, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupportTicketService } from './support-ticket.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; import { Roles } from '../../common/decorators/roles.decorator'; import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Support Tickets')
@Controller('support-tickets')
export class SupportTicketController {
    constructor(private readonly service: SupportTicketService) { }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'List all support tickets (CMS dashboard)' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('type') type?: string,
    ) {
        return this.service.findAll(
            Number(page) || 1,
            Number(limit) || 20,
            status || undefined,
            type || undefined,
        );
    }

    @Get('stats')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'Get support ticket statistics' })
    getStats() {
        return this.service.getStats();
    }

    @Patch(':id/approve')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'Approve a support ticket' })
    approve(
        @Param('id') id: string,
        @Body() dto: { adminNotes?: string },
    ) {
        return this.service.approve(id, dto.adminNotes);
    }

    @Patch(':id/reject')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'Reject a support ticket' })
    reject(
        @Param('id') id: string,
        @Body() dto: { adminNotes?: string },
    ) {
        return this.service.reject(id, dto.adminNotes);
    }
}





