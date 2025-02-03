import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HometaxFillingPersonModel } from '../entity/hometax_filling_person.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class HometaxFillingPersonService {
  constructor(
    @InjectRepository(HometaxFillingPersonModel)
    private readonly hometaxFillingPersonRepository: Repository<HometaxFillingPersonModel>,
  ) {}

  async createHometaxFillingPerson(
    hometaxFillingPerson: Partial<HometaxFillingPersonModel>,
  ): Promise<HometaxFillingPersonModel> {
    try {
      const existingPerson = await this.hometaxFillingPersonRepository.findOne({
        where: { userId: hometaxFillingPerson.userId },
      })

      if (existingPerson) {
        // 업데이트
        const updatedPerson = {
          ...existingPerson,
          ...hometaxFillingPerson,
          // updatedAt은 자동으로 갱신
        }
        return await this.hometaxFillingPersonRepository.save(updatedPerson)
      } else {
        // 새로 생성
        const newPerson =
          this.hometaxFillingPersonRepository.create(hometaxFillingPerson)
        return await this.hometaxFillingPersonRepository.save(newPerson)
      }
    } catch (error) {
      throw AppException.database(
        'hometax filling person 테이블 생성 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  async updateRefundLimit(
    userId: string,
    refundLimitData: Partial<HometaxFillingPersonModel>,
  ) {
    try {
      const result = await this.hometaxFillingPersonRepository.update(
        { userId },
        refundLimitData,
      )

      if (result.affected === 0) {
        throw new Error('해당 유저의 데이터를 찾을 수 없습니다.')
      }

      return result
    } catch (error) {
      throw AppException.database(
        'hometax filling person refund limit 업데이트 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  async getHometaxFilling(userId: string) {
    try {
      const hometaxFilling = await this.hometaxFillingPersonRepository.findOne({
        where: { userId },
      })

      return hometaxFilling
    } catch (error) {
      throw AppException.database(
        'hometax filling person 테이블 조회 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  /********************************
   * 홈택스 신고인 정보 생성
   */
  async create(
    data: Partial<HometaxFillingPersonModel>,
  ): Promise<HometaxFillingPersonModel> {
    const fillingPerson = this.hometaxFillingPersonRepository.create(data)
    return await this.hometaxFillingPersonRepository.save(fillingPerson)
  }

  /**
   * 홈택스 신고인 정보 업데이트
   */
  async update(
    userId: string,
    data: Partial<HometaxFillingPersonModel>,
  ): Promise<HometaxFillingPersonModel> {
    await this.hometaxFillingPersonRepository.update({ userId }, data)
    return await this.hometaxFillingPersonRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * userId로 홈택스 신고인 정보 조회
   */
  async findByUserId(userId: string): Promise<HometaxFillingPersonModel> {
    return await this.hometaxFillingPersonRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * 특정 연도의 통계 조회
   */
  async getYearlyStatistics(
    userId: string,
    year: number,
  ): Promise<{
    accountDuty: string
    fillingType: string
    agentName: string
    income: {
      total: number
      business: number
      deduction: number
    }
    tax: {
      taxationStandard: number
      calculated: number
      reduction: number
      credit: number
      determined: number
      additional: number
      surplus: number
      prePaid: number
      paidAgricultural: number
      reductionExcluded: number
      creditExcluded: number
      reductionIncluded: number
      creditIncluded: number
    }
    businessIncomeRate: number
    refundLimit: number
  }> {
    const fillingPerson = await this.findByUserId(userId)
    if (!fillingPerson) return null

    return {
      accountDuty: fillingPerson[`accountDutyYear${year}`],
      fillingType: fillingPerson[`fillingTypeYear${year}`],
      agentName: fillingPerson[`agentNameYear${year}`],
      income: {
        total: fillingPerson[`totalIncomeYear${year}`] || 0,
        business: fillingPerson[`businessIncomeYear${year}`] || 0,
        deduction: fillingPerson[`incomeDeductionYear${year}`] || 0,
      },
      tax: {
        taxationStandard: fillingPerson[`taxationStandardYear${year}`] || 0,
        calculated: fillingPerson[`calculatedTaxYear${year}`] || 0,
        reduction: fillingPerson[`taxReductionYear${year}`] || 0,
        credit: fillingPerson[`taxCreditYear${year}`] || 0,
        determined: fillingPerson[`determinedTaxYear${year}`] || 0,
        additional: fillingPerson[`additionalTaxYear${year}`] || 0,
        surplus: fillingPerson[`surplusTaxYear${year}`] || 0,
        prePaid: fillingPerson[`prePaidTaxYear${year}`] || 0,
        paidAgricultural: fillingPerson[`paidAgriculturalTaxYear${year}`] || 0,
        reductionExcluded:
          fillingPerson[`taxReductionExcludedYear${year}`] || 0,
        creditExcluded: fillingPerson[`taxCreditExcludedYear${year}`] || 0,
        reductionIncluded:
          fillingPerson[`taxReductionIncludedYear${year}`] || 0,
        creditIncluded: fillingPerson[`taxCreditIncludedYear${year}`] || 0,
      },
      businessIncomeRate: fillingPerson[`businessIncomeRateYear${year}`] || 0,
      refundLimit: fillingPerson[`refundLimitYear${year}`] || 0,
    }
  }

  /**
   * 5년간 사업소득 비율 평균 계산
   */
  async calculateAverageBusinessIncomeRate(userId: string): Promise<number> {
    const fillingPerson = await this.findByUserId(userId)
    if (!fillingPerson) return 0

    let sum = 0
    let count = 0

    for (let year = 1; year <= 5; year++) {
      const rate = fillingPerson[`businessIncomeRateYear${year}`]
      if (rate) {
        sum += Number(rate)
        count++
      }
    }

    return count > 0 ? Number((sum / count).toFixed(4)) : 0
  }

  /**
   * 특정 사용자의 홈택스 신고인 정보 삭제
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.hometaxFillingPersonRepository.delete({ userId })
  }

  /**
   * userId로 존재 여부 확인
   */
  async exists(userId: string): Promise<boolean> {
    const count = await this.hometaxFillingPersonRepository.count({
      where: { userId },
    })
    return count > 0
  }
}
