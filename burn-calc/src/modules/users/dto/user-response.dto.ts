import { Exclude } from "class-transformer";

// src/modules/users/dto/user-response.dto.ts
export class UserResponseDto {
  id: number;
  name: string;

  @Exclude()
  password: string;

  isExpert: boolean;
}
