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
  Req,
  UseGuards,
} from '@nestjs/common';
import {FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CompoundService } from './compound.service';
import { CompoundResponseDto } from './dto/compound-response.dto';
import { CompoundFiltersDto } from './dto/compound-filters.dto';
import { CreateCompoundDto } from './dto/create-compound.dto';
import { SessionGuard } from 'src/modules/users/session.guard';
import { ApiCreatedResponse, ApiFoundResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('compounds')
@Controller('compounds')
export class CompoundController {
  constructor(private service: CompoundService) {}

  @Get()
  @ApiFoundResponse({type: [CompoundResponseDto]})
  async findAll(
    @Query() filters: CompoundFiltersDto
  ): Promise<CompoundResponseDto[]> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @ApiFoundResponse({type: CompoundResponseDto})
  async findById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<CompoundResponseDto> {
    return this.service.findById(id);
  }

  @Post()
  @ApiCreatedResponse({type: CompoundResponseDto})
  @UseGuards(SessionGuard)
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateCompoundDto,
    @Req() req: Request & { session: { userId: number } }
  ): Promise<CompoundResponseDto> {
    const imageFile = files?.find(f => f.mimetype.startsWith('image/'));
    const videoFile = files?.find(f => f.mimetype.startsWith('video/'));

    return this.service.create(dto, req.session.userId, imageFile, videoFile);
  }
}