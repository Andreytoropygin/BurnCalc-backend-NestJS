// src/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Загружаем переменные из файла .env
dotenv.config();

// Импортируем ваши Entity (убедитесь, что пути правильные)
import { User } from './entities/user.entity';
import { Request } from './entities/request.entity';
import { Compound } from './entities/compound.entity';
import { RequestStatus } from './entities/request-status.entity';
import { RequestCompound } from './entities/request-compound.entity';

// Вспомогательная функция для безопасного получения строк
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Переменная окружения ${key} не определена и не имеет значения по умолчанию.`);
  }
  return value || defaultValue!;
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  // Используем функцию или явное приведение типов с fallback
  host: getEnv('DB_HOST', 'localhost'),
  port: parseInt(getEnv('DB_PORT', '5432'), 10),
  username: getEnv('DB_USER', 'andreyroot'),
  password: getEnv('DB_PASS', 'andreyroot'),
  database: getEnv('DB_NAME', 'burn-calc-db'),
  
  entities: [User, Request, Compound, RequestStatus, RequestCompound],
  migrations: ['./src/migrations/*.ts'],
  synchronize: false, // Важно: false при использовании миграций
  logging: true,      // Включите логи, чтобы видеть SQL запросы
});