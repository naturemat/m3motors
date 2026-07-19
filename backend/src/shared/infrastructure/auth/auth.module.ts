/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MobileJwtService } from './jwt.service';

const JWT_SECRET =
  process.env.JWT_SECRET ?? 'm3motors-mobile-secret-change-in-prod';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [MobileJwtService],
  exports: [MobileJwtService, JwtModule],
})
export class AuthModule {}
