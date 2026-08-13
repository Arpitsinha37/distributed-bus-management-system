import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // Sliders
  async getSliders(siteId?: string) { return this.prisma.slider.findMany({ where: siteId ? { siteId } : {}, orderBy: { order: 'asc' } }); }
  async createSlider(data: any) { return this.prisma.slider.create({ data }); }
  async updateSlider(id: string, data: any) { return this.prisma.slider.update({ where: { id }, data }); }
  async deleteSlider(id: string) { return this.prisma.slider.delete({ where: { id } }); }

  // Blogs
  async getBlogs(siteId?: string) { return this.prisma.blog.findMany({ where: siteId ? { siteId } : {}, orderBy: { createdAt: 'desc' } }); }
  async createBlog(data: any) { return this.prisma.blog.create({ data }); }
  async updateBlog(id: string, data: any) { return this.prisma.blog.update({ where: { id }, data }); }
  async deleteBlog(id: string) { return this.prisma.blog.delete({ where: { id } }); }

  // Testimonials
  async getTestimonials(siteId?: string) { return this.prisma.testimonial.findMany({ where: siteId ? { siteId } : {}, orderBy: { createdAt: 'desc' } }); }
  async createTestimonial(data: any) { return this.prisma.testimonial.create({ data }); }
  async updateTestimonial(id: string, data: any) { return this.prisma.testimonial.update({ where: { id }, data }); }
  async deleteTestimonial(id: string) { return this.prisma.testimonial.delete({ where: { id } }); }

  // Team
  async getTeamMembers(siteId?: string) { return this.prisma.teamMember.findMany({ where: siteId ? { siteId } : {}, orderBy: { order: 'asc' } }); }
  async createTeamMember(data: any) { return this.prisma.teamMember.create({ data }); }
  async updateTeamMember(id: string, data: any) { return this.prisma.teamMember.update({ where: { id }, data }); }
  async deleteTeamMember(id: string) { return this.prisma.teamMember.delete({ where: { id } }); }

  // FAQs
  async getFaqs(siteId?: string) { return this.prisma.fAQ.findMany({ where: siteId ? { siteId } : {}, orderBy: { order: 'asc' } }); }
  async createFaq(data: any) { return this.prisma.fAQ.create({ data }); }
  async updateFaq(id: string, data: any) { return this.prisma.fAQ.update({ where: { id }, data }); }
  async deleteFaq(id: string) { return this.prisma.fAQ.delete({ where: { id } }); }

  // Gallery
  async getGallery(siteId?: string) { return this.prisma.galleryImage.findMany({ where: siteId ? { siteId } : {}, orderBy: { order: 'asc' } }); }
  async createGalleryImage(data: any) { return this.prisma.galleryImage.create({ data }); }
  async updateGalleryImage(id: string, data: any) { return this.prisma.galleryImage.update({ where: { id }, data }); }
  async deleteGalleryImage(id: string) { return this.prisma.galleryImage.delete({ where: { id } }); }

  // Site Settings
  async getSiteSettings(siteId?: string) { 
    return this.prisma.siteSetting.findUnique({ where: { siteId: siteId || '' } }) || this.prisma.siteSetting.findFirst({ where: { siteId: null } }); 
  }
  async upsertSiteSettings(siteId: string | null, data: any) {
    const existing = await this.prisma.siteSetting.findUnique({ where: { siteId: siteId || '' } });
    if (existing) {
      return this.prisma.siteSetting.update({ where: { id: existing.id }, data });
    }
    return this.prisma.siteSetting.create({ data: { ...data, siteId } });
  }
}
