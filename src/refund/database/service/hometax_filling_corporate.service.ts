import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HometaxFillingCorporateModel } from '../entity/hometax_filling_corporate.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class HometaxFillingCorporateService {
  constructor(
    @InjectRepository(HometaxFillingCorporateModel)
    private readonly hometaxFillingCorporateRepository: Repository<HometaxFillingCorporateModel>,
  ) {}

  async getHometaxFilling(requestId: string) {
    try {
      const hometaxFilling =
        await this.hometaxFillingCorporateRepository.findOne({
          where: { userId: requestId },
        })

      return hometaxFilling // null을 반환하거나 데이터를 반환
    } catch (error) {
      throw AppException.database(
        'hometax filling corporate 테이블 조회 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  async updateRefundLimit(
    requestId: string,
    refundLimitData: Partial<HometaxFillingCorporateModel>,
  ) {
    try {
      const result = await this.hometaxFillingCorporateRepository.update(
        { userId: requestId },
        refundLimitData,
      )

      if (result.affected === 0) {
        throw new Error('해당 유저의 데이터를 찾을 수 없습니다.')
      }

      return result
    } catch (error) {
      throw AppException.database(
        'hometax filling corporate refund limit 업데이트 실패',
        'system',
        { originalError: error.message },
      )
    }
  }
  /*******************************************
   * 법인 신고 정보 생성
   */
  async create(
    data: Partial<HometaxFillingCorporateModel>,
  ): Promise<HometaxFillingCorporateModel> {
    const fillingCorporate = this.hometaxFillingCorporateRepository.create(data)
    return await this.hometaxFillingCorporateRepository.save(fillingCorporate)
  }

  /**
   * 법인 신고 정보 업데이트
   */
  async update(
    userId: string,
    data: Partial<HometaxFillingCorporateModel>,
  ): Promise<HometaxFillingCorporateModel> {
    await this.hometaxFillingCorporateRepository.update({ userId }, data)
    return await this.hometaxFillingCorporateRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * userId로 법인 신고 정보 조회
   */
  async findByUserId(userId: string): Promise<HometaxFillingCorporateModel> {
    return await this.hometaxFillingCorporateRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * 특정 연도의 세금 통계 조회
   */
  async getYearlyTaxStatistics(
    userId: string,
    year: number,
  ): Promise<{
    businessPeriod: string
    taxationStandard: number
    tax: {
      calculated: number
      reduction: number
      credit: number
      reductionExcluded: number
      creditExcluded: number
      reductionIncluded: number
      creditIncluded: number
      determined: number
      additional: number
      surplus: number
      prePaid: number
      paidAgricultural: number
    }
    refundLimit: number
  }> {
    const fillingCorporate = await this.findByUserId(userId)
    if (!fillingCorporate) return null

    return {
      businessPeriod: fillingCorporate[`businessPeriodYear${year}`],
      taxationStandard: fillingCorporate[`taxationStandardYear${year}`] || 0,
      tax: {
        calculated: fillingCorporate[`calculatedTaxYear${year}`] || 0,
        reduction: fillingCorporate[`taxReductionYear${year}`] || 0,
        credit: fillingCorporate[`taxCreditYear${year}`] || 0,
        reductionExcluded:
          fillingCorporate[`taxReductionExcludedYear${year}`] || 0,
        creditExcluded: fillingCorporate[`taxCreditExcludedYear${year}`] || 0,
        reductionIncluded:
          fillingCorporate[`taxReductionIncludedYear${year}`] || 0,
        creditIncluded: fillingCorporate[`taxCreditIncludedYear${year}`] || 0,
        determined: fillingCorporate[`determinedTaxYear${year}`] || 0,
        additional: fillingCorporate[`additionalTaxYear${year}`] || 0,
        surplus: fillingCorporate[`surplusTaxYear${year}`] || 0,
        prePaid: fillingCorporate[`prePaidTaxYear${year}`] || 0,
        paidAgricultural:
          fillingCorporate[`paidAgriculturalTaxYear${year}`] || 0,
      },
      refundLimit: fillingCorporate[`refundLimitYear${year}`] || 0,
    }
  }

  /**
   * 5년간 총 세액공제 및 감면액 계산
   */
  async calculateTotalTaxBenefits(userId: string): Promise<{
    totalReduction: number
    totalCredit: number
  }> {
    const fillingCorporate = await this.findByUserId(userId)
    if (!fillingCorporate) return null

    let totalReduction = 0
    let totalCredit = 0

    for (let year = 1; year <= 5; year++) {
      totalReduction += fillingCorporate[`taxReductionYear${year}`] || 0
      totalCredit += fillingCorporate[`taxCreditYear${year}`] || 0
    }

    return {
      totalReduction,
      totalCredit,
    }
  }

  /**
   * 특정 사용자의 법인 신고 정보 삭제
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.hometaxFillingCorporateRepository.delete({ userId })
  }

  /**
   * userId로 존재 여부 확인
   */
  async exists(userId: string): Promise<boolean> {
    const count = await this.hometaxFillingCorporateRepository.count({
      where: { userId },
    })
    return count > 0
  }
}
