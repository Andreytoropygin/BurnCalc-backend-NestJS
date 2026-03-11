// src/modules/users/dto/create-user.dto.ts
import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}