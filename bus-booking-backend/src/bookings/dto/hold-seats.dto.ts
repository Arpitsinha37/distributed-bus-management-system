import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

class PassengerInput {
  @IsString() name: string;
  @IsOptional() age?: number;
  @IsOptional() @IsString() gender?: string;
  @IsString() seatNumber: string;
}

export class HoldSeatsDto {
  @IsString() tripId: string;

  @IsArray() @ArrayMinSize(1)
  seatNumbers: string[];

  @IsString() customerName: string;
  @IsString() customerPhone: string;
  @IsOptional() @IsEmail() customerEmail?: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => PassengerInput)
  passengers: PassengerInput[];
}
