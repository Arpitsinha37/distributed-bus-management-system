import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogAuthorService } from './blog-author.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Blog Authors')
@Controller('blog-authors')
export class BlogAuthorController {
    constructor(private readonly svc: BlogAuthorService) { }

    @Get()
    findAll(@Query('search') search?: string) { return this.svc.findAll(search); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.svc.findOne(id); }

    @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    create(@Body() body: any) { return this.svc.create(body); }

    @Put(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

    @Delete(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    remove(@Param('id') id: string) { return this.svc.remove(id); }

    @Post(':id/delete') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    removePost(@Param('id') id: string) { return this.svc.remove(id); }
}
