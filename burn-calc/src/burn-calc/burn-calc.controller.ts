import { Controller, Get, Post, Body, Render, Param, Headers, Redirect, Query } from '@nestjs/common';
import { BurnCalcService } from './burn-calc.service';
import * as handlebars from 'handlebars';

@Controller('burn-calc')
export class BurnCalcController {
    private readonly defaultRequest = {
        h2o_volume: 4.48,
        co2_volume: 2.24,
        sample_mass: 1.6
    };

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
        const compounds = await this.burnCalcService.findAll();
        
        // 2. Получаем информацию о корзине текущего пользователя
        const cartInfo = await this.burnCalcService.getUserCartInfo(userId);

        return {
            title: "BurnCalc - Каталог",
            compounds: compounds,
            query: '',
            // Передаем данные о корзине в шаблон
            has_draft: cartInfo.hasDraft,
            cart_count: cartInfo.cartCount,
            cart_id: cartInfo.cartId
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

        // 1. Получаем заявку из БД по ID
        const cart = await this.burnCalcService.getCartById(requestId, userId);
        
        // 2. Формируем список соединений для шаблона
        const compoundsInCart = cart.requestCompounds.map(rc => ({
            ...rc.compound,
            priority: rc.priority
        }));

        // 3. Берем параметры дефолтные
        const v_h2o = this.defaultRequest.h2o_volume;
        const v_co2 = this.defaultRequest.co2_volume;
        const m_sample = this.defaultRequest.sample_mass;

        // 4. Считаем формулу
        const calculation = this.burnCalcService.calculateFormula(v_h2o, v_co2, m_sample, compoundsInCart);

        return {
            title: `Заявка #${cart.id}`,
            request: { h2o_volume: v_h2o, co2_volume: v_co2, sample_mass: m_sample },
            compounds: compoundsInCart,
            cartId: cart.id,
            result: new handlebars.SafeString(calculation),
        };
    }

    @Get('compound/:id')
    @Render('compound')
    async getCompound(@Param('id') id: string) {
        const compound = await this.burnCalcService.findOne(parseInt(id));
        return {
            title: `${compound.title} - BurnCalc`,
            compound: compound,
        };
    }

    @Post('')
    @Render('main')
    async searchCompounds(@Body() body: { query?: string }, @Headers() headers: any) {
        const userId = this.getUserId(headers);
        
        // 2. Получаем информацию о корзине текущего пользователя
        const cartInfo = await this.burnCalcService.getUserCartInfo(userId);

        const query = body?.query || '';
        const compounds = await this.burnCalcService.findAll(query);
        return {
            title: `Поиск: ${query}`,
            compounds,
            query,
            has_draft: cartInfo.hasDraft,
            cart_count: cartInfo.cartCount,
            cart_id: cartInfo.cartId};
    }

    /**
     * POST /burn-calc/add-to-cart
     * Создает черновик, если нет, и добавляет товар.
     * Редиректит на страницу созданной/найденной заявки.
     */
    // src/burn-calc/burn-calc.controller.ts

    @Post('add-to-cart')
    @Redirect('', 302) // URL будет динамическим
    async addToCart(
        @Body() body: { compoundId: number, redirectTo?: string }, 
        @Headers() headers: any
    ) {
        const userId = this.getUserId(headers);
        
        try {
            await this.burnCalcService.addToCart(userId, body.compoundId);
            
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
     * POST /burn-calc/delete-cart/:id
     * Логическое удаление заявки
     */
    @Post('delete-cart/:id')
    @Redirect('/burn-calc', 302)
    async deleteCart(@Param('id') id: string, @Headers() headers: any) {
        const userId = this.getUserId(headers);
        await this.burnCalcService.deleteCartSQL(userId, parseInt(id));
        // После удаления редирект на главную, так как заявки больше нет
        return {};
    }
}