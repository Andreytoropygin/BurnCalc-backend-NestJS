// src/modules/compounds/dto/compound-response.dto.ts

export class CompoundResponseDto {
  id: number;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  formula: string;
  specificH2oVolume: number;
  specificCo2Volume: number;
  class: string;
}