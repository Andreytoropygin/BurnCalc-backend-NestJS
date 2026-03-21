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
  Req,
  UseGuards,
} from '@nestjs/common';
import { CombustionService } from './combustion.service';
import { CombustionListResponseDto, CombustionSingleResponseDto } from './dto/combustion-response.dto';
import { CombustionFiltersDto } from './dto/combustion-filters.dto';
import { UpdateCombustionDto } from './dto/update-combustion.dto';
import { CombustionDraftBriefDto } from './dto/combustion-draft-brief.dto';
import { CompleteCombustionDto } from './dto/complete-combustion.dto';
import { SessionGuard } from 'src/modules/users/session.guard';

@Controller('combustions')
export class CombustionController {
  constructor(private service: CombustionService) {}

  @Get('draft-brief')
  @UseGuards(SessionGuard)
  async getCartIcon(
    @Req() req: Request & { session: { userId: number } }
  ): Promise<CombustionDraftBriefDto> {
    return this.service.getDraftBrief(req.session.userId);
  }

  @Get()
  @UseGuards(SessionGuard)
  async findAll(
    @Query() filters: CombustionFiltersDto,
    @Req() req: Request & { session: { userId: number } }
  ): Promise<CombustionListResponseDto[]> {
    return this.service.findAll(req.session.userId, filters);
  }

  @Get(':id')
  @UseGuards(SessionGuard)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { session: { userId: number } }
  ): Promise<CombustionSingleResponseDto> {
    return this.service.findById(id, req.session.userId);
  }

  @Put()
  @UseGuards(SessionGuard)
  async update(
    @Body() dto: UpdateCombustionDto,
    @Req() req: Request & { session: { userId: number } }
  ): Promise<CombustionSingleResponseDto> {
    return this.service.update(dto, req.session.userId);
  }

  @Put('form')
  @UseGuards(SessionGuard)
  async form(
    @Req() req: Request & { session: { userId: number } }
  ): Promise<CombustionListResponseDto> {
    return this.service.form(req.session.userId);
  }

  @Put(':id/complete')
  @UseGuards(SessionGuard)
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteCombustionDto,
    @Req() req: Request & { session: { userId: number } }
  ): Promise<CombustionListResponseDto> {
    return this.service.complete(id, dto.action, req.session.userId);
  }

  @Delete()
  @UseGuards(SessionGuard)
  async remove(
    @Req() req: Request & { session: { userId: number } }
  ): Promise<{ message: string }> {
    return this.service.remove(req.session.userId);
  }
}