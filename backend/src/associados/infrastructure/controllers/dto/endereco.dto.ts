import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MinLength } from 'class-validator';

export class EnderecoDto {
  @ApiProperty({ example: '97000-000' })
  @IsString()
  @Length(8, 9)
  cep: string;

  @ApiProperty({ example: 'Rua dos Andradas' })
  @IsString()
  @MinLength(2)
  logradouro: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @MinLength(1)
  numero: string;

  @ApiPropertyOptional({ example: 'Apto 101' })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @MinLength(2)
  bairro: string;

  @ApiProperty({ example: 'Santa Maria' })
  @IsString()
  @MinLength(2)
  cidade: string;

  @ApiProperty({ example: 'RS' })
  @IsString()
  @Length(2, 2)
  uf: string;
}
