import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SocialInsuranceRateModel } from '../entity/social-insurance-rate.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class SocialInsuranceRateService {
  constructor(
    @InjectRepository(SocialInsuranceRateModel)
    private readonly insuranceRateRepository: Repository<SocialInsuranceRateModel>,
  ) {}

  async createSocialInsuranceRate(
    requestId: string,
    workplaceManageNo: string,
    normalRate: number,
    commuteRate: number,
    surplusRate: number,
    yearIndex: number,
  ) {
    try {
      const totalRate = normalRate + commuteRate + surplusRate

      // 기존 데이터 확인
      const existingRate = await this.insuranceRateRepository.findOne({
        where: {
          userId: requestId,
          workplaceManageNo: workplaceManageNo,
        },
      })

      if (existingRate) {
        // 기존 데이터가 있으면 update
        return this.insuranceRateRepository.save({
          ...existingRate,
          [`normalRateYear${yearIndex}`]: normalRate,
          [`commuteAccidentRateYear${yearIndex}`]: commuteRate,
          [`surplusRateYear${yearIndex}`]: surplusRate,
          [`totalRateYear${yearIndex}`]: totalRate,
        })
      } else {
        // 새로운 데이터 insert
        return this.insuranceRateRepository.save({
          userId: requestId,
          workplaceManageNo,
          [`normalRateYear${yearIndex}`]: normalRate,
          [`commuteAccidentRateYear${yearIndex}`]: commuteRate,
          [`surplusRateYear${yearIndex}`]: surplusRate,
          [`totalRateYear${yearIndex}`]: totalRate,
        })
      }
    } catch (error) {
      throw AppException.database(
        'social insurance rate 테이블 생성 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  async getSocialInsuranceRates(requestId: string) {
    try {
      const socialInsuranceRates = await this.insuranceRateRepository.find({
        where: { userId: requestId },
      })

      return socialInsuranceRates
    } catch (error) {
      throw AppException.database(
        'social insurance rate 테이블 조회 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  // async createSocialInsuranceRate(
  //   requestId: string,
  //   workplaceManageNo: string,
  //   normalRate: number,
  //   commuteRate: number,
  //   surplusRate: number,
  //   yearIndex: number,
  // ) {
  //   const totalRate = normalRate + commuteRate + surplusRate

  //   return this.insuranceRateRepository.save({
  //     userId: requestId,
  //     workplaceManageNo,
  //     [`normalRateYear${yearIndex}`]: normalRate,
  //     [`commuteAccidentRateYear${yearIndex}`]: commuteRate,
  //     [`surplusRateYear${yearIndex}`]: surplusRate,
  //     [`totalRateYear${yearIndex}`]: totalRate,
  //   })
  // }

  /**
   * 보험요율 정보 생성
   */
  async create(
    data: Partial<SocialInsuranceRateModel>,
  ): Promise<SocialInsuranceRateModel> {
    const insuranceRate = this.insuranceRateRepository.create(data)
    return await this.insuranceRateRepository.save(insuranceRate)
  }

  /**
   * 여러 보험요율 정보 일괄 생성
   */
  async createMany(
    dataArray: Partial<SocialInsuranceRateModel>[],
  ): Promise<SocialInsuranceRateModel[]> {
    const insuranceRates = this.insuranceRateRepository.create(dataArray)
    return await this.insuranceRateRepository.save(insuranceRates)
  }

  /**
   * 보험요율 정보 업데이트
   */
  async update(
    id: string,
    data: Partial<SocialInsuranceRateModel>,
  ): Promise<SocialInsuranceRateModel> {
    await this.insuranceRateRepository.update(id, data)
    return await this.insuranceRateRepository.findOne({
      where: { id },
      relations: ['user', 'company'],
    })
  }

  /*
  async findByCompanyId(companyId: string): Promise<SocialInsuranceRateModel> {
    return await this.insuranceRateRepository.findOne({
      where: { companyId },
      relations: ['user', 'company'],
    })
  }
*/
  /**
   * user_id로 보험요율 정보 목록 조회
   */
  async findByUserId(userId: string): Promise<SocialInsuranceRateModel[]> {
    return await this.insuranceRateRepository.find({
      where: { userId },
      relations: ['user', 'company'],
    })
  }

  /**
   * 사업장관리번호로 보험요율 정보 조회
   */
  async findByWorkplaceManageNo(
    workplaceManageNo: string,
  ): Promise<SocialInsuranceRateModel[]> {
    return await this.insuranceRateRepository.find({
      where: { workplaceManageNo },
      relations: ['user', 'company'],
    })
  }

  /**
   * 특정 연도의 보험요율 합계 계산
   */
  /*
  async calculateTotalRateByYear(
    companyId: string,
    year: number,
  ): Promise<{
    normalRate: number
    commuteAccidentRate: number
    surplusRate: number
    totalRate: number
  }> {
    const insuranceRate = await this.findByCompanyId(companyId)
    if (!insuranceRate) return null

    const yearField = `Year${year}` as const

    return {
      normalRate: Number(insuranceRate[`normalRate${yearField}`]) || 0,
      commuteAccidentRate:
        Number(insuranceRate[`commuteAccidentRate${yearField}`]) || 0,
      surplusRate: Number(insuranceRate[`surplusRate${yearField}`]) || 0,
      totalRate: Number(insuranceRate[`totalRate${yearField}`]) || 0,
    }
  }
*/
  /**
   * 특정 사용자의 보험요율 정보 삭제
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.insuranceRateRepository.delete({ userId })
  }

  /**
   * 특정 회사의 보험요율 정보 삭제
   */
  /*
  async deleteByCompanyId(companyId: string): Promise<void> {
    await this.insuranceRateRepository.delete({ companyId })
  }
*/
  /**
   * ID로 존재 여부 확인
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.insuranceRateRepository.count({
      where: { id },
    })
    return count > 0
  }

  /**
   * company_id로 존재 여부 확인
   */
  /*
  async existsByCompanyId(companyId: string): Promise<boolean> {
    const count = await this.insuranceRateRepository.count({
      where: { companyId },
    })
    return count > 0
  }
    */
}
