import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
import { Readable } from 'stream';

@Injectable()
export class MediaService {
    constructor(private prisma: PrismaService) {}

    /**
     * Upload a file to Cloudinary CDN and store the URL in the database.
     * Cloudinary automatically optimizes images (format, quality, size).
     */
    async upload(file: Express.Multer.File, tenantId?: string, folder = '/') {
        // Determine resource type for Cloudinary
        const resourceType = file.mimetype.startsWith('video/')
            ? 'video' as const
            : file.mimetype.startsWith('image/')
                ? 'image' as const
                : 'raw' as const;

        // Build the Cloudinary folder path
        const cloudinaryFolder = `newroadtravels${folder === '/' ? '' : folder}`;

        // Upload to Cloudinary via stream
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: cloudinaryFolder,
                    resource_type: resourceType,
                    // Use original filename without extension as public_id
                    public_id: file.originalname.replace(/\.[^/.]+$/, ''),
                    overwrite: false,
                    unique_filename: true,
                    // Apply automatic quality & format optimization for images
                    ...(resourceType === 'image' && {
                        transformation: [
                            { quality: 'auto', fetch_format: 'auto' },
                        ],
                    }),
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            );

            // Pipe the file buffer into the upload stream
            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });

        // Store the Cloudinary secure URL in the database
        return this.prisma.mediaFile.create({
            data: {
                filename: file.originalname,
                url: uploadResult.secure_url,
                mimeType: file.mimetype,
                size: file.size,
                folder,
                
            },
        });
    }

    async findAll(tenantId?: string, folder?: string) {
        const where: any = {};
        if (tenantId) where.tenantId = tenantId;
        if (folder) where.folder = folder;
        return this.prisma.mediaFile.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async findById(id: string) {
        const media = await this.prisma.mediaFile.findUnique({ where: { id } });
        if (!media) throw new NotFoundException('Media not found');
        return media;
    }

    async delete(id: string) {
        const media = await this.findById(id);

        // If the URL is a Cloudinary URL, also delete from Cloudinary
        if (media.url.includes('res.cloudinary.com')) {
            try {
                // Extract public_id from Cloudinary URL
                const urlParts = media.url.split('/upload/');
                if (urlParts[1]) {
                    // Remove version and file extension to get public_id
                    const pathAfterUpload = urlParts[1]
                        .replace(/^v\d+\//, '') // remove version like v1234567890/
                        .replace(/\.[^/.]+$/, ''); // remove file extension

                    const resourceType = media.mimeType.startsWith('video/')
                        ? 'video' as const
                        : media.mimeType.startsWith('image/')
                            ? 'image' as const
                            : 'raw' as const;

                    await cloudinary.uploader.destroy(pathAfterUpload, {
                        resource_type: resourceType,
                    });
                }
            } catch (err) {
                console.error('Failed to delete from Cloudinary:', err);
                // Continue with DB deletion even if Cloudinary delete fails
            }
        }

        await this.prisma.mediaFile.delete({ where: { id } });
    }
}


