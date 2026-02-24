import { Module, Global, DynamicModule } from '@nestjs/common';
import { MinioService } from './minio.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Global()
@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {
  static forRoot(): DynamicModule {
    return {
      module: MinioModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'MINIO_CLIENT',
          useFactory: (configService: ConfigService) => {
            // Вариант 1: Использовать значения по умолчанию (Рекомендуется для разработки)
            const endPoint = configService.get<string>('MINIO_ENDPOINT', 'localhost');
            const port = parseInt(configService.get<string>('MINIO_PORT', '9000') || '9000', 10);
            const useSSLString = configService.get<boolean>('MINIO_USE_SSL', false);
            const useSSL = useSSLString === true; 
            const accessKey = configService.get<string>('MINIO_ACCESS_KEY', 'admin');
            const secretKey = configService.get<string>('MINIO_SECRET_KEY', 'password');

            // ВАЖНО: Проверка на случай, если критические данные все же отсутствуют в продакшене
            if (!accessKey || !secretKey) {
              throw new Error('MinIO credentials (ACCESS_KEY or SECRET_KEY) are missing.');
            }

            return new Minio.Client({
              endPoint,
              port,
              useSSL,
              accessKey,
              secretKey,
            });
          },
          inject: [ConfigService],
        },
      ],
    };
  }
}