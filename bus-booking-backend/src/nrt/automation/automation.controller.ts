import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Automations')
@Controller('automations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AutomationController {
    constructor(private readonly svc: AutomationService) { }

    @Get()
    @ApiOperation({ summary: 'List all workflows' })
    list() {
        return this.svc.getWorkflows();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get workflow details with enrollments' })
    get(@Param('id') id: string) {
        return this.svc.getWorkflow(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new workflow' })
    create(@Body() body: any) {
        return this.svc.createWorkflow(body);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update workflow configuration' })
    update(@Param('id') id: string, @Body() body: any) {
        return this.svc.updateWorkflow(id, body);
    }

    @Put(':id/status')
    @ApiOperation({ summary: 'Toggle workflow active status' })
    toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.svc.toggleStatus(id, isActive);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a workflow' })
    remove(@Param('id') id: string) {
        return this.svc.deleteWorkflow(id);
    }

    // Manual test trigger endpoint for developers
    @Post('test-trigger')
    @ApiOperation({ summary: 'Manually trigger an event to test logic' })
    async testTrigger(@Body() body: { subscriberId: string; eventType: string; eventData: any }) {
        await this.svc.handleEvent(body.subscriberId, body.eventType, body.eventData);
        return { success: true, message: 'Event pushed to automation engine' };
    }
}
