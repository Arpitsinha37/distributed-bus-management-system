import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true is required for payment webhook signature verification
  // (payments.controller reads req.rawBody) — see providers/*.provider.ts
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Every DTO is validated and stripped of unexpected fields by default.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  app.enableCors(); // tighten to your storefront domains before going live
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Bus booking API running on http://localhost:${port}/api/v1`);
}
bootstrap();
