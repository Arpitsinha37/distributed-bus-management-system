import { Module } from '@nestjs/common';
import { BlogAuthorController } from './blog-author.controller';
import { BlogAuthorService } from './blog-author.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({ imports: [PrismaModule, AuthModule], controllers: [BlogAuthorController], providers: [BlogAuthorService] })
export class BlogAuthorModule { }
