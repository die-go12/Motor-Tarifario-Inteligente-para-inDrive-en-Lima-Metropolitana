import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ example: 'Miraflores' })
  @IsString()
  @Length(1, 255)
  origin: string;

  @ApiProperty({ example: 'San Isidro' })
  @IsString()
  @Length(1, 255)
  destination: string;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
