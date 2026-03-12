// src/modules/compound-combustions/services/compound-combustion.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CompoundCombustionRepository } from '../repositories/compound-combustion.repository';
import { CombustionRepository } from '../../combustions/repositories/combustion.repository';
import { CompoundRepository } from 'src/modules/compounds/repositories/compound.repository';
import { SingletonUser } from 'src/common/singleton-user.service';
import { UpdateCompoundCombustionDto } from '../dto/update-compound-combustion.dto';
import { CompoundCombustionResponseDto } from '../dto/compound-combustion-response.dto';

@Injectable()
export class CompoundCombustionService {
  private readonly singletonUser = SingletonUser.getInstance();

  constructor(
    private ccRepo: CompoundCombustionRepository,
    private combustionRepo: CombustionRepository,
    private compoundRepo: CompoundRepository
  ) {}

  async addToCombustion(
    compoundId: number,
  ): Promise<CompoundCombustionResponseDto> {
    const compound = this.compoundRepo.findById(compoundId);
    if (!compound) {
      throw new NotFoundException(`Соединение с ID: ${compoundId} не найдено`)
    }

    const creatorId = this.singletonUser.getCreatorId();
    let combustion = await this.combustionRepo.findDraftByUserId(creatorId);

    if (!combustion) {
       combustion = await this.combustionRepo.create({
        status: 'draft',
        userId: creatorId
       })
    }

    if (!combustion) {
      throw new InternalServerErrorException('Не удалось создать черновик');
    }

    const existing = await this.ccRepo.findByCombustionAndCompound(combustion.id, compoundId);
    if (existing) {
      throw new BadRequestException('Услуга уже добавлена в заявку');
    }

    const compoundCombustion = await this.ccRepo.create({ combustionId: combustion.id, compoundId: compoundId}) 
    if (!compoundCombustion) {
      throw new InternalServerErrorException('Не удалось добавить соединение');
    }

    return compoundCombustion as CompoundCombustionResponseDto;
  }

  async updateInCombustion(
    compoundId: number,
    dto: UpdateCompoundCombustionDto,
  ): Promise<CompoundCombustionResponseDto> {
    const creatorId = this.singletonUser.getCreatorId();
    const combustion = await this.combustionRepo.findDraftByUserId(creatorId);
    if (!combustion) {
      throw new NotFoundException(`Черновик не найден`);
    }
    const compoundCombustion = await this.ccRepo.findByCombustionAndCompound(combustion.id, compoundId)
    if (!compoundCombustion) {
      throw new BadRequestException('Можно редактировать только добавленные соединения');
    }

    const updatedCC = await this.ccRepo.update(combustion.id, compoundId, dto);
    if (!updatedCC) {
      throw new InternalServerErrorException('Не удалось обновить соединение в заявке')
    }

    return updatedCC as CompoundCombustionResponseDto;
  }

  async removeFromCombustion(
    compoundId: number,
  ): Promise<{ message: string }> {
    const creatorId = this.singletonUser.getCreatorId();
    const combustion = await this.combustionRepo.findDraftByUserId(creatorId);
    if (!combustion) {
      throw new NotFoundException(`Черновик не найден`);
    }
    const compoundCombustion = await this.ccRepo.findByCombustionAndCompound(combustion.id, compoundId)
    if (!compoundCombustion) {
      throw new NotFoundException(`Соединение не добавлено в заявку`);
    }

    await this.ccRepo.delete(combustion.id, compoundId);

    return { message: 'Услуга удалена из заявки' };
  }
}