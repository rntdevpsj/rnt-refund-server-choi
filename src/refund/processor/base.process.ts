import { InjectQueue } from '@nestjs/bull'
import { Inject, Logger } from '@nestjs/common'
import { Job, Queue } from 'bull'
import { AppException } from 'src/common/exception/app.exception'
import { RedisService } from 'src/common/service/redis.service'
import { ProcessStep } from 'src/common/type/common.types'
import { RefundUserService } from '../database/service/refund-user.service'
import {
  ProgressDetail,
  ProgressStatus,
  RefundStatus,
} from 'src/common/type/refund-enum.types'
import { RefundUserModel } from '../database/entity/refund-user.entity'

export abstract class BaseProcessor {
  protected readonly logger = new Logger(this.constructor.name)

  constructor(
    @Inject(RedisService) protected readonly redisService: RedisService,
    @Inject(RefundUserService)
    protected readonly refundUserService: RefundUserService,
    @InjectQueue('notification-queue') protected notificationQueue: Queue,
  ) {}

  protected async handleProcessError(job: Job, error: Error) {
    const { userId } = job.data

    try {
      // Redis 프로세스 상태 업데이트
      await this.redisService.updateProcessStatus(userId, 'failed', {
        type: error instanceof AppException ? error.errorType : 'system-error',
        processStep: job.name as ProcessStep,
        operation: error instanceof AppException ? error.operation : 'system',
        message: error.message,
      })

      // DB 상태 업데이트 - auth에러인지 일반에러인지 확인
      const errorType =
        error instanceof AppException && error.isAuthError()
          ? 'AUTH_FAILED'
          : 'SYSTEM_FAILED'
      const updateData: Partial<RefundUserModel> = {
        userId,
        progressStatus: ProgressStatus.FAILED,
        progressDetail:
          errorType === 'AUTH_FAILED'
            ? ProgressDetail.AUTHFAILED
            : ProgressDetail.SYSTEMFAILED,
        refundStatus: RefundStatus.APPLY,
      }
      await this.refundUserService.updateRefundRequest(updateData)

      this.logger.log({
        message: '핸들에러프로세스 에러데이터',

        response: JSON.stringify(error, null, 2),
      })
      // 파트너사 알림 큐에 추가 (NotificationProcessor에서 중복 전송 방지)
      await this.notificationQueue.add('partner-notification', {
        userId,
        data: {
          status: 'FAILED',
          error: {
            type:
              error instanceof AppException ? error.errorType : 'system-error',
            message: error.message,
            processStep: job.name,
            operation:
              error instanceof AppException ? error.operation : 'system',
          },
        },
      })
    } catch (handleError) {
      // 에러처리 실패시 다시 에러발생 시키면 중복에러 발생
      this.logger.error(`에러처리 실패 user: ${userId}:`, handleError)
    }
  }
}
