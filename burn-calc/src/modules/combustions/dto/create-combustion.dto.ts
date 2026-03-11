// src/modules/combustions/dto/create-combustion.dto.ts
import { IsString, IsNumber, Min, IsOptional} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCombustionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  formula?: string;

  @IsString()
  @IsOptional()
  class?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  specificH2oVolume?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  specificCo2Volume?: number;
}