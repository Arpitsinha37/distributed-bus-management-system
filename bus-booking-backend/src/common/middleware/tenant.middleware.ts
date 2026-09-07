import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const slug = req.headers['x-site-id'] as string | undefined;
    if (slug) {
      // Find the site by slug
      const site = await this.prisma.site.findUnique({ where: { slug } });
      if (!site) {
        return next(new NotFoundException(`Unknown site: ${slug}`));
      }
      // Attach the resolved CUID to the request
      (req as any).siteId = site.id;
    }
    next();
  }
}
