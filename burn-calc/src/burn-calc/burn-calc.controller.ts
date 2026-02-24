import { Controller, Get, Post, Body, Render, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as handlebars from 'handlebars';

interface Compound {
    id: number;
    title: string;
    class: string;
    molar_mass: number;
    formula: any; // SafeString
    description: any;
    in_cart: boolean;
    priority: number;
    image_file_name: string;
    video_file_name: string;
    // Дополнительные поля для расчета
    c_count?: number; // Количество атомов C в молекуле
    h_count?: number; // Количество атомов H в молекуле
    o_count?: number; // Количество атомов O в молекуле
}

@Controller('burn-calc')
export class BurnCalcController {
    private compounds: Compound[] = [
        {
            id: 1,
            title: "Метан",
            class: "Алканы",
            molar_mass: 16.04,
            formula: new handlebars.SafeString("CH<sub>4</sub>"),
            description: new handlebars.SafeString("Простейший представитель алканов, легкий газ, малорастворимый в воде.<br>\
                Метан – основной компонент природного газа (80-98%), попутных нефтяных газов и газов, \
                скапливающихся в шахтах и рудниках. Также метан производится бактериями в болотах \
                (отсюда синоним метана: «болотный газ») и в кишечнике жвачных животных."),
            in_cart: true, priority: 2,
            image_file_name: "метан.png", video_file_name: "метан.mp4",
            c_count: 1, h_count: 4, o_count: 0
        },
        {
            id: 2,
            title: "Этилен",
            class: "Алкены",
            molar_mass: 28.05,
            formula: new handlebars.SafeString("C<sub>2</sub>H<sub>4</sub>"),
            description: new handlebars.SafeString("Простейший представитель класса алкенов. Бесцветный газ со слабым \
                сладковатым запахом. Слабо растворим в воде, \
                значительно лучше в этаноле.<br>Важнейшее сырье в органической химии, самое производимое \
                органическое соединение в мире.<br>В природе важный (и первых из открытых) фитогормон, он \
                влияет на многие процессы онтогенеза. Некоторые из этих свойств этилена используются в \
                сельском хозяйстве. Для человека этилен (точнее продукт его окисления в организме) \
                обладает  канцерогенным действием."),
            in_cart: true, priority: 1,
            image_file_name: "этилен.png", video_file_name: "этилен.mp4",
            c_count: 2, h_count: 4, o_count: 0
        },
        {
            id: 3,
            title: "Ацетилен",
            class: "Алкины",
            molar_mass: 26.04,
            formula: new handlebars.SafeString("C<sub>2</sub>H<sub>2</sub>"),
            description: new handlebars.SafeString("Простейший представитель алкинов. Бесцветный газ без запаха.\
                Нерастворим в воде, хорошо растворяется в ацетоне.<br>У ацетилена очень \
                большая теплота сгорания, температура пламени в кислороде достигает 3150°С, \
                поэтому ацетилен применяют в аппаратах для сварки и резки металлов. Ацетилен \
                в смеси с кислородом крайне опасен, может взорваться при малейшей искре, \
                даже от разряда статического электричества."),
            in_cart: false, priority: 1,
            image_file_name: "ацетилен.png", video_file_name: "ацетилен.mp4",
            c_count: 2, h_count: 2, o_count: 0
        },
        {
            id: 4,
            title: "Бензол",
            class: "Арены",
            molar_mass: 78.11,
            formula: new handlebars.SafeString("C<sub>6</sub>H<sub>6</sub>"),
            description: new handlebars.SafeString("Бензол – простейший представитель аренов. \
                Бесцветная жидкость со сладковатым запахом и высокой летучестью.<br>Бензол \
                используется в промышленности как сырье для синтеза большого числа органических \
                соединений (лекарств, пластмасс, резин, красителей и др), редко используется как \
                растворитель.<br>Токсичен, регулярное вдыхание паров бензола вызывает онкологические \
                заболевания, заболевания костного мозга и др."),
            in_cart: false, priority: 3,
            image_file_name: "бензол.png", video_file_name: "бензол.mp4",
            c_count: 6, h_count: 6, o_count: 0
        },
        {
            id: 5,
            title: "Этанол",
            class: "Спирты",
            molar_mass: 46.07,
            formula: new handlebars.SafeString("C<sub>2</sub>H<sub>6</sub>O<sub>1</sub>"),
            description: new handlebars.SafeString("Предельный одноатомный спирт..."),
            in_cart: false, priority: 1,
            image_file_name: "этанол.png", video_file_name: "этанол.mp4",
            c_count: 2, h_count: 6, o_count: 1
        }
    ];

    private request = {
        h2o_volume: 4.48,
        co2_volume: 2.24,
        sample_mass: 1.6
    };
    
    // Константы молярных масс элементов
    private readonly M_C = 12.01; // г/моль
    private readonly M_H = 1.008; // г/моль
    private readonly M_O = 16.00; // г/моль
    private readonly Vm = 22.4;   // Молярный объем газа при н.у. (л/моль)

    @Get()
    @Render('main')
    getMain() {
        return {
            title: "BurnCalc",
            cart_count: this.compounds.filter(c => c.in_cart).length,
            compounds: this.compounds
        };
    }

    @Get('request')
    @Render('request')
    calculateFormula() {
        const v_h2o = this.request.h2o_volume
        const v_co2 = this.request.co2_volume
        const m_sample = this.request.sample_mass

        let result = "Ошибка ввода данных";
        let empiricalFormula = "";
        let matchedCompound: Compound | null = null;
        
        // Объявляем переменные расчета заранее, чтобы они были видны в return
        let n_c = 0;
        let n_h = 0;
        let n_o = 0;

        if (v_h2o > 0 && v_co2 > 0 && m_sample > 0) {
            // 2. Расчет количеств веществ (моли)
            n_c = v_co2 / this.Vm;
            const n_h2o = v_h2o / this.Vm;
            n_h = n_h2o * 2; 

            // 3. Расчет масс элементов
            const m_c = n_c * this.M_C;
            const m_h = n_h * this.M_H;
            const m_o = m_sample - (m_c + m_h);

            // 4. Определение наличия кислорода
            n_o = m_o > 1e-6 ? (m_o / this.M_O) : 0;

            // 5. Нахождение простейшего соотношения
            // Если кислород не найден, исключаем его из поиска минимума
            const values = [n_c, n_h];
            if (n_o > 0) values.push(n_o);
            
            const minMoles = Math.min(...values);
            
            if (minMoles === 0) {
                result = "Ошибка расчета: количество вещества равно нулю.";
            } else {
                let r_c = n_c / minMoles;
                let r_h = n_h / minMoles;
                let r_o = n_o > 0 ? n_o / minMoles : 0;

                // Функция для округления с учетом погрешности
                const fixIndex = (val: number) => {
                    const rounded = Math.round(val);
                    // Если разница меньше 0.15, считаем целым числом
                    return Math.abs(val - rounded) < 0.15 ? rounded : parseFloat(val.toFixed(1));
                };

                const i_c = fixIndex(r_c);
                const i_h = fixIndex(r_h);
                const i_o = fixIndex(r_o);

                // Формируем строку эмпирической формулы
                empiricalFormula = `C<sub>${i_c}</sub>H<sub>${i_h}</sub>`;
                if (i_o > 0) {
                    empiricalFormula += `O<sub>${i_o}</sub>`;
                }

                // 6. Поиск совпадения в базе данных
                const candidates = this.compounds.filter(c => {
                    // ПРОВЕРКА: Убедитесь, что свойства существуют перед использованием
                    if (c.c_count === undefined || c.h_count === undefined) {
                        return false;
                    }

                    const cCount = c.c_count;
                    const hCount = c.h_count;
                    const oCount = c.o_count || 0;

                    // Проверка наличия кислорода
                    const hasO = i_o > 0;
                    const compoundHasO = oCount > 0;
                    if (hasO !== compoundHasO) return false;

                    // Отношения в соединении из базы (нормируем по углероду)
                    // Избегаем деления на ноль, хотя для органики C всегда > 0
                    if (cCount === 0) return false;

                    const baseRatioH = hCount / cCount;
                    const baseRatioO = oCount / cCount;

                    // Отношения из эксперимента
                    // Избегаем деления на ноль, если i_c == 0 (невозможно для горения, но для безопасности)
                    if (i_c === 0) return false;
                    
                    const expRatioH = i_h / i_c;
                    const expRatioO = i_o > 0 ? i_o / i_c : 0;

                    // Сравнение с погрешностью
                    const diffH = Math.abs(baseRatioH - expRatioH);
                    const diffO = Math.abs(baseRatioO - expRatioO);

                    return diffH < 0.2 && diffO < 0.2;
                });

                if (candidates.length > 0) {
                    matchedCompound = candidates[0];
                    result = `Найдено совпадение: <strong>${matchedCompound.title}</strong> (${matchedCompound.class})`;
                } else {
                    result = `Эмпирическая формула: ${empiricalFormula}. Точного совпадения в базе не найдено.`;
                }
            }
        }

        const compounds = this.compounds.filter(c => c.in_cart).sort((a, b) => a.priority - b.priority);
        const request = {
            h2o_volume: v_h2o,
            co2_volume: v_co2,
            sample_mass: m_sample
        };

        return {
            title: "Заявка - BurnCalc",
            request: request,
            compounds: compounds,
            result: new handlebars.SafeString(result)
        };
    }

    @Get('compound/:id')
    @Render('compound')
    getCompound(@Param('id') id: string) {
        let compound = this.compounds.find(c => c.id === Number(id));
        return {
            title: compound ? compound.title + " - BurnCalc" : "Не найдено",
            compound: compound
        };
    }

    @Post()
    @Render('main')
    async searchCompounds(@Body() body: { query?: string }) {
        const query = body?.query || '';
        let compounds;
        
        if (query && query.trim()) {
            const searchQuery = query.toLowerCase();
            compounds = this.compounds.filter(c => 
                c.title.toLowerCase().includes(searchQuery)
            );
        } else {
            compounds = this.compounds;
        }
        
        return {
            title: 'Поиск - BurnCalc',
            query: query || '',
            cart_count: this.compounds.filter(c => c.in_cart).length,
            compounds: compounds
        };
    }
}
