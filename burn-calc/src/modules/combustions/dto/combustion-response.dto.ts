// src/modules/combustions/dto/combustion-response.dto.ts

export class CombustionListResponseDto {
  id: number;
  technicianName: string;
  expertName: string | null;
  status: string;
  createdAt: Date;
  formedAt: Date | null;
  completedAt: Date | null;
  h2oVolume: number | null;
  co2Volume: number | null;
  sampleDescription: string | null;
  resultsCount: number; // количество ненулевых результатов
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

export class CombustionSingleResponseDto {
  id: number;
  technicianId: number;
  expertId: number | null;
  status: string;
  createdAt: Date;
  formedAt: Date | null;
  completedAt: Date | null;
  h2oVolume: number | null;
  co2Volume: number | null;
  sampleDescription: string | null;
  compounds: CompoundInCombustionDto[];
}
