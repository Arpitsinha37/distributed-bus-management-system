import { Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { memoryStorage } from 'multer';

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
    constructor(private mediaService: MediaService) { }

    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a file' })
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
    upload(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
        return this.mediaService.upload(file, undefined, folder);
    }

    @Get()
    @ApiOperation({ summary: 'List media files' })
    findAll(@Query('folder') folder?: string) {
        return this.mediaService.findAll(undefined, folder);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete media file' })
    delete(@Param('id') id: string) {
        return this.mediaService.delete(id);
    }
}
