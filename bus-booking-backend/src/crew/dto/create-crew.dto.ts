import { IsEmail, IsEnum, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { CrewRole } from '@prisma/client';

export class CreateCrewDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  licenseNo?: string;

  @IsDateString()
  @IsOptional()
  licenseExpiry?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsEnum(CrewRole)
  role: CrewRole;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
