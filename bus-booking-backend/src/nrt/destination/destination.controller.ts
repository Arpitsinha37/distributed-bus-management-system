import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DestinationService } from './destination.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Destinations')
@Controller()
export class DestinationController {
    constructor(private readonly service: DestinationService) { }

    // ═══════════════ PUBLIC ═══════════════

    @Get('destinations')
    findAllPublic() {
        return this.service.findAllPublic();
    }

    @Get('destinations/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.service.findBySlug(slug);
    }

    // ═══════════════ ADMIN ═══════════════

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('admin/destinations')
    findAll() {
        return this.service.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('admin/destinations')
    create(@Body() body: any) {
        return this.service.create(body);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Put('admin/destinations/:id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete('admin/destinations/:id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Post('admin/destinations/:id/upload-image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.service.uploadImage(id, file);
    }
}
