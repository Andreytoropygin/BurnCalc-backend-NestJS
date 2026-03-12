// src/modules/compound-combustions/dto/update-compound-combustion.dto.ts
import { IsString} from 'class-validator';

export class UpdateCompoundCombustionDto {
  @IsString()
  comment: string;
}