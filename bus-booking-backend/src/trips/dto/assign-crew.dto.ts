import { IsEnum, IsString } from 'class-validator';
import { CrewRole } from '@prisma/client';

export class AssignCrewDto {
  @IsString()
  crewMemberId: string;

  @IsEnum(CrewRole)
  role: CrewRole;
}
