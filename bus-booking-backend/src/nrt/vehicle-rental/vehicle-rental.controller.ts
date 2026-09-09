import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { VehicleRentalService } from './vehicle-rental.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Vehicle Rentals')
@Controller('vehicle-rentals')
export class VehicleRentalController {
    constructor(private readonly vehicleRentalService: VehicleRentalService) { }

    @Get()
    findAll(@Query('availabilityStatus') availabilityStatus?: string,
        @Query('vehicleType') vehicleType?: string, @Query('search') search?: string,
        @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.vehicleRentalService.findAll({
            availabilityStatus: availabilityStatus || '',
            vehicleType,
            search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    @Get('featured')
    findFeatured() {
        return this.vehicleRentalService.findAll({ isFeatured: true, limit: 10 });
    }

    @Get('by-slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.vehicleRentalService.findBySlug(slug);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.vehicleRentalService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() body: any) {
        return this.vehicleRentalService.create(body);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() body: any) {
        return this.vehicleRentalService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.vehicleRentalService.remove(id);
    }

    @Post(':id/delete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removePost(@Param('id') id: string) {
        return this.vehicleRentalService.remove(id);
    }

    @Post(':id/upload-image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.vehicleRentalService.uploadImage(id, file);
    }

    @Delete(':id/image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removeImage(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
        return this.vehicleRentalService.removeImage(id, imageUrl);
    }

    @Post(':id/remove-image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removeImagePost(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
        return this.vehicleRentalService.removeImage(id, imageUrl);
    }
}
