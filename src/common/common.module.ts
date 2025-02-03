import { Module } from '@nestjs/common'
import { CommonService } from './common.service'
import { CommonController } from './common.controller'
import { HttpApiModule } from './http/http-api.module'

@Module({
  imports: [HttpApiModule],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [HttpApiModule],
})
export class CommonModule {}
