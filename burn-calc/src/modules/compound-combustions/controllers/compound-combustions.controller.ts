// src/modules/compound-combustions/controllers/compound-combustion.controller.ts
import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { CompoundCombustionService } from '../services/compound-combustion.service';
import { UpdateCompoundCombustionDto } from '../dto/update-compound-combustion.dto';
import { CompoundCombustionResponseDto } from '../dto/compound-combustion-response.dto';

@Controller('compounds-combustions')
export class CompoundCombustionController {
  constructor(private service: CompoundCombustionService) {}

  @Post(':compoundId')
  async addToCombustion(
    @Param('compoundId', ParseIntPipe) compoundId: number
  ): Promise<CompoundCombustionResponseDto> {
    return this.service.addToCombustion(compoundId);
  }

  @Put(':compoundId')
  async updateInCombustion(
    @Param('compoundId', ParseIntPipe) compoundId: number,
    @Body() dto: UpdateCompoundCombustionDto,
  ): Promise<CompoundCombustionResponseDto> {
    return this.service.updateInCombustion(compoundId, dto);
  }

  @Delete(':compoundId')
  async removeFromCombustion(
    @Param('compoundId', ParseIntPipe) compoundId: number,
  ): Promise<{ message: string }> {
    return this.service.removeFromCombustion(compoundId);
  }
}