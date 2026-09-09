import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { TourPackageService } from './tour-package.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Tour Packages')
@Controller('tour-packages')
export class TourPackageController {
    constructor(private readonly tourPackageService: TourPackageService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('featured') featured?: string,
        @Query('search') search?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.tourPackageService.findAll({
            status: status === 'all' ? undefined : (status || 'active'),
            featured: featured !== undefined ? featured === 'true' : undefined,
            search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    @Get('slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.tourPackageService.findBySlug(slug);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tourPackageService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() body: any) {
        return this.tourPackageService.create(body);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() body: any) {
        return this.tourPackageService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.tourPackageService.remove(id);
    }

    @Post(':id/delete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removePost(@Param('id') id: string) {
        return this.tourPackageService.remove(id);
    }

    @Post(':id/upload-cover')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    uploadCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.tourPackageService.uploadCoverImage(id, file);
    }

    @Post(':id/upload-gallery')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    uploadGallery(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.tourPackageService.uploadGalleryImage(id, file);
    }

    @Post(':id/remove-gallery-image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removeGalleryImage(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
        return this.tourPackageService.removeGalleryImage(id, imageUrl);
    }
}
