// src/modules/compounds/dto/create-compound.dto.ts
import { IsString, IsNumber, Min, IsOptional} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompoundDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  formula?: string;

  @IsString()
  @IsOptional()
  class?: string;

  @IsString()
  @IsOptional()
  description_eng?: string;

  @IsString()
  @IsOptional()
  description_rus?: string;

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