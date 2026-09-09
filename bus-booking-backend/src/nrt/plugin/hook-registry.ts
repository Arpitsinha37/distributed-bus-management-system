import { Injectable } from '@nestjs/common';

export type HookName = 'beforeCreate' | 'afterCreate' | 'beforeUpdate' | 'afterUpdate' | 'beforeDelete' | 'afterDelete' | 'afterLogin' | 'beforeRender';

type HookHandler = (context: any) => Promise<any>;

@Injectable()
export class HookRegistry {
    private hooks = new Map<HookName, HookHandler[]>();

    register(hookName: HookName, handler: HookHandler): void {
        const handlers = this.hooks.get(hookName) || [];
        handlers.push(handler);
        this.hooks.set(hookName, handlers);
    }

    async execute(hookName: HookName, context: any): Promise<any> {
        const handlers = this.hooks.get(hookName) || [];
        let result = context;
        for (const handler of handlers) {
            result = (await handler(result)) || result;
        }
        return result;
    }

    getRegisteredHooks(): Record<string, number> {
        const result: Record<string, number> = {};
        this.hooks.forEach((handlers, name) => {
            result[name] = handlers.length;
        });
        return result;
    }

    clear(hookName?: HookName): void {
        if (hookName) {
            this.hooks.delete(hookName);
        } else {
            this.hooks.clear();
        }
    }
}
