import { AppException } from './../common/exception/app.exception'
import {
  ENV_SUPABASE_REFUND_URL,
  ENV_SUPABASE_REFUND_ROLE_KEY,
} from './../common/const/env-keys.const'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseRefundService {
  private supabase: SupabaseClient

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>(ENV_SUPABASE_REFUND_URL),
      this.configService.get<string>(ENV_SUPABASE_REFUND_ROLE_KEY),
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
      return { user: null, error }
    }
  }

  // Storage 관련 메소드
  // async uploadPdfToStorage(
  //   base64Data: string,
  //   userId: string,
  //   filePath: string,
  // ): Promise<{ publicUrl: string; storagePath: string }> {
  //   try {
  //     if (!base64Data || typeof base64Data !== 'string') {
  //       throw new Error('유효하지 않은 PDF base64 데이터입니다.')
  //     }
  //     // base64 데이터를 Buffer로 변환
  //     const pdfBuffer = Buffer.from(base64Data, 'base64')
  //     console.log('pdf storage upload')
  //     // Storage에 업로드
  //     const { error } = await this.supabase.storage
  //       .from('business-closure') // 버킷 이름
  //       .upload(filePath, pdfBuffer, {
  //         contentType: 'application/pdf',
  //         upsert: false,
  //       })

  //     if (error) {
  //       throw AppException.database('스토리지 파일저장 실패', 'system', {
  //         originalError: error.message,
  //       })
  //     }

  //     // 업로드된 파일의 공개 URL 생성
  //     const {
  //       data: { publicUrl },
  //     } = this.supabase.storage.from('business-closure').getPublicUrl(filePath)

  //     return {
  //       publicUrl,
  //       storagePath: filePath,
  //     }
  //   } catch (error) {
  //     console.error('Supabase storage 업로드 실패:', error)
  //     throw AppException.database('스토리지 파일저장 실패', 'system', {
  //       originalError: error.message,
  //     })
  //   }
  // }

  // async deletePdf(storagePath: string): Promise<void> {
  //   try {
  //     const { error } = await this.supabase.storage
  //       .from('documents')
  //       .remove([storagePath])

  //     if (error) {
  //       throw AppException.database('스토리지 파일삭제 실패', 'system', {
  //         originalError: error.message,
  //       })
  //     }
  //   } catch (e) {
  //     throw AppException.database('스토리지 파일삭제 실패', 'system', {
  //       originalError: e.message,
  //     })
  //   }
  // }
  async uploadPdfToStorage(
    base64Data: string,
    userId: string,
    filePath: string,
  ): Promise<{ publicUrl: string; storagePath: string }> {
    try {
      if (!base64Data || typeof base64Data !== 'string') {
        throw new Error('유효하지 않은 PDF base64 데이터입니다.')
      }

      // 파일 존재 여부만 확인 (실제 URL은 생성하지 않음)
      const { data, error: checkError } = await this.supabase.storage
        .from('refund')
        .createSignedUrl(filePath, 1) // 1초짜리 signed URL 생성 시도

      // 파일이 이미 존재하면 publicUrl 반환
      if (!checkError) {
        const {
          data: { publicUrl },
        } = this.supabase.storage.from('refund').getPublicUrl(filePath)

        return {
          publicUrl,
          storagePath: filePath,
        }
      }

      const pdfBuffer = Buffer.from(base64Data, 'base64')

      const { error } = await this.supabase.storage
        .from('refund')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (error) {
        throw AppException.database('스토리지 파일저장 실패', 'system', {
          originalError: error.message,
        })
      }

      const {
        data: { publicUrl },
      } = this.supabase.storage.from('refund').getPublicUrl(filePath)

      return {
        publicUrl,
        storagePath: filePath,
      }
    } catch (error) {
      throw AppException.database('스토리지 파일저장 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async uploadExcelToStorage(
    base64Data: string,
    userId: string,
    filePath: string,
  ): Promise<{ publicUrl: string; storagePath: string }> {
    try {
      if (!base64Data || typeof base64Data !== 'string') {
        throw AppException.database(
          '유효하지 않은 Excel base64 데이터입니다',
          'system',
        )
      }

      // 파일 존재 여부 확인
      const { data, error: checkError } = await this.supabase.storage
        .from('refund')
        .createSignedUrl(filePath, 1) // 1초짜리 signed URL 생성 시도

      // 파일이 이미 존재하면 publicUrl 반환
      if (!checkError) {
        const {
          data: { publicUrl },
        } = this.supabase.storage.from('refund').getPublicUrl(filePath)

        return {
          publicUrl,
          storagePath: filePath,
        }
      }

      const excelBuffer = Buffer.from(base64Data, 'base64')

      console.log('파일변환완료')

      const { error } = await this.supabase.storage
        .from('refund')
        .upload(filePath, excelBuffer, {
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          upsert: false,
        })

      if (error) {
        throw AppException.database('스토리지 파일저장 실패', 'system', {
          originalError: error.message,
        })
      }

      const {
        data: { publicUrl },
      } = this.supabase.storage.from('refund').getPublicUrl(filePath)

      return {
        publicUrl,
        storagePath: filePath,
      }
    } catch (error) {
      console.error('Supabase storage 업로드 실패:', error)
      throw AppException.database('스토리지 파일저장 실패', 'system', {
        originalError: error.message,
      })
    }
  }
}
