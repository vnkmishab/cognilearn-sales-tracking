import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(email: string, pass: string) {
    // In Phase 1, we mock authentication
    if (email === 'admin@fieldops.com' && pass === 'password') {
      return {
        access_token: 'mock-jwt-token-admin',
        role: 'ADMIN'
      };
    }
    if (email === 'employee@fieldops.com' && pass === 'password') {
      return {
        access_token: 'mock-jwt-token-employee',
        role: 'EMPLOYEE'
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
