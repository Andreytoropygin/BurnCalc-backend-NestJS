// src/modules/users/controllers/user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthUserDto } from '../dto/auth-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.service.register(dto);
  }

  @Post('auth')
  async auth(@Body() dto: AuthUserDto): Promise<{ message: string }>  {
    return this.service.auth(dto);
  }

  @Post('logout')
  async logout(): Promise<{ message: string }> {
    return this.service.logout();
  }
}