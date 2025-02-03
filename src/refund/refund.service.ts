import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { RedisService } from 'src/common/service/redis.service'
import { AppException } from 'src/common/exception/app.exception'
import { SimpleAuthRequestDto } from './dto/cashnote-request.dto'
import { NO_RETRY_OPTIONS } from 'src/common/const/queue.const'
import { RefundUserService } from './database/service/refund-user.service'
import {
  AuthType,
  ProgressStatus,
  RefundStatus,
} from 'src/common/type/refund-enum.types'
import { RefundUserModel } from './database/entity/refund-user.entity'

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name)

  constructor(
    @InjectQueue('auth-queue') private authQueue: Queue,
    @InjectQueue('notification-queue') private notificationQueue: Queue,
    private readonly redisService: RedisService,
    private readonly refundUserService: RefundUserService,
  ) {}

  async initiateSimpleAuthProcess(
    userId: string,
    requestDto: SimpleAuthRequestDto,
  ) {
    try {
      // DB에 요청 기록 생성
      const createData: Partial<RefundUserModel> = {
        userId,
        appRoute: 'cashnote',
        cashnoteUid: requestDto.cashnoteUid,
        authType: AuthType.SIMPLEAUTH,
        userName: requestDto.userName,
        birthDate: requestDto.birthDate,
        userMobileNo: requestDto.userCellphoneNumber,
        userSocialNo: requestDto.identityNumber,
        companyType: requestDto.companyType,
        progressStatus: ProgressStatus.PENDIG,
        refundStatus: RefundStatus.APPLY,
      }
      const request =
        await this.refundUserService.createRefundRequest(createData)

      // Redis에 프로세스 데이터 저장
      await this.redisService.setProcessData(userId, {
        userId,
        cashnoteUid: requestDto.cashnoteUid,
        redirectUrl: requestDto.redirectUrl,
        authType: 'simple-auth',
        status: 'processing',
        isNotified: false,
      })

      // Queue에 인증 요청 작업 추가
      await this.authQueue.add(
        'simple-auth-request',
        {
          userId,
          requestId: request.id,
          requestDto,
        },
        NO_RETRY_OPTIONS,
      )
    } catch (error) {
      throw AppException.from(
        error,
        '환급금간편인증 초기화 실패',
        'system', // 현재 프로세스 step
        'system', // 현재 작업 operation
      )
      // // 초기화 과정에서 발생한 하위위에러는 전역필터로 전달
      // if (error instanceof AppException) {
      //   throw error
      // }

      // // 현 작업내에서 발생한 신규에러는 AppException으로 throw
      // throw AppException.system(
      //   '간편인증작업업 초기화 실패',
      //   'simple-auth-request',
      //   { originalError: error.message },
      // )
    }
  }

  async isExistCashnoteRefundAmount(cashnoteUid: string) {
    try {
      const existingAmount =
        await this.refundUserService.getExistRefundAmount(cashnoteUid)

      if (existingAmount !== null) {
        await this.notificationQueue.add('partner-notification', {
          cashnoteUid,
          data: {
            status: 'COMPLETED',
            data: {
              refundAmount: existingAmount,
              message: '예상환급금산출 완료고객.',
            },
          },
        })
        return true
      }
      return false
    } catch (error) {
      this.logger.error('refund process error:', error)
      throw AppException.from(
        error,
        '환급금산출내역 확인 실패',
        'system',
        'system',
      )
    }
  }
}
