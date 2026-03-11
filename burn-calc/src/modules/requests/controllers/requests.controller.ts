// src/modules/requests/controllers/request.controller.ts
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
import { RequestService } from '../services/request.service';
import { RequestListResponseDto, RequestSingleResponseDto } from '../dto/request-response.dto';
import { RequestFiltersDto } from '../dto/request-filters.dto';
import { UpdateRequestDto } from '../dto/update-request.dto';
import { RequestDraftBriefDto } from '../dto/request-draft-brief.dto';
import { CompleteRequestDto } from '../dto/complete-request.dto';

@Controller('requests')
export class RequestController {
  constructor(private service: RequestService) {}

  @Get('draft-brief')
  async getCartIcon(): Promise<RequestDraftBriefDto> {
    return this.service.getDraftBrief();
  }

  @Get()
  async findAll(
    @Query() filters: RequestFiltersDto
  ): Promise<RequestListResponseDto[]> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<RequestSingleResponseDto> {
    return this.service.findById(id);
  }

  @Put()
  async update(
    @Body() dto: UpdateRequestDto,
  ): Promise<RequestSingleResponseDto> {
    return this.service.update(dto);
  }

  @Put('form')
  async form(
  ): Promise<RequestListResponseDto> {
    return this.service.form();
  }

  @Put(':id/complete')
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteRequestDto,
  ): Promise<RequestListResponseDto> {
    return this.service.complete(id, dto.action);
  }

  @Delete()
  async remove(
  ): Promise<{ message: string }> {
    return this.service.remove();
  }
}