import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

// Every storefront sends its identity explicitly via X-Site-Id — never
// inferred from Origin/Referer, which is easy to spoof or misconfigure.
// Usage: findTrips(@SiteId() siteId: string) { ... }
export const SiteId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  
  // If the TenantMiddleware resolved the slug to a CUID, it will be here.
  const siteId = request.siteId;
  
  if (!siteId) {
    throw new BadRequestException('Missing or invalid X-Site-Id header');
  }
  return siteId;
});
