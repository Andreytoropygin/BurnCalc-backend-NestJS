// src/modules/users/services/user.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthUserDto } from '../dto/auth-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private repository: UserRepository) {}

  async register(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new BadRequestException('Пользователь с таким именем уже существует');
    }

    const user = await this.repository.create({
      name: dto.name,
      password: dto.password,
      isModerator: false,
    });

    return user as UserResponseDto;
  }

  async auth(dto: AuthUserDto): Promise<{ message: string }> {
    const user = await this.repository.findByName(dto.name);
    if (!user || user.password !== dto.password) {
      throw new BadRequestException('Неверное имя или пароль');
    }

    // Заглушка для 4ой лабораторной
    return { message: 'Аутентификация успешна' };
  }

  async logout(): Promise<{ message: string }> {
    // Заглушка для 4ой лабораторной
    return { message: 'Деавторизация успешна' };
  }
}