// src/modules/request-combustions/controllers/request-combustion.controller.ts
import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { RequestCombustionService } from '../services/request-combustion.service';
import { UpdateRequestCombustionDto } from '../dto/update-request-combustion.dto';
import { RequestCombustionResponseDto } from '../dto/request-combustion-response.dto';

@Controller('requests-combustions')
export class RequestCombustionController {
  constructor(private service: RequestCombustionService) {}

  @Post(':combustionId')
  async addToRequest(
    @Param('combustionId', ParseIntPipe) combustionId: number
  ): Promise<RequestCombustionResponseDto> {
    return this.service.addToRequest(combustionId);
  }

  @Put(':combustionId')
  async updateInRequest(
    @Param('combustionId', ParseIntPipe) combustionId: number,
    @Body() dto: UpdateRequestCombustionDto,
  ): Promise<RequestCombustionResponseDto> {
    return this.service.updateInRequest(combustionId, dto);
  }

  @Delete(':combustionId')
  async removeFromRequest(
    @Param('combustionId', ParseIntPipe) combustionId: number,
  ): Promise<{ message: string }> {
    return this.service.removeFromRequest(combustionId);
  }
}