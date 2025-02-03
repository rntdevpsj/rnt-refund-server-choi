import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TotalSalaryYearlyModel } from '../entity/total-salary-yearly.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class TotalSalaryYearlyService {
  constructor(
    @InjectRepository(TotalSalaryYearlyModel)
    private readonly totalSalaryYearlyRepository: Repository<TotalSalaryYearlyModel>,
  ) {}

  async createTotalSalaryYearly(
    totalSalaryData: Partial<TotalSalaryYearlyModel>,
  ) {
    try {
      const createRequest =
        this.totalSalaryYearlyRepository.create(totalSalaryData)
      return await this.totalSalaryYearlyRepository.save(createRequest)
    } catch (error) {
      throw AppException.database(
        'total salary yearly 테이블 생성 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  /*******************************************
   * 연간 총 급여 정보 생성
   */
  async create(
    data: Partial<TotalSalaryYearlyModel>,
  ): Promise<TotalSalaryYearlyModel> {
    const yearly = this.totalSalaryYearlyRepository.create(data)
    return await this.totalSalaryYearlyRepository.save(yearly)
  }

  /**
   * 연간 총 급여 정보 업데이트
   */
  async update(
    userId: string,
    data: Partial<TotalSalaryYearlyModel>,
  ): Promise<TotalSalaryYearlyModel> {
    await this.totalSalaryYearlyRepository.update({ userId }, data)
    return await this.totalSalaryYearlyRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * userId로 연간 총 급여 정보 조회
   */
  async findByUserId(userId: string): Promise<TotalSalaryYearlyModel> {
    return await this.totalSalaryYearlyRepository.findOne({
      where: { userId },
      relations: ['user'],
    })
  }

  /**
   * 특정 연도의 급여 통계 조회
   */
  async getYearlySalaryStatistics(
    userId: string,
    year: number,
  ): Promise<{
    youth: number
    middle: number
    total: number
  }> {
    const yearly = await this.findByUserId(userId)
    if (!yearly) return null

    return {
      youth: yearly[`youthSalaryYear${year}`] || 0,
      middle: yearly[`middleSalaryYear${year}`] || 0,
      total: yearly[`totalSalaryYear${year}`] || 0,
    }
  }

  /**
   * 특정 사용자의 연간 총 급여 정보 삭제
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.totalSalaryYearlyRepository.delete({ userId })
  }

  /**
   * userId로 존재 여부 확인
   */
  async exists(userId: string): Promise<boolean> {
    const count = await this.totalSalaryYearlyRepository.count({
      where: { userId },
    })
    return count > 0
  }

  /**
   * 5년간 총 급여 합계 계산
   */
  async calculateTotalSalaryForFiveYears(userId: string): Promise<{
    youthTotal: number
    middleTotal: number
    grandTotal: number
  }> {
    const yearly = await this.findByUserId(userId)
    if (!yearly) return null

    let youthTotal = 0
    let middleTotal = 0
    let grandTotal = 0

    for (let year = 1; year <= 5; year++) {
      youthTotal += yearly[`youthSalaryYear${year}`] || 0
      middleTotal += yearly[`middleSalaryYear${year}`] || 0
      grandTotal += yearly[`totalSalaryYear${year}`] || 0
    }

    return {
      youthTotal,
      middleTotal,
      grandTotal,
    }
  }
}
