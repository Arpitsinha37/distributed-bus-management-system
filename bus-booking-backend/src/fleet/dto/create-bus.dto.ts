import { IsArray, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateBusDto {
  @IsString()
  registrationNo: string;

  @IsString()
  type: string; // e.g. "AC Sleeper", "VIP Sofa"

  @IsString() @IsOptional() brand?: string;
  @IsString() @IsOptional() model?: string;
  @IsNumber() @IsOptional() manufacturingYear?: number;
  
  @IsString() @IsOptional() ownerName?: string;
  @IsString() @IsOptional() ownerPhone?: string;
  @IsString() @IsOptional() rcNumber?: string;
  @IsString() @IsOptional() insuranceNo?: string;

  @IsDateString() @IsOptional() insuranceExpiry?: string;
  @IsDateString() @IsOptional() fitnessExpiry?: string;
  @IsDateString() @IsOptional() permitExpiry?: string;

  @IsArray() @IsOptional()
  images?: string[];

  @IsArray() @IsOptional()
  amenities?: string[];

  @IsString()
  seatLayoutId: string;
}
