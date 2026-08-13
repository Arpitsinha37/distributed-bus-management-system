import { SetMetadata } from '@nestjs/common';
import { StaffRole } from '../enums/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: StaffRole[]) => SetMetadata(ROLES_KEY, roles);
