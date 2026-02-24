import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const hbs = require('hbs')

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Подключаем Handlebars
  app.setBaseViewsDir(join(__dirname, '..', 'views')); //Указываем директорию с шаблонами
  app.setViewEngine('hbs'); //Устанавливаем Handlebars как шаблонизатор

  // Регистрируем папку с частичными шаблонами (например, меню)
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));

  // Регистрируем папку со статикой
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
