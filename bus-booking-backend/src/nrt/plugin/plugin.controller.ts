import { StaffRole } from '@prisma/client';
import { Body, Controller, Get, Post, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PluginService } from './plugin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; import { Roles } from '../../common/decorators/roles.decorator'; import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('plugins')
export class PluginController {
    constructor(private pluginService: PluginService) { }

    @Get()
    @ApiOperation({ summary: 'List installed plugins' })
    findAll() { return this.pluginService.findAll(); }

    @Get('available')
    @ApiOperation({ summary: 'List available plugins in filesystem' })
    getAvailable() { return this.pluginService.getAvailablePlugins(); }

    @Post('install/:name')
    @ApiOperation({ summary: 'Install a plugin' })
    install(@Param('name') name: string) { return this.pluginService.install(name); }

    @Post('install')
    @ApiOperation({ summary: 'Install a plugin by request body' })
    installFromBody(@Body('name') name: string) { return this.pluginService.install(name); }

    @Patch(':id/enable')
    @ApiOperation({ summary: 'Enable a plugin' })
    enable(@Param('id') id: string) { return this.pluginService.enable(id); }

    @Post(':id/enable')
    @ApiOperation({ summary: 'Enable a plugin' })
    enablePost(@Param('id') id: string) { return this.pluginService.enable(id); }

    @Patch(':id/disable')
    @ApiOperation({ summary: 'Disable a plugin' })
    disable(@Param('id') id: string) { return this.pluginService.disable(id); }

    @Post(':id/disable')
    @ApiOperation({ summary: 'Disable a plugin' })
    disablePost(@Param('id') id: string) { return this.pluginService.disable(id); }

    @Delete(':id')
    @ApiOperation({ summary: 'Uninstall a plugin' })
    uninstall(@Param('id') id: string) { return this.pluginService.uninstall(id); }

    @Post(':id/uninstall')
    @ApiOperation({ summary: 'Uninstall a plugin' })
    uninstallPost(@Param('id') id: string) { return this.pluginService.uninstall(id); }
}




