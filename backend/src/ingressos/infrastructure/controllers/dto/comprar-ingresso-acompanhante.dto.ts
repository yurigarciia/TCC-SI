import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { PerfilComprador } from '../../../domain/ingresso.entity';

export class ComprarIngressoAcompanhanteDto {
  @ApiProperty({ example: 'Maria Teste' })
  @IsString()
  @MinLength(2)
  nomeComprador: string;

  @ApiProperty({
    enum: [PerfilComprador.NAO_SOCIO, PerfilComprador.CRIANCA],
    example: PerfilComprador.NAO_SOCIO,
  })
  @IsEnum([PerfilComprador.NAO_SOCIO, PerfilComprador.CRIANCA])
  perfilComprador: PerfilComprador.NAO_SOCIO | PerfilComprador.CRIANCA;
}
