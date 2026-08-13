import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { StaffRole } from '../../common/enums/roles.enum';

export class CreateStaffDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString() @MinLength(6)
  password: string; // hashed in the service, never stored raw

  @IsOptional() @IsEnum(StaffRole)
  role?: StaffRole;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  // cuid[] of sites this staff member is scoped to.
  // Empty = SUPER_ADMIN sees all; for other roles, empty = no access.
  @IsOptional() @IsArray() @IsString({ each: true })
  siteIds?: string[];
}
