import { Module } from '@nestjs/common';
import { NeisService } from './neis.service';
import { NeisController } from './neis.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  controllers: [NeisController],
  providers: [NeisService],
})
export class NeisModule {}
