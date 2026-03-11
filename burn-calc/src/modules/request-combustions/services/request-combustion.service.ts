// src/modules/request-combustions/services/request-combustion.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RequestCombustionRepository } from '../repositories/request-combustion.repository';
import { RequestRepository } from '../../requests/repositories/request.repository';
import { CombustionRepository } from 'src/modules/combustions/repositories/combustion.repository';
import { SingletonUser } from 'src/common/singleton-user.service';
import { UpdateRequestCombustionDto } from '../dto/update-request-combustion.dto';
import { RequestCombustionResponseDto } from '../dto/request-combustion-response.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { Not } from 'typeorm';

@Injectable()
export class RequestCombustionService {
  private readonly singletonUser = SingletonUser.getInstance();

  constructor(
    private rcRepo: RequestCombustionRepository,
    private requestRepo: RequestRepository,
    private combustionRepo: CombustionRepository
  ) {}

  async addToRequest(
    combustionId: number,
  ): Promise<RequestCombustionResponseDto> {
    const combustion = this.combustionRepo.findById(combustionId);
    if (!combustion) {
      throw new NotFoundException(`Соединение с ID: ${combustionId} не найдено`)
    }

    const creatorId = this.singletonUser.getCreatorId();
    let request = await this.requestRepo.findDraftByUserId(creatorId);

    if (!request) {
       request = await this.requestRepo.create({
        status: 'draft',
        userId: creatorId
       })
    }

    if (!request) {
      throw new InternalServerErrorException('Не удалось создать черновик');
    }

    const existing = await this.rcRepo.findByRequestAndCombustion(request.id, combustionId);
    if (existing) {
      throw new BadRequestException('Услуга уже добавлена в заявку');
    }

    const requestCombustion = await this.rcRepo.create({ requestId: request.id, combustionId: combustionId}) 
    if (!requestCombustion) {
      throw new InternalServerErrorException('Не удалось добавить соединение');
    }

    return requestCombustion as RequestCombustionResponseDto;
  }

  async updateInRequest(
    combustionId: number,
    dto: UpdateRequestCombustionDto,
  ): Promise<RequestCombustionResponseDto> {
    const creatorId = this.singletonUser.getCreatorId();
    const request = await this.requestRepo.findDraftByUserId(creatorId);
    if (!request) {
      throw new NotFoundException(`Черновик не найден`);
    }
    const requestCombustion = await this.rcRepo.findByRequestAndCombustion(request.id, combustionId)
    if (!requestCombustion) {
      throw new BadRequestException('Можно редактировать только добавленные соединения');
    }

    const updatedRc = await this.rcRepo.update(request.id, combustionId, dto);
    if (!updatedRc) {
      throw new InternalServerErrorException('Не удалось обновить соединение в заявке')
    }

    return updatedRc as RequestCombustionResponseDto;
  }

  async removeFromRequest(
    combustionId: number,
  ): Promise<{ message: string }> {
    const creatorId = this.singletonUser.getCreatorId();
    const request = await this.requestRepo.findDraftByUserId(creatorId);
    if (!request) {
      throw new NotFoundException(`Черновик не найден`);
    }
    const requestCombustion = await this.rcRepo.findByRequestAndCombustion(request.id, combustionId)
    if (!requestCombustion) {
      throw new NotFoundException(`Соединение не добавлено в заявку`);
    }

    await this.rcRepo.delete(request.id, combustionId);

    return { message: 'Услуга удалена из заявки' };
  }
}