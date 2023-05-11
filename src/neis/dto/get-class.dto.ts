import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class getClassDto {
  @ApiProperty()
  @IsString()
  readonly sd_code: string;

  @ApiProperty()
  @IsString()
  readonly sc_code: string;
}
