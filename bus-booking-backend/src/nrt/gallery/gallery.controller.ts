import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
@ApiTags('Gallery') @Controller('gallery')
export class GalleryController {
    constructor(private readonly svc: GalleryService) { }
    @Get() findAll(@Query('status') status?: string, @Query('category') category?: string) { return this.svc.findAll({ status, category }); }
    @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
    @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth() create(@Body() body: any) { return this.svc.create(body); }
    @Put(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth() update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
    @Delete(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth() remove(@Param('id') id: string) { return this.svc.remove(id); }

    @Post(':id/delete') @UseGuards(JwtAuthGuard) @ApiBearerAuth() removePost(@Param('id') id: string) { return this.svc.remove(id); }
    @Patch(':id/status') @UseGuards(JwtAuthGuard) @ApiBearerAuth() toggleStatus(@Param('id') id: string, @Body('status') status: string) { return this.svc.toggleStatus(id, status); }
}
