// src/modules/combustions/services/combustion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CombustionRepository } from '../repositories/combustion.repository';
import { MinioService } from '../../../common/minio/minio.service';
import { CombustionResponseDto } from '../dto/combustion-response.dto';
import { CreateCombustionDto } from '../dto/create-combustion.dto';
import { CombustionFiltersDto } from '../dto/combustion-filters.dto';
import { Combustion } from 'src/entities/combustion.entity';

@Injectable()
export class CombustionService {
  constructor(
    private repository: CombustionRepository,
    private minioService: MinioService,
  ) {}

  async findAll(filters?: CombustionFiltersDto): Promise<CombustionResponseDto[]> {
    let combustions = await this.repository.findAll(filters);

    for (let combustion of combustions) {
      if (combustion.imageUrl) {
        const imageFileName = combustion.imageUrl.split('/').pop();
        combustion.imageUrl = await this.minioService.getSignedUrl(imageFileName);
      }
  
      if (combustion.videoUrl) {
        const videoFileName = combustion.videoUrl.split('/').pop();
        combustion.videoUrl = await this.minioService.getSignedUrl(videoFileName)
      }
    }
    return combustions as CombustionResponseDto[];
  }

  async findById(id: number): Promise<CombustionResponseDto> {
    let combustion = await this.repository.findById(id);
    if (!combustion) {
      throw new NotFoundException(`Услуга с ID ${id} не найдена`);
    }

    if (combustion.imageUrl) {
      const imageFileName = combustion.imageUrl.split('/').pop();
      combustion.imageUrl = await this.minioService.getSignedUrl(imageFileName);
    }

    if (combustion.videoUrl) {
      const videoFileName = combustion.videoUrl.split('/').pop();
      combustion.videoUrl = await this.minioService.getSignedUrl(videoFileName)
    }

    return combustion as CombustionResponseDto;
  }

  async create(
    dto: CreateCombustionDto,
    imageFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ): Promise<CombustionResponseDto> {
    const data: Partial<Combustion> = {
      title: dto.title || `Combustion-${Date.now()}`,
      formula: dto.formula || `formula-${Date.now()}`,
      class: dto.class || 'organic',
      specificH2oVolume: dto.specificH2oVolume || 0,
      specificCo2Volume: dto.specificCo2Volume || 0,
      isActive: true,
      imageUrl: null,
      videoUrl: null,
    };

    let combustion = await this.repository.create(data);
    
    if (imageFile) {
      const imageName = `combustion-${combustion.id}-${Date.now()}-image.${imageFile.originalname.split('.').pop()}`;
      data.imageUrl = await this.minioService.uploadFile(imageFile.buffer, imageName, imageFile.mimetype);
    }

    if (videoFile) {
      const videoName = `combustion-${combustion.id}-${Date.now()}-video.${videoFile.originalname.split('.').pop()}`;
      data.videoUrl = await this.minioService.uploadFile(videoFile.buffer, videoName, videoFile.mimetype);
    }

    if (imageFile || videoFile) {
      combustion = await this.repository.update(
        combustion.id,
        {imageUrl: data.imageUrl, videoUrl: data.videoUrl}
      );
    }

    if (combustion.imageUrl) {
      const imageFileName = combustion.imageUrl.split('/').pop();
      combustion.imageUrl = await this.minioService.getSignedUrl(imageFileName);
    }

    if (combustion.videoUrl) {
      const videoFileName = combustion.videoUrl.split('/').pop();
      combustion.videoUrl = await this.minioService.getSignedUrl(videoFileName)
    }
      
    return combustion as CombustionResponseDto;
  }
}
