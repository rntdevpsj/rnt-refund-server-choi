import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IntegrateMonthlyCountModel } from '../entity/integrate-monthly-count.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class IntegrateMonthlyCountService {
  constructor(
    @InjectRepository(IntegrateMonthlyCountModel)
    private readonly integrateMonthlyCountRepository: Repository<IntegrateMonthlyCountModel>,
  ) {}

  async createIncreaseMonthlyCount(
    integrateMonthlyData: Partial<IntegrateMonthlyCountModel>,
  ) {
    try {
      const createRequest =
        this.integrateMonthlyCountRepository.create(integrateMonthlyData)
      return await this.integrateMonthlyCountRepository.save(createRequest)
    } catch (error) {
      throw AppException.database(
        'integrate monthly count 테이블 생성 실패',
        'system',
        { originalError: error.message },
      )
    }
  }
  /**
   * 직원별 월별 집계 정보 생성
   */
  async createMonthlyCount(
    data: Partial<IntegrateMonthlyCountModel>,
  ): Promise<IntegrateMonthlyCountModel> {
    const monthlyCount = this.integrateMonthlyCountRepository.create(data)
    return await this.integrateMonthlyCountRepository.save(monthlyCount)
  }

  /**
   * 여러 직원의 월별 집계 정보 일괄 생성
   */
  async createManyMonthlyCount(
    dataArray: Partial<IntegrateMonthlyCountModel>[],
  ): Promise<IntegrateMonthlyCountModel[]> {
    const monthlyCountEntities =
      this.integrateMonthlyCountRepository.create(dataArray)
    return await this.integrateMonthlyCountRepository.save(monthlyCountEntities)
  }

  /**
   * 직원별 월별 집계 정보 업데이트
   */
  async updateMonthlyCount(
    id: string,
    data: Partial<IntegrateMonthlyCountModel>,
  ): Promise<IntegrateMonthlyCountModel> {
    await this.integrateMonthlyCountRepository.update(id, data)
    return await this.integrateMonthlyCountRepository.findOne({
      where: { id },
      relations: ['user', 'employee'],
    })
  }

  /**
   * 여러 직원의 월별 집계 정보 일괄 업데이트
   */
  async updateManyMonthlyCount(
    dataArray: Partial<IntegrateMonthlyCountModel>[],
  ): Promise<IntegrateMonthlyCountModel[]> {
    const validData = dataArray.filter(data => data.id)

    const updatePromises = validData.map(async data => {
      const existingRecord = await this.integrateMonthlyCountRepository.findOne(
        {
          where: { id: data.id },
        },
      )

      if (existingRecord) {
        Object.assign(existingRecord, data)
        return await this.integrateMonthlyCountRepository.save(existingRecord)
      }
      return null
    })

    const updatedRecords = await Promise.all(updatePromises)
    return updatedRecords.filter(record => record !== null)
  }

  /**
   * employee_id로 월별 집계 정보 조회
   */
  async findByEmployeeId(
    employeeId: string,
  ): Promise<IntegrateMonthlyCountModel> {
    return await this.integrateMonthlyCountRepository.findOne({
      where: { employeeId },
      relations: ['user', 'employee'],
    })
  }

  /**
   * user_id로 모든 월별 집계 정보 조회
   */
  async findByUserId(userId: string): Promise<IntegrateMonthlyCountModel[]> {
    return await this.integrateMonthlyCountRepository.find({
      where: { userId },
      relations: ['user', 'employee'],
    })
  }

  /**
   * 주민등록번호로 월별 집계 정보 조회
   */
  async findByEmployeeSocialNo(
    employeeSocialNo: string,
    userId?: string,
  ): Promise<IntegrateMonthlyCountModel[]> {
    const where: any = { employeeSocialNo }
    if (userId) {
      where.userId = userId
    }

    return await this.integrateMonthlyCountRepository.find({
      where,
      relations: ['user', 'employee'],
    })
  }

  /**
   * 특정 사용자의 모든 월별 집계 정보 삭제
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.integrateMonthlyCountRepository.delete({ userId })
  }

  /**
   * 특정 employee의 월별 집계 정보 삭제
   */
  async deleteByEmployeeId(employeeId: string): Promise<void> {
    await this.integrateMonthlyCountRepository.delete({ employeeId })
  }

  /**
   * ID로 존재 여부 확인
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.integrateMonthlyCountRepository.count({
      where: { id },
    })
    return count > 0
  }

  /**
   * employee_id로 존재 여부 확인
   */
  async existsByEmployeeId(employeeId: string): Promise<boolean> {
    const count = await this.integrateMonthlyCountRepository.count({
      where: { employeeId },
    })
    return count > 0
  }
}
