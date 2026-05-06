// src/modules/users/user.controller.ts
import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import express from 'express';
import { UserService } from './user.service';
import { UserRequestDto } from './dto/user-request.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @Post('register')
  @ApiCreatedResponse({ type: UserResponseDto })
  async register(
    @Body() dto: UserRequestDto
  ): Promise<UserResponseDto> {
    return this.service.register(dto);
  }

  @Post('login')
  @ApiOkResponse({ type: UserResponseDto })
  async auth(
    @Body() dto: UserRequestDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<UserResponseDto> {
    const { sessionId, user } = await this.service.login(dto);
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });
    return user;
  }

  @Post('logout')
  @ApiOkResponse()
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response)
  {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      await this.service.logout(sessionId);
    }
    res.clearCookie('sessionId');
    res.status(200).json({ ok: true });
  }
}
