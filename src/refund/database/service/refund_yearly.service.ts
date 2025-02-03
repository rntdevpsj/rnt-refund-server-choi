import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RefundYearlyModel } from '../entity/refund_yearly.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class RefundYearlyService {
  constructor(
    @InjectRepository(RefundYearlyModel)
    private readonly refundYearlyRepository: Repository<RefundYearlyModel>,
  ) {}

  async createRefundYearly(refundYearlyData: Partial<RefundYearlyModel>) {
    try {
      const createRequest = this.refundYearlyRepository.create(refundYearlyData)
      return await this.refundYearlyRepository.save(createRequest)
    } catch (error) {
      throw AppException.database('refund yearly 테이블 생성 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  //*****************************************************************************
  async create(data: Partial<RefundYearlyModel>): Promise<RefundYearlyModel> {
    const yearly = this.refundYearlyRepository.create(data)
    return await this.refundYearlyRepository.save(yearly)
  }

  async update(
    userId: string,
    data: Partial<RefundYearlyModel>,
  ): Promise<RefundYearlyModel> {
    await this.refundYearlyRepository.update({ userId }, data)
    return await this.refundYearlyRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  async findByUserId(userId: string): Promise<RefundYearlyModel> {
    return await this.refundYearlyRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }
}
