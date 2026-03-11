// src/modules/combustions/dto/combustion-response.dto.ts

export class CombustionResponseDto {
  id: number;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  formula: string;
  specificH2oVolume: number;
  specificCo2Volume: number;
  class: string;
}