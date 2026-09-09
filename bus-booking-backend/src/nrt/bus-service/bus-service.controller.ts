import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BusServiceService } from './bus-service.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Bus Services')
@Controller('bus-services')
export class BusServiceController {
    constructor(private readonly busServiceService: BusServiceService) { }

    // Public - frontend read
    @Get()
    findAll(@Query('status') status?: string, @Query('search') search?: string,
        @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.busServiceService.findAll({
            status: status === 'all' ? undefined : (status || 'active'),
            search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    // Public - find by slug (SEO-friendly URLs)
    @Get('by-slug/:slug')
    async findBySlug(@Param('slug') slug: string) {
        const service = await this.busServiceService.findBySlug(slug);
        if (!service) {
            throw new NotFoundException(`Bus service not found with slug: ${slug}`);
        }
        return service;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.busServiceService.findOne(id);
    }

    // Admin only
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() body: any) {
        return this.busServiceService.create(body);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() body: any) {
        return this.busServiceService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.busServiceService.remove(id);
    }

    @Post(':id/delete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removePost(@Param('id') id: string) {
        return this.busServiceService.remove(id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    toggleStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.busServiceService.toggleStatus(id, status);
    }
}
