// src/modules/combustions/dto/combustion-response.dto.ts
export class CombustionListResponseDto {
  id: number;
  userName: string;
  moderatorName: string | null;
  status: string;
  createdAt: Date;
  formedAt: Date | null;
  completedAt: Date | null;
  h2oVolume: number | null;
  co2Volume: number | null;
  sampleDescription: string | null;
  resultsCount?: number; // количество ненулевых результатов
}

export class CombustionSingleResponseDto {
  id: number;
  userId: number;
  moderatorId: number;
  status: string;
  createdAt: Date;
  formedAt: Date | null;
  completedAt: Date | null;
  h2oVolume: number | null;
  co2Volume: number | null;
  sampleDescription: string | null;
  compounds?: CompoundInCombustionDto[];
}

export class CompoundInCombustionDto {
  id: number;
  title: string;
  imageUrl: string | null;
  specificH2oVolume: number
  specificCo2Volume: number;
  comment: string | null;
  amount: number | null;
}