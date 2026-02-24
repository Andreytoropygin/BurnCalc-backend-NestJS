import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BurnCalcModule } from './burn-calc/burn-calc.module';
import { MinioModule } from './minio/minio.module';
import { ImagesController } from './images/images.controller';
import { VideosController } from './videos/videos.controller';

@Module({
  imports: [
    BurnCalcModule, 
    ConfigModule.forRoot({
      isGlobal: true, // Чтобы не импортировать в каждый модуль отдельно
      envFilePath: '.env', // Путь к файлу (по умолчанию .env)
      ignoreEnvFile: false,
    }),
    MinioModule.forRoot(),
  ],
  controllers: [ImagesController, VideosController]
})
export class AppModule {}
