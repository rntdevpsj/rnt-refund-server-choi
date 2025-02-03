import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { AppException } from 'src/common/exception/app.exception'
import { RedisService } from 'src/common/service/redis.service'
import { ProcessStep } from 'src/common/type/common.types'
import { PartnerNotificationData } from 'src/tilco/type/response.types'

@Injectable()
export class NotificationService {
private readonly logger = new Logger(NotificationService.name)

constructor(private readonly redisService: RedisService) {}

async notifyPartner(
userId: string,
data: PartnerNotificationData,
): Promise<void> {
try {
// 프로세스 데이터 조회
const processData = await this.redisService.getProcessData(userId)
if (!processData || processData.isNotified) {
this.logger.debug(
`Notification skipped for user ${userId}: ` +
`${!processData ? 'No process data' : 'Already notified'}`,
)
return
}

      // 파트너사 통보
      // await axios.post(processData.redirectUrl, data, {
      //   timeout: 5000,
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // })

      // 통보 완료 표시
      await this.redisService.markAsNotified(userId)

      // Redis 데이터 정리
      await this.redisService.cleanupProcessData(userId)

      this.logger.debug(`Partner notification sent for user ${userId}:`, {
        redirectUrl: processData.redirectUrl,
        data,
      })
    } catch (error) {
      this.logger.error(`Failed to notify partner for user ${userId}:`, error)
      // 파트너사 통보 실패는 throw하지 않음
    }

}

async sendErrorNotification(
userId: string,
error: any,
step: string,
): Promise<void> {
const errorData: PartnerNotificationData = {
success: false,
error: {
code: error instanceof AppException ? error.errorType : 'system-error',
message: error.message,
step: step as ProcessStep,
},
}

    await this.notifyPartner(userId, errorData)

}

async sendNoRefundNotification(
userId: string,
message: string,
details?: any,
): Promise<void> {
const notificationData: PartnerNotificationData = {
success: true,
data: {
refundAmount: 0,
message,
details,
},
}

    await this.notifyPartner(userId, notificationData)

}

async sendRefundNotification(
userId: string,
amount: number,
details: any,
): Promise<void> {
const notificationData: PartnerNotificationData = {
success: true,
data: {
refundAmount: amount,
message: '환급금 계산이 완료되었습니다.',
details,
},
}

    await this.notifyPartner(userId, notificationData)

}
}
