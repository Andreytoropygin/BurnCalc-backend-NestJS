// src/modules/users/user.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserRequestDto } from './dto/user-request.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { SessionService } from 'src/modules/session/session.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private sessionService:  SessionService
  ) {}

  async register(dto: UserRequestDto): Promise<UserResponseDto> {
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

  async login(dto: UserRequestDto): Promise<{sessionId: string, user: UserResponseDto}> {
    const user = await this.repository.findByName(dto.name);
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Неверное имя или пароль');
    }

    const sessionId = uuidv4();
    await this.sessionService.create(sessionId, user.id);
    return { sessionId, user: user as UserResponseDto };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.destroy(sessionId);
  }

  async validateSession(sessionId: string): Promise<UserResponseDto> {
    const userId = await this.sessionService.getUserId(sessionId);
    if (!userId) throw new UnauthorizedException('Invalid or expired session');
    const user = await this.repository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return user as UserResponseDto;
  }

  async getUserIdBySessionId(sessionId: string): Promise<number | null> {
    return this.sessionService.getUserId(sessionId);
  }
}