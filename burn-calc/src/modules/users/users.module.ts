// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserController } from './users.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { SessionModule } from 'src/modules/session/session.module';
import { SessionGuard } from './session.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SessionModule],
  controllers: [UserController],
  providers: [UserService, SessionGuard, UserRepository],
  exports: [UserService, SessionGuard],
})
export class UsersModule {}