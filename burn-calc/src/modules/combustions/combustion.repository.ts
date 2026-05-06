// src/modules/combustions/repositories/combustion.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Combustion } from 'src/entities/combustion.entity';
import { CombustionFiltersDto } from './dto/combustion-filters.dto';

@Injectable()
export class CombustionRepository {
  constructor(
    @InjectRepository(Combustion)
    private repository: Repository<Combustion>,
  ) {}

  async findAll(filters?: CombustionFiltersDto): Promise<Combustion[]> {
    let query = this.repository
      .createQueryBuilder('combustions')
      .leftJoinAndSelect('combustions.technician', 'technician')
      .leftJoinAndSelect('combustions.expert', 'expert')
      .leftJoinAndSelect('combustions.compoundCombustions', 'compoundCombustions')
      .where('combustions.status != :deleted', { deleted: 'deleted' })
      .andWhere('combustions.status != :draft', { draft: 'draft' });

    if (filters?.status) {
      query = query.andWhere('combustions.status = :status', { status: filters.status });
    }

    if (filters?.formedAtFrom) {
      query.andWhere('combustions.formed_at >= :formedAtFrom', {
        formedAtFrom: filters.formedAtFrom,
      });
    }

    if (filters?.formedAtTo) {
      query.andWhere('combustions.formed_at <= :formedAtTo', {
        formedAtTo: `${filters.formedAtTo} 23:59:59`,
      });
    }

    return await query.getMany();
  }

  async findById(id: number): Promise<Combustion | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['technician', 'expert', 'compoundCombustions', 'compoundCombustions.compound'],
    });
  }

  async findDraftByUserId(userId: number): Promise<Combustion | null> {
    return await this.repository.findOne({
      where: { technicianId: userId, status: 'draft' },
      relations: ['compoundCombustions', 'compoundCombustions.compound'],
    });
  }

  async create(data: Partial<Combustion>): Promise<Combustion> {
    const combustion = this.repository.create(data);
    return await this.repository.save(combustion);
  }

  async update(id: number, data: Partial<Combustion>): Promise<Combustion> {
    await this.repository.update(id, data);
    const updatedCombustion = await this.findById(id);
    if (!updatedCombustion) {
      throw new NotFoundException(`Сгорание с ID ${id} не найдено`);
    }
    return updatedCombustion
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { status: 'deleted' });
  }
}