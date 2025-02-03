import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IncreaseEmployeeYearlyModel } from '../entity/increase-employee-yearly.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class IncreaseEmployeeYearlyService {
  constructor(
    @InjectRepository(IncreaseEmployeeYearlyModel)
    private readonly increaseEmployeeYearlyRepository: Repository<IncreaseEmployeeYearlyModel>,
  ) {}

  async createIncreaseEmployeeYearly(
    increaseEmployeeData: Partial<IncreaseEmployeeYearlyModel>,
  ) {
    try {
      const createRequest =
        this.increaseEmployeeYearlyRepository.create(increaseEmployeeData)
      return await this.increaseEmployeeYearlyRepository.save(createRequest)
    } catch (error) {
      throw AppException.database(
        'increase employee yearly 테이블 생성 실패',
        'system',
        { originalError: error.message },
      )
    }
  }
  /**
   * 연간 증가 직원 수 정보 생성
   */
  async create(
    data: Partial<IncreaseEmployeeYearlyModel>,
  ): Promise<IncreaseEmployeeYearlyModel> {
    const yearly = this.increaseEmployeeYearlyRepository.create(data)
    return await this.increaseEmployeeYearlyRepository.save(yearly)
  }

  /**
   * 연간 증가 직원 수 정보 업데이트
   */
  async update(
    userId: string,
    data: Partial<IncreaseEmployeeYearlyModel>,
  ): Promise<IncreaseEmployeeYearlyModel> {
    await this.increaseEmployeeYearlyRepository.update({ userId }, data)
    return await this.increaseEmployeeYearlyRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * userId로 연간 증가 직원 수 정보 조회
   */
  async findByUserId(userId: string): Promise<IncreaseEmployeeYearlyModel> {
    return await this.increaseEmployeeYearlyRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * 특정 연도의 증가 직원 수 계산
   */
  async calculateYearlyIncrease(
    userId: string,
    year: number,
  ): Promise<{
    youth: {
      count: number
      firstVar: number
      secondVar: number
      thirdVar: number
    }
    middle: {
      count: number
      firstVar: number
      secondVar: number
      thirdVar: number
    }
    total: {
      count: number
      firstVar: number
      secondVar: number
      thirdVar: number
    }
  }> {
    const yearly = await this.findByUserId(userId)
    if (!yearly) return null

    return {
      youth: {
        count: Number(yearly[`youthCountYear${year}`]) || 0,
        firstVar: Number(yearly[`firstVariationYouthYear${year}`]) || 0,
        secondVar: Number(yearly[`secondVariationYouthYear${year}`]) || 0,
        thirdVar: Number(yearly[`thirdVariationYouthYear${year}`]) || 0,
      },
      middle: {
        count: Number(yearly[`middleCountYear${year}`]) || 0,
        firstVar: Number(yearly[`firstVariationMiddleYear${year}`]) || 0,
        secondVar: Number(yearly[`secondVariationMiddleYear${year}`]) || 0,
        thirdVar: Number(yearly[`thirdVariationMiddleYear${year}`]) || 0,
      },
      total: {
        count: Number(yearly[`totalCountYear${year}`]) || 0,
        firstVar: Number(yearly[`firstVariationTotalYear${year}`]) || 0,
        secondVar: Number(yearly[`secondVariationTotalYear${year}`]) || 0,
        thirdVar: Number(yearly[`thirdVariationTotalYear${year}`]) || 0,
      },
    }
  }

  /**
   * 특정 사용자의 연간 증가 직원 수 정보 삭제
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.increaseEmployeeYearlyRepository.delete({ userId })
  }

  /**
   * userId로 존재 여부 확인
   */
  async exists(userId: string): Promise<boolean> {
    const count = await this.increaseEmployeeYearlyRepository.count({
      where: { userId },
    })
    return count > 0
  }
}
