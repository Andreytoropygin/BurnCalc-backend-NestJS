// src/modules/combustions/dto/combustion-filters.dto.ts
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CombustionFiltersDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  formedAtFrom?: string;

  @IsOptional()
  @IsDateString()
  formedAtTo?: string;
}