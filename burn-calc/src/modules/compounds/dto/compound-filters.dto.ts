// src/modules/compounds/dto/compound-filters.dto.ts
import { IsOptional, IsString} from 'class-validator';

export class CompoundFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  class?: string;
}