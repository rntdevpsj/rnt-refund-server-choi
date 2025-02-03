import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SocialInsuranceTaxCreditModel } from '../entity/social_insurance_tax_credit.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class SocialInsuranceTaxCreditService {
  constructor(
    @InjectRepository(SocialInsuranceTaxCreditModel)
    private readonly socialInsuranceTaxCreditRepository: Repository<SocialInsuranceTaxCreditModel>,
  ) {}

  async createSocialInsuranceTaxCredit(
    socialTaxCredit: Partial<SocialInsuranceTaxCreditModel>,
  ) {
    try {
      const createRequest =
        this.socialInsuranceTaxCreditRepository.create(socialTaxCredit)
      return await this.socialInsuranceTaxCreditRepository.save(createRequest)
    } catch (error) {
      throw AppException.database(
        'social insurance tax credit 테이블 생성 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  /*********************************************
   * 사회보험 세액공제 정보 생성
   */
  async create(
    data: Partial<SocialInsuranceTaxCreditModel>,
  ): Promise<SocialInsuranceTaxCreditModel> {
    const taxCredit = this.socialInsuranceTaxCreditRepository.create(data)
    return await this.socialInsuranceTaxCreditRepository.save(taxCredit)
  }

  /**
   * 사회보험 세액공제 정보 업데이트
   */
  async update(
    userId: string,
    data: Partial<SocialInsuranceTaxCreditModel>,
  ): Promise<SocialInsuranceTaxCreditModel> {
    await this.socialInsuranceTaxCreditRepository.update({ userId }, data)
    return await this.socialInsuranceTaxCreditRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * userId로 사회보험 세액공제 정보 조회
   */
  async findByUserId(userId: string): Promise<SocialInsuranceTaxCreditModel> {
    return await this.socialInsuranceTaxCreditRepository.findOne({
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
      total: number
    }
    paidTax: {
      first: number
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
        total: taxCredit[`totalCreditYear${year}`] || 0,
      },
      paidTax: {
        first: taxCredit[`firstPaidTaxYear${year}`] || 0,
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
    await this.socialInsuranceTaxCreditRepository.delete({ userId })
  }

  /**
   * userId로 존재 여부 확인
   */
  async exists(userId: string): Promise<boolean> {
    const count = await this.socialInsuranceTaxCreditRepository.count({
      where: { userId },
    })
    return count > 0
  }
}
