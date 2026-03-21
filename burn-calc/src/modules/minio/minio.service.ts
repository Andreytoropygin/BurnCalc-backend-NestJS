// src/modules/combustions/services/minio.service.ts
import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Global()
@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET')!;
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
      port: this.configService.get<number>('MINIO_PORT')!,
      useSSL: this.configService.get<string>('MINIO_USE_SSL')! === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
    });
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (error) {
      console.error('Ошибка инициализации бакета:', error);
    }
  }

  async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    await this.minioClient.putObject(this.bucketName, fileName, file, file.length, {
      'Content-Type': contentType,
    });

    const protocol = this.configService.get<string>('MINIO_USE_SSL') === 'true' ? 'https' : 'http';
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = this.configService.get<number>('MINIO_PORT');

    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
  }

  async getSignedUrl(fileName: string | undefined): Promise<string | null> {
    if (!fileName) return null;
    try {
      const expiresIn = 7 * 24 * 60 * 60;
      return await this.minioClient.presignedGetObject(this.bucketName, fileName, expiresIn);
    } catch (error) {
      return null;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const name = fileName.split('/').pop();
      if (name) {
        await this.minioClient.removeObject(this.bucketName, name);
      }
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
    }
  }
}