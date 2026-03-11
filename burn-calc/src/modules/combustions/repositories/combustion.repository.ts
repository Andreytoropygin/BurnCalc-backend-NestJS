// src/modules/combustions/repositories/combustion.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Combustion } from '../../../entities/combustion.entity';
import { CombustionFiltersDto } from '../dto/combustion-filters.dto';

@Injectable()
export class CombustionRepository {
  constructor(
    @InjectRepository(Combustion)
    private repository: Repository<Combustion>,
  ) {}

  async findAll(filters?: CombustionFiltersDto): Promise<Combustion[]> {
    const query = this.repository.createQueryBuilder('combustion');
    query.where('combustion.is_active = :isActive', { isActive: true });

    if (filters?.search) {
      query.andWhere(
        '(combustion.title ILIKE :search OR combustion.formula ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.class) {
      query.andWhere('combustion.class = :class', { class: filters.class });
    }

    return await query.getMany();
  }

  async findById(id: number): Promise<Combustion | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<Combustion>): Promise<Combustion> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(id: number, data: Partial<Combustion>): Promise<Combustion> {
    await this.repository.update(id, data);
    const updatedCombustion =  await this.findById(id);
    if (!updatedCombustion) {
      throw new NotFoundException(`Соединение с ID ${id} не найдено`);
    }
    return updatedCombustion
  }
}