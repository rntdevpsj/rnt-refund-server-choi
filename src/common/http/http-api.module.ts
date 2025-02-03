import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { HttpApiService } from './http-api.service'

@Module({
  imports: [
    HttpModule.register({
      timeout: 1800000,
      maxRedirects: 3,
    }),
    ConfigModule,
  ],
  providers: [HttpApiService],
  exports: [HttpApiService],
})
export class HttpApiModule {}
