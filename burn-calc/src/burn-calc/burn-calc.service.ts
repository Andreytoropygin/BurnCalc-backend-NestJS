// src/burn-calc/burn-calc.service.ts
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Compound } from '../entities/compound.entity';
import { Request } from '../entities/request.entity';
import { RequestCompound } from '../entities/request-compound.entity';
import { RequestStatus } from '../entities/request-status.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BurnCalcService {
  constructor(
    @InjectRepository(Compound) private compoundRepo: Repository<Compound>,
    @InjectRepository(Request) private requestRepo: Repository<Request>,
    @InjectRepository(RequestCompound) private reqCompRepo: Repository<RequestCompound>,
    @InjectRepository(RequestStatus) private statusRepo: Repository<RequestStatus>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Быстрая проверка наличия черновика у пользователя
   * Возвращает: { hasDraft: boolean, cartId: number | null, cartCount: number }
   */
  async getUserCartInfo(userId: number) {
    const draftStatus = await this.statusRepo.findOne({ where: { name: 'draft' } });
    if (!draftStatus) return { hasDraft: false, cartId: null, cartCount: 0 };

    const request = await this.requestRepo.findOne({
      where: { user: { id: userId }, status: { id: draftStatus.id } },
      relations: ['requestCompounds'], // Загружаем связи, чтобы посчитать количество
      select: ['id'] // Нам нужен только ID заявки
    });

    if (!request) {
      return { hasDraft: false, cartId: null, cartCount: 0 };
    }

    return {
      hasDraft: true,
      cartId: request.id,
      cartCount: request.requestCompounds ? request.requestCompounds.length : 0
    };
  }


  // ... методы findAll, findOne, calculateFormula оставляем без изменений ...
  async findAll(query?: string) {
      const qb = this.compoundRepo.createQueryBuilder('c').where('c.is_active = :active', { active: true });
      if (query && query.trim()) qb.andWhere('c.title ILIKE :q', { q: `%${query}%` });
      return qb.getMany();
  }

  async findOne(id: number) {
      const compound = await this.compoundRepo.findOne({ where: { id } });
      if (!compound) throw new NotFoundException(`Соединение не найдено`);
      return compound;
  }

  calculateFormula(v_h2o: number, v_co2: number, m_sample: number, allCompounds: Compound[]) {
      // ... (код расчета формулы из предыдущего ответа остается тем же) ...
      const M_C = 12.01, M_H = 1.008, M_O = 16.00, Vm = 22.4;
      if (v_h2o <= 0 || v_co2 <= 0 || m_sample <= 0) return "Ошибка ввода";
      
      const n_c = v_co2 / Vm;
      const n_h = (v_h2o / Vm) * 2;
      const m_c = n_c * M_C;
      const m_h = n_h * M_H;
      const m_o = m_sample - (m_c + m_h);
      const n_o = m_o > 1e-6 ? m_o / M_O : 0;

      const values = [n_c, n_h, ...(n_o > 0 ? [n_o] : [])];
      const minMoles = Math.min(...values);
      if (minMoles === 0) return "Ошибка";

      const r_c = n_c / minMoles, r_h = n_h / minMoles, r_o = n_o > 0 ? n_o / minMoles : 0;
      const fix = (v: number) => Math.abs(v - Math.round(v)) < 0.15 ? Math.round(v) : parseFloat(v.toFixed(1));
      
      const i_c = fix(r_c), i_h = fix(r_h), i_o = fix(r_o);
      let empFormula = `C<sub>${i_c}</sub>H<sub>${i_h}</sub>`;
      if (i_o > 0) empFormula += `O<sub>${i_o}</sub>`;

      const candidates = allCompounds.filter(c => {
          if (!c.cCount || !c.hCount) return false;
          const hasO = i_o > 0, cHasO = (c.oCount||0) > 0;
          if (hasO !== cHasO) return false;
          const baseH = c.hCount/c.cCount, baseO = (c.oCount||0)/c.cCount;
          const expH = i_h/i_c, expO = i_o>0 ? i_o/i_c : 0;
          return Math.abs(baseH - expH) < 0.2 && Math.abs(baseO - expO) < 0.2;
      });

      return candidates.length ?
      `Совпадение найдено: <strong>${candidates[0].title}</strong> (${candidates[0].class})` :
      `Совпадений с добавленными соединениями нет. Эмпирическая формула: ${empFormula}`;
  }

  /**
   * Логика добавления в корзину:
   * 1. Проверяем, есть ли у пользователя черновик.
   * 2. Если нет -> Создаем новый черновик.
   * 3. Добавляем соединение в черновик.
   */
  async addToCart(userId: number, compoundId: number) {
    // 1. Находим статус "draft"
    const draftStatus = await this.statusRepo.findOne({ where: { name: 'draft' } });
    if (!draftStatus) throw new NotFoundException('Статус черновика не найден');

    // 2. Ищем существующий черновик
    let request = await this.requestRepo.findOne({
      where: { user: { id: userId }, status: { id: draftStatus.id } },
    });

    // 3. Если черновика нет -> СОЗДАЕМ ЕГО
    if (!request) {
      request = this.requestRepo.create({
        user: { id: userId },
        status: draftStatus,
        createdAt: new Date(),
        // formed_at, completed_at остаются null
      });
      await this.requestRepo.save(request);
      console.log(`Создан новый черновик заявки ID: ${request.id} для пользователя ${userId}`);
    }

    // 4. Проверяем, не добавлено ли уже это соединение
    const existingLink = await this.reqCompRepo.findOne({
      where: { request: { id: request.id }, compound: { id: compoundId } },
    });

    if (existingLink) {
      throw new ConflictException('Это соединение уже есть в заявке');
    }

    // 5. Добавляем связь
    const link = this.reqCompRepo.create({
      request: request,
      compound: { id: compoundId },
      priority: 1,
    });
    
    await this.reqCompRepo.save(link);

    return request; // Возвращаем заявку, чтобы знать её ID
  }

  /**
   * Получение заявки строго по ID
   */
  async getCartById(requestId: number, userId: number) {
    const request = await this.requestRepo.findOne({
      where: { 
        id: requestId,
        user: { id: userId }, // Проверка принадлежности
        status: { name: 'draft' } // Только черновики
      },
      relations: ['requestCompounds', 'requestCompounds.compound'],
      order: { requestCompounds: { priority: 'ASC' } }
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена, удалена или принадлежит другому пользователю');
    }

    return request;
  }

  // Логическое удаление
  async deleteCartSQL(userId: number, requestId: number) {
    const deletedStatus = await this.statusRepo.findOne({ where: { name: 'deleted' } });

    if (!deletedStatus) throw new NotFoundException('Статус удаленной заявки не найден');
    
    const result = await this.dataSource.query(
      `UPDATE "Request" SET status_id = $1, formed_at = NOW() 
       WHERE id = $2 AND user_id = $3 AND status_id = (SELECT id FROM "Request_statuses" WHERE name = 'draft')`,
      [deletedStatus.id, requestId, userId]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Не удалось удалить заявку (не найдена или уже удалена)');
    }
    return true;
  }
}