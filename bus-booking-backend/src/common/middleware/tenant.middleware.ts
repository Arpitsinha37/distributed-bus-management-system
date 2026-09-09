import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const siteIdOrSlug = req.headers['x-site-id'] as string | undefined;
    if (siteIdOrSlug) {
      if (siteIdOrSlug === 'global') {
        (req as any).siteId = 'global';
      } else {
        // Find the site by slug or ID
        const site = await this.prisma.site.findFirst({
          where: {
            OR: [
              { slug: siteIdOrSlug },
              { id: siteIdOrSlug }
            ]
          }
        });
        if (!site) {
          return next(new NotFoundException(`Unknown site: ${siteIdOrSlug}`));
        }
        // Attach the resolved CUID to the request
        (req as any).siteId = site.id;
      }
    }
    next();
  }
}
