import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IncreaseMonthlyCountModel } from '../entity/increase-monthly-counts.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class IncreaseMonthlyCountService {
  constructor(
    @InjectRepository(IncreaseMonthlyCountModel)
    private readonly monthlyCountRepository: Repository<IncreaseMonthlyCountModel>,
  ) {}

  async createIncreaseMonthlyCount(
    increaseMonthlyData: Partial<IncreaseMonthlyCountModel>,
  ) {
    try {
      const createRequest =
        this.monthlyCountRepository.create(increaseMonthlyData)
      return await this.monthlyCountRepository.save(createRequest)
    } catch (error) {
      throw AppException.database(
        'increase monthly count 테이블 생성 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  /*********************
   * 직원별 월별 집계 정보 생성
   */
  async createMonthlyCount(
    data: Partial<IncreaseMonthlyCountModel>,
  ): Promise<IncreaseMonthlyCountModel> {
    const monthlyCount = this.monthlyCountRepository.create(data)
    return await this.monthlyCountRepository.save(monthlyCount)
  }

  /**
   * 여러 직원의 월별 집계 정보 일괄 생성
   */
  async createManyMonthlyCount(
    dataArray: Partial<IncreaseMonthlyCountModel>[],
  ): Promise<IncreaseMonthlyCountModel[]> {
    const monthlyCountEntities = this.monthlyCountRepository.create(dataArray)
    return await this.monthlyCountRepository.save(monthlyCountEntities)
  }

  /**
   * 직원별 월별 집계 정보 업데이트
   */
  async updateMonthlyCount(
    id: string,
    data: Partial<IncreaseMonthlyCountModel>,
  ): Promise<IncreaseMonthlyCountModel> {
    await this.monthlyCountRepository.update(id, data)
    return await this.monthlyCountRepository.findOne({
      where: { id },
      relations: ['user', 'employee'],
    })
  }

  /**
   * 여러 직원의 월별 집계 정보 일괄 업데이트
   */
  async updateManyMonthlyCount(
    dataArray: Partial<IncreaseMonthlyCountModel>[],
  ): Promise<IncreaseMonthlyCountModel[]> {
    const validData = dataArray.filter(data => data.id)

    const updatePromises = validData.map(async data => {
      const existingRecord = await this.monthlyCountRepository.findOne({
        where: { id: data.id },
      })

      if (existingRecord) {
        Object.assign(existingRecord, data)
        return await this.monthlyCountRepository.save(existingRecord)
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
  ): Promise<IncreaseMonthlyCountModel> {
    return await this.monthlyCountRepository.findOne({
      where: { employeeId },
      relations: ['user', 'employee'],
    })
  }

  /**
   * user_id로 모든 월별 집계 정보 조회
   */
  async findByUserId(userId: string): Promise<IncreaseMonthlyCountModel[]> {
    return await this.monthlyCountRepository.find({
      where: { userId },
      relations: ['user', 'employee'],
    })
  }

  /**
   * worker_type으로 월별 집계 정보 조회
   */
  async findByWorkerType(
    workerType: string,
    userId?: string,
  ): Promise<IncreaseMonthlyCountModel[]> {
    const where: any = { workerType }
    if (userId) {
      where.userId = userId
    }

    return await this.monthlyCountRepository.find({
      where,
      relations: ['user', 'employee'],
    })
  }

  /**
   * 주민등록번호로 월별 집계 정보 조회
   */
  async findByEmployeeSocialNo(
    employeeSocialNo: string,
    userId?: string,
  ): Promise<IncreaseMonthlyCountModel[]> {
    const where: any = { employeeSocialNo }
    if (userId) {
      where.userId = userId
    }

    return await this.monthlyCountRepository.find({
      where,
      relations: ['user', 'employee'],
    })
  }

  /**
   * 특정 사용자의 모든 월별 집계 정보 삭제
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.monthlyCountRepository.delete({ userId })
  }

  /**
   * 특정 employee의 월별 집계 정보 삭제
   */
  async deleteByEmployeeId(employeeId: string): Promise<void> {
    await this.monthlyCountRepository.delete({ employeeId })
  }

  /**
   * 특정 연도의 급여 합계 계산
   */
  async calculateYearSalarySum(
    userId: string,
    year: number,
  ): Promise<{
    youthSalarySum: number
    middleSalarySum: number
  }> {
    const records = await this.findByUserId(userId)

    const result = {
      youthSalarySum: 0,
      middleSalarySum: 0,
    }

    records.forEach(record => {
      const youthField =
        `youthSalaryPerEmployeeYear${year}` as keyof IncreaseMonthlyCountModel
      const middleField =
        `middleSalaryPerEmployeeYear${year}` as keyof IncreaseMonthlyCountModel

      result.youthSalarySum += Number(record[youthField]) || 0
      result.middleSalarySum += Number(record[middleField]) || 0
    })

    return result
  }

  /**
   * ID로 존재 여부 확인
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.monthlyCountRepository.count({
      where: { id },
    })
    return count > 0
  }

  /**
   * employee_id로 존재 여부 확인
   */
  async existsByEmployeeId(employeeId: string): Promise<boolean> {
    const count = await this.monthlyCountRepository.count({
      where: { employeeId },
    })
    return count > 0
  }
}

/*
// 생성
const monthlyCount = await service.createMonthlyCount({
  employeeId: 'uuid',
  userId: 'uuid',
  workerType: 'SPECIAL',
  employeeName: '홍길동'
});

// 급여 정보 업데이트
await service.updateMonthlyCount(id, {
  youthSalaryPerEmployeeYear2: 3000000,
  middleSalaryPerEmployeeYear2: 4000000
});

// 특정 연도 급여 합계 계산
const salarySum = await service.calculateYearSalarySum('user-uuid', 2);
*/
