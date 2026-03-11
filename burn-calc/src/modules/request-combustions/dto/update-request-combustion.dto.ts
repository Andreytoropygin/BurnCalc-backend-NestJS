// src/modules/request-combustions/dto/update-request-combustion.dto.ts
import { IsString} from 'class-validator';

export class UpdateRequestCombustionDto {
  @IsString()
  comment: string;
}