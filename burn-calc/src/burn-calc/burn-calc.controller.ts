import { Controller, Get, Post, Body, Render, Param, Headers, Redirect, Query } from '@nestjs/common';
import { BurnCalcService } from './burn-calc.service';
import * as handlebars from 'handlebars';

@Controller('burn-calc')
export class BurnCalcController {
    constructor(private readonly burnCalcService: BurnCalcService) {}

    private getUserId(headers: any): number {
        // Для демо берем из заголовка или дефолт 1
        return headers['x-user-id'] ? parseInt(headers['x-user-id']) : 1;
    }
    @Get()
    @Render('main')
    async getMain(@Headers() headers: any) {
        const userId = this.getUserId(headers);
        
        // 1. Получаем список соединений (с поиском)
        const combustions = await this.burnCalcService.findAll();
        
        // 2. Получаем информацию о корзине текущего пользователя
        const requestInfo = await this.burnCalcService.getUserRequestInfo(userId);

        return {
            title: "BurnCalc - Каталог",
            combustions: combustions,
            query: '',
            // Передаем данные о корзине в шаблон
            has_draft: requestInfo.hasDraft,
            request_count: requestInfo.requestCount,
            request_id: requestInfo.requestId
        };
    }

    /**
     * GET /burn-calc/request/:id
     * Просмотр конкретной заявки по ID
     */
    @Get('request/:id')
    @Render('request')
    async getRequest(
        @Param('id') id: string, 
        @Headers() headers: any,
    ) {
        const userId = this.getUserId(headers);
        const requestId = parseInt(id);

        // Получаем заявку из БД
        const request = await this.burnCalcService.getDraftRequestById(requestId, userId);
        
        return {
            title: `Заявка #${request.id}`,
            request: request
        };
    }

    @Get('combustion/:id')
    @Render('combustion')
    async getCombustion(@Param('id') id: string) {
        const combustion = await this.burnCalcService.findOne(parseInt(id));
        return {
            title: `${combustion.title} - BurnCalc`,
            combustion: combustion,
        };
    }

    @Post('')
    @Render('main')
    async searchCombustions(@Body() body: { query?: string }, @Headers() headers: any) {
        const userId = this.getUserId(headers);
        
        // 2. Получаем информацию о корзине текущего пользователя
        const requestInfo = await this.burnCalcService.getUserRequestInfo(userId);

        const query = body?.query || '';
        const combustions = await this.burnCalcService.findAll(query);
        return {
            title: `Поиск: ${query}`,
            combustions,
            query,
            has_draft: requestInfo.hasDraft,
            request_count: requestInfo.requestCount,
            request_id: requestInfo.requestId};
    }

    /**
     * POST /burn-calc/add-to-request
     * Создает черновик, если нет, и добавляет товар.
     * Редиректит на страницу созданной/найденной заявки.
     */
    // src/burn-calc/burn-calc.controller.ts

    @Post('add-to-request')
    @Redirect('', 302) // URL будет динамическим
    async addToRequest(
        @Body() body: { combustionId: number, redirectTo?: string }, 
        @Headers() headers: any
    ) {
        const userId = this.getUserId(headers);
        
        try {
            await this.burnCalcService.addTorequest(userId, body.combustionId);
            
            // Если передан адрес возврата, используем его, иначе идем на главную
            const redirectUrl = body.redirectTo || '/burn-calc';
            
            return { url: redirectUrl };
        } catch (e) {
            console.error(e.message);
            // В случае ошибки тоже возвращаем назад
            return { url: body.redirectTo || '/burn-calc' };
        }
    }

    /**
     * POST /burn-calc/delete-request/:id
     * Логическое удаление заявки
     */
    @Post('delete-request/:id')
    @Redirect('/burn-calc', 302)
    async deleterequest(@Param('id') id: string, @Headers() headers: any) {
        const userId = this.getUserId(headers);
        await this.burnCalcService.deleterequestSQL(userId, parseInt(id));
        return {};
    }
}