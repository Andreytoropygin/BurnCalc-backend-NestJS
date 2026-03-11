// src/modules/requests/repositories/request.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from '../../../entities/request.entity';
import { RequestFiltersDto } from '../dto/request-filters.dto';

@Injectable()
export class RequestRepository {
  constructor(
    @InjectRepository(Request)
    private repository: Repository<Request>,
  ) {}

  async findAll(filters?: RequestFiltersDto): Promise<Request[]> {
    const query = this.repository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.moderator', 'moderator')
      .where('request.status != :deleted', { deleted: 'deleted' })
      .andWhere('request.status != :draft', { draft: 'draft' });

    if (filters?.status) {
      query.andWhere('request.status = :status', { status: filters.status });
    }

    if (filters?.formedAtFrom) {
      query.andWhere('request.formed_at >= :formedAtFrom', {
        formedAtFrom: filters.formedAtFrom,
      });
    }

    if (filters?.formedAtTo) {
      query.andWhere('request.formed_at <= :formedAtTo', {
        formedAtTo: filters.formedAtTo,
      });
    }

    return await query.getMany();
  }

  async findById(id: number): Promise<Request | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'moderator', 'requestCombustions', 'requestCombustions.combustion'],
    });
  }

  async findDraftByUserId(userId: number): Promise<Request | null> {
    return await this.repository.findOne({
      where: { userId, status: 'draft' },
      relations: ['requestCombustions'],
    });
  }

  async create(data: Partial<Request>): Promise<Request> {
    const request = this.repository.create(data);
    return await this.repository.save(request);
  }

  async update(id: number, data: Partial<Request>): Promise<Request> {
    await this.repository.update(id, data);
    const updatedRequest = await this.findById(id);
    if (!updatedRequest) {
      throw new NotFoundException(`Заявка с ID ${id} не найдена`);
    }
    return updatedRequest
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { status: 'deleted' });
  }
}