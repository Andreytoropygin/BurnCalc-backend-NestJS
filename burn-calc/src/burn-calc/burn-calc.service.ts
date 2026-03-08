// src/burn-calc/burn-calc.service.ts
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Double } from 'typeorm';
import { Combustion } from '../entities/combustion.entity';
import { Request } from '../entities/request.entity';
import { RequestCombustion } from '../entities/request-combustion.entity';
import { User } from '../entities/user.entity';

const DRAFT_STATUS = 'draft'
const DELETED_STATUS = 'deleted'
const FORMED_STATUS = 'formed'
const COMPLETED_STATUS = 'completed'
const REJECTED_STATUS = 'rejected'
const DEFAULT_H2O_VOLUME = 1
const DEFAULT_CO2_VOLUME = 1


@Injectable()
export class BurnCalcService {
  constructor(
    @InjectRepository(Combustion) private combustionRepo: Repository<Combustion>,
    @InjectRepository(Request) private requestRepo: Repository<Request>,
    @InjectRepository(RequestCombustion) private reqCombRepo: Repository<RequestCombustion>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Быстрая проверка наличия черновика у пользователя
   * Возвращает: { hasDraft: boolean, requestId: number | null, requestCount: number }
   */
  async getUserRequestInfo(userId: number) {
    const request = await this.requestRepo.findOne({
      where: { user: { id: userId }, status: DRAFT_STATUS },
      relations: ['requestCombustions'], // Загружаем связи, чтобы посчитать количество
      select: ['id'] // Нам нужен только ID заявки
    });

    if (!request) {
      return { hasDraft: false, requestId: null, requestCount: 0 };
    }

    return {
      hasDraft: true,
      requestId: request.id,
      requestCount: request.requestCombustions ? request.requestCombustions.length : 0
    };
  }


  // ... методы findAll, findOne, calculateFormula оставляем без изменений ...
  async findAll(query?: string) {
      const qb = this.combustionRepo.createQueryBuilder('c').where('c.is_active = :active', { active: true });
      if (query && query.trim()) qb.andWhere('c.title ILIKE :q', { q: `%${query}%` });
      return qb.getMany();
  }

  async findOne(id: number) {
      const combustion = await this.combustionRepo.findOne({ where: { id } });
      if (!combustion) throw new NotFoundException(`Соединение не найдено`);
      return combustion;
  }

  /**
   * Логика добавления в корзину:
   * 1. Проверяем, есть ли у пользователя черновик.
   * 2. Если нет, создаем новый черновик.
   * 3. Добавляем соединение в черновик.
   */
  async addTorequest(userId: number, combustionId: number) {
    // Ищем существующий черновик
    let request = await this.requestRepo.findOne({
      where: { user: { id: userId }, status: DRAFT_STATUS },
    });

    // Если черновика нет -> СОЗДАЕМ ЕГО
    if (!request) {
      request = this.requestRepo.create({
        user: { id: userId },
        status: DRAFT_STATUS,
        createdAt: new Date()
      });
      await this.requestRepo.save(request);
      console.log(`Создан новый черновик заявки ID: ${request.id} для пользователя ${userId}`);
    }

    // Проверяем, не добавлено ли уже это соединение
    const existingLink = await this.reqCombRepo.findOne({
      where: { request: { id: request.id }, combustion: { id: combustionId } },
    });

    if (existingLink) {
      throw new ConflictException('Это соединение уже есть в заявке');
    }

    // Добавляем связь
    const link = this.reqCombRepo.create({
      request: request,
      combustion: { id: combustionId },
    });
    
    await this.reqCombRepo.save(link);

    return request; // Возвращаем заявку, чтобы знать её ID
  }

  /**
   * Получение заявки строго по ID
   */
  async getDraftRequestById(requestId: number, userId: number) {
    let request = await this.requestRepo.findOne({
      where: { 
        id: requestId,
        user: { id: userId }, // Проверка принадлежности
        status: DRAFT_STATUS // Только черновики
      },
      relations: ['requestCombustions', 'requestCombustions.combustion'],
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена, удалена или принадлежит другому пользователю');
    }

    for (let rc of request.requestCombustions) {
      const cmb = rc.combustion
      const amount_by_co2 = request.co2Volume / cmb.specific_co2_volume
      const amount_by_h2o = request.h2oVolume / cmb.specific_h2o_volume
      const error = Math.abs(amount_by_co2 - amount_by_h2o) / (amount_by_co2 + amount_by_h2o)
      rc.amount = error <= 0.1 ? Number(((amount_by_h2o + amount_by_co2) / 2).toFixed(4)) : 0;
    }

    return request;
  }

  // Логическое удаление
  async deleterequestSQL(userId: number, requestId: number) {    
    const result = await this.dataSource.query(
      `UPDATE "Request" SET status = $1, formed_at = NOW() 
       WHERE id = $2 AND user_id = $3`,
      [DELETED_STATUS, requestId, userId]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Не удалось удалить заявку (не найдена или уже удалена)');
    }
    return true;
  }
}