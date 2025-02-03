import { RefundUserService } from './../database/service/refund-user.service'
import { InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Inject, Injectable } from '@nestjs/common'
import { RedisService } from 'src/common/service/redis.service'
import { Job, Queue } from 'bull'
import { AppException } from 'src/common/exception/app.exception'
import { RefundHometaxService } from '../service/refund-hometax.service'
import { SimpleAuthData } from 'src/tilco/resdata/auth-api-res.data'
import { RefundEmployService } from '../service/refund-employ.service'
import { RefundCalculateService } from '../service/refund-calculate.service'
import { BaseProcessor } from './base.process'
import {
  ProgressDetail,
  ProgressStatus,
  RefundStatus,
} from 'src/common/type/refund-enum.types'
import { RefundUserModel } from '../database/entity/refund-user.entity'

@Injectable()
@Processor('refund-queue')
export class RefundProcessor extends BaseProcessor {
  constructor(
    @Inject(RedisService) redisService: RedisService,
    @Inject(RefundUserService) refundUserService: RefundUserService,
    @InjectQueue('notification-queue') notificationQueue: Queue,

    private readonly refundHometaxService: RefundHometaxService,
    private readonly refundEmployService: RefundEmployService,
    private readonly refundCalculateService: RefundCalculateService,
  ) {
    super(redisService, refundUserService, notificationQueue)
    // console.log(
    //   'Service methods:',
    //   Object.getOwnPropertyNames(
    //     Object.getPrototypeOf(this.refundHometaxService),
    //   ),
    // )
  }

  @Process('refund-calculation')
  async handleRefundCalculation(job: Job<any>) {
    const { userId, requestId } = job.data

    // console.log('refundHometaxService type:', typeof this.refundHometaxService)
    // console.log(
    //   'refundHometaxService methods:',
    //   Object.getOwnPropertyNames(this.refundHometaxService),
    // )

    try {
      const authData = await this.redisService.getAuthData(userId)
      if (!authData) {
        throw AppException.business(
          '간편인증 데이터를 찾을 수 없습니다',
          'refund-calculation',
          'system',
        )
      }

      console.log('홈택스 데이터수집시작')
      // 홈택스 데이터 처리
      const hometaxResult = await this.refundHometaxService.processHometaxData(
        authData.hometaxAuth as SimpleAuthData,
        userId,
        requestId,
      )
      console.log(hometaxResult)

      console.log('고용산재 데이터수집시작')
      // 고용산재 데이터 처리
      const employResult = await this.refundEmployService.processEmployData(
        authData.employAuth as SimpleAuthData,
        userId,
        requestId,
      )
      console.log(employResult)

      // 환급대상이 아닌 경우
      if (!hometaxResult.success || !employResult.success) {
        await this.handleNotEligible(userId, requestId)
        return
      }

      // 환급금 계산
      const calculationResult =
        await this.refundCalculateService.calculateRefund(userId, requestId)

      const updateData: Partial<RefundUserModel> = {
        userId,
        progressStatus: ProgressStatus.COMPLETED,
        progressDetail: ProgressDetail.REFUNDABLE,
        refundStatus: RefundStatus.APPLY,
        // estimatedRefundAmt: calculationResult.amount,
        estimatedRefundAmt: calculationResult,
      }
      // 결과 처리 및 DB 업데이트
      await Promise.all([
        this.redisService.updateProcessStatus(userId, 'completed'),
        this.refundUserService.updateRefundRequest(updateData),
      ])

      // 결과 알림
      await this.notificationQueue.add('partner-notification', {
        userId,
        data: {
          // status: calculationResult.amount > 0 ? 'SUCCESS' : 'NOT_ELIGIBLE',
          status: calculationResult > 0 ? 'SUCCESS' : 'NOT_ELIGIBLE',
          data: {
            // refundAmount : calculationResult.amount
            refundAmount: calculationResult,
            message:
              // calculationResult.amount > 0
              calculationResult > 0
                ? '환급금 계산이 완료되었습니다.'
                : '환급금이 없습니다.',
            // details: calculationResult.details,
          },
        },
      })
    } catch (error) {
      this.logger.error('refund process error:', error)
      throw AppException.from(
        error,
        '환급금 계산 실패',
        'refund-calculation',
        'process-completion',
      )
    }
  }

  private async handleNotEligible(userId: string, requestId: string) {
    const updateData: Partial<RefundUserModel> = {
      userId,
      progressStatus: ProgressStatus.COMPLETED,
      progressDetail: ProgressDetail.NOREFUNDABLE,
      refundStatus: RefundStatus.APPLY,
      estimatedRefundAmt: 0,
    }
    await Promise.all([
      this.redisService.updateProcessStatus(userId, 'completed'),
      await this.refundUserService.updateRefundRequest(updateData),
    ])

    await this.notificationQueue.add('partner-notification', {
      userId,
      data: {
        status: 'NOT_ELIGIBLE',
        data: {
          refundAmount: 0,
          message: '환급금 대상자가 아닙니다.',
        },
      },
    })
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    await this.handleProcessError(job, error)
  }
}
