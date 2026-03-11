// src/modules/request-combustions/repositories/request-combustion.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestCombustion } from '../../../entities/request-combustion.entity';

@Injectable()
export class RequestCombustionRepository {
  constructor(
    @InjectRepository(RequestCombustion)
    private repository: Repository<RequestCombustion>,
  ) {}

  async findByRequestAndCombustion(
    requestId: number,
    combustionId: number,
  ): Promise<RequestCombustion | null> {
    return await this.repository.findOne({
      where: { requestId, combustionId },
      relations: ['combustion'],
    });
  }

  async findByRequestId(requestId: number): Promise<RequestCombustion[]> {
    return await this.repository.find({
      where: { requestId },
      relations: ['combustion'],
    });
  }

  async create(data: Partial<RequestCombustion>): Promise<RequestCombustion> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(
    requestId: number,
    combustionId: number,
    data: Partial<RequestCombustion>,
  ): Promise<RequestCombustion> {
    await this.repository.update({ requestId, combustionId }, data);
    const updatedRC = await this.findByRequestAndCombustion(requestId, combustionId);
    if (!updatedRC) {
      throw new NotFoundException(`Не найдено`);
    }
    return updatedRC
  }

  async delete(requestId: number, combustionId: number): Promise<void> {
    await this.repository.delete({ requestId, combustionId });
  }
}