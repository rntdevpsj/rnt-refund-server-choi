import { Injectable, Logger } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { REDIS_KEYS, REDIS_TTL } from '../const/redis.const'
import { AppException } from '../exception/app.exception'
import { ProcessData } from '../type/process.types'
import { ProcessStatus } from '../type/common.types'
import { UserAuthData } from 'src/tilco/resdata/auth-api-res.data'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name)
  public readonly redis: Redis

  constructor(private configService: ConfigService) {
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD')
    const redisUrl = `redis://default:${redisPassword}@redis-15469.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com:15469`

    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  }

  async generateUserId(): Promise<string> {
    try {
      let userId: string
      let exists = true

      while (exists) {
        userId = uuidv4()
        const result = await this.redis.exists(REDIS_KEYS.data.process(userId))
        exists = result === 1
      }

      return userId
    } catch (error) {
      throw AppException.redis('userId 생성 실패', 'request-validation', {
        originalError: error.message,
      })
    }
  }

  async setProcessData(userId: string, data: ProcessData): Promise<void> {
    try {
      await this.redis.set(
        REDIS_KEYS.data.process(userId),
        JSON.stringify(data),
        'EX',
        REDIS_TTL.process,
      )
    } catch (error) {
      throw AppException.redis('프로세스 데이터 저장 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async getProcessData(userId: string): Promise<ProcessData | null> {
    try {
      const data = await this.redis.get(REDIS_KEYS.data.process(userId))
      if (!data) {
        this.logger.debug(`No process data found for user ${userId}`)
        return null
      }

      try {
        return JSON.parse(data)
      } catch (parseError) {
        this.logger.error(`Invalid JSON data for user ${userId}:`, parseError)
        throw AppException.redis('잘못된 프로세스 데이터 형식', 'system', {
          originalError: parseError.message,
        })
      }
    } catch (error) {
      throw AppException.redis('프로세스 데이터 조회 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async updateProcessStatus(
    userId: string,
    status: ProcessStatus,
    errorInfo?: ProcessData['errorInfo'],
  ): Promise<ProcessData> {
    const key = REDIS_KEYS.data.process(userId)
    await this.redis.watch(key)

    try {
      const processData = await this.getProcessData(userId)
      if (!processData) {
        throw AppException.business(
          '프로세스 데이터를 찾을 수 없습니다',
          'system',
          'redis',
        )
      }

      if (this.isTerminalStatus(processData.status)) {
        await this.redis.unwatch()
        return processData
      }

      const updatedData: ProcessData = {
        ...processData,
        status,
        ...(errorInfo && { errorInfo }),
      }

      const result = await this.redis
        .multi()
        .set(key, JSON.stringify(updatedData), 'EX', REDIS_TTL.process)
        .exec()

      if (!result) {
        throw AppException.redis(
          '프로세스 상태 업데이트 실패 (경쟁 상태)',
          'system',
        )
      }

      return updatedData
    } catch (error) {
      if (error instanceof AppException) throw error
      throw AppException.redis('프로세스 상태 업데이트 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async setAuthData(userId: string, data: UserAuthData): Promise<void> {
    try {
      await this.redis.set(
        REDIS_KEYS.data.auth(userId),
        JSON.stringify(data),
        'EX',
        REDIS_TTL.auth,
      )
      this.logger.debug(`Auth data saved for user ${userId}`)
    } catch (error) {
      throw AppException.redis('인증 데이터 저장 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async getAuthData(userId: string): Promise<UserAuthData | null> {
    try {
      const data = await this.redis.get(REDIS_KEYS.data.auth(userId))
      if (!data) {
        return null
      }

      try {
        return JSON.parse(data)
      } catch (parseError) {
        throw AppException.redis('잘못된 인증 데이터 형식', 'system', {
          originalError: parseError.message,
        })
      }
    } catch (error) {
      throw AppException.redis('인증 데이터 조회 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async markAsNotified(userId: string): Promise<void> {
    try {
      const processData = await this.getProcessData(userId)
      if (!processData || processData.isNotified) return

      await this.setProcessData(userId, {
        ...processData,
        isNotified: true,
      })

      this.logger.debug(`Marked as notified for user ${userId}`)
    } catch (error) {
      this.logger.error(`Failed to mark as notified for user ${userId}:`, error)
    }
  }

  private isTerminalStatus(status: ProcessStatus): boolean {
    return ['completed', 'completed-no-refund', 'failed'].includes(status)
  }

  async cleanupProcessData(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.redis.del(REDIS_KEYS.data.process(userId)),
        this.redis.del(REDIS_KEYS.data.auth(userId)),
      ])

      this.logger.debug(`Cleaned up Redis data for user ${userId}`)
    } catch (error) {
      this.logger.warn(
        `Failed to cleanup Redis data for user ${userId}:`,
        error,
      )
    }
  }

  // 데이터 초기화를 위한 유틸리티 메서드
  async clearAllData(): Promise<void> {
    try {
      await this.redis.flushdb()
      this.logger.log('Successfully cleared all Redis data')
    } catch (error) {
      this.logger.error('Failed to clear Redis data:', error)
      throw AppException.redis('Redis 데이터 삭제 실패', 'system', {
        originalError: error.message,
      })
    }
  }
}
