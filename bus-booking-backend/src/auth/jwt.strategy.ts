import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    });
  }

  // Whatever this returns becomes request.user in every guarded controller.
  async validate(payload: { sub: string; email: string; role: string; siteIds: string[] }) {
    return { id: payload.sub, email: payload.email, role: payload.role, siteIds: payload.siteIds };
  }
}
