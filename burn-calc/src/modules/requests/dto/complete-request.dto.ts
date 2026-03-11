// src/modules/requests/dto/complete-request.dto.ts
import { IsEnum } from 'class-validator';

export enum RequestAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class CompleteRequestDto {
  @IsEnum(RequestAction)
  action: RequestAction;
}