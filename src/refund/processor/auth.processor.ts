import { RefundUserService } from './../database/service/refund-user.service'
import { InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Inject, Injectable } from '@nestjs/common'
import { Job, Queue } from 'bull'
import { RedisService } from 'src/common/service/redis.service'
import { TilcoService } from 'src/tilco/tilco.service'
import { AppException } from 'src/common/exception/app.exception'
import { NO_RETRY_OPTIONS } from 'src/common/const/queue.const'
import { SimpleAuthData } from 'src/tilco/resdata/auth-api-res.data'
import { BaseProcessor } from './base.process'
import { ProgressStatus, RefundStatus } from 'src/common/type/refund-enum.types'
import { RefundUserModel } from '../database/entity/refund-user.entity'

@Injectable()
@Processor('auth-queue')
export class AuthProcessor extends BaseProcessor {
  constructor(
    @Inject(TilcoService) private readonly tilcoService: TilcoService,
    @Inject(RedisService) redisService: RedisService,
    @Inject(RefundUserService) RefundUserService: RefundUserService,
    @InjectQueue('notification-queue') notificationQueue: Queue,
    @InjectQueue('refund-queue') private refundQueue: Queue,
    @InjectQueue('auth-queue') private authQueue: Queue,
  ) {
    super(redisService, RefundUserService, notificationQueue)
  }

  @Process('simple-auth-request')
  async handleSimpleAuthRequest(job: Job<any>) {
    const { userId, requestId, requestDto } = job.data
    let hometaxAuth: SimpleAuthData
    let employAuth: SimpleAuthData

    try {
      // 작업시작 상태 업데이트
      await this.redisService.updateProcessStatus(userId, 'processing')
      const updateData: Partial<RefundUserModel> = {
        userId,
        progressStatus: ProgressStatus.PROCESSING,
        refundStatus: RefundStatus.APPLY,
      }
      await this.refundUserService.updateRefundRequest(updateData)

      // 인증 요청
      ;[hometaxAuth, employAuth] = await Promise.all([
        this.tilcoService.simpleHometaxAuthRequest(requestDto),
        this.tilcoService.simpleEmployAuthRequest(requestDto),
      ])

      // 인증요청 return값 검증
      if (!hometaxAuth || !employAuth) {
        throw AppException.externalApi(
          '간편인증 요청 실패',
          'simple-auth-request',
          'external-api',
        )
      }

      // Redis에 인증 데이터 저장
      await this.redisService.setAuthData(userId, {
        authType: 'simple-auth',
        hometaxAuth: {
          ...hometaxAuth,
          BirthDate: requestDto.birthDate,
          IdentityNumber: requestDto.identityNumber,
        },
        employAuth: {
          ...employAuth,
          BirthDate: requestDto.birthDate,
          IdentityNumber: requestDto.identityNumber,
        },
      })

      // 사용자인증확인 체크크작업 추가
      await this.authQueue.add(
        'auth-verification',
        {
          userId,
          requestId,
        },
        NO_RETRY_OPTIONS,
      )
    } catch (error) {
      throw AppException.from(
        error,
        '간편인증 실패',
        'simple-auth-request',
        'auth',
      )
    }
  }

  @Process('auth-verification')
  async handleAuthVerification(job: Job<any>) {
    const { userId, requestId } = job.data
    const INITIAL_DELAY = 30000
    const RETRY_DELAY = 15000
    const MAX_ATTEMPTS = 5

    try {
      console.log('auth-verify-start')
      const authData = await this.redisService.getAuthData(userId)
      if (!authData) {
        throw AppException.business(
          'redis에 인증데이터가 없습니다',
          'auth-verification',
          'redis',
        )
      }

      // 사용자 확인 최초 대기
      await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY))

      // 사용자 확인 체크 루프
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const [hometaxVerified, employVerified] = await Promise.all([
            this.tilcoService.checkHometaxLogin(
              authData.hometaxAuth as SimpleAuthData,
            ),
            this.tilcoService.checkEmployLogin(
              authData.employAuth as SimpleAuthData,
            ),
          ])

          // 사용자 간편인증 확인 성공공
          if (hometaxVerified?.Result && employVerified?.Result) {
            await Promise.all([
              this.redisService.updateProcessStatus(userId, 'auth-completed'),
              // this.databaseService.updateRequestStatus(requestId, 'COMPLETED'),
            ])

            // 환급금 계산 작업 추가
            await this.refundQueue.add(
              'refund-calculation',
              {
                userId,
                requestId,
              },
              NO_RETRY_OPTIONS,
            )

            return
          }

          // 간편인증 사용자확인 체크 재시도도
          if (attempt < MAX_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          }
        } catch (error) {
          if (
            attempt < MAX_ATTEMPTS &&
            error instanceof AppException &&
            error.errorType === 'external-api-error'
          ) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            continue
          }
          throw error
        }
      }

      throw AppException.business(
        '간편인증 사용자확인 체크시간이 초과되었습니다',
        'auth-verification',
        'login-verify',
      )
    } catch (error) {
      throw AppException.from(
        error,
        '간편인증 사옹자자확인 실패',
        'auth-verification',
        'auth',
      )
    }
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    await this.handleProcessError(job, error)
  }
}
