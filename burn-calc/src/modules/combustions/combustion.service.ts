// src/modules/combustions/services/combustion.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { CombustionRepository } from './combustion.repository';
import { CompoundCombustionRepository } from 'src/modules/compound-combustions/compound-combustion.repository';
import { UserRepository } from 'src/modules/users/user.repository';
import { CombustionListResponseDto, CombustionSingleResponseDto, CompoundInCombustionDto } from './dto/combustion-response.dto';
import { CombustionFiltersDto } from './dto/combustion-filters.dto';
import { UpdateCombustionDto } from './dto/update-combustion.dto';
import { CombustionDraftBriefDto } from './dto/combustion-draft-brief.dto';
import { MinioService } from 'src/modules/minio/minio.service';

@Injectable()
export class CombustionService {
  constructor(
    private combustionRepo: CombustionRepository,
    private ccRepo: CompoundCombustionRepository,
    private userRepo: UserRepository,
    private minioService: MinioService
  ) {}

  async getDraftBrief(userId: number): Promise<CombustionDraftBriefDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    const draft = await this.combustionRepo.findDraftByUserId(userId);

    if (!draft) return { combustionId: null, compoundsCount: 0 } as CombustionDraftBriefDto;

    const compounds = await this.ccRepo.findByCombustionId(draft.id);
    return { combustionId: draft.id, compoundsCount: compounds.length };
  }

  async findAll(userId: number, filters?: CombustionFiltersDto): Promise<CombustionListResponseDto[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    const combustions = (await this.combustionRepo.findAll(filters)).filter(c => (c.technicianId === userId) || user.isExpert);

    return combustions.map(c => {
      const resultsCount = c.compoundCombustions?.filter(
        cc => cc.amount !== null && cc.amount !== undefined,
      ).length || 0;

      return {
        id: c.id,
        technicianName: c.technician.name,
        expertName: c.expert ? c.expert.name : null,
        status: c.status,
        createdAt: c.createdAt,
        formedAt: c.formedAt,
        completedAt: c.completedAt,
        h2oVolume: c.h2oVolume,
        co2Volume: c.co2Volume,
        sampleDescription: c.sampleDescription,
        resultsCount: resultsCount
      } as CombustionListResponseDto;
    }) as CombustionListResponseDto[];
  }

  async findById(id: number, userId: number): Promise<CombustionSingleResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    const combustion = await this.combustionRepo.findById(id);
    if (!combustion || combustion.status === 'deleted') throw new NotFoundException(`Заявка с ID ${id} не найдена`);

    if (combustion.technicianId !== userId && !user.isExpert) throw new ForbiddenException(`Просмотреть заявку может только создатель или эксперт`)

    let compounds: CompoundInCombustionDto[] =
      combustion.compoundCombustions?.map(cc => ({
        imageUrl: cc.compound?.imageUrl || null,
        comment: cc.comment,
        amount: cc.amount,
        id: cc.compoundId,
        title: cc.compound.title,
        specificCo2Volume: cc.compound.specificCo2Volume,
        specificH2oVolume: cc.compound.specificH2oVolume
        
      })) || [];

      for (let compound of compounds) {
        if (compound.imageUrl) {
          const imageFileName = compound.imageUrl.split('/').pop();
          compound.imageUrl = await this.minioService.getSignedUrl(imageFileName);
        }
      }

    return { 
      id: combustion.id,
      technicianId: combustion.technicianId,
      expertId: combustion.expertId,
      status: combustion.status,
      createdAt: combustion.createdAt,
      formedAt: combustion.formedAt,
      completedAt: combustion.completedAt,
      co2Volume: combustion.co2Volume,
      h2oVolume: combustion.h2oVolume,
      sampleDescription: combustion.sampleDescription,
      compounds,
     } as CombustionSingleResponseDto;
  }

  async update(dto: UpdateCombustionDto, userId: number): Promise<CombustionSingleResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);
    
    const combustion = await this.combustionRepo.findDraftByUserId(userId);
    if (!combustion) {
      throw new NotFoundException(`Черновик пользователя с ID ${userId} не найден`);
    }

    const updatedCombustion = await this.combustionRepo.update(combustion.id, dto)

    return {
      id: updatedCombustion.id,
      co2Volume: updatedCombustion.co2Volume,
      h2oVolume: updatedCombustion.h2oVolume,
      sampleDescription: updatedCombustion.sampleDescription
    } as CombustionSingleResponseDto;
  }

  async form(userId: number): Promise<CombustionListResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    let combustion = await this.combustionRepo.findDraftByUserId(userId);
    if (!combustion) {
      throw new NotFoundException(`Черновик пользователя с ID ${userId} не найден`);
    }

    const compoundCombustions = combustion.compoundCombustions;
    if (compoundCombustions.length === 0) {
      throw new BadRequestException('Сгорание должно содержать хотя бы одно соединение');
    }

    if (!combustion.co2Volume || !combustion.h2oVolume) {
      throw new BadRequestException('Необходимо указать co2Volume и h2oVolume');
    }

    // Расчет amount по формуле из лаб 2
    for (let cc of compoundCombustions) {
      const compound = cc.compound;
      if (compound && compound.specificCo2Volume > 0 && compound.specificH2oVolume > 0) {
        const amountByCo2 = combustion.co2Volume / compound.specificCo2Volume;
        const amountByH2o = combustion.h2oVolume / compound.specificH2oVolume;
        const error = Math.abs(amountByCo2 - amountByH2o) / (amountByCo2 + amountByH2o);
        cc.amount =
          error <= 0.1
            ? Number(((amountByH2o + amountByCo2) / 2).toFixed(4))
            : 0;
        await this.ccRepo.update(cc.combustionId, cc.compoundId, { amount: cc.amount });
      }
    }

    const updatedCombustion = await this.combustionRepo.update(combustion.id, {
      status: 'formed',
      formedAt: new Date()
    });
   
    const resultsCount = updatedCombustion.compoundCombustions?.filter(
      cc => cc.amount !== null && cc.amount !== undefined,
    ).length || 0;

    return {
      id: updatedCombustion.id,
      technicianName: updatedCombustion.technician.name,
      expertName: updatedCombustion.expert?.name || null,
      status: updatedCombustion.status,
      createdAt: updatedCombustion.createdAt,
      formedAt: updatedCombustion.formedAt,
      resultsCount: resultsCount
    } as CombustionListResponseDto;
  }

  async complete(id: number, action: 'approve' | 'reject', userId: number): Promise<CombustionListResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    const combustion = await this.combustionRepo.findById(id);
    if (!combustion || combustion.status === 'deleted') {
      throw new NotFoundException(`Заявка с ID ${id} не найдена`);
    }

    if (!user.isExpert) {
      throw new ForbiddenException('Только эксперт может завершить заявку');
    }

    if (combustion.status !== 'formed') {
      throw new BadRequestException('Можно завершить только сформированную заявку');
    }

    const updatedCombustion = await this.combustionRepo.update(id, {
      status: action === 'approve' ? 'approved' : 'rejected',
      expertId: userId,
      completedAt: new Date(),
    });

    const resultsCount = updatedCombustion.compoundCombustions?.filter(
      rc => rc.amount !== null && rc.amount !== undefined,
    ).length || 0;

    return {
      id: updatedCombustion.id,
      technicianName: updatedCombustion.technician.name,
      expertName: updatedCombustion.expert.name,
      status: updatedCombustion.status,
      createdAt: updatedCombustion.createdAt,
      formedAt: updatedCombustion.formedAt,
      completedAt: updatedCombustion.completedAt,
      resultsCount: resultsCount
    } as CombustionListResponseDto;
  }

  async remove(userId: number): Promise<{ message: string }> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(`Пользователь с ID: ${userId} не найден`);

    const combustion = await this.combustionRepo.findDraftByUserId(userId);
    if (!combustion) {
      throw new NotFoundException(`Черновик пользователя с ID ${userId} не найден`);
    }

    await this.combustionRepo.softDelete(combustion.id);

    return {
      message: `Черновик успешно удален`,
    };
  }
}
