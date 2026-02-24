import { Controller, Get, Param, Res, Headers } from '@nestjs/common';
import type { Response } from 'express';
import { MinioService } from '../minio/minio.service';
import { join } from 'path';

@Controller('images')
export class ImagesController {
  constructor(private readonly minioService: MinioService) {}

  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      // Если файлы хранятся просто по имени в корне бакета
      const stream = await this.minioService.getFile(filename);
      
      // Определяем тип контента (можно захардкодить для png/jpg или получить метаданные из MinIO)
      res.setHeader('Content-Type', 'image/png'); 
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Кэширование на год
      
      stream.pipe(res);
    } catch (error) {
      res.status(404).send('Image not found');
    }
  }
  
  // Альтернатива: Эндпоинт, возвращающий Presigned URL (если фронтенд будет качать напрямую)
  @Get('url/:filename')
  async getImageUrl(@Param('filename') filename: string) {
    const url = await this.minioService.getPresignedUrl(filename);
    return { url };
  }
}