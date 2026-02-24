import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly bucketName: string;

  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    private readonly configService: ConfigService,
  ) {
    // Добавляем второе аргументом значение по умолчанию
    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'burncalc-images');
  }

  async onModuleInit() {
    // Создаем бакет, если он не существует
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      console.log(`Bucket "${this.bucketName}" created successfully.`);
      
      // Делаем бакет публичным для чтения (для простоты, в продакшене лучше использовать presigned URLs)
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`]
          }
        ]
      };
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
    }
  }

  /**
   * Загрузка файла (буфера) в MinIO
   */
  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      buffer,
      buffer.length,
      { 'Content-Type': mimeType },
    );
    
    // Возвращаем путь к файлу (или полный URL, если настроен прокси)
    return `${this.bucketName}/${fileName}`;
  }

  /**
   * Получение файла как поток (для отдачи через контроллер)
   */
  async getFile(fileName: string): Promise<Readable> {
    return this.minioClient.getObject(this.bucketName, fileName);
  }

  /**
   * Генерация временной подписанной ссылки (Presigned URL)
   * Рекомендуется для безопасности, чтобы не открывать бакет полностью публично
   */
  async getPresignedUrl(fileName: string, expirySeconds: number = 3600): Promise<string> {
    return this.minioClient.presignedGetObject(
      this.bucketName,
      fileName,
      expirySeconds,
    );
  }
  
  /**
   * Удаление файла
   */
  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }
}