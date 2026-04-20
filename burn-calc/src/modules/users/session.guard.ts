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

@Injectable()
export class SoftSessionGuard implements CanActivate {
  constructor(private sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Получаем sessionId из куки
    const sessionId = request.cookies?.sessionId;

    // Инициализируем объект session, если его нет
    (request as any).session = (request as any).session || {};

    if (sessionId) {
      // Пытаемся получить userId
      const userId = await this.sessionService.getUserId(sessionId);
      
      if (userId) {
        // Если сессия валидна, записываем userId
        (request as any).session.userId = userId;
      } else {
        // Если сессия невалидна, просто очищаем userId (гость)
        (request as any).session.userId = undefined;
      }
    }
    
    // Всегда возвращаем true, чтобы запрос дошел до контроллера
    return true;
  }
}
