// src/modules/requests/dto/request-filters.dto.ts
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class RequestFiltersDto {
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