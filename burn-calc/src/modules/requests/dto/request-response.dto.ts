// src/modules/requests/dto/request-response.dto.ts
export class RequestListResponseDto {
  id: number;
  userName: string;
  moderatorName: string | null;
  status: string;
  createdAt: Date;
  formedAt: Date | null;
  completedAt: Date | null;
  resultsCount?: number; // количество ненулевых результатов
}

export class RequestSingleResponseDto {
  id: number;
  h2oVolume: number | null;
  co2Volume: number | null;
  sampleDescription: string | null;
  combustions?: CombustionInRequestDto[];
}

export class CombustionInRequestDto {
  id: number;
  title: string;
  imageUrl: string | null;
  specificH2oVolume: number
  specificCo2Volume: number;
  comment: string | null;
}