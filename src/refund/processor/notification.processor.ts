import { HttpService } from '@nestjs/axios'
import { OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bull'
import { REDIS_KEYS, REDIS_TTL } from 'src/common/const/redis.const'
import { RedisService } from 'src/common/service/redis.service'
import { PartnerNotificationData } from 'src/common/type/notification.types'

@Injectable()
@Processor('notification-queue')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name)

  constructor(
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
  ) {}

  @Process('partner-notification')
  async processNotification(
    job: Job<{
      userId: string
      data: PartnerNotificationData
    }>,
  ) {
    const { userId, data } = job.data

    try {
      // Redis에서 프로세스 데이터 조회
      const processData = await this.redisService.getProcessData(userId)
      if (!processData) {
        throw new Error('Process 데이터가 없습니다')
      }

      // 이미 통보했으면 무시
      if (processData.isNotified) {
        this.logger.debug(`이미 파트너사에 통보했습니다 user ${userId}`)
        return
      }

      // Redis Transaction으로 isNotified 업데이트 및 파트너사 통보
      const key = REDIS_KEYS.data.process(userId)
      await this.redisService.redis.watch(key)

      try {
        const multi = this.redisService.redis.multi()

        // 파트너사 통보
        // await this.httpService
        //   .post(processData.redirectUrl, data, {
        //     timeout: 5000,
        //     headers: { 'Content-Type': 'application/json' },
        //   })
        //   .toPromise()
        this.logger.debug(
          `캐시노트 통보작업 user ${userId}`,
          `전송데이터=>' ${JSON.stringify(data, null, 2)}`,
        )

        // 통보 성공 시 isNotified 업데이트
        multi.set(
          key,
          JSON.stringify({ ...processData, isNotified: true }),
          'EX',
          REDIS_TTL.process,
        )

        await multi.exec()
      } catch (error) {
        await this.redisService.redis.unwatch()
        throw error
      }

      // 프로세스 데이터 정리
      await this.redisService.cleanupProcessData(userId)
    } catch (error) {
      this.logger.error(`파트너사 전송 실패 user ${userId}:`, error)
      throw error
    }
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    const { userId } = job.data

    try {
      // 실패해도 재시도 하지 않도록 isNotified 표시
      await this.redisService.markAsNotified(userId)
    } catch (markError) {
      this.logger.error(`파트너사 통보마크 실패 user ${userId}:`, markError)
    }
  }
}
