import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EmailSubscriberService } from './email-subscriber.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Email Subscribers')
@Controller('email-subscribers')
export class EmailSubscriberController {
    constructor(private readonly svc: EmailSubscriberService) { }

    // ── List with search, filter, sort, pagination ──
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List subscribers with search/filter/sort' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('city') city?: string,
        @Query('status') status?: string,
        @Query('source') source?: string,
        @Query('budgetTier') budgetTier?: string,
        @Query('minScore') minScore?: string,
        @Query('maxScore') maxScore?: string,
        @Query('tag') tag?: string,
        @Query('tagCategory') tagCategory?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: string,
    ) {
        return this.svc.findAll({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search, city, status, source, budgetTier,
            minScore: minScore ? Number(minScore) : undefined,
            maxScore: maxScore ? Number(maxScore) : undefined,
            tag, tagCategory, sortBy, sortOrder,
        });
    }

    // ── Dashboard stats ──
    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get subscriber statistics' })
    getStats() {
        return this.svc.getStats();
    }

    // ── All unique tags (for filter dropdowns) ──
    @Get('tags')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all unique tags' })
    getAllTags() {
        return this.svc.getAllTags();
    }

    // ── Unique cities ──
    @Get('cities')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all unique cities' })
    getCities() {
        return this.svc.getUniqueCities();
    }

    // ── Single subscriber profile ──
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get subscriber profile with tags & events' })
    getProfile(@Param('id') id: string) {
        return this.svc.getProfile(id);
    }

    // ── Public subscribe endpoint ──
    @Post()
    @ApiOperation({ summary: 'Subscribe (public)' })
    subscribe(@Body('email') email: string, @Body('source') source?: string) {
        return this.svc.subscribe(email, source);
    }

    // ── Update subscriber ──
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update subscriber profile' })
    update(@Param('id') id: string, @Body() body: any) {
        return this.svc.update(id, body);
    }

    // ── Delete subscriber ──
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete subscriber' })
    remove(@Param('id') id: string) {
        return this.svc.remove(id);
    }

    // ── Also support POST delete (for compat) ──
    @Post(':id/delete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removePost(@Param('id') id: string) {
        return this.svc.remove(id);
    }

    // ── Bulk delete ──
    @Post('bulk/delete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bulk delete subscribers' })
    bulkDelete(@Body('ids') ids: string[]) {
        return this.svc.bulkDelete(ids);
    }

    // ── Bulk tag ──
    @Post('bulk/tag')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bulk tag subscribers' })
    bulkTag(@Body() body: { ids: string[]; tags: { category: string; value: string }[] }) {
        return this.svc.bulkTag(body.ids, body.tags);
    }

    // ── Add tags to single subscriber ──
    @Post(':id/tags')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add tags to subscriber' })
    addTags(@Param('id') id: string, @Body('tags') tags: { category: string; value: string }[]) {
        return this.svc.addTags(id, tags);
    }

    // ── Remove a tag ──
    @Delete('tags/:tagId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove a tag' })
    removeTag(@Param('tagId') tagId: string) {
        return this.svc.removeTag(tagId);
    }

    // ── Log event ──
    @Post(':id/events')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Log subscriber event' })
    logEvent(
        @Param('id') id: string,
        @Body() body: { eventType: string; eventData?: any; campaignId?: string },
    ) {
        return this.svc.logEvent(id, body.eventType, body.eventData, body.campaignId);
    }
}
