// src/modules/combustions/dto/complete-combustion.dto.ts
import { IsEnum } from 'class-validator';

export enum CompleteAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class CompleteCombustionDto {
  @IsEnum(CompleteAction)
  action: CompleteAction;
}
