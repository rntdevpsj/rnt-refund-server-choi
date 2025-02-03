/* eslint-disable @typescript-eslint/no-unused-vars */
import * as T from './calculate-util.types'
import { CalculateBasicUtils } from './calculate-basics.utils'
import { IncreaseEmployeeTaxCreditModel } from 'src/refund/database/entity/increase_employee_tax_credit.entity'
import { IntegrateEmployeeTaxCreditModel } from 'src/refund/database/entity/integrate_employee_tax_credit.entity'
import { SocialInsuranceTaxCreditModel } from 'src/refund/database/entity/social_insurance_tax_credit.entity'
import { IncreaseEmployeeYearlyModel } from 'src/refund/database/entity/increase-employee-yearly.entity'
import { IntegrateEmployeeYearlyModel } from 'src/refund/database/entity/integrate-employee-yearly.entity'

export class CreditHelper {
  public static reduceCredit = (
    ...creditObj:
      | Partial<IncreaseEmployeeTaxCreditModel>[]
      | Partial<IntegrateEmployeeTaxCreditModel>[]
      | Partial<SocialInsuranceTaxCreditModel>[]
  ):
    | Partial<IncreaseEmployeeTaxCreditModel>
    | Partial<IntegrateEmployeeTaxCreditModel>
    | Partial<SocialInsuranceTaxCreditModel> => {
    const result = [...creditObj].reduce((acc, credit) => {
      Object.entries(credit).forEach(([key, value]) => {
        const [_, __, employeeType, yearIndex] = key.split(/(?=[A-Z])/)
        if (employeeType === 'total') {
          acc[`totalCredit${yearIndex}`] =
            (acc[`totalCredit${yearIndex}`] || 0) + value
        }
      })
      return acc
    }, {})
    for (let i = 1; i <= 5; i++) {
      if (!result.hasOwnProperty(`totalCreditYear${i}`)) {
        result[`totalCreditYear${i}`] = 0
      }
    }
    return result
  }

  public static reducePay = (
    ...payObj:
      | Partial<IncreaseEmployeeTaxCreditModel>[]
      | Partial<IntegrateEmployeeTaxCreditModel>[]
      | Partial<SocialInsuranceTaxCreditModel>[]
  ):
    | Partial<IncreaseEmployeeTaxCreditModel>
    | Partial<IntegrateEmployeeTaxCreditModel>
    | Partial<SocialInsuranceTaxCreditModel> => {
    const result = [...payObj].reduce((acc, pay) => {
      Object.entries(pay).forEach(([key, value]) => {
        const [_, __, ___, yearIndex] = key.split(/(?=[A-Z])/)
        acc[`totalPaidTax${yearIndex}`] =
          (acc[`totalPaidTax${yearIndex}`] || 0) + value
      })
      return acc
    }, {})
    for (let i = 1; i <= 5; i++) {
      if (!result.hasOwnProperty(`totalPaidTaxYear${i}`)) {
        result[`totalPaidTaxYear${i}`] = 0
      }
    }
    return result
  }

  public static selectPosNegVariation = (
    yearlyCount:
      | Partial<IncreaseEmployeeYearlyModel>
      | Partial<IntegrateEmployeeYearlyModel>,
    variationType: string,
    positiveOrNegative: boolean,
  ): T.NumberObject => {
    const variationObj = CalculateBasicUtils.pickPropertiesFromObject(
      yearlyCount,
      variationType,
    ) as T.NumberObject
    return Object.fromEntries(
      Object.entries(variationObj).filter(([key, value]) => {
        const variationIndex = key.split(/(?=[A-Z])/).slice(-1)[0]
        return (
          typeof value === 'number' &&
          variationIndex !== 'year7' &&
          ((positiveOrNegative && value >= 0) ||
            (!positiveOrNegative && value < 0))
        )
      }),
    )
  }

  private static getHealthInsuranceRate = (year: number): T.NumberObject => {
    const result: T.NumberObject = {
      healthInsuranceRate: 0,
      longTermCareInsuranceRate: 0,
    }
    switch (year) {
      case 2019:
        result.healthInsuranceRate = 3.23
        result.longTermCareInsuranceRate = Number(
          (result.healthInsuranceRate * 0.0851).toFixed(4),
        )
        break

      case 2020:
        result.healthInsuranceRate = 3.335
        result.longTermCareInsuranceRate = Number(
          (result.healthInsuranceRate * 0.1025).toFixed(4),
        )
        break

      case 2021:
        result.healthInsuranceRate = 3.43
        result.longTermCareInsuranceRate = Number(
          (result.healthInsuranceRate * 0.1152).toFixed(4),
        )
        break

      case 2022:
        result.healthInsuranceRate = 3.495
        result.longTermCareInsuranceRate = Number(
          (result.healthInsuranceRate * 0.1227).toFixed(4),
        )
        break

      case 2023:
        result.healthInsuranceRate = 3.545
        result.longTermCareInsuranceRate = Number(
          (result.healthInsuranceRate * 0.1281).toFixed(4),
        )
        break

      case 2024:
        result.healthInsuranceRate = 3.545
        result.longTermCareInsuranceRate = Number(
          (result.healthInsuranceRate * 0.1295).toFixed(4),
        )
        break
    }
    return result
  }

  private static getLaborInsuranceRate = (year: number): number => {
    let result: number = 0
    switch (year) {
      case 2019:
        result = 0.9
        break

      case 2020:
      case 2021:
        result = 1.05
        break

      case 2022:
      case 2023:
      case 2024:
        result = 1.15
        break
    }
    return result
  }

  public static getGenericSocialInsuranceRate = (
    year: number,
  ): T.NumberObject => {
    return Object.assign(
      { pensionInsuranceRate: 4.5 },
      this.getHealthInsuranceRate(year),
      { laborInsuranceRate: this.getLaborInsuranceRate(year) },
    )
  }
}
