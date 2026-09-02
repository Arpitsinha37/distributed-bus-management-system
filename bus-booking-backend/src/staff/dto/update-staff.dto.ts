import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { StaffRole } from '../common/enums/roles.enum';

export class UpdateStaffDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString() @MinLength(6)
  password?: string;

  @IsOptional() @IsEnum(StaffRole)
  role?: StaffRole;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @IsOptional() @IsArray() @IsString({ each: true })
  siteIds?: string[];
}
