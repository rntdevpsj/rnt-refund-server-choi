import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IncreaseEmployeeTaxCreditModel } from '../entity/increase_employee_tax_credit.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class IncreaseEmployeeTaxCreditService {
  constructor(
    @InjectRepository(IncreaseEmployeeTaxCreditModel)
    private readonly increaseEmploytaxCreditRepository: Repository<IncreaseEmployeeTaxCreditModel>,
  ) {}

  async createIncreaseEmployeeTaxCredit(
    increaseTaxCredit: Partial<IncreaseEmployeeTaxCreditModel>,
  ) {
    try {
      const createRequest =
        this.increaseEmploytaxCreditRepository.create(increaseTaxCredit)
      return await this.increaseEmploytaxCreditRepository.save(createRequest)
    } catch (error) {
      throw AppException.database(
        'increase employee tax credit 테이블 생성 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  /**************************************************
   * 세액공제 정보 생성
   */
  async create(
    data: Partial<IncreaseEmployeeTaxCreditModel>,
  ): Promise<IncreaseEmployeeTaxCreditModel> {
    const taxCredit = this.increaseEmploytaxCreditRepository.create(data)
    return await this.increaseEmploytaxCreditRepository.save(taxCredit)
  }

  /**
   * 세액공제 정보 업데이트
   */
  async update(
    userId: string,
    data: Partial<IncreaseEmployeeTaxCreditModel>,
  ): Promise<IncreaseEmployeeTaxCreditModel> {
    await this.increaseEmploytaxCreditRepository.update({ userId }, data)
    return await this.increaseEmploytaxCreditRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * userId로 세액공제 정보 조회
   */
  async findByUserId(userId: string): Promise<IncreaseEmployeeTaxCreditModel> {
    return await this.increaseEmploytaxCreditRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * 특정 연도의 세액공제 통계 조회
   */
  async getYearlyTaxCreditStatistics(
    userId: string,
    year: number,
  ): Promise<{
    credits: {
      first: { youth: number; middle: number; total: number }
      second: { youth: number; middle: number; total: number }
      third: { youth: number; middle: number; total: number }
    }
    paidTax: {
      first: number
      second: number
      total: number
    }
  }> {
    const taxCredit = await this.findByUserId(userId)
    if (!taxCredit) return null

    return {
      credits: {
        first: {
          youth: taxCredit[`firstCreditYouthYear${year}`] || 0,
          middle: taxCredit[`firstCreditMiddleYear${year}`] || 0,
          total: taxCredit[`firstCreditTotalYear${year}`] || 0,
        },
        second: {
          youth: taxCredit[`secondCreditYouthYear${year}`] || 0,
          middle: taxCredit[`secondCreditMiddleYear${year}`] || 0,
          total: taxCredit[`secondCreditTotalYear${year}`] || 0,
        },
        third: {
          youth: taxCredit[`thirdCreditYouthYear${year}`] || 0,
          middle: taxCredit[`thirdCreditMiddleYear${year}`] || 0,
          total: taxCredit[`thirdCreditTotalYear${year}`] || 0,
        },
      },
      paidTax: {
        first: taxCredit[`firstPaidTaxYear${year}`] || 0,
        second: taxCredit[`secondPaidTaxYear${year}`] || 0,
        total: taxCredit[`totalPaidTaxYear${year}`] || 0,
      },
    }
  }

  /**
   * 5년간 총 세액공제 및 납부세액 합계 계산
   */
  async calculateTotalForFiveYears(userId: string): Promise<{
    totalCredits: number
    totalPaidTax: number
  }> {
    const taxCredit = await this.findByUserId(userId)
    if (!taxCredit) return null

    let totalCredits = 0
    let totalPaidTax = 0

    for (let year = 1; year <= 5; year++) {
      totalCredits += taxCredit[`totalCreditYear${year}`] || 0
      totalPaidTax += taxCredit[`totalPaidTaxYear${year}`] || 0
    }

    return {
      totalCredits,
      totalPaidTax,
    }
  }

  /**
   * 특정 사용자의 세액공제 정보 삭제
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.increaseEmploytaxCreditRepository.delete({ userId })
  }

  /**
   * userId로 존재 여부 확인
   */
  async exists(userId: string): Promise<boolean> {
    const count = await this.increaseEmploytaxCreditRepository.count({
      where: { userId },
    })
    return count > 0
  }
}
