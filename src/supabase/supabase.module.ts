import { Module } from '@nestjs/common'
import { SupabaseMainService } from './supabase-main.service'
import { SupabaseController } from './supabase.controller'
import { SupabaseRefundService } from './supabase-refund.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  controllers: [SupabaseController],
  providers: [SupabaseMainService, SupabaseRefundService],
  exports: [SupabaseMainService, SupabaseRefundService],
})
export class SupabaseModule {}
