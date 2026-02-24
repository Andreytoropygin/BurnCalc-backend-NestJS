// src/videos/videos.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MinioService } from '../minio/minio.service';

@Controller('videos') // Путь будет /videos/:filename
export class VideosController {
  constructor(private readonly minioService: MinioService) {}

  @Get(':filename')
  async streamVideo(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const stream = await this.minioService.getFile(filename);
      
      // Хардкодим видео тип или определяем динамически
      res.setHeader('Content-Type', 'video/mp4'); 
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      stream.pipe(res);
    } catch (error) {
      res.status(404).send('Video not found');
    }
  }
}