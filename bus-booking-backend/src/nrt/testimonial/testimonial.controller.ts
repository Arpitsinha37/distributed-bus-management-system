import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonialService } from './testimonial.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialController {
    constructor(private readonly testimonialService: TestimonialService) { }

    @Get()
    findAll(@Query('approved') approved?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.testimonialService.findAll({
            isActive: approved !== undefined ? approved === 'true' : true,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.testimonialService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() body: any) {
        return this.testimonialService.create(body);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() body: any) {
        return this.testimonialService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.testimonialService.remove(id);
    }

    @Post(':id/delete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removePost(@Param('id') id: string) {
        return this.testimonialService.remove(id);
    }

    @Patch(':id/approve')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    toggleApproval(@Param('id') id: string, @Body('approved') isActive: boolean) {
        return this.testimonialService.toggleApproval(id, isActive);
    }
}


