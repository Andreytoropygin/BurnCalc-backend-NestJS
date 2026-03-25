import { Exclude } from "class-transformer";

// src/modules/users/dto/user-response.dto.ts
export class UserResponseDto {
  @Exclude()
  id: number;
  name: string;

  @Exclude()
  password: string;

  isExpert: boolean;
}
