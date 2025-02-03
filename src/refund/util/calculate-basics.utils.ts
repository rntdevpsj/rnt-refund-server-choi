/* eslint-disable @typescript-eslint/no-unused-vars */
import { NumberObject, RectificationPeriod } from './calculate-util.types'
import { RefundCompanyModel } from 'src/refund/database/entity/refund-company.entity'
import { EmployeeWorkerModel } from 'src/refund/database/entity/employee-worker.entity'

export class CalculateBasicUtils {
  public static getRectificationPeriod = (
    corporateBool: boolean,
  ): RectificationPeriod => {
    const getPeriodYear = (
      criteria: number,
      month: number,
      year: number,
      minus: number,
    ): number => {
      return month > criteria ? year - minus : year - (minus + 1)
    }

    let startYear: number, endYear: number
    const today = new Date()
    const monthOfToday = today.getMonth() + 1
    const yearOfToday = today.getFullYear()
    if (corporateBool) {
      startYear = getPeriodYear(3, monthOfToday, yearOfToday, 5)
      endYear = getPeriodYear(3, monthOfToday, yearOfToday, 1)
    } else {
      startYear = getPeriodYear(5, monthOfToday, yearOfToday, 5)
      endYear = getPeriodYear(5, monthOfToday, yearOfToday, 1)
    }
    return { startYear, endYear }
  }

  public static yearIndexesOfEmployeeData = (
    period: RectificationPeriod,
  ): NumberObject => {
    const years = Array.from({ length: 7 }, (_, i) => period.startYear - 1 + i)
    const yearIndex = Array.from({ length: 7 }, (_, i) => i + 1)
    return years.reduce((acc, key, index) => {
      acc[key] = yearIndex[index]
      return acc
    }, {} as NumberObject)
  }

  public static getYearFromIndex = (
    yearIndex: NumberObject,
    variationYearIdx: number,
  ): string | undefined => {
    return Object.entries(yearIndex).find(
      ([_, value]) => value === variationYearIdx,
    )?.[0]
  }

  public static pickPropertiesFromObject = (obj: any, keyName: string): any => {
    const keyNameRegEx = new RegExp(keyName, 'i')
    return Object.keys(obj).reduce((acc, key) => {
      if (keyNameRegEx.test(key)) {
        acc[key] = obj[key]
      }
      return acc
    }, {})
  }

  public static setEntireLocationType = (
    companyDataArr: Partial<RefundCompanyModel>[],
    employeeDataArr: Partial<EmployeeWorkerModel>[],
    period: RectificationPeriod,
  ): boolean => {
    const tempSet = new Set()
    const employeeWorkplaceManageSet = new Set(
      employeeDataArr
        .filter(
          employeeObj =>
            Number((employeeObj['employeeEndDate'] as string).slice(0, 4)) >=
            period.startYear - 1,
        )
        .map(employeeObj => employeeObj.workplaceManageNo),
    )
    employeeWorkplaceManageSet.forEach(workplaceManageNo => {
      companyDataArr.forEach(companyDataObj => {
        if (companyDataObj.workplaceManageNo === workplaceManageNo)
          tempSet.add(companyDataObj.locationType)
      })
    })
    if (tempSet.has(true)) return true
    else return false
  }
}
