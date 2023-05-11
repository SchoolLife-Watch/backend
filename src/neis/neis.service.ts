import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { getTimeTableDto } from './dto/get-time-table.dto';
import { DateTime } from 'luxon';
import { getClassDto } from './dto/get-class.dto';

@Injectable()
export class NeisService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly config: ConfigService,
  ) {}

  async getSchoolByName(name: string) {
    const scinfo_api_uri = 'https://open.neis.go.kr/hub/schoolInfo';
    const scinfo = await axios.get(
      `${scinfo_api_uri}?KEY=${this.config.get(
        'NEIS_KEY',
      )}&Type=json&SCHUL_NM=${name}`,
    );

    if (!scinfo.data.schoolInfo[1])
      throw new HttpException('학교를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);

    const res = scinfo.data.schoolInfo[1].row.map((school: any) => {
      return {
        name: school.SCHUL_NM,
        sd_code: school.SD_SCHUL_CODE,
        sc_code: school.ATPT_OFCDC_SC_CODE,
      };
    });

    return res;
  }

  async getClassByCode({ sd_code, sc_code }: getClassDto) {
    const csinfo_apiUri = 'https://open.neis.go.kr/hub/classInfo';
    const csinfo = await axios.get(
      `${csinfo_apiUri}?KEY=${this.config.get(
        'NEIS_KEY',
      )}&Type=json&ATPT_OFCDC_SC_CODE=${sc_code}&SD_SCHUL_CODE=${sd_code}&AY=${new Date().getFullYear()}`,
    );

    const total = csinfo.data.classInfo[1].row.map((classInfo: any) => {
      return {
        grade: classInfo.GRADE,
        class: classInfo.CLASS_NM,
      };
    });

    const res = [];

    for (let i = 1; i <= parseInt(total.slice(-1)[0].grade); i++) {
      res.push(
        total.filter(
          (options: { grade: string; class: string }) =>
            parseInt(options.grade) === i,
        ).length,
      );
    }

    return res;
  }

  async getTimetable({
    sd_code,
    sc_code,
    grade,
    class: classroom,
  }: getTimeTableDto) {
    const cache = await this.cache.get(
      `${sd_code}-${sc_code}-${grade}-${classroom}/${DateTime.now()
        .setZone('Asia/Seoul')
        .toFormat('yyyyMMdd')}`,
    );
    if (cache) return cache;

    const timetable_api_uri = 'https://open.neis.go.kr/hub/hisTimetable';
    const timetable = await axios.get(
      `${timetable_api_uri}?KEY=${this.config.get(
        'NEIS_KEY',
      )}&Type=json&ATPT_OFCDC_SC_CODE=${sc_code}&SD_SCHUL_CODE=${sd_code}&GRADE=${grade}&CLASS_NM=${classroom}&ALL_TI_YMD=${DateTime.now()
        .setZone('Asia/Seoul')
        .toFormat('yyyyMMdd')}`,
    );

    if (!timetable.data.hisTimetable[1])
      throw new HttpException(
        '시간표를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );

    const res = timetable.data.hisTimetable[1].row.map(
      (timetable: any) => timetable.ITRT_CNTNT,
    );

    this.cache.set(
      `${sd_code}-${sc_code}-${grade}-${classroom}/${DateTime.now()
        .setZone('Asia/Seoul')
        .toFormat('yyyyMMdd')}`,
      res,
      60 * 60 * 24,
    );

    return res;
  }

  async getMeal({ sd_code, sc_code }: getClassDto) {
    const cache = await this.cache.get(
      `${sd_code}-${sc_code}/${DateTime.now()
        .setZone('Asia/Seoul')
        .toFormat('yyyyMMdd')}`,
    );
    if (cache) return cache;

    const meal_api_uri = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
    const meal = await axios.get(
      `${meal_api_uri}?KEY=${this.config.get(
        'NEIS_KEY',
      )}&Type=json&ATPT_OFCDC_SC_CODE=${sc_code}&SD_SCHUL_CODE=${sd_code}&MLSV_YMD=${DateTime.now()
        .setZone('Asia/Seoul')
        .toFormat('yyyyMMdd')}`,
    );

    if (!meal.data.mealServiceDietInfo[1])
      throw new HttpException('급식이 없습니다.', HttpStatus.NOT_FOUND);

    const res = meal.data.mealServiceDietInfo[1].row[0].DDISH_NM.split(
      '<br/>',
    ).map((meal: string) =>
      meal
        .replace(/[0-9]/g, '')
        .replace(/([(.)])/g, '')
        .trim(),
    );

    this.cache.set(
      `${sd_code}-${sc_code}/${DateTime.now()
        .setZone('Asia/Seoul')
        .toFormat('yyyyMMdd')}`,
      res,
      60 * 60 * 24,
    );

    return res;
  }
}
