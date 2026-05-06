// src/modules/combustions/dto/update-combustion.dto.ts
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCombustionDto {
  @IsString()
  @IsOptional()
  sampleDescription?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  co2Volume?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  h2oVolume?: number;
}
