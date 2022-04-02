import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppGateway, AppService],
})
export class AppModule {}
