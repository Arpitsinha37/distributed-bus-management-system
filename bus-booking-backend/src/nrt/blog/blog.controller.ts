// @ts-nocheck
import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
    constructor(private readonly svc: BlogService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('search') search?: string,
        @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.svc.findAll({ status, search, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 50 });
    }

    @Get('featured')
    findFeatured() {
        return this.svc.findAll({ isFeatured: true, limit: 10 });
    }

    @Get(':idOrSlug')
    findOne(@Param('idOrSlug') idOrSlug: string) { return this.svc.findOne(idOrSlug); }

    @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    create(@Body() body: any) { return this.svc.create(body); }

    @Put(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

    @Delete(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    remove(@Param('id') id: string) { return this.svc.remove(id); }

    @Post(':id/delete') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    removePost(@Param('id') id: string) { return this.svc.remove(id); }

    @Patch(':id/status') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    toggleStatus(@Param('id') id: string, @Body('status') status: string) { return this.svc.toggleStatus(id, status); }
}
