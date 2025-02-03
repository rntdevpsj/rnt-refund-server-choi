// processor내에서의 에러는 failed이벤트리스너가 처리하고
// processor 이외의곳에서 throw된 에러는 에러체인으로 상위로 올라가서 최종적으로 전역에러필터에서 처리된다다
import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common'
import { RedisService } from '../service/redis.service'
import { AppException } from '../exception/app.exception'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'
import { RefundUserService } from 'src/refund/database/service/refund-user.service'
import {
  ProgressDetail,
  ProgressStatus,
  RefundStatus,
} from '../type/refund-enum.types'
import { RefundUserModel } from 'src/refund/database/entity/refund-user.entity'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  constructor(
    private readonly refundUserService: RefundUserService,
    @InjectQueue('notification-queue') private notificationQueue: Queue,
    private readonly redisService: RedisService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest()
    const userId = request.userId

    if (!userId) {
      this.logger.error('reqeust객체에서 UserId를 찾을수 없습니다:', exception)
      return
    }

    try {
      // Redis에서 프로세스 데이터 조회
      const processData = await this.redisService.getProcessData(userId)
      if (!processData) {
        this.logger.error(`레디스에 Process data가 없습니다 ${userId}`)
        return
      }

      // DB에서 userId 조회 및 상태 업데이트
      const isExist = await this.refundUserService.exists(userId)
      if (!isExist) {
        this.logger.error(`데이터베이스에 신청자의 데이터가 없습니다 ${userId}`)
        return
      }
      const errorType = this.determineErrorType(exception)

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

      // 아직 통보되지 않은 경우에만 파트너사 통보
      if (!processData.isNotified) {
        await this.notificationQueue.add('partner-notification', {
          userId,
          data: {
            status: 'FAILED',
            error: this.formatError(exception),
          },
        })
      }
    } catch (error) {
      this.logger.error(
        `Critical: Error handling failed for user ${userId}:`,
        error,
      )
    }
  }

  private determineErrorType(
    exception: unknown,
  ): 'AUTH_FAILED' | 'SYSTEM_FAILED' {
    if (exception instanceof AppException) {
      return exception.isAuthError() ? 'AUTH_FAILED' : 'SYSTEM_FAILED'
    }
    return 'SYSTEM_FAILED'
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof AppException) {
      return exception.message
    }
    if (exception instanceof Error) {
      return exception.message
    }
    return '알 수 없는 오류가 발생했습니다'
  }

  private getErrorDetails(exception: unknown): any {
    if (exception instanceof AppException) {
      return {
        type: exception.errorType,
        processStep: exception.processStep,
        operation: exception.operation,
        details: exception.details,
      }
    }
    return {
      originalError:
        exception instanceof Error ? exception.message : String(exception),
    }
  }

  private formatError(exception: unknown): any {
    if (exception instanceof AppException) {
      return {
        type: exception.errorType,
        message: exception.message,
        processStep: exception.processStep,
        operation: exception.operation,
        details: exception.details,
      }
    }

    return {
      type: 'system-error',
      message: '서버 내부 오류가 발생했습니다',
      processStep: 'system',
      operation: 'system',
      details: {
        originalError:
          exception instanceof Error ? exception.message : String(exception),
      },
    }
  }

  // private async getRequestId(userId: string): Promise<string | null> {
  //   try {
  //     // 가장 최근의 request 조회
  //     const authRequest =
  //       await this.databaseService.getAuthRequestByUserId(userId)
  //     if (authRequest) {
  //       return authRequest.id
  //     }

  //     const refundRequest =
  //       await this.databaseService.getRefundRequestByUserId(userId)
  //     return refundRequest?.id || null
  //   } catch (error) {
  //     this.logger.error(`Failed to get request ID for user ${userId}:`, error)
  //     return null
  //   }
  // }
}
