import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Get()
    get() {
        return this.contactService.get();
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    upsert(@Body() body: any) {
        return this.contactService.upsert(body);
    }
}
