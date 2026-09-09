import { Controller, Get, Header } from '@nestjs/common';
import { SitemapService } from './sitemap.service';

@Controller()
export class SitemapController {
    constructor(private readonly sitemapService: SitemapService) {}

    @Get('sitemap.xml')
    @Header('Content-Type', 'application/xml')
    @Header('Cache-Control', 'public, max-age=3600')
    async getSitemapIndex(): Promise<string> {
        return this.sitemapService.generateSitemapIndex();
    }

    @Get('sitemap-bus.xml')
    @Header('Content-Type', 'application/xml')
    @Header('Cache-Control', 'public, max-age=3600')
    async getBusSitemap(): Promise<string> {
        return this.sitemapService.generateBusSitemap();
    }

    @Get('sitemap-tour.xml')
    @Header('Content-Type', 'application/xml')
    @Header('Cache-Control', 'public, max-age=3600')
    async getTourSitemap(): Promise<string> {
        return this.sitemapService.generateTourSitemap();
    }

    @Get('sitemap-blog.xml')
    @Header('Content-Type', 'application/xml')
    @Header('Cache-Control', 'public, max-age=3600')
    async getBlogSitemap(): Promise<string> {
        return this.sitemapService.generateBlogSitemap();
    }

    @Get('sitemap-pages.xml')
    @Header('Content-Type', 'application/xml')
    @Header('Cache-Control', 'public, max-age=3600')
    async getPagesSitemap(): Promise<string> {
        return this.sitemapService.generatePagesSitemap();
    }
}
