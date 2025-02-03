import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WorkerType } from 'src/common/type/refund-enum.types'
import { EmployeeWorkerModel } from '../entity/employee-worker.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class EmployeeWorkerService {
  constructor(
    @InjectRepository(EmployeeWorkerModel)
    private readonly employeeWorkerRepository: Repository<EmployeeWorkerModel>,
  ) {}

  async createEmployeeWorker(
    employee: Partial<EmployeeWorkerModel>,
  ): Promise<EmployeeWorkerModel> {
    try {
      const employeeEntity = this.employeeWorkerRepository.create({
        ...employee,
        workerType: employee.workerType ?? WorkerType.OVER1YEAR,
      })

      return await this.employeeWorkerRepository.save(employeeEntity)
    } catch (error) {
      throw AppException.database('worker 테이블 생성 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async updateTotalSararyPerYear(
    employeeSocialNo: string,
    employeeStartDate: string,
    totalSalary: string,
    boheomYear: number,
    startYear: number,
  ) {
    try {
      const yearIndex = boheomYear - startYear + 1
      const columnName = `totalSalaryPerEmployeeYear${yearIndex}`

      return this.employeeWorkerRepository.update(
        { employeeSocialNo, employeeStartDate },
        { [columnName]: Number(totalSalary) },
      )
    } catch (error) {
      throw AppException.database(
        'worker 테이블 보수총액 수정 실패',
        'system',
        {
          originalError: error.message,
        },
      )
    }
  }

  async getEmployeeWorkers(requestId: string) {
    try {
      const employeeWorkers = await this.employeeWorkerRepository.find({
        where: { userId: requestId },
      })

      return employeeWorkers
    } catch (error) {
      throw AppException.database('worker 테이블 조회 실패', 'system', {
        originalError: error.message,
      })
    }
  }
  /***********************************************************

async createEmployees(
  employees: Partial<EmployeeWorkerModel>[],
): Promise<EmployeeWorkerModel[]> {
  const employeeEntities = this.employeeWorkerRepository.create(employees)
  return await this.employeeWorkerRepository.save(employeeEntities)
}


  async updateEmployees(
    employees: Partial<EmployeeWorkerModel>[],
  ): Promise<EmployeeWorkerModel[]> {
    const validEmployees = employees.filter(employee => employee.id)

    const updatePromises = validEmployees.map(async employee => {
      const existingEmployee = await this.employeeWorkerRepository.findOne({
        where: { id: employee.id },
      })

      // default는 테이블에 row생성시 실행되고 update시 지정안해주면 undefined나 null이 세팅될수 있으니 0으로 초기화화
      if (existingEmployee) {
        // 급여 필드가 없으면 0으로 설정
        for (let i = 1; i <= 5; i++) {
          const field = `totalSalaryPerEmployeeYear${i}`
          if (
            employee[field as keyof EmployeeWorkerModel] === undefined ||
            employee[field as keyof EmployeeWorkerModel] === null
          ) {
            ;(employee as any)[field] = 0
          }
        }

        Object.assign(existingEmployee, employee)
        return await this.employeeWorkerRepository.save(existingEmployee)
      }
      return null
    })

    const updatedEmployees = await Promise.all(updatePromises)
    return updatedEmployees.filter(employee => employee !== null)
  }

  
  async findByUserId(userId: string): Promise<EmployeeWorkerModel[]> {
    return await this.employeeWorkerRepository.find({
      where: { userId },
      relations: ['user', 'company'],
    })
  }

 
  // async findByCompanyId(companyId: string): Promise<EmployeeWorkerModel[]> {
  //   return await this.employeeWorkerRepository.find({
  //     where: { companyId },
  //     relations: ['user', 'company'],
  //   })
  // }

 
  async createEmployee(
    employee: Partial<EmployeeWorkerModel>,
  ): Promise<EmployeeWorkerModel> {
    const employeeEntity = this.employeeWorkerRepository.create({
      ...employee,
      // 급여 필드 기본값 설정
      totalSalaryPerEmployeeYear1: employee.totalSalaryPerEmployeeYear1 ?? 0,
      totalSalaryPerEmployeeYear2: employee.totalSalaryPerEmployeeYear2 ?? 0,
      totalSalaryPerEmployeeYear3: employee.totalSalaryPerEmployeeYear3 ?? 0,
      totalSalaryPerEmployeeYear4: employee.totalSalaryPerEmployeeYear4 ?? 0,
      totalSalaryPerEmployeeYear5: employee.totalSalaryPerEmployeeYear5 ?? 0,
      workerType: employee.workerType ?? WorkerType.OVER1YEAR,
    })

    return await this.employeeWorkerRepository.save(employeeEntity)
  }

 
  async updateEmployee(
    id: string,
    employeeData: Partial<EmployeeWorkerModel>,
  ): Promise<EmployeeWorkerModel> {
    await this.employeeWorkerRepository.update(id, employeeData)
    return await this.employeeWorkerRepository.findOne({
      where: { id },
      relations: ['user', 'company'],
    })
  }

 
  async findByWorkerType(
    workerType: WorkerType,
    companyId?: string,
  ): Promise<EmployeeWorkerModel[]> {
    const where: any = { workerType }
    if (companyId) {
      where.companyId = companyId
    }

    return await this.employeeWorkerRepository.find({
      where,
      relations: ['user', 'company'],
    })
  }


  // async deleteByCompanyId(companyId: string): Promise<void> {
  //   await this.employeeWorkerRepository.delete({ companyId })
  // }


  async deleteByUserId(userId: string): Promise<void> {
    await this.employeeWorkerRepository.delete({ userId })
  }

 
  async findByEmployeeSocialNo(
    employeeSocialNo: string,
    companyId?: string,
  ): Promise<EmployeeWorkerModel[]> {
    const where: any = { employeeSocialNo }
    if (companyId) {
      where.companyId = companyId
    }

    return await this.employeeWorkerRepository.find({
      where,
      relations: ['user', 'company'],
    })
  }

  
  // async findByCompanyIds(companyIds: string[]): Promise<EmployeeWorkerModel[]> {
  //   return await this.employeeWorkerRepository.find({
  //     where: {
  //       companyId: In(companyIds),
  //     },
  //     relations: ['user', 'company'],
  //   })
  // }

  async findOne(id: string): Promise<EmployeeWorkerModel> {
    return await this.employeeWorkerRepository.findOne({
      where: { id },
      relations: ['user', 'company', 'monthlyCount'],
    })
  }
 
  async exists(id: string): Promise<boolean> {
    const count = await this.employeeWorkerRepository.count({
      where: { id },
    })
    return count > 0
  }
  */
}
