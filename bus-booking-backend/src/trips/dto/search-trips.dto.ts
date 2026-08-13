import { IsDateString, IsString } from 'class-validator';

export class SearchTripsDto {
  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsDateString()
  date: string; // "2026-08-20"
}
