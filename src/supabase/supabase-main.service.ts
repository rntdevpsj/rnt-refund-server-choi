import { AppException } from './../common/exception/app.exception'
import {
  ENV_SUPABASE_MAIN_URL,
  ENV_SUPABASE_MAIN_ROLE_KEY,
} from './../common/const/env-keys.const'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseMainService {
  private supabase: SupabaseClient

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>(ENV_SUPABASE_MAIN_URL),
      this.configService.get<string>(ENV_SUPABASE_MAIN_ROLE_KEY),
    )
  }

  // Auth 관련 메소드
  async verifyToken(token: string) {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token)
      return { user, error }
    } catch (error) {
      throw AppException.database('veriy token에러', 'system', {
        originalError: error.message,
      })
    }
  }
}
