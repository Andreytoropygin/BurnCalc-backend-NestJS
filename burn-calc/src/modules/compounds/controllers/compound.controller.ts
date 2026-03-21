// src/modules/compounds/controllers/compound.controller.ts
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
import { CompoundService } from '../services/compound.service';
import { CompoundResponseDto } from '../dto/compound-response.dto';
import { CompoundFiltersDto } from '../dto/compound-filters.dto';
import { CreateCompoundDto } from '../dto/create-compound.dto';

@Controller('compounds')
export class CompoundController {
  constructor(private service: CompoundService) {}

  @Get()
  async findAll(@Query() filters: CompoundFiltersDto): Promise<CompoundResponseDto[]> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CompoundResponseDto> {
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
    @Body() dto: CreateCompoundDto
  ): Promise<CompoundResponseDto> {
    const imageFile = files?.find(f => f.mimetype.startsWith('image/'));
    const videoFile = files?.find(f => f.mimetype.startsWith('video/'));

    return this.service.create(dto, imageFile, videoFile);
  }
}