// src/modules/compound-combustions/services/compound-combustion.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CompoundCombustionRepository } from './compound-combustion.repository';
import { CombustionRepository } from 'src/modules/combustions/combustion.repository';
import { CompoundRepository } from 'src/modules/compounds/compound.repository';
import { UserRepository } from 'src/modules/users/user.repository';
import { UpdateCompoundCombustionDto } from './dto/update-compound-combustion.dto';
import { CompoundCombustionResponseDto } from './dto/compound-combustion-response.dto';

@Injectable()
export class CompoundCombustionService {
  constructor(
    private ccRepo: CompoundCombustionRepository,
    private combustionRepo: CombustionRepository,
    private compoundRepo: CompoundRepository,
    private userRepo: UserRepository
  ) {}

  async addToCombustion(
    compoundId: number,
    userId: number
  ): Promise<CompoundCombustionResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    const compound = this.compoundRepo.findById(compoundId);
    if (!compound) {
      throw new NotFoundException(`Соединение с ID: ${compoundId} не найдено`)
    }

    let combustion = await this.combustionRepo.findDraftByUserId(userId);

    if (!combustion) {
       combustion = await this.combustionRepo.create({
        status: 'draft',
        userId: userId
       })
    }

    if (!combustion) {
      throw new InternalServerErrorException('Не удалось создать черновик');
    }

    const existing = await this.ccRepo.findByCombustionAndCompound(combustion.id, compoundId);
    if (existing) {
      throw new BadRequestException('Услуга уже добавлена в черновик');
    }

    const compoundCombustion = await this.ccRepo.create({ combustionId: combustion.id, compoundId: compoundId}) 
    if (!compoundCombustion) {
      throw new InternalServerErrorException('Не удалось добавить соединение в черновик');
    }

    return compoundCombustion as CompoundCombustionResponseDto;
  }

  async updateInCombustion(
    compoundId: number,
    dto: UpdateCompoundCombustionDto,
    userId: number
  ): Promise<CompoundCombustionResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    const combustion = await this.combustionRepo.findDraftByUserId(userId);
    if (!combustion) {
      throw new NotFoundException(`Черновик не найден`);
    }
    const compoundCombustion = await this.ccRepo.findByCombustionAndCompound(combustion.id, compoundId)
    if (!compoundCombustion) {
      throw new BadRequestException(`Cоединение с ID: ${compoundId} не добавлено в черновик`);
    }

    const updatedCC = await this.ccRepo.update(combustion.id, compoundId, dto);
    if (!updatedCC) {
      throw new InternalServerErrorException('Не удалось обновить соединение в черновике')
    }

    return updatedCC as CompoundCombustionResponseDto;
  }

  async removeFromCombustion(
    compoundId: number,
    userId: number
  ): Promise<{ message: string }> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    const combustion = await this.combustionRepo.findDraftByUserId(userId);
    if (!combustion) {
      throw new NotFoundException(`Черновик не найден`);
    }
    const compoundCombustion = await this.ccRepo.findByCombustionAndCompound(combustion.id, compoundId)
    if (!compoundCombustion) {
      throw new BadRequestException(`Соединение с ID: ${compoundId} не добавлено в черновик`);
    }

    await this.ccRepo.delete(combustion.id, compoundId);

    return { message: 'Соединение удалено из черновика' };
  }
}