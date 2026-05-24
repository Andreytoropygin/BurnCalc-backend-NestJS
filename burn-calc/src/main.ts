// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cors({
    origin: [
      'https://andreytoropygin.github.io',
      'https://localhost:4173',
      'http://localhost:4173',     // Ваш devUrl
      'http://localhost:3000',
      'http://localhost:8000',
      'http://192.168.0.105:8000',
      'tauri://localhost',         // КРИТИЧЕСКИ ВАЖНО для собранного AppImage/.deb на Linux
      'https://tauri.localhost',   // На всякий случай для новых версий
      'http://tauri.localhost'     // Для Windows
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
  
  app.use(cookieParser());

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const config = new DocumentBuilder()
  .setTitle('BurnCalc API')
  .setDescription('Сессионная аутентификация. После login скопируйте sessionId из Set-Cookie и вставьте в Authorize → Cookie.')
  .addCookieAuth('sessionId')
  .build();

  // Глобальный префикс
  app.setGlobalPrefix('api');

  // Глобальная валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Автоматическое исключение полей с @Exclude() из ответа
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}/api`);
}
bootstrap();