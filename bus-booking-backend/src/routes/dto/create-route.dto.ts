import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  originCity: string;

  @IsString()
  destinationCity: string;

  @IsOptional() @IsInt() @Min(0)
  durationMinutes?: number;

  @IsOptional() @IsArray()
  boardingPoints?: string[];

  @IsOptional() @IsArray()
  droppingPoints?: string[];
}
