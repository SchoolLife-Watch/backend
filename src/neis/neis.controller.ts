import { Controller, Get, Query } from '@nestjs/common';
import { NeisService } from './neis.service';
import { getTimeTableDto } from './dto/get-time-table.dto';
import { getClassDto } from './dto/get-class.dto';

@Controller('neis')
export class NeisController {
  constructor(private readonly neis: NeisService) {}

  @Get('/school')
  async getSchoolByName(@Query('name') name: string) {
    return await this.neis.getSchoolByName(name);
  }

  @Get('/class')
  async getClassByCode(@Query() query: getClassDto) {
    return await this.neis.getClassByCode(query);
  }

  @Get('/timetable')
  async getTimetable(@Query() query: getTimeTableDto) {
    return await this.neis.getTimetable(query);
  }

  @Get('/meal')
  async getMeal(@Query() query: getClassDto) {
    return await this.neis.getMeal(query);
  }
}
