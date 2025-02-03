/* eslint-disable @typescript-eslint/no-unused-vars */
import * as T from './calculate-util.types'
import { CalculateBasicUtils } from './calculate-basics.utils'
import { EmployeeWorkerModel } from 'src/refund/database/entity/employee-worker.entity'
import { IncreaseMonthlyCountModel } from 'src/refund/database/entity/increase-monthly-counts.entity'
import { IntegrateMonthlyCountModel } from 'src/refund/database/entity/integrate-monthly-count.entity'
import { WorkerType } from 'src/common/type/refund-enum.types'
import { TotalSalaryYearlyModel } from 'src/refund/database/entity/total-salary-yearly.entity'
import { IncreaseEmployeeYearlyModel } from 'src/refund/database/entity/increase-employee-yearly.entity'
import { IntegrateEmployeeYearlyModel } from 'src/refund/database/entity/integrate-employee-yearly.entity'

export class CalculateEmployeeCount {
  private static isValidEndDate = (
    employeeOriginalDataArr: Partial<EmployeeWorkerModel>[],
    period: T.RectificationPeriod,
  ): boolean => {
    return employeeOriginalDataArr.some(employeeData => {
      const endDate = Number(employeeData['employeeEndDate'] as string) ?? 9999
      return endDate >= period.startYear
    })
  }
  private static insertHyphenOnDate = (dateString: string): string => {
    if (dateString.length > 8) {
      return dateString
    }
    const year = dateString.slice(0, 4)
    const month = dateString.slice(4, 6)
    const day = dateString.slice(6)
    return `${year}-${month}-${day}`
  }
  private static changeToDateType = (dateString: string): Date => {
    return new Date(dateString)
  }
  private static hasThreeOrMoreDecimals = (num: number): boolean => {
    return /\.\d{3,}/.test(num.toString())
  }
  private static getBirthDay = (socialNumber: string): Date => {
    const dob = socialNumber.slice(0, 6)
    return Number(dob.slice(0, 2)) > 20
      ? new Date(`19${dob.slice(0, 2)}-${dob.slice(2, 4)}-${dob.slice(4)}`)
      : new Date(`20${dob.slice(0, 2)}-${dob.slice(2, 4)}-${dob.slice(4)}`)
  }
  private static calculateConditionChangeDate = (
    birthDate: Date,
    integratedBool: boolean,
  ): Date => {
    return integratedBool
      ? new Date(birthDate.setFullYear(birthDate.getFullYear() + 35))
      : new Date(birthDate.setFullYear(birthDate.getFullYear() + 30))
  }

  // validation static method: tb_employee_worker의 데이터 검증하여 프로세스 실행 여부 판단 //
  private static validateEmployeeData = (
    employeeOriginalDataArr: Partial<EmployeeWorkerModel>[],
    period: T.RectificationPeriod,
  ): T.ValidationError | null => {
    if (employeeOriginalDataArr.length === 0) {
      return {
        message: '직원 데이터가 존재하지 않습니다.',
        code: 'INVALID_STRUCTURE',
      }
    }
    if (!this.isValidEndDate(employeeOriginalDataArr, period)) {
      return {
        message: '경정청구 계산에 유효한 직원 데이터가 없습니다.',
        code: 'INVALID_STRUCTURE',
      }
    }
    return null
  }
  // 실제 프로세스 //
  public static calculateEmployeeCountData = (
    userId: string,
    employeeOriginalDataArr: Partial<EmployeeWorkerModel>[],
    period: T.RectificationPeriod,
    corpBool: boolean,
  ): Partial<T.CalculateResult> => {
    try {
      // 데이터 검증 단계
      const validationError = this.validateEmployeeData(
        employeeOriginalDataArr,
        period,
      )
      if (validationError) {
        return {
          increaseMonthlyCounts: null,
          integrateMonthlyCounts: null,
          increaseEmployeeYearly: null,
          integrateEmployeeYearly: null,
          totalSalaryYearly: null,
          error: validationError,
        }
      }

      // (1) 직원 개인별 고용증대, 통합고용 근무월수 계산하여 객체배열로 반환
      const yearIndexes = CalculateBasicUtils.yearIndexesOfEmployeeData(period)
      const increaseMonthlyCounts = this.increaseOrIntegrateMonthlyCounts(
        employeeOriginalDataArr,
        period,
        yearIndexes,
        false,
      )
      const integrateMonthlyCounts = this.increaseOrIntegrateMonthlyCounts(
        employeeOriginalDataArr,
        period,
        yearIndexes,
        true,
      )

      // (2) (1)의 객체배열 이용하여 연도별 고용증대 / 통합고용 상시근로자수 계산
      const increaseEmployeeYearly = this.setAverageCount(
        userId,
        this.reduceMonthlyCounts(increaseMonthlyCounts),
        corpBool,
        period,
      )
      this.setYearlyVariation(increaseEmployeeYearly, 1, 'first')
      this.setYearlyVariation(increaseEmployeeYearly, 1, 'second')
      this.setYearlyVariation(increaseEmployeeYearly, 2, 'third')

      const integrateEmployeeYearly = this.setAverageCount(
        userId,
        this.reduceMonthlyCounts(integrateMonthlyCounts),
        corpBool,
        period,
      )
      this.setYearlyVariation(integrateEmployeeYearly, 1, 'first')
      this.setYearlyVariation(integrateEmployeeYearly, 1, 'second')
      this.setYearlyVariation(integrateEmployeeYearly, 2, 'third')

      // (3) (1)의 객체배열 이용하여 청년외, 청년등 총급여 나누기
      const totalSalaryYearly = this.reduceSalary(userId, increaseMonthlyCounts)

      console.log(`${userId}: 고용증대 근무월수 계산`, increaseMonthlyCounts)
      console.log(`${userId}: 통합고용 근무월수 계산`, integrateMonthlyCounts)
      console.log(
        `${userId}: 고용증대 상시근로자 수 계산`,
        increaseEmployeeYearly,
      )
      console.log(
        `${userId}: 통합고용 상시근로자 수 계산`,
        integrateEmployeeYearly,
      )
      console.log(`${userId}: 총급여 계산`, totalSalaryYearly)
      return {
        increaseMonthlyCounts,
        integrateMonthlyCounts,
        increaseEmployeeYearly,
        integrateEmployeeYearly,
        totalSalaryYearly,
        error: null,
      }
    } catch (error) {
      console.log(error.stack)
      return {
        increaseMonthlyCounts: null,
        integrateMonthlyCounts: null,
        increaseEmployeeYearly: null,
        integrateEmployeeYearly: null,
        totalSalaryYearly: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : '직원 데이터 계산 처리 도중 오류가 발생했습니다.',
          code: 'PROCESSING_ERROR',
        },
      }
    }
  }

  private static increaseOrIntegrateMonthlyCounts = (
    employeeOriginalDataArr: Partial<EmployeeWorkerModel>[],
    period: T.RectificationPeriod,
    yearIndexes: T.NumberObject,
    integrateBool: boolean,
  ):
    | Partial<IncreaseMonthlyCountModel>[]
    | Partial<IntegrateMonthlyCountModel>[] => {
    return employeeOriginalDataArr.map(employeeData => {
      const modifiedEmployeeData = this.modifyLeaveDatePerEmployee(
        employeeData,
        period,
      )
      const dates = this.setRectDatesPerEmployee(
        modifiedEmployeeData,
        period,
        integrateBool,
      )
      const monthlyCounts = this.setMonthlyCountsPerEmployee(
        modifiedEmployeeData,
        dates,
        yearIndexes,
      )
      if (!integrateBool) {
        this.divideSalaryPerEmployee(modifiedEmployeeData, monthlyCounts)
      }
      return monthlyCounts
    })
  }

  // 인원계산 메소드 정리 //
  private static modifyLeaveDatePerEmployee = (
    employeeData: Partial<EmployeeWorkerModel>,
    period: T.RectificationPeriod,
  ): Partial<EmployeeWorkerModel> => {
    if (
      !employeeData.hasOwnProperty('employeeEndDate') ||
      employeeData[`employeeEndDate`] === ''
    ) {
      employeeData[`employeeEndDate`] = '9999-12-31'
    }
    if (
      Number(employeeData.employeeEndDate.slice(0, 4)) <
      period.startYear - 1
    ) {
      const {
        employeeId,
        userId,
        workplaceManageNo,
        employeeName,
        employeeSocialNo,
        workerType,
      } = employeeData
      return {
        employeeId,
        userId,
        workplaceManageNo,
        employeeName,
        employeeSocialNo,
        workerType,
      }
    }
    employeeData.employeeStartDate = this.insertHyphenOnDate(
      employeeData.employeeStartDate,
    )
    employeeData.employeeEndDate = this.insertHyphenOnDate(
      employeeData.employeeEndDate,
    )
    return employeeData
  }

  private static setRectDatesPerEmployee = (
    employeeData: Partial<EmployeeWorkerModel>,
    period: T.RectificationPeriod,
    integratedBool: boolean,
  ): T.DatesObject => {
    let result = {}
    if (
      employeeData.employeeStartDate !== '' &&
      employeeData.employeeEndDate !== ''
    ) {
      const { employeeStartDate, employeeEndDate, employeeSocialNo } =
        employeeData

      const hireYear = Number(employeeStartDate.slice(0, 4))
      const leaveYear = Number(employeeEndDate.slice(0, 4))

      const start =
        hireYear >= period.startYear || hireYear === period.startYear - 1
          ? this.changeToDateType(employeeStartDate)
          : new Date(`${period.startYear - 1}-01-01`)

      const end =
        leaveYear <= period.endYear || leaveYear === period.endYear + 1
          ? this.changeToDateType(employeeEndDate)
          : new Date(`${period.endYear + 1}-12-31`)

      const birthDay = this.getBirthDay(employeeSocialNo)
      const conditionChangeDate = this.calculateConditionChangeDate(
        birthDay,
        integratedBool,
      )

      return integratedBool
        ? (result = {
            start: hireYear >= 2022 ? start : new Date('2022-01-01'),
            end,
            conditionChangeDate,
          })
        : (result = { start, end, conditionChangeDate })
    }
    return result
  }

  private static setMonthlyCountsPerEmployee = (
    employeeData: Partial<EmployeeWorkerModel>,
    dates: T.DatesObject,
    yearIdxes: T.NumberObject,
  ):
    | Partial<IncreaseMonthlyCountModel>
    | Partial<IntegrateMonthlyCountModel> => {
    const result = {
      youthMonthlyCountsYear1: 0,
      middleMonthlyCountsYear1: 0,
      totalMonthlyCountsYear1: 0,
      youthMonthlyCountsYear2: 0,
      middleMonthlyCountsYear2: 0,
      totalMonthlyCountsYear2: 0,
      youthMonthlyCountsYear3: 0,
      middleMonthlyCountsYear3: 0,
      totalMonthlyCountsYear3: 0,
      youthMonthlyCountsYear4: 0,
      middleMonthlyCountsYear4: 0,
      totalMonthlyCountsYear4: 0,
      youthMonthlyCountsYear5: 0,
      middleMonthlyCountsYear5: 0,
      totalMonthlyCountsYear5: 0,
      youthMonthlyCountsYear6: 0,
      middleMonthlyCountsYear6: 0,
      totalMonthlyCountsYear6: 0,
      youthMonthlyCountsYear7: 0,
      middleMonthlyCountsYear7: 0,
      totalMonthlyCountsYear7: 0,
    }

    const { employeeId, userId, employeeName, employeeSocialNo, workerType } =
      employeeData
    const { start, end, conditionChangeDate } = dates

    if (
      !employeeData.hasOwnProperty('employeeEndDate') &&
      employeeData.employeeEndDate === ''
    ) {
      return {
        employeeId,
        userId,
        employeeName,
        employeeSocialNo,
        workerType,
        ...result,
      }
    }
    if (
      workerType === WorkerType.SPECIAL ||
      workerType === WorkerType.UNDER1YEAR ||
      workerType === WorkerType.EXCLUDE
    ) {
      return {
        employeeId,
        userId,
        employeeName,
        employeeSocialNo,
        workerType,
        ...result,
      }
    }

    const currentDate = new Date(start.getFullYear(), start.getMonth(), 1)
    while (currentDate <= end) {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const lastDayOfMonth = new Date(year, month + 1, 0)
      const isBeforeConditionChange = lastDayOfMonth < conditionChangeDate
      const isAfterStartDate = lastDayOfMonth >= start
      const isBeforeEndDate = lastDayOfMonth <= end

      if (isAfterStartDate && isBeforeEndDate) {
        const yearIdx = yearIdxes[`${year}`]
        if (isBeforeConditionChange) {
          const youthMonthlyCount =
            (result[`youthMonthlyCountsYear${yearIdx}`] || 0) + 1
          if (workerType === WorkerType.SHORTHALF) {
            result[`youthMonthlyCountsYear${yearIdx}`] =
              (youthMonthlyCount * 0.5 * 100) / 100
          } else {
            result[`youthMonthlyCountsYear${yearIdx}`] = youthMonthlyCount
          }
        } else {
          const middleMonthlyCount =
            (result[`middleMonthlyCountsYear${yearIdx}`] || 0) + 1
          if (workerType === 'SHORTHALF') {
            result[`middleMonthlyCountsYear${yearIdx}`] =
              (middleMonthlyCount * 0.5 * 100) / 100
          } else {
            result[`middleMonthlyCountsYear${yearIdx}`] = middleMonthlyCount
          }
        }
        result[`totalMonthlyCountsYear${yearIdx}`] =
          (result[`youthMonthlyCountsYear${yearIdx}`] || 0) +
          (result[`middleMonthlyCountsYear${yearIdx}`] || 0)
      }
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    return {
      employeeId,
      userId,
      employeeName,
      employeeSocialNo,
      workerType,
      ...result,
    }
  }

  private static divideSalaryPerEmployee = (
    employeeData: Partial<EmployeeWorkerModel>,
    monthlyCounts:
      | Partial<IncreaseMonthlyCountModel>
      | Partial<IntegrateMonthlyCountModel>,
  ): void => {
    if (
      !employeeData.hasOwnProperty('employeeEndDate') &&
      employeeData.employeeEndDate === ''
    ) {
      return
    }
    if (
      employeeData.workerType === WorkerType.SPECIAL ||
      employeeData.workerType === WorkerType.UNDER1YEAR ||
      employeeData.workerType === WorkerType.EXCLUDE
    ) {
      return
    }

    const monthlyCountsMap = new Map(Object.entries(monthlyCounts))
    const salaryData = CalculateBasicUtils.pickPropertiesFromObject(
      employeeData,
      'totalSalary',
    )

    for (const [key, value] of Object.entries(salaryData)) {
      const salaryYearIdx = Number(key.slice(-1))

      const youthCounts =
        (monthlyCountsMap.get(
          `youthMonthlyCountsYear${salaryYearIdx + 1}`,
        ) as number) ?? 0

      const middleCounts =
        (monthlyCountsMap.get(
          `middleMonthlyCountsYear${salaryYearIdx + 1}`,
        ) as number) ?? 0

      const totalCounts = youthCounts + middleCounts

      if ((value as number) > 0) {
        const youthSalary = Math.ceil(
          (value as number) * (youthCounts / totalCounts),
        )
        const middleSalary = Math.ceil(
          (value as number) * (middleCounts / totalCounts),
        )
        monthlyCounts[`youthSalaryPerEmployeeYear${salaryYearIdx + 1}`] =
          youthSalary
        monthlyCounts[`middleSalaryPerEmployeeYear${salaryYearIdx + 1}`] =
          middleSalary
      }
    }
  }

  private static reduceMonthlyCounts = (
    monthlyCountsArr:
      | Partial<IncreaseMonthlyCountModel>[]
      | Partial<IntegrateMonthlyCountModel>[],
  ): T.NumberObject => {
    const monthlyCountsForReduce = monthlyCountsArr.map(
      (
        monthlyCounts:
          | Partial<IncreaseMonthlyCountModel>
          | Partial<IntegrateMonthlyCountModel>,
      ) => {
        return CalculateBasicUtils.pickPropertiesFromObject(
          monthlyCounts,
          'monthlyCounts',
        )
      },
    )
    return monthlyCountsForReduce.reduce((acc, monthlyCounts) => {
      for (const [key, value] of Object.entries(monthlyCounts)) {
        const [type, _, count, year] = key.split(/(?=[A-Z])/)
        acc[`${type}${count}${year}`] =
          (acc[`${type}${count}${year}`] || 0) + (value as number)
      }
      return acc
    }, {})
  }

  private static setAverageCount = (
    userId: string,
    entireMonthlyCounts: T.NumberObject,
    corpBool: boolean,
    period: T.RectificationPeriod,
    businessStartDay: string = '2018-01-01',
  ):
    | Partial<IncreaseEmployeeYearlyModel>
    | Partial<IntegrateEmployeeYearlyModel> => {
    const result = { userId }
    const countsKeys = Object.keys(entireMonthlyCounts)
    const businessStartDate = new Date(businessStartDay)
    const businessStartYear = businessStartDate.getFullYear()

    // 법인사업자인 경우로서 사업개시일이 경정청구 시작연도 - 1년 보다 이후인 경우
    if (corpBool && businessStartYear >= period.startYear - 1) {
      const businessStartMonth = businessStartDate.getMonth()
      countsKeys.forEach(keys => {
        const divisor = keys.includes(String(businessStartYear))
          ? 12 - businessStartMonth
          : 12
        const avgCounts =
          entireMonthlyCounts[keys] ?? 0 / (divisor ? divisor : 1)
        result[keys] = this.hasThreeOrMoreDecimals(avgCounts as number)
          ? Math.floor(avgCounts * 100) / 100
          : (avgCounts as number)
      })
    }
    // 개인사업자인 경우
    else {
      countsKeys.forEach(keys => {
        const avgCounts = entireMonthlyCounts[keys] / 12
        result[keys] = this.hasThreeOrMoreDecimals(avgCounts)
          ? Math.floor(avgCounts * 100) / 100
          : avgCounts
      })
    }
    return result
  }

  private static setYearlyVariation = (
    yearlyCounts:
      | Partial<IncreaseEmployeeYearlyModel>
      | Partial<IntegrateEmployeeYearlyModel>,
    compareCount: number,
    varType: string,
  ): void => {
    const yearIndexes = Array.from({ length: 7 }, (_, i) => i + 1)
    const types = ['youth', 'middle', 'total']
    const startYearIndex: T.NumberObject = {
      first: 1,
      second: 2,
      third: 3,
    }

    for (let i = startYearIndex[varType]; i < yearIndexes.length; i++) {
      const cur = yearIndexes[i]
      const compare = yearIndexes[i - compareCount] ?? 0

      types.forEach(type => {
        const curKey = `${type}CountsYear${cur}`
        const compareKey = `${type}CountsYear${compare}`

        if (
          yearlyCounts.hasOwnProperty(curKey) &&
          yearlyCounts.hasOwnProperty(compareKey)
        ) {
          const variationCount = yearlyCounts[curKey] - yearlyCounts[compareKey]
          yearlyCounts[`${varType}Variation${type}Year${cur}`] =
            Math.round(variationCount * 100) / 100
        }
      })
    }
  }

  private static reduceSalary = (
    userId: string,
    monthlyCountsArr:
      | Partial<IncreaseMonthlyCountModel>[]
      | Partial<IntegrateMonthlyCountModel>[],
  ): Partial<TotalSalaryYearlyModel> => {
    const salaryArrForReduce = monthlyCountsArr.map(monthlyCounts => {
      return CalculateBasicUtils.pickPropertiesFromObject(
        monthlyCounts,
        'salaryPerEmployee',
      )
    })
    return salaryArrForReduce.reduce(
      (acc, salaryData) => {
        for (const [key, value] of Object.entries(salaryData)) {
          const [type, _, __, ___, year] = key.split(/(?=[A-Z])/)
          const yearIndex = Number(year.slice(-1))

          acc[`${type}SalaryYear${yearIndex - 1}`] =
            (acc[`${type}SalaryYear${yearIndex - 1}`] || 0) + (value as number)
          acc[`totalSalaryYear${yearIndex - 1}`] =
            (acc[`youthSalaryYear${yearIndex - 1}`] || 0) +
            (acc[`middleSalaryYear${yearIndex - 1}`] || 0)
        }
        return acc
      },
      { userId },
    )
  }
}
