// src/modules/compound-combustions/controllers/compound-combustion.controller.ts
import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CompoundCombustionService } from './compound-combustion.service';
import { UpdateCompoundCombustionDto } from './dto/update-compound-combustion.dto';
import { CompoundCombustionResponseDto } from './dto/compound-combustion-response.dto';
import { SessionGuard } from 'src/modules/users/session.guard';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('compounds-combustions')
@Controller('compounds-combustions')
export class CompoundCombustionController {
  constructor(private service: CompoundCombustionService) {}

  @Post(':compoundId')
  @ApiOkResponse({type: CompoundCombustionResponseDto})
  @UseGuards(SessionGuard)
  async addToCombustion(
    @Param('compoundId', ParseIntPipe) compoundId: number,
    @Req() req: Request & { session: { userId: number } }
  ): Promise<CompoundCombustionResponseDto> {
    return this.service.addToCombustion(compoundId, req.session.userId);
  }

  @Put(':compoundId')
  @ApiOkResponse({type: CompoundCombustionResponseDto})
  @UseGuards(SessionGuard)
  async updateInCombustion(
    @Param('compoundId', ParseIntPipe) compoundId: number,
    @Body() dto: UpdateCompoundCombustionDto,
    @Req() req: Request & { session: { userId: number } }
  ): Promise<CompoundCombustionResponseDto> {
    return this.service.updateInCombustion(compoundId, dto, req.session.userId);
  }

  @Delete(':compoundId')
  @ApiOkResponse()
  @UseGuards(SessionGuard)
  async removeFromCombustion(
    @Param('compoundId', ParseIntPipe) compoundId: number,
    @Req() req: Request & { session: { userId: number } }
  ): Promise<{ message: string }> {
    return this.service.removeFromCombustion(compoundId, req.session.userId);
  }
}
