// src/modules/users/dto/user-request.dto.ts
import { IsString, MinLength } from 'class-validator';

export class UserRequestDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsString()
    @MinLength(6)
    password: string;
}
