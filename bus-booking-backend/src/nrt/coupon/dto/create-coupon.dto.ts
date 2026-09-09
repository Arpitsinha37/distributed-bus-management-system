import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE10', description: 'Unique coupon code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ enum: ['percentage', 'fixed'], example: 'percentage' })
  @IsEnum(['percentage', 'fixed'])
  type!: string;

  @ApiProperty({ example: 0.1, description: 'Value (0.1 for 10% or flat amount)' })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiProperty({ example: 500, description: 'Minimum booking amount required' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minAmount?: number;

  @ApiProperty({ example: 200, description: 'Maximum discount allowed (for percentage type)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscount?: number;

  @ApiProperty({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  expiryDate!: string;

  @ApiProperty({ example: 100, description: 'Maximum times this coupon can be used' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @ApiProperty({ example: '10% off for summer bookings' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
