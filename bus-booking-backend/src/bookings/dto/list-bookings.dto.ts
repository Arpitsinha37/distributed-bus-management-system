import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class ListBookingsDto {
  @IsOptional() @IsString()
  siteId?: string;

  @IsOptional() @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional() @IsDateString()
  dateFrom?: string;

  @IsOptional() @IsDateString()
  dateTo?: string;

  @IsOptional() @IsString()
  page?: string;

  @IsOptional() @IsString()
  limit?: string;
}
