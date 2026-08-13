import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

class PassengerInput {
  @IsString() name: string;
  @IsOptional() age?: number;
  @IsOptional() @IsString() gender?: string;
  @IsString() seatNumber: string;
}

class SeatSelectionInput {
  @IsString() number: string;
  @IsString() type: string;
}

export class CreateCounterBookingDto {
  @IsString() tripId: string;
  
  @IsString() scheduleId: string;

  @IsArray() @ArrayMinSize(1)
  @ValidateNested({ each: true }) @Type(() => SeatSelectionInput)
  seats: SeatSelectionInput[];

  @IsString() customerName: string;
  @IsString() customerPhone: string;
  @IsOptional() @IsEmail() customerEmail?: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => PassengerInput)
  passengers: PassengerInput[];

  @IsString() paymentMethod: string;

  @IsString()
  @IsOptional()
  boardingPoint?: string;

  @IsString()
  @IsOptional()
  droppingPoint?: string;
}
