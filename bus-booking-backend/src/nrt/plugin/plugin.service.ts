import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HookRegistry } from './hook-registry';
import * as path from 'path';
import * as fs from 'fs';

export interface PluginDefinition {
    name: string;
    displayName: string;
    version: string;
    description?: string;
    hooks?: Record<string, (context: any) => Promise<any>>;
    routes?: any[];
    adminPages?: any[];
}

@Injectable()
export class PluginService {
    private logger = new Logger('PluginService');
    private pluginsDir = path.resolve(process.cwd(), '../../packages/plugins');

    constructor(
        private prisma: PrismaService,
        private hookRegistry: HookRegistry,
    ) { }

    async findAll() {
        return this.prisma.plugin.findMany({ orderBy: { installedAt: 'desc' } });
    }

    async findById(id: string) {
        const plugin = await this.prisma.plugin.findUnique({ where: { id } });
        if (!plugin) throw new NotFoundException('Plugin not found');
        return plugin;
    }

    async install(pluginName: string) {
        const pluginPath = path.join(this.pluginsDir, pluginName, 'index.ts');

        if (!fs.existsSync(pluginPath)) {
            throw new NotFoundException(`Plugin "${pluginName}" not found in plugins directory`);
        }

        // In production, this would be dynamic import with sandboxing
        const plugin = await this.prisma.plugin.create({
            data: { name: pluginName, displayName: pluginName, version: '1.0.0', enabled: false },
        });

        return plugin;
    }

    async enable(id: string) {
        const plugin = await this.findById(id);

        // Load plugin hooks
        try {
            const pluginPath = path.join(this.pluginsDir, plugin.name, 'index.ts');
            if (fs.existsSync(pluginPath)) {
                this.logger.log(`Loading plugin: ${plugin.name}`);
                // In production: dynamic import + register hooks
            }
        } catch (e) {
            this.logger.error(`Failed to load plugin ${plugin.name}:`, e);
        }

        return this.prisma.plugin.update({ where: { id }, data: { enabled: true } });
    }

    async disable(id: string) {
        await this.findById(id);
        return this.prisma.plugin.update({ where: { id }, data: { enabled: false } });
    }

    async uninstall(id: string) {
        await this.findById(id);
        await this.prisma.plugin.delete({ where: { id } });
    }

    async getAvailablePlugins(): Promise<string[]> {
        if (!fs.existsSync(this.pluginsDir)) return [];
        return fs.readdirSync(this.pluginsDir).filter((f) => {
            const indexPath = path.join(this.pluginsDir, f, 'index.ts');
            return fs.existsSync(indexPath);
        });
    }
}
