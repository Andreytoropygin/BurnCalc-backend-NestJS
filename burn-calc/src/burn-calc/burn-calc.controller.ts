import { Controller, Get, Post, Body, Render, Param, Res } from '@nestjs/common';
import * as handlebars from 'handlebars';

interface Combustion {
    id: number;
    title: string;
    class: string;
    formula: handlebars.SafeString;
    specific_h2o_volume: number;    // удельный объем водяного пара сгорания, л/моль
    specific_co2_volume: number;    // удельный объем углекислого газа сгорания, л/моль
    image_file_name: string;
    video_file_name: string;

    // поля м-м
    in_cart: boolean;
    request_comment: string;
    amount: any;                 // результат в м-м - количество вещества в образце, моль
}

@Controller('burn-calc')
export class BurnCalcController {
    private combustions: Combustion[] = [
        {
            id: 1,
            title: "Метан",
            class: "Алканы",
            formula: new handlebars.SafeString("CH<sub>4</sub>"),
            specific_h2o_volume: 22.4,
            specific_co2_volume: 44.8,
            image_file_name: "метан.png", video_file_name: "метан.mp4",
            
            in_cart: true, 
            request_comment: "Чистый газ",
            amount: 2.1,
        },
        {
            id: 2,
            title: "Этилен",
            class: "Алкены",
            specific_h2o_volume: 44.8,
            specific_co2_volume: 44.8,
            formula: new handlebars.SafeString("C<sub>2</sub>H<sub>4</sub>"),
            image_file_name: "этилен.png", video_file_name: "этилен.mp4",

            in_cart: false, 
            request_comment: "",
            amount: null,
        },
        {
            id: 3,
            title: "Ацетилен",
            class: "Алкины",
            formula: new handlebars.SafeString("C<sub>2</sub>H<sub>2</sub>"),
            specific_h2o_volume: 44.8,
            specific_co2_volume: 22.4,
            image_file_name: "ацетилен.png", video_file_name: "ацетилен.mp4",

            in_cart: false, 
            request_comment: "",
            amount: null,
        },
        {
            id: 4,
            title: "Бензол",
            class: "Арены",
            formula: new handlebars.SafeString("C<sub>6</sub>H<sub>6</sub>"),
            specific_h2o_volume: 134.4,
            specific_co2_volume: 67.2,
            image_file_name: "бензол.png", video_file_name: "бензол.mp4",
            
            in_cart: false, 
            request_comment: "",
            amount: null,
        },
        {
            id: 5,
            title: "Этанол",
            class: "Спирты",
            formula: new handlebars.SafeString("C<sub>2</sub>H<sub>6</sub>O<sub>1</sub>"),
            specific_h2o_volume: 44.8,
            specific_co2_volume: 67.2,
            image_file_name: "этанол.png", video_file_name: "этанол.mp4",

            in_cart: true, 
            request_comment: "Концентрация 80%",
            amount: 1.3,
        }
    ];

    private request = {
        id: 1,
        h2o_volume: 105.28,
        co2_volume: 181.44,
        sample_description: "бесцветный легкий газ, без запаха",
    };

    @Get()
    @Render('main')
    getMain() {
        return {
            title: "BurnCalc",
            cart_count: this.combustions.filter(c => c.in_cart).length,
            combustions: this.combustions
        };
    }

    @Get('request/:id')
    @Render('request')
    getRequest(@Param('id') id: string) {
        if (this.request.id === Number(id)) {
            return {
                title: "Заявка - BurnCalc",
                request: this.request,
                combustions: this.combustions.filter(c => c.in_cart),
            };
        }
        else {
            return {title: "Не найдено"}
        }

        
    }

    @Get('combustion/:id')
    @Render('combustion')
    getCombustion(@Param('id') id: string) {
        let combustion = this.combustions.find(c => c.id === Number(id));
        return {
            title: combustion ? combustion.title + " - BurnCalc" : "Не найдено",
            combustion: combustion
        };
    }

    @Post()
    @Render('main')
    async searchCombustions(@Body() body: { query?: string }) {
        const query = body?.query || '';
        let combustions;
        
        if (query && query.trim()) {
            const searchQuery = query.toLowerCase();
            combustions = this.combustions.filter(c => 
                c.title.toLowerCase().includes(searchQuery)
            );
        } else {
            combustions = this.combustions;
        }
        
        return {
            title: 'Поиск - BurnCalc',
            query: query || '',
            cart_count: this.combustions.filter(c => c.in_cart).length,
            combustions: combustions
        };
    }
}
