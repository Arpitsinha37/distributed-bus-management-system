import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
    constructor(private readonly chatbotService: ChatbotService) { }

    @Post('message')
    @ApiOperation({ summary: 'Send a message to the NRT AI Assistant' })
    async sendMessage(
        @Body() dto: { message: string; sessionId: string },
    ) {
        return this.chatbotService.handleMessage(dto.message, dto.sessionId);
    }
}
