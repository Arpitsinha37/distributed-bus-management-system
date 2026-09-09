import { Module } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { PluginController } from './plugin.controller';
import { HookRegistry } from './hook-registry';
@Module({ controllers: [PluginController], providers: [PluginService, HookRegistry], exports: [PluginService, HookRegistry] })
export class PluginModule { }
