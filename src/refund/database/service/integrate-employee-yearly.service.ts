import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IntegrateEmployeeYearlyModel } from '../entity/integrate-employee-yearly.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class IntegrateEmployeeYearlyService {
  constructor(
    @InjectRepository(IntegrateEmployeeYearlyModel)
    private readonly integrateEmployeeYearlyRepository: Repository<IntegrateEmployeeYearlyModel>,
  ) {}

  async createIntegrateEmployeeYearly(
    integrateEmployeeData: Partial<IntegrateEmployeeYearlyModel>,
  ) {
    try {
      const createRequest = this.integrateEmployeeYearlyRepository.create(
        integrateEmployeeData,
      )
      return await this.integrateEmployeeYearlyRepository.save(createRequest)
    } catch (error) {
      throw AppException.database(
        'integrate employee yearly 테이블 생성 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  /********************************************
   * 직원 통합 연간 정보 생성
   */
  async create(
    data: Partial<IntegrateEmployeeYearlyModel>,
  ): Promise<IntegrateEmployeeYearlyModel> {
    const yearly = this.integrateEmployeeYearlyRepository.create(data)
    return await this.integrateEmployeeYearlyRepository.save(yearly)
  }

  /**
   * 직원 통합 연간 정보 업데이트
   */
  async update(
    userId: string,
    data: Partial<IntegrateEmployeeYearlyModel>,
  ): Promise<IntegrateEmployeeYearlyModel> {
    await this.integrateEmployeeYearlyRepository.update({ userId }, data)
    return await this.integrateEmployeeYearlyRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * userId로 직원 통합 연간 정보 조회
   */
  async findByUserId(userId: string): Promise<IntegrateEmployeeYearlyModel> {
    return await this.integrateEmployeeYearlyRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * 특정 연도의 직원 통계 조회
   */
  async getYearlyStatistics(
    userId: string,
    year: number,
  ): Promise<{
    count: { youth: number; middle: number; total: number }
    firstVariation: { youth: number; middle: number; total: number }
    secondVariation: { youth: number; middle: number; total: number }
    thirdVariation: { youth: number; middle: number; total: number }
  }> {
    const yearly = await this.findByUserId(userId)
    if (!yearly) return null

    return {
      count: {
        youth: Number(yearly[`youthCountYear${year}`]) || 0,
        middle: Number(yearly[`middleCountYear${year}`]) || 0,
        total: Number(yearly[`totalCountYear${year}`]) || 0,
      },
      firstVariation: {
        youth: Number(yearly[`firstVariationYouthYear${year}`]) || 0,
        middle: Number(yearly[`firstVariationMiddleYear${year}`]) || 0,
        total: Number(yearly[`firstVariationTotalYear${year}`]) || 0,
      },
      secondVariation: {
        youth: Number(yearly[`secondVariationYouthYear${year}`]) || 0,
        middle: Number(yearly[`secondVariationMiddleYear${year}`]) || 0,
        total: Number(yearly[`secondVariationTotalYear${year}`]) || 0,
      },
      thirdVariation: {
        youth: Number(yearly[`thirdVariationYouthYear${year}`]) || 0,
        middle: Number(yearly[`thirdVariationMiddleYear${year}`]) || 0,
        total: Number(yearly[`thirdVariationTotalYear${year}`]) || 0,
      },
    }
  }

  /**
   * 특정 사용자의 직원 통합 연간 정보 삭제
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.integrateEmployeeYearlyRepository.delete({ userId })
  }

  /**
   * userId로 존재 여부 확인
   */
  async exists(userId: string): Promise<boolean> {
    const count = await this.integrateEmployeeYearlyRepository.count({
      where: { userId },
    })
    return count > 0
  }
}
