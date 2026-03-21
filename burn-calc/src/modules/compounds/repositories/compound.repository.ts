// src/modules/compounds/repositories/compound.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compound } from '../../../entities/compound.entity';
import { CompoundFiltersDto } from '../dto/compound-filters.dto';

@Injectable()
export class CompoundRepository {
  constructor(
    @InjectRepository(Compound)
    private repository: Repository<Compound>,
  ) {}

  async findAll(filters?: CompoundFiltersDto): Promise<Compound[]> {
    const query = this.repository.createQueryBuilder('compounds');
    query.where('compounds.is_active = :isActive', { isActive: true });

    if (filters?.search) {
      query.andWhere(
        '(compounds.title ILIKE :search OR compounds.formula ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.class) {
      query.andWhere('compounds.class = :class', { class: filters.class });
    }

    return await query.getMany();
  }

  async findById(id: number): Promise<Compound | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<Compound>): Promise<Compound> {
    const compound = this.repository.create(data);
    return await this.repository.save(compound);
  }

  async update(id: number, data: Partial<Compound>): Promise<Compound> {
    await this.repository.update(id, data);
    const updatedCompound =  await this.findById(id);
    if (!updatedCompound) {
      throw new NotFoundException(`Соединение с ID ${id} не найдено`);
    }
    return updatedCompound
  }
}