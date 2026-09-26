import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsString()
  discountType: string;

  @IsNumber()
  discountValue: number;

  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @IsNumber()
  @IsOptional()
  minBookingAmount?: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validTo: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsArray()
  @IsOptional()
  scheduleIds?: string[];
}
