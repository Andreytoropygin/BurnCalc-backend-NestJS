// src/modules/combustions/controllers/combustion.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { CombustionService } from '../services/combustion.service';
import { CombustionListResponseDto, CombustionSingleResponseDto } from '../dto/combustion-response.dto';
import { CombustionFiltersDto } from '../dto/combustion-filters.dto';
import { UpdateCombustionDto } from '../dto/update-combustion.dto';
import { CombustionDraftBriefDto } from '../dto/combustion-draft-brief.dto';
import { CompleteCombustionDto } from '../dto/complete-combustion.dto';

@Controller('combustions')
export class CombustionController {
  constructor(private service: CombustionService) {}

  @Get('draft-brief')
  async getCartIcon(): Promise<CombustionDraftBriefDto> {
    return this.service.getDraftBrief();
  }

  @Get()
  async findAll(
    @Query() filters: CombustionFiltersDto
  ): Promise<CombustionListResponseDto[]> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<CombustionSingleResponseDto> {
    return this.service.findById(id);
  }

  @Put()
  async update(
    @Body() dto: UpdateCombustionDto,
  ): Promise<CombustionSingleResponseDto> {
    return this.service.update(dto);
  }

  @Put('form')
  async form(
  ): Promise<CombustionListResponseDto> {
    return this.service.form();
  }

  @Put(':id/complete')
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteCombustionDto,
  ): Promise<CombustionListResponseDto> {
    return this.service.complete(id, dto.action);
  }

  @Delete()
  async remove(
  ): Promise<{ message: string }> {
    return this.service.remove();
  }
}