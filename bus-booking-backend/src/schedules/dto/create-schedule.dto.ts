import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, Matches, Min, ValidateNested, IsOptional } from 'class-validator';

export class FareTierDto {
  @IsString()
  seatType: string;

  @IsString()
  @IsOptional()
  boardingPoint?: string;

  @IsNumber()
  amount: number;
}

export class CreateScheduleDto {
  @IsString()
  routeId: string;

  @IsString()
  busId: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'departureTime must be HH:mm' })
  departureTime: string;

  @IsArray()
  daysOfWeek: number[]; // [] = every day, otherwise 0=Sun..6=Sat

  @IsNumber() @Min(0)
  fare: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FareTierDto)
  fareTiers?: FareTierDto[];
}
