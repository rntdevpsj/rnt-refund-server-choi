/* eslint-disable prefer-const */
import * as T from './calculate-util.types'
import { CalculateBasicUtils } from './calculate-basics.utils'
import { RefundHelper } from './calculate-refund-helper.utils'
import { HometaxFillingPersonModel } from 'src/refund/database/entity/hometax_filling_person.entity'
import { HometaxFillingCorporateModel } from 'src/refund/database/entity/hometax_filling_corporate.entity'
import { SocialInsuranceTaxCreditModel } from 'src/refund/database/entity/social_insurance_tax_credit.entity'
import { IncreaseEmployeeTaxCreditModel } from 'src/refund/database/entity/increase_employee_tax_credit.entity'
import { IntegrateMonthlyCountModel } from 'src/refund/database/entity/integrate-monthly-count.entity'
import { RefundYearlyModel } from 'src/refund/database/entity/refund_yearly.entity'

export class CalculateRefundYearly {
  private static renameProperties = (obj: any, newKeyName: string) => {
    let result = {}
    Object.entries(obj).forEach(([key, value]) => {
      const yearIndex = key.slice(-1)
      const newKey = `${newKeyName}Year${yearIndex}`
      result[newKey] = value
    })
    return result
  }

  private static setBaseData = (
    hometaxFilling:
      | Partial<HometaxFillingPersonModel>
      | Partial<HometaxFillingCorporateModel>,
    socialCredit: Partial<SocialInsuranceTaxCreditModel>,
    increaseCredit: Partial<IncreaseEmployeeTaxCreditModel>,
    integrateCredit: Partial<IntegrateMonthlyCountModel>,
    refundLimit:
      | Partial<HometaxFillingPersonModel>
      | Partial<HometaxFillingCorporateModel>,
  ): Partial<RefundYearlyModel> => {
    const hometaxFillingBaseDataArr = [
      'surplusTax',
      'paidAgriculturalTax',
      'refundLimit',
    ].map(dataType =>
      CalculateBasicUtils.pickPropertiesFromObject(hometaxFilling, dataType),
    )

    const socialTotalCredit = this.renameProperties(
      CalculateBasicUtils.pickPropertiesFromObject(socialCredit, 'totalCredit'),
      'socialInsuranceTotalCredit',
    )
    const socialTotalPay = this.renameProperties(
      CalculateBasicUtils.pickPropertiesFromObject(
        socialCredit,
        'totalPaidTax',
      ),
      'socialInsuranceTotalPayTax',
    )
    const increaseTotalCredit = this.renameProperties(
      CalculateBasicUtils.pickPropertiesFromObject(
        increaseCredit,
        'totalCredit',
      ),
      'increaseTotalCredit',
    )
    const increaseTotalPay = this.renameProperties(
      CalculateBasicUtils.pickPropertiesFromObject(
        increaseCredit,
        'totalPaidTax',
      ),
      'increaseTotalPayTax',
    )
    const integrateTotalCredit = this.renameProperties(
      CalculateBasicUtils.pickPropertiesFromObject(
        integrateCredit,
        'totalCredit',
      ),
      'integrateTotalCredit',
    )
    const integrateTotalPay = this.renameProperties(
      CalculateBasicUtils.pickPropertiesFromObject(
        integrateCredit,
        'totalPaidTax',
      ),
      'integrateTotalPayTax',
    )
    const refundLimitation = CalculateBasicUtils.pickPropertiesFromObject(
      refundLimit,
      'refundLimit',
    )
    return Object.assign(
      {},
      ...hometaxFillingBaseDataArr,
      refundLimitation,
      socialTotalCredit,
      socialTotalPay,
      increaseTotalCredit,
      increaseTotalPay,
      integrateTotalCredit,
      integrateTotalPay,
    )
  }

  public static calculateRefundYearlyData = (
    userId: string,
    hometaxFilling:
      | Partial<HometaxFillingPersonModel>
      | Partial<HometaxFillingCorporateModel>,
    refundLimit:
      | Partial<HometaxFillingPersonModel>
      | Partial<HometaxFillingCorporateModel>,
    socialInsuranceCredit: Partial<SocialInsuranceTaxCreditModel>,
    increaseCredit: Partial<IncreaseEmployeeTaxCreditModel>,
    integrateCredit: Partial<IntegrateMonthlyCountModel>,
    corpBool: boolean,
  ): Partial<RefundYearlyModel> => {
    const refundBaseData = this.setBaseData(
      hometaxFilling,
      socialInsuranceCredit,
      increaseCredit,
      integrateCredit,
      refundLimit,
    )

    // return this.calculateYearlyRefund(userId, refundBaseData, corpBool)
    const refundYearly = this.calculateYearlyRefund(
      userId,
      refundBaseData,
      corpBool,
    )
    console.log(`${userId}: 연도별 공제액 등 계산:`, refundYearly)
    return refundYearly
  }

  public static setRefundLimit = (
    report:
      | Partial<HometaxFillingPersonModel>
      | Partial<HometaxFillingCorporateModel>,
    corpBool: boolean,
    period: T.RectificationPeriod,
  ):
    | Partial<HometaxFillingPersonModel>
    | Partial<HometaxFillingCorporateModel> => {
    let result = {}
    const yearIdxes = [1, 2, 3, 4, 5]
    const rectYearsObject = Object.fromEntries(
      yearIdxes.map(yearIdx => [yearIdx, period.startYear + (yearIdx - 1)]),
    )
    // 개인사업자인 경우
    if (!corpBool) {
      yearIdxes.forEach(yearIdx => {
        const businessIncome = report[`businessIncomeYear${yearIdx}`]
        const totalIncome = report[`totalIncomeYear${yearIdx}`]
        const taxReductionIncluded =
          report[`taxReductionIncludedYear${yearIdx}`]
        const taxCreditIncluded = report[`taxCreditIncludedYear${yearIdx}`]
        const determinedTax = report[`determinedTaxYear${yearIdx}`]

        const businessIncomeRate =
          businessIncome > 0
            ? Number((businessIncome / totalIncome).toFixed(4))
            : 0

        const businessTax = Math.floor(
          report[`calculatedTaxYear${yearIdx}`] * businessIncomeRate,
        )

        const criteria =
          report[`taxationStandardYear${yearIdx}`] +
          report[`incomeDeductionYear${yearIdx}`]
        const { taxRate, reduction } = RefundHelper.getExactTaxRateAndReduction(
          criteria,
          rectYearsObject[yearIdx],
          corpBool,
        )

        const calculatedTaxForMinimumTax =
          (criteria * taxRate - reduction) * businessIncomeRate

        const minimumTax =
          calculatedTaxForMinimumTax <= 30000000
            ? Math.floor(calculatedTaxForMinimumTax * 0.35)
            : Math.floor(
                10500000 + (calculatedTaxForMinimumTax - 30000000) * 0.45,
              )

        const refundLimit = Math.min(
          businessTax - minimumTax - taxReductionIncluded - taxCreditIncluded,
          determinedTax,
        )
        result[`businessIncomeRateYear${yearIdx}`] = businessIncomeRate
        result[`refundLimitYear${yearIdx}`] = refundLimit
      })
    }
    // 법인사업자인 경우
    else {
      yearIdxes.forEach(yearIdx => {
        const taxReductionIncluded =
          report[`taxReductionIncludedYear${yearIdx}`]
        const taxCreditIncluded = report[`taxCreditIncludedYear${yearIdx}`]
        const taxationStandard = report[`taxationStandardYear${yearIdx}`]
        const determinedTax = report[`determinedTaxYear${yearIdx}`]

        const minimumTax = Math.floor(taxationStandard * 0.07)
        const refundLimit = Math.min(
          minimumTax - taxReductionIncluded - taxCreditIncluded,
          determinedTax,
        )
        result[`refundLimitYear${yearIdx}`] = refundLimit
      })
    }
    return result
  }

  private static calculateYearlyRefund = (
    userId: string,
    baseData: Partial<RefundYearlyModel>,
    corpBool: boolean,
  ): Partial<RefundYearlyModel> => {
    let result = { userId }

    for (let i = 1; i <= 5; i++) {
      // 연도별 baseData 항목들 가져옴
      const limit: number = baseData[`refundLimitYear${i}`] ?? 0
      const socialTotal: number =
        baseData[`socialInsuranceTotalCreditYear${i}`] ?? 0
      const increaseTotal: number = baseData[`increaseTotalCreditYear${i}`] ?? 0
      const integrateTotal: number =
        baseData[`integrateTotalCreditYear${i}`] ?? 0
      const socialPay: number =
        baseData[`socialInsuranceTotalPayTaxYear${i}`] ?? 0
      const increasePay: number = baseData[`increaseTotalPayTaxYear${i}`] ?? 0
      const integratePay: number = baseData[`integrateTotalPayTaxYear${i}`] ?? 0
      const agriculturalPaid: number =
        baseData[`paidAgriculturalTaxYear${i}`] ?? 0
      const surplusTax: number = baseData[`surplusTaxYear${i}`] ?? 0

      // 연도별 전기이월세액공제액
      const prevSocialCarried: number =
        result[`socialInsuranceCarriedTaxYear${i - 1}`] ?? 0
      const prevIncreaseCarried: number =
        result[`increaseCarriedTaxYear${i - 1}`] ?? 0
      const prevIntegrateCarried: number =
        result[`integrateCarriedTaxYear${i - 1}`] ?? 0
      // 연도별 공제사용액
      const socialUse: number = Math.min(limit, socialTotal + prevSocialCarried)
      const increaseUse: number = Math.min(
        Math.max(limit - socialUse, 0),
        increaseTotal + prevIncreaseCarried,
      )
      const integrateUse: number = Math.min(
        Math.max(limit - socialUse - increaseUse, 0),
        integrateTotal + prevIntegrateCarried,
      )
      // 연도별 농특세발생액
      const agriculturalTaxCreated: number = Math.floor(
        (increaseUse + integrateUse - increasePay - integratePay) * 0.2,
      )
      // 연도별 차기이월세액
      const socialCarried: number = prevSocialCarried + socialTotal - socialUse
      const increaseCarried: number =
        prevIncreaseCarried + increaseTotal - increaseUse
      const integrateCarried: number =
        prevIntegrateCarried + integrateTotal - integrateUse
      const carriedTotal: number =
        socialCarried + increaseCarried + integrateCarried

      const refundAmt: number = corpBool
        ? socialUse +
          increaseUse +
          integrateUse -
          (socialPay + increasePay + integratePay) -
          (agriculturalTaxCreated - agriculturalPaid)
        : Math.floor(
            (socialUse +
              increaseUse +
              integrateUse -
              (socialPay + increasePay + integratePay)) *
              1.1,
          ) -
          (agriculturalTaxCreated - agriculturalPaid)

      result[`surplusTaxYear${i}`] = surplusTax
      result[`paidAgriculturalTaxYear${i}`] = agriculturalPaid
      result[`refundLimitYear${i}`] = limit
      result[`socialInsuranceYearlyUseCreditYear${i}`] = socialUse
      result[`increaseYearlyUseCreditYear${i}`] = increaseUse
      result[`integrateYearlyUseCreditYear${i}`] = integrateUse
      result[`socialInsuranceCarriedTaxYear${i}`] = socialCarried
      result[`increaseCarriedTaxYear${i}`] = increaseCarried
      result[`integrateCarriedTaxYear${i}`] = integrateCarried
      result[`totalCarriedTaxYear${i}`] = carriedTotal
      result[`createAgriculturalTaxYear${i}`] = agriculturalTaxCreated
      result[`refundAmtYear${i}`] = refundAmt
    }
    return result
  }
}
