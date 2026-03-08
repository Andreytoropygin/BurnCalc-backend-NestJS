import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BurnCalcModule } from './burn-calc/burn-calc.module';
import { MinioModule } from './minio/minio.module';
import { ImagesController } from './images/images.controller';
import { VideosController } from './videos/videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Combustion } from './entities/combustion.entity';
import { Request } from './entities/request.entity';
import { RequestCombustion } from './entities/request-combustion.entity';

@Module({
  imports: [
    BurnCalcModule, 
    ConfigModule.forRoot({
      isGlobal: true, // Чтобы не импортировать в каждый модуль отдельно
      envFilePath: '.env', // Путь к файлу (по умолчанию .env)
      ignoreEnvFile: false,
    }),
    MinioModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Автоматический поиск всех *.entity файлов
        synchronize: false, // ВАЖНО: false, так как мы используем миграции или ручное управление схемой
        logging: true, // Включить логи SQL для отладки
      }),
    }),
  ],
  controllers: [ImagesController, VideosController]
})
export class AppModule {}
