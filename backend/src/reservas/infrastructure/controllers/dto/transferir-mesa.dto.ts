import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TransferirMesaDto {
  @ApiProperty()
  @IsUUID()
  novaMesaId: string;
}
