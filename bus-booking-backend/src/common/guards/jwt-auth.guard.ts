import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Protects admin-panel routes. Public booking-search endpoints on the
// storefronts don't use this — only staff-facing endpoints do.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
