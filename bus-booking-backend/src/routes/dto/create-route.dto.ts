import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  originCity: string;

  @IsString()
  destinationCity: string;

  @IsOptional() @IsNumber() @Min(0)
  distanceKm?: number;

  @IsOptional() @IsInt() @Min(0)
  durationMinutes?: number;

  @IsOptional() @IsArray()
  boardingPoints?: string[];

  @IsOptional() @IsArray()
  droppingPoints?: string[];
}
