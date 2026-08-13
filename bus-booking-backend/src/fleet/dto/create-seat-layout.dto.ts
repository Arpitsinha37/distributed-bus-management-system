import { IsInt, IsObject, IsString, Min } from 'class-validator';

export class CreateSeatLayoutDto {
  @IsString()
  name: string; // e.g. "40-seat 2x2 seater"

  @IsInt() @Min(1)
  totalSeats: number;

  @IsObject()
  layoutJson: any; // Prisma Json field — validated as object by @IsObject, stored as-is
}
