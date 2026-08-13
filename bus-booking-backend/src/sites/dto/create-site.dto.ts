import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  slug: string; // e.g. "pokhara-express" — this is the X-Site-Id value

  @IsString()
  name: string;

  @IsString()
  domain: string;

  @IsOptional() @IsString()
  logoUrl?: string;

  @IsOptional() @IsString()
  themeColor?: string;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsString()
  contactPhone?: string;

  @IsOptional() @IsEmail()
  contactEmail?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
