import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// Enum was removed in SQLite, using string types instead
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // Endpoint does not require any specific role
    }
    
    // In a real application, you would extract the user from the JWT request object.
    // E.g., const { user } = context.switchToHttp().getRequest();
    // For Phase 2, we mock the user extraction payload:
    const mockUserPayload = { role: 'ADMIN' }; // Simulating an Admin logged in
    
    return requiredRoles.includes(mockUserPayload.role);
  }
}
