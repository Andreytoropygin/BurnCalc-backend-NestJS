import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionService } from 'src/modules/session/session.service';
import { Request } from 'express';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Получаем sessionId из куки
    const sessionId = request.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('Session ID not found in cookies');
    }

    // Проверяем сессию в Redis через SessionService
    const userId = await this.sessionService.getUserId(sessionId);

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Добавляем userId в объект запроса
    (request as any).session = (request as any).session || {};
    (request as any).session.userId = userId;

    return true;
  }
}