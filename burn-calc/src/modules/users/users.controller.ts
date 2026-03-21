// src/modules/users/user.controller.ts
import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import express from 'express';
import { UserService } from './user.service';
import { UserRequestDto } from './dto/user-request.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @Post('register')
  async register(
    @Body() dto: UserRequestDto
  ): Promise<UserResponseDto> {
    return this.service.register(dto);
  }

  @Post('login')
  async auth(
    @Body() dto: UserRequestDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { sessionId, user } = await this.service.login(dto);
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });
    return { user };
  }

  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res() res: express.Response)
  {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      await this.service.logout(sessionId);
    }
    res.clearCookie('sessionId');
    return res.status(200).json({ ok: true });
  }
}