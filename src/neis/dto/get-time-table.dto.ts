import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class getTimeTableDto {
  @ApiProperty()
  @IsString()
  readonly sd_code: string;

  @ApiProperty()
  @IsString()
  readonly sc_code: string;

  @ApiProperty()
  @IsNumber()
  readonly grade: number;

  @ApiProperty()
  @IsNumber()
  readonly class: number;
}
