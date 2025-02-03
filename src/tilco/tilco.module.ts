import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TilcoService } from './tilco.service'
import { HttpApiModule } from 'src/common/http/http-api.module'
import { SupabaseModule } from 'src/supabase/supabase.module'

@Module({
  imports: [HttpModule, HttpApiModule, SupabaseModule],
  providers: [TilcoService],
  exports: [TilcoService],
})
export class TilcoModule {}
