// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './common/database.module';

// Импорт модулей доменов
import { CombustionsModule } from './modules/combustions/combustions.module';
import { RequestsModule } from './modules/requests/requests.module';
import { RequestCombustionsModule } from './modules/request-combustions/request-combustions.module';
import { UsersModule } from './modules/users/users.module';
import { MinioModule } from './common/minio/minio.module';

@Module({
  imports: [
    // Глобальная конфигурация из .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Подключение TypeORM к PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('DB_SYNC') === 'true',
        logging: configService.get<string>('DB_LOG') === 'true',
      }),
      inject: [ConfigService],
    }),

    // Модули доменов
    MinioModule,
    DatabaseModule,
    CombustionsModule,
    RequestsModule,
    RequestCombustionsModule,
    UsersModule,
  ]
})
export class AppModule {}