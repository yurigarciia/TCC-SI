import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TransferirMesaDto {
  @ApiProperty({ example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f' })
  @IsUUID()
  novaMesaId: string;
}
