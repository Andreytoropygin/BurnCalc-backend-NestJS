// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { DatabaseModule } from './modules/database/database.module';
import { MinioModule } from './modules/minio/minio.module';
import { SessionModule } from './modules/session/session.module';

// Импорт модулей доменов
import { CompoundsModule } from './modules/compounds/compounds.module';
import { CombustionsModule } from './modules/combustions/combustions.module';
import { CompoundCombustionsModule } from './modules/compound-combustions/compound-combustions.module';
import { UsersModule } from './modules/users/users.module';

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

    MinioModule,
    DatabaseModule,
    SessionModule,

    // Модули доменов
    CompoundsModule,
    CombustionsModule,
    CompoundCombustionsModule,
    UsersModule,
  ],
  controllers: [AppController]
})
export class AppModule {}