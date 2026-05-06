import { ApiProperty } from "@nestjs/swagger";

export class CombustionDraftBriefDto {
    @ApiProperty()
    combustionId: number | null;
    @ApiProperty()
    compoundsCount: number;
}
