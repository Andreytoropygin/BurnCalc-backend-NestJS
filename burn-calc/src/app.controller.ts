import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import express from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { UserService } from 'src/modules/users/user.service';

@Controller()
export class AppController {
  constructor(private userService: UserService) {}

  @Get('/login')
  @ApiExcludeEndpoint()
  getLogin(@Req() req: express.Request, @Res() res: express.Response) {
    return res.render('login');
  }

  @Get('/profile')
  @ApiExcludeEndpoint()
  async getProfile(@Req() req: express.Request, @Res() res: express.Response) {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.redirect('login');
    }

    try {
      const user = await this.userService.validateSession(sessionId);
      if (!user) {
        return res.redirect('login');
      }

      return res.render('profile', {
        title: 'Profile',
        user: {
          id: user.id,
          name: user.name,
          isExpert: user.isExpert,
        },
      });
    } catch (err) {
      return res.redirect('login');
    }
  }
}