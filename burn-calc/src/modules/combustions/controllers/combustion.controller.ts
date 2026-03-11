// src/modules/combustions/controllers/combustion.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import {FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CombustionService } from '../services/combustion.service';
import { CombustionResponseDto } from '../dto/combustion-response.dto';
import { CombustionFiltersDto } from '../dto/combustion-filters.dto';
import { CreateCombustionDto } from '../dto/create-combustion.dto';

@Controller('combustions')
export class CombustionController {
  constructor(private service: CombustionService) {}

  @Get()
  async findAll(@Query() filters: CombustionFiltersDto): Promise<CombustionResponseDto[]> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CombustionResponseDto> {
    return this.service.findById(id);
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateCombustionDto
  ): Promise<CombustionResponseDto> {
    const imageFile = files?.find(f => f.mimetype.startsWith('image/'));
    const videoFile = files?.find(f => f.mimetype.startsWith('video/'));

    return this.service.create(dto, imageFile, videoFile);
  }
}