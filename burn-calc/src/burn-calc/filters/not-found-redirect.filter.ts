// not-found-redirect.filter.ts
import { ExceptionFilter, Catch, NotFoundException, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch(NotFoundException)
export class NotFoundRedirectFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Проверяем, что запрос ожидает HTML (а не API JSON)
    if (response.req.headers['accept']?.includes('text/html')) {
      return response.redirect('/burn-calc');
    }
    
    // Для API возвращаем стандартный JSON ответ
    response.status(404).json({ statusCode: 404, message: exception.message });
  }
}