// src/modules/users/dto/user-request.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRequestDto {
    @IsString()
    @MinLength(3)
    @ApiProperty({ example: 'Test User' })
    name: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: '123456' })
    password: string;
}