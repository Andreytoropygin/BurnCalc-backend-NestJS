// src/modules/requests/services/request.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RequestRepository } from '../repositories/request.repository';
import { RequestCombustionRepository } from '../../request-combustions/repositories/request-combustion.repository';
import { CombustionRepository } from '../../combustions/repositories/combustion.repository';
import { SingletonUser } from 'src/common/singleton-user.service';
import { RequestListResponseDto, RequestSingleResponseDto, CombustionInRequestDto } from '../dto/request-response.dto';
import { RequestFiltersDto } from '../dto/request-filters.dto';
import { UpdateRequestDto } from '../dto/update-request.dto';
import { RequestDraftBriefDto } from '../dto/request-draft-brief.dto';
import { MinioService } from 'src/common/minio/minio.service';

@Injectable()
export class RequestService {
  private readonly singletonUser = SingletonUser.getInstance();

  constructor(
    private requestRepo: RequestRepository,
    private rcRepo: RequestCombustionRepository,
    private minioService: MinioService
  ) {}

  async getDraftBrief(): Promise<RequestDraftBriefDto> {
    const creatorId = this.singletonUser.getCreatorId();
    const draft = await this.requestRepo.findDraftByUserId(creatorId);

    if (!draft) {
      return { combustionsCount: 0 } as RequestDraftBriefDto;
    }

    const combustions = await this.rcRepo.findByRequestId(draft.id);
    return { requestId: draft.id, combustionsCount: combustions.length };
  }

  async findAll(filters?: RequestFiltersDto): Promise<RequestListResponseDto[]> {
    const requests = await this.requestRepo.findAll(filters);

    return requests.map(req => {
      const resultsCount = req.requestCombustions?.filter(
        rc => rc.amount !== null && rc.amount !== undefined && rc.amount !== 0,
      ).length || 0;

      return {
        id: req.id,
        userName: req.user.name,
        moderatorName: req.moderator.name,
        status: req.status,
        createdAt: req.createdAt,
        formedAt: req.formedAt,
        completedAt: req.completedAt,
        resultsCount: resultsCount
      } as RequestListResponseDto;
    }) as RequestListResponseDto[];
  }

  async findById(id: number): Promise<RequestSingleResponseDto> {
    const request = await this.requestRepo.findById(id);
    if (!request || request.status === 'deleted') {
      throw new NotFoundException(`Заявка с ID ${id} не найдена`);
    }

    let combustions: CombustionInRequestDto[] =
      request.requestCombustions?.map(rc => ({
        imageUrl: rc.combustion?.imageUrl || null,
        comment: rc.comment,
        ...rc.combustion
      })) || [];

      for (let combustion of combustions) {
        if (combustion.imageUrl) {
          const imageFileName = combustion.imageUrl.split('/').pop();
          combustion.imageUrl = await this.minioService.getSignedUrl(imageFileName);
        }
      }

    return { 
      id: request.id,
      co2Volume: request.co2Volume,
      h2oVolume: request.h2oVolume,
      sampleDescription: request.sampleDescription,
      combustions,
     } as RequestSingleResponseDto;
  }

  async update(dto: UpdateRequestDto): Promise<RequestSingleResponseDto> {
    const creatorId = this.singletonUser.getCreatorId();
    const request = await this.requestRepo.findDraftByUserId(creatorId);
    if (!request) {
      throw new NotFoundException(`Черновик пользователя с ID ${creatorId} не найден`);
    }

    const updatedRequest = await this.requestRepo.update(request.id, dto)

    return {
      id: updatedRequest.id,
      co2Volume: updatedRequest.co2Volume,
      h2oVolume: updatedRequest.h2oVolume,
      sampleDescription: updatedRequest.sampleDescription
    } as RequestSingleResponseDto;
  }

  async form(): Promise<RequestListResponseDto> {
    const creatorId = this.singletonUser.getCreatorId();
    const request = await this.requestRepo.findDraftByUserId(creatorId);
    if (!request) {
      throw new NotFoundException(`Черновик пользователя с ID ${creatorId} не найден`);
    }

    const combustions = request.requestCombustions;
    if (combustions.length === 0) {
      throw new BadRequestException('Заявка должна содержать хотя бы одну услугу');
    }

    if (!request.co2Volume || !request.h2oVolume) {
      throw new BadRequestException('Необходимо указать co2Volume и h2oVolume');
    }

    // Расчет amount по формуле из лаб 2
    for (const rc of combustions) {
      const cmb = rc.combustion;
      if (cmb && cmb.specificCo2Volume > 0 && cmb.specificH2oVolume > 0) {
        const amountByCo2 = request.co2Volume / cmb.specificCo2Volume;
        const amountByH2o = request.h2oVolume / cmb.specificH2oVolume;
        const error = Math.abs(amountByCo2 - amountByH2o) / (amountByCo2 + amountByH2o);
        rc.amount =
          error <= 0.1
            ? Number(((amountByH2o + amountByCo2) / 2).toFixed(4))
            : 0;
        await this.rcRepo.update(rc.requestId, rc.combustionId, { amount: rc.amount });
      }
    }

    const updatedRequest = await this.requestRepo.update(request.id, {
      status: 'formed',
      formedAt: new Date(),
      moderatorId: this.singletonUser.getModeratorId()
    });
   
    const resultsCount = updatedRequest.requestCombustions?.filter(
      rc => rc.amount !== null && rc.amount !== undefined && rc.amount !== 0,
    ).length || 0;

    return {
      id: updatedRequest.id,
      userName: updatedRequest.user.name,
      moderatorName: updatedRequest.moderator?.name || null,
      status: updatedRequest.status,
      createdAt: updatedRequest.createdAt,
      formedAt: updatedRequest.formedAt,
      resultsCount: resultsCount
    } as RequestListResponseDto;
  }

  async complete(id: number, action: 'approve' | 'reject'): Promise<RequestListResponseDto> {
    const request = await this.requestRepo.findById(id);
    if (!request || request.status === 'deleted') {
      throw new NotFoundException(`Заявка с ID ${id} не найдена`);
    }

    if (request.moderatorId !== this.singletonUser.getModeratorId()) {
      throw new ForbiddenException('Только модератор может подтвердить/отклонить заявку');
    }

    if (request.status !== 'formed') {
      throw new BadRequestException('Можно подтвердить/отклонить только сформированную заявку');
    }

    const updatedRequest = await this.requestRepo.update(id, {
      status: action === 'approve' ? 'approved' : 'rejected',
      moderatorId: this.singletonUser.getModeratorId(),
      completedAt: new Date(),
    });

    const resultsCount = updatedRequest.requestCombustions?.filter(
      rc => rc.amount !== null && rc.amount !== undefined && rc.amount !== 0,
    ).length || 0;

    return {
      id: updatedRequest.id,
      userName: updatedRequest.user.name,
      moderatorName: updatedRequest.moderator.name,
      status: updatedRequest.status,
      createdAt: updatedRequest.createdAt,
      formedAt: updatedRequest.formedAt,
      completedAt: updatedRequest.completedAt,
      resultsCount: resultsCount
    } as RequestListResponseDto;
  }

  async remove(): Promise<{ message: string }> {
    const creatorId = this.singletonUser.getCreatorId();
    const request = await this.requestRepo.findDraftByUserId(creatorId);
    if (!request) {
      throw new NotFoundException(`Черновик пользователя с ID ${creatorId} не найден`);
    }

    await this.requestRepo.softDelete(request.id);

    return {
      message: `Черновик успешно удален`,
    };
  }
}
