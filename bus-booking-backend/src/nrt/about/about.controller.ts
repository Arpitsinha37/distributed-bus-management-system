import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('About')
@Controller('about')
export class AboutController {
    constructor(private readonly aboutService: AboutService) { }

    @Get()
    get() {
        return this.aboutService.get();
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    upsert(@Body() body: any) {
        return this.aboutService.upsert(body);
    }
}
