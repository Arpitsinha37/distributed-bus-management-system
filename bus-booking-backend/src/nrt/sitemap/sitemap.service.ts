import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SitemapService {
    private readonly BASE_URL = 'https://www.newroadtravels.com';
    private readonly API_BASE = 'https://travel-production-ffc8.up.railway.app/api';

    constructor(private prisma: PrismaService) {}

    async generateSitemapIndex(): Promise<string> {
        const now = new Date().toISOString().split('T')[0];
        
        const sitemaps = [
            `${this.BASE_URL}/sitemap-pages.xml`,
            `${this.BASE_URL}/sitemap-bus.xml`,
            `${this.BASE_URL}/sitemap-tour.xml`,
            `${this.BASE_URL}/sitemap-blog.xml`
        ];

        const sitemapTags = sitemaps.map(url => `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('');

        return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapTags}
</sitemapindex>`;
    }

    async generatePagesSitemap(): Promise<string> {
        const vehicleRentals = await this.prisma.vehicleRental.findMany({
            where: { availabilityStatus: 'available' },
            select: { slug: true, vehicleName: true, images: true, updatedAt: true },
        });

        const urls: string[] = [];
        const now = new Date().toISOString().split('T')[0];
        const staticPages = [
            { loc: '/', changefreq: 'daily', priority: '1.0', lastmod: now },
            { loc: '/about', changefreq: 'monthly', priority: '0.8' },
            { loc: '/rentals', changefreq: 'weekly', priority: '0.9', lastmod: now },
            { loc: '/tours', changefreq: 'weekly', priority: '0.9', lastmod: now },
            { loc: '/blog', changefreq: 'daily', priority: '0.8', lastmod: now },
            { loc: '/faq', changefreq: 'monthly', priority: '0.7', lastmod: now },
            { loc: '/testimonials', changefreq: 'monthly', priority: '0.5' },
            { loc: '/location', changefreq: 'monthly', priority: '0.5' },
        ];

        for (const page of staticPages) {
            urls.push(this.buildUrlEntry(page.loc, page.lastmod ? new Date(page.lastmod) : undefined, page.changefreq, page.priority));
        }

        for (const rental of vehicleRentals) {
            const images = (rental.images as string[] || [])
                .filter(img => img && !img.includes('base64') && !img.startsWith('data:'))
                .slice(0, 5)
                .map(img => ({
                    loc: img.startsWith('http') ? img : `${this.BASE_URL}${img}`,
                    title: rental.vehicleName,
                }));
            urls.push(this.buildUrlEntry(
                `/rentals/${rental.slug}`,
                rental.updatedAt,
                'weekly',
                '0.8',
                images,
            ));
        }

        return this.wrapWithUrlset(urls);
    }

    async generateBusSitemap(): Promise<string> {
        const busServices = await this.prisma.busService.findMany({
            where: { status: 'active' },
            select: { id: true, slug: true, title: true, source: true, destination: true, image: true, updatedAt: true },
        });

        const urls: string[] = [];
        for (const service of busServices) {
            const title = service.title || `${service.source} to ${service.destination} Bus Service`;
            const path = service.slug ? `/bus/${service.slug}` : `/bus-service/${service.id}`;
            urls.push(this.buildUrlEntry(
                path,
                service.updatedAt,
                'daily',
                '0.9',
                service.image ? [{ loc: service.image, title }] : [],
            ));
        }

        return this.wrapWithUrlset(urls);
    }

    async generateTourSitemap(): Promise<string> {
        const tourPackages = await this.prisma.tourPackage.findMany({
            where: { status: 'active' },
            select: { slug: true, title: true, image: true, updatedAt: true },
        });

        const destinations = await this.prisma.destination.findMany({
            where: { status: 'active' },
            select: { slug: true, name: true, image: true, updatedAt: true },
        });

        const urls: string[] = [];
        for (const pkg of tourPackages) {
            urls.push(this.buildUrlEntry(
                `/tours/${pkg.slug}`,
                pkg.updatedAt,
                'weekly',
                '0.8',
                pkg.image ? [{ loc: pkg.image, title: pkg.title }] : [],
            ));
        }

        for (const dest of destinations) {
            urls.push(this.buildUrlEntry(
                `/destinations/${dest.slug}`,
                dest.updatedAt,
                'monthly',
                '0.7',
                dest.image ? [{ loc: dest.image, title: dest.name }] : [],
            ));
        }

        return this.wrapWithUrlset(urls);
    }

    async generateBlogSitemap(): Promise<string> {
        const blogs = await this.prisma.blog.findMany({
            where: { isPublished: true },
            select: { slug: true, title: true, coverImage: true, updatedAt: true },
        });

        const urls: string[] = [];
        for (const blog of blogs) {
            urls.push(this.buildUrlEntry(
                `/blog/${blog.slug}`,
                blog.updatedAt,
                'weekly',
                '0.7',
                blog.coverImage ? [{ loc: blog.coverImage, title: blog.title }] : [],
            ));
        }

        return this.wrapWithUrlset(urls);
    }

    private wrapWithUrlset(urls: string[]): string {
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;
    }

    private buildUrlEntry(
        path: string,
        lastmod?: Date,
        changefreq = 'weekly',
        priority = '0.5',
        images: { loc: string; title: string }[] = [],
    ): string {
        const cleanPath = path.trim();
        const lastmodTag = lastmod
            ? `    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>`
            : '';

        const imageTags = images
            .filter(img => img.loc && !img.loc.includes('base64') && !img.loc.includes('data:image'))
            .map(img => {
                const fullLoc = img.loc.startsWith('http') ? img.loc : `${this.BASE_URL}${img.loc.startsWith('/') ? '' : '/'}${img.loc}`;
                return `    <image:image>
      <image:loc>${this.escapeXml(fullLoc)}</image:loc>
      <image:title>${this.escapeXml(img.title)}</image:title>
    </image:image>`;
            })
            .join('\n');

        return `  <url>
    <loc>${this.BASE_URL}${cleanPath}</loc>
${lastmodTag ? lastmodTag + '\n' : ''}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${imageTags ? imageTags + '\n' : ''}  </url>`;
    }

    private escapeXml(str: string): string {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
