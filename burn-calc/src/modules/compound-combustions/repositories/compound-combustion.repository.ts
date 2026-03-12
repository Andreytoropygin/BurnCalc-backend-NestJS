// src/modules/combustion-combustions/repositories/combustion-combustion.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompoundCombustion } from '../../../entities/compound-combustion.entity';

@Injectable()
export class CompoundCombustionRepository {
  constructor(
    @InjectRepository(CompoundCombustion)
    private repository: Repository<CompoundCombustion>,
  ) {}

  async findByCombustionAndCompound(
    combustionId: number,
    compoundId: number,
  ): Promise<CompoundCombustion | null> {
    return await this.repository.findOne({
      where: { combustionId, compoundId },
      relations: ['compound'],
    });
  }

  async findByCombustionId(combustionId: number): Promise<CompoundCombustion[]> {
    return await this.repository.find({
      where: { combustionId },
      relations: ['compound'],
    });
  }

  async create(data: Partial<CompoundCombustion>): Promise<CompoundCombustion> {
    const ompoundCombustion = this.repository.create(data);
    return await this.repository.save(ompoundCombustion);
  }

  async update(
    combustionId: number,
    compoundId: number,
    data: Partial<CompoundCombustion>,
  ): Promise<CompoundCombustion> {
    await this.repository.update({ combustionId, compoundId }, data);
    const updatedCC = await this.findByCombustionAndCompound(combustionId, compoundId);
    if (!updatedCC) {
      throw new NotFoundException(`Не найдено`);
    }
    return updatedCC
  }

  async delete(combustionId: number, compoundId: number): Promise<void> {
    await this.repository.delete({ combustionId, compoundId });
  }
}