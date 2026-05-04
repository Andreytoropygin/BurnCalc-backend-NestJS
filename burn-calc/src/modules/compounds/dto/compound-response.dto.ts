// src/modules/compounds/dto/compound-response.dto.ts

import { Exclude } from "class-transformer";

export class CompoundResponseDto {
  id: number;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  formula: string;
  description_eng: string;
  description_rus: string;
  specificH2oVolume: number;
  specificCo2Volume: number;
  class: string;
  @Exclude()
  isActive: boolean;
}