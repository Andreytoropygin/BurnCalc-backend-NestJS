// src/modules/requests/dto/update-request.dto.ts
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRequestDto {
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