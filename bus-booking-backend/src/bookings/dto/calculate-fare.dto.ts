import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SeatSelectionDto {
  @IsString()
  number: string;

  @IsString()
  type: string;
}

export class CalculateFareDto {
  @IsString()
  scheduleId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatSelectionDto)
  seats: SeatSelectionDto[];

  @IsString()
  @IsOptional()
  boardingPoint?: string;

  @IsString()
  @IsOptional()
  couponCode?: string;
}
