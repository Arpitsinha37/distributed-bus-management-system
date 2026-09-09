import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCouponDto {
  @ApiProperty({ example: 'SUMMER20', description: 'The coupon code to validate' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 1500, description: 'The total booking amount before discount' })
  @IsNumber()
  @Min(0)
  bookingAmount!: number;
}
