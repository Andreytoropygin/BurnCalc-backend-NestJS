// src/modules/compounds/services/compound.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CompoundRepository } from './compound.repository';
import { UserRepository } from '../users/user.repository';
import { MinioService } from 'src/modules/minio/minio.service';
import { CompoundResponseDto } from './dto/compound-response.dto';
import { CreateCompoundDto } from './dto/create-compound.dto';
import { CompoundFiltersDto } from './dto/compound-filters.dto';
import { Compound } from 'src/entities/compound.entity';

@Injectable()
export class CompoundService {
  constructor(
    private repository: CompoundRepository,
    private userRepo: UserRepository,
    private minioService: MinioService,
  ) {}

  async findAll(filters?: CompoundFiltersDto): Promise<CompoundResponseDto[]> {
    let compounds = await this.repository.findAll(filters);

    for (let compound of compounds) {
      if (compound.imageUrl) {
        const imageFileName = compound.imageUrl.split('/').pop();
        compound.imageUrl = await this.minioService.getSignedUrl(imageFileName);
      }
  
      if (compound.videoUrl) {
        const videoFileName = compound.videoUrl.split('/').pop();
        compound.videoUrl = await this.minioService.getSignedUrl(videoFileName)
      }
    }
    return compounds as CompoundResponseDto[];
  }

  async findById(id: number): Promise<CompoundResponseDto> {
    let compound = await this.repository.findById(id);
    if (!compound) {
      throw new NotFoundException(`Услуга с ID ${id} не найдена`);
    }

    if (compound.imageUrl) {
      const imageFileName = compound.imageUrl.split('/').pop();
      compound.imageUrl = await this.minioService.getSignedUrl(imageFileName);
    }

    if (compound.videoUrl) {
      const videoFileName = compound.videoUrl.split('/').pop();
      compound.videoUrl = await this.minioService.getSignedUrl(videoFileName)
    }

    return compound as CompoundResponseDto;
  }

  async create(
    dto: CreateCompoundDto,
    userId: number,
    imageFile?: Express.Multer.File,
    videoFile?: Express.Multer.File
  ): Promise<CompoundResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    if (!user.isExpert) throw new ForbiddenException(`Создавать соединения можно только экспертам`);

    const data: Partial<Compound> = {
      title: dto.title || `Compound-${Date.now()}`,
      formula: dto.formula || `formula-${Date.now()}`,
      class: dto.class || 'organic',
      specificH2oVolume: dto.specificH2oVolume || 0,
      specificCo2Volume: dto.specificCo2Volume || 0,
      isActive: true,
      imageUrl: null,
      videoUrl: null,
    };

    let compound = await this.repository.create(data);
    
    if (imageFile) {
      const imageName = `compound-${compound.id}-${Date.now()}-image.${imageFile.originalname.split('.').pop()}`;
      data.imageUrl = await this.minioService.uploadFile(imageFile.buffer, imageName, imageFile.mimetype);
    }

    if (videoFile) {
      const videoName = `compound-${compound.id}-${Date.now()}-video.${videoFile.originalname.split('.').pop()}`;
      data.videoUrl = await this.minioService.uploadFile(videoFile.buffer, videoName, videoFile.mimetype);
    }

    if (imageFile || videoFile) {
      compound = await this.repository.update(
        compound.id,
        {imageUrl: data.imageUrl, videoUrl: data.videoUrl}
      );
    }

    if (compound.imageUrl) {
      const imageFileName = compound.imageUrl.split('/').pop();
      compound.imageUrl = await this.minioService.getSignedUrl(imageFileName);
    }

    if (compound.videoUrl) {
      const videoFileName = compound.videoUrl.split('/').pop();
      compound.videoUrl = await this.minioService.getSignedUrl(videoFileName)
    }
      
    return compound as CompoundResponseDto;
  }
}
