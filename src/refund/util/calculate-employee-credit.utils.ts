/* eslint-disable @typescript-eslint/no-unused-vars */
import * as T from './calculate-util.types'
import { CalculateBasicUtils } from './calculate-basics.utils'
import { CreditHelper } from './calculate-credit-helper.utils'
import { IncreaseEmployeeYearlyModel } from 'src/refund/database/entity/increase-employee-yearly.entity'
import { IntegrateEmployeeYearlyModel } from 'src/refund/database/entity/integrate-employee-yearly.entity'
import { IncreaseEmployeeTaxCreditModel } from 'src/refund/database/entity/increase_employee_tax_credit.entity'
import { IntegrateEmployeeTaxCreditModel } from 'src/refund/database/entity/integrate_employee_tax_credit.entity'
import { SocialInsuranceRateModel } from 'src/refund/database/entity/social-insurance-rate.entity'
import { TotalSalaryYearlyModel } from 'src/refund/database/entity/total-salary-yearly.entity'
import { SocialInsuranceTaxCreditModel } from 'src/refund/database/entity/social_insurance_tax_credit.entity'

// 1. 고용증대 세액공제
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
export class CalculateIncreaseEmployeeCredit {
  private static increaseEmploymentCreditAmount = (
    locationBool: boolean,
  ): T.NumberObject => {
    return locationBool
      ? { youth: 11000000, notYouth: 7000000 }
      : { youth: 12000000, notYouth: 7700000 }
  }
  private static increaseMultiplier = (
    year: string,
    employeeType: string,
    locationBool: boolean,
  ): number => {
    const { youth, notYouth } =
      this.increaseEmploymentCreditAmount(locationBool)
    return locationBool === false && (year === '2021' || year === '2022')
      ? employeeType === 'Youth'
        ? 13000000
        : notYouth
      : employeeType === 'Youth'
        ? youth
        : notYouth
  }

  // 데이터 검증 메소드
  private static ValidationEmployeeData = (
    yearlyCount: Partial<IncreaseEmployeeYearlyModel>,
  ): T.ValidationError | null => {
    if (!yearlyCount)
      return {
        message: '고용증대 연도별 상시근로자 수 데이터가 없습니다',
        code: 'NO_EMPLOYEE_DATA',
      }

    if (Object.values(yearlyCount).every(value => value === 0))
      return {
        message: '고용증대 연도별 상시근로자 수 증감이 없습니다',
        code: 'NO_VARIATION',
      }

    const firstYearlyVariation = CalculateBasicUtils.pickPropertiesFromObject(
      yearlyCount,
      'firstVariation',
    )

    if (Object.values(firstYearlyVariation).every((value: number) => value < 0))
      return {
        message: '연도별 상시근로자수가 지속적으로 감소합니다',
        code: 'NEGATIVE_VARIATION',
      }
    return null
  }

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
  // 고용증대 공제 및 납부세액 계산 메인 메소드
  public static calculateIncreaseEmployeeCreditData = (
    userId: string,
    increaseYearlyCount: Partial<IncreaseEmployeeYearlyModel>,
    yearIndexes: T.NumberObject,
    locationBool: boolean,
  ): Partial<T.CalculateResult> => {
    try {
      // 데이터 검증
      const vaildationError = this.ValidationEmployeeData(increaseYearlyCount)
      if (vaildationError)
        return { increaseEmployeeTaxCredit: null, error: vaildationError }

      const posVariation1st = CreditHelper.selectPosNegVariation(
        increaseYearlyCount,
        'firstVariation',
        true,
      )
      const credit1st = this.increaseEmploymentCredit1st(
        posVariation1st,
        yearIndexes,
        locationBool,
      )

      const posVariation2nd = CreditHelper.selectPosNegVariation(
        increaseYearlyCount,
        'secondVariation',
        true,
      )
      const credit2nd = this.increaseEmploymentCredit2nd(
        credit1st,
        posVariation2nd,
        yearIndexes,
        locationBool,
      )

      const posVariation3rd = CreditHelper.selectPosNegVariation(
        increaseYearlyCount,
        'thirdVariation',
        true,
      )
      const credit3rd = this.increaseEmploymentCredit3rd(
        credit1st,
        posVariation2nd,
        posVariation3rd,
        yearIndexes,
        locationBool,
      )

      const negVariation2nd = CreditHelper.selectPosNegVariation(
        increaseYearlyCount,
        'secondVariation',
        false,
      )
      const negVariation3rd = CreditHelper.selectPosNegVariation(
        increaseYearlyCount,
        'thirdVariation',
        false,
      )
      const pay2nd = this.increaseEmploymentPay2nd(
        credit1st,
        negVariation2nd,
        yearIndexes,
        locationBool,
      )
      const pay3rd = this.increaseEmployementPay3rd(
        credit1st,
        credit2nd,
        pay2nd,
        negVariation3rd,
        yearIndexes,
        locationBool,
      )

      const totalCredit = CreditHelper.reduceCredit(
        credit1st,
        credit2nd,
        credit3rd,
      )
      const totalPay = CreditHelper.reducePay(pay2nd, pay3rd)

      console.log(`${userId} : 고용증대 1차분 계산`, credit1st)
      console.log(`${userId} : 고용증대 2차분 계산`, credit2nd)
      console.log(`${userId} : 고용증대 3차분 계산`, credit3rd)
      console.log(`${userId} : 고용증대 2차납부 계산`, pay2nd)
      console.log(`${userId} : 고용증대 3차납부 계산`, pay3rd)
      console.log(`${userId} : 고용증대 공제 총액 계산`, totalCredit)
      console.log(`${userId} : 고용증대 납부 총액 계산`, totalPay)

      return {
        increaseEmployeeTaxCredit: {
          userId,
          ...credit1st,
          ...credit2nd,
          ...credit3rd,
          ...pay2nd,
          ...pay3rd,
          ...totalCredit,
          ...totalPay,
        },
        error: null,
      }
    } catch (error) {
      console.log(error.stack)
      return {
        increaseEmployeeTaxCredit: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : '고용증대 세액공제 계산 중 오류 발생',
          code: 'PROCESSING_ERROR',
        },
      }
    }
  }

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
  // 고용증대 공제 및 납부세액 계산 메소드 정리
  // 고용증대 1차 공제
  private static increaseEmploymentCredit1st = (
    positiveYoY1st: T.NumberObject,
    yearIndexes: T.NumberObject,
    locationBool: boolean,
  ): Partial<IncreaseEmployeeTaxCreditModel> => {
    const resultMap = new Map()
    const positiveYoY1stMap = new Map(Object.entries(positiveYoY1st))

    positiveYoY1stMap.forEach((value, key) => {
      const [creditType, _, employeeType, variationYear] =
        key.split(/(?=[A-Z])/)
      const variationYearIdx = Number(variationYear[variationYear.length - 1])
      const countYear = CalculateBasicUtils.getYearFromIndex(
        yearIndexes,
        variationYearIdx,
      )

      const temp =
        positiveYoY1stMap.get(`${creditType}VariationTotal${variationYear}`) ??
        0
      // 조건 : (1) 상시근로자 수 합계 !== undefined (2) 상시근로자 수 합계 > 0 (3) year < 2023
      if (temp > 0 && Number(countYear) < 2023 && employeeType !== 'Total') {
        // total credit 초기화
        const totalKey = `${creditType}CreditTotalYear${variationYearIdx - 1}`
        if (!resultMap.has(totalKey)) {
          resultMap.set(totalKey, 0)
        }
        const creditMultiplier = this.increaseMultiplier(
          countYear,
          employeeType,
          locationBool,
        )
        // 전체 증가 인원 < 청년외 또는 청년등 증가 인 경우 한도 걸어주기
        const valueForCredit = Math.min(
          value,
          positiveYoY1stMap.get(
            `${creditType}VariationTotal${variationYear}`,
          ) ?? 0,
        )

        const employeeKey = `${creditType}Credit${employeeType}Year${variationYearIdx - 1}`
        resultMap.set(
          employeeKey,
          Math.round(
            (resultMap.get(employeeKey) || 0) +
              valueForCredit * creditMultiplier,
          ),
        )
        resultMap.set(
          totalKey,
          resultMap.get(totalKey) + valueForCredit * creditMultiplier,
        )
      }
    })
    return Object.fromEntries(resultMap)
  }

  // 고용증대 2차 공제
  private static increaseEmploymentCredit2nd = (
    credit1st: Partial<IncreaseEmployeeTaxCreditModel>,
    positiveYoY2nd: T.NumberObject,
    yearIndexes: T.NumberObject,
    locationBool: boolean,
  ): Partial<IncreaseEmployeeTaxCreditModel> => {
    const resultMap = new Map()
    const positiveYoY2ndMap = new Map(Object.entries(positiveYoY2nd))

    positiveYoY2ndMap.forEach((__, key) => {
      const [creditType, _, employeeType, variationYear] =
        key.split(/(?=[A-Z])/)
      // 1차년도 공제금액 가져올때 : variationYearIdx - 2
      // 2차년도 공제 연도 설정할때 : variationYearIdx - 1
      const variationYearIdx = Number(variationYear[variationYear.length - 1])

      // (case 1) 전체 상시근로자 수 유지, 증가한 경우 -> 1차공제분 찾아서 추가할당
      if (
        positiveYoY2ndMap.has(`${creditType}VariationTotal${variationYear}`) &&
        employeeType !== 'Total'
      ) {
        // total credit 초기화
        const totalKey = `${creditType}CreditTotalYear${variationYearIdx - 1}`
        if (!resultMap.has(totalKey)) {
          resultMap.set(totalKey, 0)
        }

        const prevCredit =
          credit1st[`firstCredit${employeeType}Year${variationYearIdx - 2}`] ??
          0
        resultMap.set(
          `${creditType}Credit${employeeType}Year${variationYearIdx - 1}`,
          prevCredit,
        )
        resultMap.set(totalKey, resultMap.get(totalKey) + prevCredit)

        // (case 2) 전체 상시근로자 수 유지, 증가하였는데, 청년외 수 감소 => 1차공제분 중 청년외 금액 찾아서 할당
        if (
          !positiveYoY2ndMap.has(`${creditType}VariationMiddle${variationYear}`)
        ) {
          const prevMiddleCredit =
            credit1st[`firstCreditMiddleYear${variationYearIdx - 2}`] ?? 0
          resultMap.set(
            `${creditType}CreditMiddleYear${variationYearIdx - 1}`,
            prevMiddleCredit,
          )
          resultMap.set(totalKey, resultMap.get(totalKey) + prevMiddleCredit)
        }

        // (case 3) 전체 상시근로자 수 유지, 증가 but 청년등 수 감소 => 청년등 증가분을 청년외 증가분으로 할당
        if (
          !positiveYoY2ndMap.has(`${creditType}VariationYouth${variationYear}`)
        ) {
          const prevCreditYouth =
            credit1st[`firstCreditYouthYear${variationYearIdx - 2}`] ?? 0

          const prevCreditYear = CalculateBasicUtils.getYearFromIndex(
            yearIndexes,
            variationYearIdx - 2,
          )
          const divider = this.increaseMultiplier(
            prevCreditYear,
            'Youth',
            locationBool,
          )
          const creditMultiplier = this.increaseMultiplier(
            prevCreditYear,
            'Middle',
            locationBool,
          )

          const calculated = Math.round(
            (prevCreditYouth * creditMultiplier) / divider,
          )
          resultMap.set(
            `${creditType}CreditMiddleYear${variationYearIdx - 1}`,
            (resultMap.get(
              `${creditType}CreditMiddleYear${variationYearIdx - 1}`,
            ) || 0) + calculated,
          )
          resultMap.set(totalKey, resultMap.get(totalKey) + calculated)
        }
      }
    })
    return Object.fromEntries(resultMap)
  }

  // 고용증대 3차 공제
  private static increaseEmploymentCredit3rd = (
    credit1st: Partial<IncreaseEmployeeTaxCreditModel>,
    positiveYoY2nd: T.NumberObject,
    positiveYoY3rd: T.NumberObject,
    yearIndexes: T.NumberObject,
    locationBool: boolean,
  ): Partial<IncreaseEmployeeTaxCreditModel> => {
    const resultMap = new Map()
    const positiveYoY3rdMap = new Map(Object.entries(positiveYoY3rd))

    positiveYoY3rdMap.forEach((__, key) => {
      const [creditType, _, employeeType, variationYear] =
        key.split(/(?=[A-Z])/)
      // yearIndex 설정
      const variationYearIdx = Number(variationYear.slice(-1))
      const creditYear = variationYearIdx - 1
      const firstCreditYear = variationYearIdx - 3

      // case 1 : 3차연도 및 2차연도 전체 상시근로자수 유지, 증가
      if (
        positiveYoY3rdMap.has(`thirdVariationTotalYear${variationYearIdx}`) &&
        positiveYoY2nd[`secondVariationTotalYear${variationYearIdx - 1}`] !==
          undefined &&
        employeeType !== 'Total'
      ) {
        // total 값 초기화
        const totalCreditKey = `${creditType}CreditTotalYear${creditYear}`
        if (!resultMap.has(totalCreditKey)) {
          resultMap.set(totalCreditKey, 0)
        }

        // 1차년도 공제액 할당
        const prePrevCredit =
          credit1st[`firstCredit${employeeType}Year${firstCreditYear}`] || 0
        resultMap.set(
          `${creditType}Credit${employeeType}Year${creditYear}`,
          prePrevCredit,
        )
        resultMap.set(
          totalCreditKey,
          resultMap.get(totalCreditKey) + prePrevCredit,
        )

        // case 1-1 : 3차 및 2차연도 전체 인원 유지, 증가 but 청년 외만 감소
        if (
          !positiveYoY3rdMap.has(`thirdVariationMiddleYear${variationYearIdx}`)
        ) {
          const prePrevMiddleCredit =
            credit1st[`firstCreditMiddleYear${firstCreditYear}`] || 0
          resultMap.set(
            `${creditType}CreditMiddleYear${creditYear}`,
            prePrevMiddleCredit,
          )
          resultMap.set(
            totalCreditKey,
            resultMap.get(totalCreditKey) + prePrevMiddleCredit,
          )
        }

        // case 1-2 : 3차 및 2차연도 전체 인원 유지, 증가 but 청년 등만 감소
        if (
          !positiveYoY3rdMap.has(`thirdVariationYouthYear${variationYearIdx}`)
        ) {
          const prePrevYouthCredit =
            credit1st[`firstCreditYouthYear${firstCreditYear}`] || 0
          const prePrevCreditYear = CalculateBasicUtils.getYearFromIndex(
            yearIndexes,
            firstCreditYear,
          )
          const divider = this.increaseMultiplier(
            prePrevCreditYear,
            'Youth',
            locationBool,
          )
          const creditMultiplier = this.increaseMultiplier(
            prePrevCreditYear,
            'Middle',
            locationBool,
          )
          const calculated = Math.round(
            (prePrevYouthCredit * creditMultiplier) / divider,
          )

          resultMap.set(
            `${creditType}CreditMiddleYear${creditYear}`,
            (resultMap.get(`${creditType}CreditMiddleYear${creditYear}`) || 0) +
              calculated,
          )
          resultMap.set(
            totalCreditKey,
            resultMap.get(totalCreditKey) + calculated,
          )
        }
      }
    })
    return Object.fromEntries(resultMap)
  }

  // 고용증대 2차년도 추가납부
  private static increaseEmploymentPay2nd = (
    credit1st: Partial<IncreaseEmployeeTaxCreditModel>,
    negativeYoY2nd: T.NumberObject,
    yearIndexes: T.NumberObject,
    locationBool: boolean,
  ): Partial<IncreaseEmployeeTaxCreditModel> => {
    const credit1stMap = new Map(Object.entries(credit1st))
    const resultMap = new Map()

    for (const [payType, _, __, variationYear] of Object.keys(
      negativeYoY2nd,
    ).map(key => key.split(/(?=[A-Z])/))) {
      const variationYearIdx = Number(variationYear.slice(-1))
      const countYear = CalculateBasicUtils.getYearFromIndex(
        yearIndexes,
        variationYearIdx,
      )
      const prevYear = CalculateBasicUtils.getYearFromIndex(
        yearIndexes,
        variationYearIdx - 1,
      )

      const temp =
        (credit1stMap.get(
          `firstCreditTotalYear${variationYearIdx - 2}`,
        ) as number) ?? 0
      // (1) 1차공제 금액이 있고 그 금액이 0보다 크며, (2) 추가납부를 최초로 계산하는 loop이며, (3) 감소연도가 2020년이 아닌 경우만
      if (
        temp <= 0 ||
        resultMap.has(`firstPaidTaxYear${variationYearIdx - 1}`) ||
        countYear === '2020'
      ) {
        continue
      }

      // 감소인원 및 추가납부 계산시 곱할 금액 가져옴
      const youthVariation =
        negativeYoY2nd[`${payType}VariationYouthYear${variationYearIdx}`]
      const middleVariation =
        negativeYoY2nd[`${payType}VariationMiddleYear${variationYearIdx}`]
      const totalVariation =
        negativeYoY2nd[`${payType}VariationTotalYear${variationYearIdx}`]

      const youthDecreased = Math.abs(youthVariation ?? 0)
      const middleDecreased = Math.abs(middleVariation ?? 0)
      const totalDecreased = Math.abs(totalVariation ?? 0)

      const youthMultiplier = this.increaseMultiplier(
        prevYear,
        'Youth',
        locationBool,
      )
      const middleMultiplier = this.increaseMultiplier(
        prevYear,
        'Middle',
        locationBool,
      )

      let calculatedAmount = 0
      if (totalDecreased > 0) {
        if (totalDecreased > youthDecreased) {
          // case 1 : 전체 상시근로자수 감소, 전체 감소 > 청년등 감소
          const youthDecreasedForCalculation = Math.min(
            youthDecreased,
            totalDecreased,
          )
          const middleDecreasedForCalculation = Math.min(
            middleDecreased,
            totalDecreased,
          )
          calculatedAmount =
            youthDecreasedForCalculation * youthMultiplier +
            middleDecreasedForCalculation * middleMultiplier
        } else {
          // case 2 : 전체 상시근로자수 감소, 전체 감소 <= 청년등 감소
          calculatedAmount =
            (youthDecreased - totalDecreased) *
              (youthMultiplier - middleMultiplier) +
            totalDecreased * youthMultiplier
        }
      } else if (
        youthDecreased > 0 &&
        credit1stMap.get(`firstCreditYouthYear${variationYearIdx - 2}`) !==
          undefined
      ) {
        // case 3 : 전체 상시근로자수 유지, 증가, 청년등 만 감소
        calculatedAmount = youthDecreased * (youthMultiplier - middleMultiplier)
      }

      const limitation =
        (credit1stMap.get(
          `firstCreditTotalYear${variationYearIdx - 2}`,
        ) as number) ?? 0
      resultMap.set(
        `firstPaidTaxYear${variationYearIdx - 1}`,
        Math.min(calculatedAmount, limitation),
      )
    }
    return Object.fromEntries(resultMap)
  }

  // 고용증대 3차년도 추가납부
  private static increaseEmployementPay3rd = (
    credit1st: Partial<IncreaseEmployeeTaxCreditModel>,
    credit2nd: Partial<IncreaseEmployeeTaxCreditModel>,
    pay2nd: Partial<IncreaseEmployeeTaxCreditModel>,
    negativeYoY3rd: T.NumberObject,
    yearIndexes: T.NumberObject,
    locationBool: boolean,
  ): Partial<IncreaseEmployeeTaxCreditModel> => {
    const credit1stMap = new Map(Object.entries(credit1st))
    const credit2ndMap = new Map(Object.entries(credit2nd))
    const resultMap = new Map()

    for (const [payType, _, __, variationYear] of Object.keys(
      negativeYoY3rd,
    ).map(key => key.split(/(?=[A-Z])/))) {
      const variationYearIdx = Number(variationYear.slice(-1))
      const countYear = CalculateBasicUtils.getYearFromIndex(
        yearIndexes,
        variationYearIdx,
      )
      const criteriaYear = CalculateBasicUtils.getYearFromIndex(
        yearIndexes,
        variationYearIdx - 2,
      )

      const temp =
        (credit1stMap.get(
          `firstCreditTotalYear${variationYearIdx - 3}`,
        ) as number) ?? 0
      if (
        temp <= 0 ||
        resultMap.has(`secondPaidTaxYear${variationYearIdx - 1}`) ||
        countYear === '2020'
      ) {
        continue
      }
      const youthVariation =
        negativeYoY3rd[`${payType}VariationYouthYear${variationYearIdx}`]
      const middleVariation =
        negativeYoY3rd[`${payType}VariationMiddleYear${variationYearIdx}`]
      const totalVariation =
        negativeYoY3rd[`${payType}VariationTotalYear${variationYearIdx}`]

      const youthDecreased = Math.abs(youthVariation ?? 0)
      const middleDecreased = Math.abs(middleVariation ?? 0)
      const totalDecreased = Math.abs(totalVariation ?? 0)

      const youthMultiplier = this.increaseMultiplier(
        criteriaYear,
        'Youth',
        locationBool,
      )
      const middleMultiplier = this.increaseMultiplier(
        criteriaYear,
        'Middle',
        locationBool,
      )

      let calculatedAmount = 0

      // 공제받은 총 횟수 계산
      let prevCreditCount = 0
      if (credit1stMap.has(`firstCreditTotalYear${variationYearIdx - 3}`))
        prevCreditCount++
      if (credit2ndMap.has(`secondCreditTotalYear${variationYearIdx - 2}`))
        prevCreditCount++

      // 기존 추가납부세액 가져오기
      const prevPaid = pay2nd[`firstPaidTaxYear${variationYearIdx - 2}`] ?? 0

      const totalLimit =
        ((credit1stMap.get(
          `firstCreditTotalYear${variationYearIdx - 3}`,
        ) as number) ?? 0) +
        ((credit2ndMap.get(
          `secondCreditTotalYear${variationYearIdx - 2}`,
        ) as number) ?? 0)

      if (totalDecreased > 0) {
        if (totalDecreased > youthDecreased) {
          // case 1 : 전체 상시근로자 수 감소, 전체 감소 > 청년등 감소
          const youthDecreasedForCalculation = Math.min(
            youthDecreased,
            totalDecreased,
          )
          const middleDecreasedForCalculation = Math.min(
            middleDecreased,
            totalDecreased,
          )

          calculatedAmount = Math.min(
            (youthDecreasedForCalculation * youthMultiplier +
              middleDecreasedForCalculation * middleMultiplier) *
              prevCreditCount,
            totalLimit,
          )
        } else {
          // case 2 : 전체 상시근로자 수 감소, 전체 감소 <= 청년등 감소
          calculatedAmount = Math.min(
            ((youthDecreased - totalDecreased) *
              (youthMultiplier - middleMultiplier) +
              totalDecreased * youthMultiplier) *
              prevCreditCount,
            totalLimit,
          )
        }
      } else if (
        youthDecreased > 0 &&
        credit1stMap.get(`firstCreditYouthYear${variationYearIdx - 3}`) !==
          undefined
      ) {
        // case 3 : 전체 상시근로자 수 유지 또는 증가, 청년등 감소
        calculatedAmount = Math.min(
          youthDecreased *
            (youthMultiplier - middleMultiplier) *
            prevCreditCount,
          totalLimit,
        )
      }
      resultMap.set(
        `secondPaidTaxYear${variationYearIdx - 1}`,
        Math.min(calculatedAmount - prevPaid, totalLimit),
      )
    }
    return Object.fromEntries(resultMap)
  }
}

// 2. 통합고용 세액공제
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
export class CalculateIntegrateEmployeeCredit {
  private static integratedEmploymentCreditAmount = (
    locationBool: boolean,
  ): T.NumberObject => {
    return locationBool
      ? { youth: 14500000, notYouth: 8500000 }
      : { youth: 15500000, notYouth: 9500000 }
  }

  private static integratedMultiplier = (
    employeeType: string,
    locationBool: boolean,
  ): number => {
    const { youth, notYouth } =
      this.integratedEmploymentCreditAmount(locationBool)
    return employeeType === 'Youth' ? youth : notYouth
  }

  // 데이터 검증 메소드
  private static validationEmployeeData = (
    yearlyCount: Partial<IntegrateEmployeeYearlyModel>,
  ): T.ValidationError | null => {
    if (!yearlyCount)
      return {
        message: '통합고용 연도별 상시근로자 수 데이터가 없습니다',
        code: 'NO_EMPLOYEE_DATA',
      }

    if (Object.values(yearlyCount).every(value => value === 0))
      return {
        message: '통합고용 연도별 상시근로자 수 증감이 없습니다',
        code: 'NO_VARIATION',
      }

    const firstYearlyVariation = CalculateBasicUtils.pickPropertiesFromObject(
      yearlyCount,
      'first_variation',
    )

    if (Object.values(firstYearlyVariation).every((value: number) => value < 0))
      return {
        message: '연도별 상시근로자수가 지속적으로 감소합니다',
        code: 'NEGATIVE_VARIATION',
      }
    return null
  }
  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //

  // 통합고용 공제 및 납부세액 계산 메인 메소드
  public static calculateIntegrateEmployeeCreditData = (
    userId: string,
    integrateYearlyCount: Partial<IntegrateEmployeeYearlyModel>,
    yearIndexes: T.NumberObject,
    locationBool: boolean,
  ): Partial<T.CalculateResult> => {
    try {
      const validateError = this.validationEmployeeData(integrateYearlyCount)
      if (validateError)
        return { integrateEmployeeTaxCredit: null, error: validateError }

      const posVariation1st = CreditHelper.selectPosNegVariation(
        integrateYearlyCount,
        'firstVariation',
        true,
      )
      const credit1st = this.integratedEmployementCredit1st(
        posVariation1st,
        yearIndexes,
        locationBool,
      )

      const posVariation2nd = CreditHelper.selectPosNegVariation(
        integrateYearlyCount,
        'secondVariation',
        true,
      )
      const credit2nd = this.integratedEmploymentCredit2nd(
        credit1st,
        posVariation2nd,
        locationBool,
      )

      const posVariation3rd = CreditHelper.selectPosNegVariation(
        integrateYearlyCount,
        'thirdVariation',
        true,
      )
      const credit3rd = this.integratedEmploymentCredit3rd(
        credit1st,
        posVariation2nd,
        posVariation3rd,
        true,
      )

      const negVariation2nd = CreditHelper.selectPosNegVariation(
        integrateYearlyCount,
        'secondVariation',
        false,
      )
      const negVariation3rd = CreditHelper.selectPosNegVariation(
        integrateYearlyCount,
        'thirdVariation',
        false,
      )
      const pay2nd = this.integratedEmploymentPay2nd(
        credit1st,
        negVariation2nd,
        locationBool,
      )
      const pay3rd = this.integratedEmploymentPay3rd(
        credit1st,
        credit2nd,
        pay2nd,
        negVariation3rd,
        locationBool,
      )

      const totalCredit = CreditHelper.reduceCredit(
        credit1st,
        credit2nd,
        credit3rd,
      )
      const totalPay = CreditHelper.reducePay(pay2nd, pay3rd)

      console.log(`${userId} : 통합고용 1차분 계산`, credit1st)
      console.log(`${userId} : 통합고용 2차분 계산`, credit2nd)
      console.log(`${userId} : 통합고용 3차분 계산`, credit3rd)
      console.log(`${userId} : 통합고용 2차납부 계산`, pay2nd)
      console.log(`${userId} : 통합고용 3차납부 계산`, pay3rd)
      console.log(`${userId} : 통합고용 공제 총액 계산`, totalCredit)
      console.log(`${userId} : 통합고용 납부 총액 계산`, totalPay)

      return {
        integrateEmployeeTaxCredit: {
          userId,
          ...credit1st,
          ...credit2nd,
          ...credit3rd,
          ...pay2nd,
          ...pay3rd,
          ...totalCredit,
          ...totalPay,
        },
        error: null,
      }
    } catch (error) {
      console.log(error.stack)
      return {
        integrateEmployeeTaxCredit: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : '통합고용 세액공제 계산 도중 오류 발생',
          code: 'PROCESSING_ERROR',
        },
      }
    }
  }

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
  // 통합고용 공제 및 납부세액 계산 메소드 정리
  // 통합고용 1차 공제
  private static integratedEmployementCredit1st = (
    positiveYoY1st: T.NumberObject,
    yearIndexes: T.NumberObject,
    locationBool: boolean,
  ): Partial<IntegrateEmployeeTaxCreditModel> => {
    const resultMap = new Map()
    const positiveYoY1stMap = new Map(Object.entries(positiveYoY1st))

    positiveYoY1stMap.forEach((value, key) => {
      //creditType : first, second, third, employeeType: youth, middle, total, variationYearIdx : year1 ~ year7
      const [creditType, _, employeeType, variationYear] =
        key.split(/(?=[A-Z])/)
      const variationYearIdx = Number(variationYear[variationYear.length - 1])
      const countYear = CalculateBasicUtils.getYearFromIndex(
        yearIndexes,
        variationYearIdx,
      )

      const temp =
        positiveYoY1stMap.get(`${creditType}VariationTotal${variationYear}`) ??
        0
      // 조건 : (1) 1차증감 합계액 존재 / (2) 증감 합계 > 0 / (3) 연도 >= 2023년 / (4) 증감 total 제외
      if (temp > 0 && Number(countYear) >= 2023 && employeeType !== 'total') {
        // total credit 초기화
        const totalKey = `${creditType}CreditTotalYear${variationYearIdx - 1}`
        if (!resultMap.has(totalKey)) {
          resultMap.set(totalKey, 0)
        }

        // 곱할 금액 가져오기
        const creditMultiplier = this.integratedMultiplier(
          employeeType,
          locationBool,
        )
        // 전체 증가 인원 < 청년외 또는 청년등 증가 인 경우 한도 걸어주기
        const valueForCredit = Math.min(
          value,
          positiveYoY1stMap.get(
            `${creditType}VariationTotal${variationYear}`,
          ) ?? 0,
        )
        const employeeKey = `${creditType}Credit${employeeType}Year${variationYearIdx - 1}`
        resultMap.set(
          employeeKey,
          (resultMap.get(employeeKey) || 0) + valueForCredit * creditMultiplier,
        )
        resultMap.set(
          totalKey,
          resultMap.get(totalKey) + valueForCredit * creditMultiplier,
        )
      }
    })
    return Object.fromEntries(resultMap)
  }

  // 통합고용 2차 공제
  private static integratedEmploymentCredit2nd = (
    credit1st: Partial<IntegrateEmployeeTaxCreditModel>,
    positiveYoY2nd: T.NumberObject,
    locationBool: boolean,
  ): Partial<IntegrateEmployeeTaxCreditModel> => {
    const resultMap = new Map()
    const positiveYoY2ndMap = new Map(Object.entries(positiveYoY2nd))

    positiveYoY2ndMap.forEach((__, key) => {
      const [creditType, _, employeeType, variationYear] =
        key.split(/(?=[A-Z])/)
      // 1차년도 공제금액 가져올때 : variationYearIdx - 2
      // 2차년도 공제 연도 설정할때 : variationYearIdx - 1
      const variationYearIdx = Number(variationYear[variationYear.length - 1])

      // (case 1) 전체 상시근로자 수 유지, 증가한 경우 -> 1차공제분 찾아서 추가할당
      if (
        positiveYoY2ndMap.has(`${creditType}VariationTotal${variationYear}`) &&
        employeeType !== 'Total'
      ) {
        // total credit 초기화
        const totalKey = `${creditType}CreditTotalYear${variationYearIdx - 1}`
        if (!resultMap.has(totalKey)) {
          resultMap.set(totalKey, 0)
        }

        const prevCredit =
          credit1st[`firstCredit${employeeType}Year${variationYearIdx - 2}`] ??
          0
        resultMap.set(
          `${creditType}Credit${employeeType}Year${variationYearIdx - 1}`,
          prevCredit,
        )
        resultMap.set(totalKey, resultMap.get(totalKey) + prevCredit)

        // (case 2) 전체 상시근로자 수 유지, 증가하였는데, 청년외 수 감소 => 1차공제분 중 청년외 금액 찾아서 할당
        if (
          !positiveYoY2ndMap.has(`${creditType}VariationMiddle${variationYear}`)
        ) {
          const prevMiddleCredit =
            credit1st[`firstCreditMiddleYear${variationYearIdx - 2}`] ?? 0
          resultMap.set(
            `${creditType}CreditMiddleYear${variationYearIdx - 1}`,
            prevMiddleCredit,
          )
          resultMap.set(totalKey, resultMap.get(totalKey) + prevMiddleCredit)
        }
        // (case 3) 전체 상시근로자 수 유지, 증가 but 청년등 수 감소 => 청년등 증가분을 청년외 증가분으로 할당
        if (
          !positiveYoY2ndMap.has(`${creditType}VariationYouth${variationYear}`)
        ) {
          const prevCreditYouth =
            credit1st[`firstCreditYouthYear${variationYearIdx - 2}`] ?? 0
          const divider = this.integratedMultiplier('Youth', locationBool)
          const creditMultiplier = this.integratedMultiplier(
            'Middle',
            locationBool,
          )

          const calculated = Math.round(
            (prevCreditYouth * creditMultiplier) / divider,
          )
          resultMap.set(
            `${creditType}CreditMiddleYear${variationYearIdx - 1}`,
            (resultMap.get(
              `${creditType}CreditMiddleYear${variationYearIdx - 1}`,
            ) || 0) + calculated,
          )
          resultMap.set(totalKey, resultMap.get(totalKey) + calculated)
        }
      }
    })
    return Object.fromEntries(resultMap)
  }

  // 통합고용 3차공제
  private static integratedEmploymentCredit3rd = (
    credit1st: Partial<IntegrateEmployeeTaxCreditModel>,
    positiveYoY2nd: T.NumberObject,
    positiveYoY3rd: T.NumberObject,
    locationBool: boolean,
  ): Partial<IntegrateEmployeeTaxCreditModel> => {
    const resultMap = new Map()
    const positiveYoY3rdMap = new Map(Object.entries(positiveYoY3rd))

    positiveYoY3rdMap.forEach((__, key) => {
      const [creditType, _, employeeType, variationYear] =
        key.split(/(?=[A-Z])/)
      // yearIndex 설정
      const variationYearIdx = Number(variationYear.slice(-1))
      const creditYear = variationYearIdx - 1
      const firstCreditYear = variationYearIdx - 3

      // case 1 : 3차연도 및 2차연도 전체 상시근로자수 유지, 증가
      if (
        positiveYoY3rdMap.has(`thirdVariationTotalYear${variationYearIdx}`) &&
        positiveYoY2nd[`secondVariationTotalYear${variationYearIdx - 1}`] !==
          undefined &&
        employeeType !== 'Total'
      ) {
        // total 값 초기화
        const totalCreditKey = `${creditType}CreditTotalYear${creditYear}`
        resultMap.set(totalCreditKey, resultMap.get(totalCreditKey) || 0)

        // 1차년도 공제액 할당
        const prePrevCredit =
          credit1st[`firstCredit${employeeType}Year${firstCreditYear}`] || 0
        resultMap.set(
          `${creditType}Credit${employeeType}Year${creditYear}`,
          prePrevCredit,
        )
        resultMap.set(
          totalCreditKey,
          resultMap.get(totalCreditKey) + prePrevCredit,
        )

        // case 1-1 : 3차 및 2차연도 전체 인원 유지, 증가 but 청년 외만 감소
        if (
          !positiveYoY3rdMap.has(`thirdVariationMiddleYear${variationYearIdx}`)
        ) {
          const prePrevMiddleCredit =
            credit1st[`firstCreditMiddleYear${firstCreditYear}`] || 0
          resultMap.set(
            `${creditType}CreditMiddleYear${creditYear}`,
            prePrevMiddleCredit,
          )
          resultMap.set(
            totalCreditKey,
            resultMap.get(totalCreditKey) + prePrevMiddleCredit,
          )
        }

        // case 1-2 : 3차 및 2차연도 전체 인원 유지, 증가 but 청년 등만 감소
        if (
          !positiveYoY3rdMap.has(`thirdVariationYouthYear${variationYearIdx}`)
        ) {
          const prePrevYouthCredit =
            credit1st[`firstCreditYouthYear${firstCreditYear}`] || 0

          const divider = this.integratedMultiplier('Youth', locationBool)
          const creditMultiplier = this.integratedMultiplier(
            'Middle',
            locationBool,
          )
          const calculated = Math.round(
            (prePrevYouthCredit * creditMultiplier) / divider,
          )

          resultMap.set(`${creditType}CreditYouthYear${creditYear}`, calculated)
          resultMap.set(
            totalCreditKey,
            resultMap.get(totalCreditKey) + calculated,
          )
        }
      }
    })
    return Object.fromEntries(resultMap)
  }

  // 통합고용 2차년도 추가납부
  private static integratedEmploymentPay2nd = (
    credit1st: Partial<IntegrateEmployeeTaxCreditModel>,
    negativeYoY2nd: T.NumberObject,
    locationBool: boolean,
  ): Partial<IntegrateEmployeeTaxCreditModel> => {
    const credit1stMap = new Map(Object.entries(credit1st))
    const resultMap = new Map()

    for (const [payType, _, __, variationYear] of Object.keys(
      negativeYoY2nd,
    ).map(key => key.split(/(?=[A-Z])/))) {
      const variationYearIdx = Number(variationYear.slice(-1))

      const temp =
        (credit1stMap.get(
          `firstCreditTotalYear${variationYearIdx - 2}`,
        ) as number) ?? 0
      // (1) 1차공제 금액이 있고 그 금액이 0보다 크며, (2) 추가납부를 최초로 계산하는 loop 인 경우만
      if (
        temp <= 0 ||
        resultMap.has(`firstPaidTaxYear${variationYearIdx - 1}`)
      ) {
        continue
      }

      // 감소인원 및 추가납부 계산시 곱할 금액 가져옴
      const youthVariation =
        negativeYoY2nd[`${payType}VariationYouthYear${variationYearIdx}`]
      const middleVariation =
        negativeYoY2nd[`${payType}VariationMiddleYear${variationYearIdx}`]
      const totalVariation =
        negativeYoY2nd[`${payType}VariationTotalYear${variationYearIdx}`]

      const youthDecreased = Math.abs(youthVariation ?? 0)
      const middleDecreased = Math.abs(middleVariation ?? 0)
      const totalDecreased = Math.abs(totalVariation ?? 0)

      const youthMultiplier = this.integratedMultiplier('Youth', locationBool)
      const middleMultiplier = this.integratedMultiplier('Middle', locationBool)

      let calculatedAmount = 0
      if (totalDecreased > 0) {
        if (totalDecreased > youthDecreased) {
          // case 1 : 전체 상시근로자수 감소, 전체 감소 > 청년등 감소
          const youthDecreasedForCalculation = Math.min(
            youthDecreased,
            totalDecreased,
          )
          const middleDecreasedForCalculation = Math.min(
            middleDecreased,
            totalDecreased,
          )
          calculatedAmount =
            youthDecreasedForCalculation * youthMultiplier +
            middleDecreasedForCalculation * middleMultiplier
        } else {
          // case 2 : 전체 상시근로자수 감소, 전체 감소 <= 청년등 감소
          calculatedAmount =
            (youthDecreased - totalDecreased) *
              (youthMultiplier - middleMultiplier) +
            totalDecreased * youthMultiplier
        }
      } else if (
        youthDecreased > 0 &&
        credit1stMap.get(`firstCreditYouthYear${variationYearIdx}`) !==
          undefined
      ) {
        // case 3 : 전체 상시근로자수 유지, 증가, 청년등 만 감소
        calculatedAmount = youthDecreased * (youthMultiplier - middleMultiplier)
      }
      const limitation =
        (credit1stMap.get(
          `firstCreditTotalYear${variationYearIdx - 2}`,
        ) as number) ?? 0
      resultMap.set(
        `firstPaidTaxYear${variationYearIdx - 1}`,
        Math.min(calculatedAmount, limitation),
      )
    }
    return Object.fromEntries(resultMap)
  }

  private static integratedEmploymentPay3rd = (
    credit1st: Partial<IntegrateEmployeeTaxCreditModel>,
    credit2nd: Partial<IntegrateEmployeeTaxCreditModel>,
    pay2nd: Partial<IntegrateEmployeeTaxCreditModel>,
    negativeYoY3rd: T.NumberObject,
    locationBool: boolean,
  ): Partial<IntegrateEmployeeTaxCreditModel> => {
    const credit1stMap = new Map(Object.entries(credit1st))
    const credit2ndMap = new Map(Object.entries(credit2nd))
    const resultMap = new Map()

    for (const [payType, _, __, variationYear] of Object.keys(
      negativeYoY3rd,
    ).map(key => key.split(/(?=[A-Z])/))) {
      const variationYearIdx = Number(variationYear.slice(-1))

      const temp =
        (credit1stMap.get(
          `firstCreditTotalYear${variationYearIdx - 3}`,
        ) as number) ?? 0
      if (
        temp <= 0 ||
        resultMap.has(`secondPaidTaxYear${variationYearIdx - 1}`)
      ) {
        continue
      }

      const youthVariation =
        negativeYoY3rd[`${payType}VariationYouthYear${variationYearIdx}`]
      const middleVariation =
        negativeYoY3rd[`${payType}VariationMiddleYear${variationYearIdx}`]
      const totalVariation =
        negativeYoY3rd[`${payType}VariationTotalYear${variationYearIdx}`]

      const youthDecreased = Math.abs(youthVariation ?? 0)
      const middleDecreased = Math.abs(middleVariation ?? 0)
      const totalDecreased = Math.abs(totalVariation ?? 0)

      const youthMultiplier = this.integratedMultiplier('Youth', locationBool)
      const middleMultiplier = this.integratedMultiplier('Middle', locationBool)

      let calculatedAmount = 0
      // 공제받은 총 횟수 계산
      let prevCreditCount = 0
      if (credit1stMap.has(`firstCreditTotalYear${variationYearIdx - 3}`))
        prevCreditCount++
      if (credit2ndMap.has(`secondCreditTotalYear${variationYearIdx - 2}`))
        prevCreditCount++

      // 기존 추가납부세액 가져오기
      const prevPaid = pay2nd[`firstPaidTaxYear${variationYearIdx - 2}`] ?? 0
      const totalLimit =
        ((credit1stMap.get(
          `first_credit_total_year${variationYearIdx - 3}`,
        ) as number) ?? 0) +
        ((credit2ndMap.get(
          `second_credit_total_year${variationYearIdx - 2}`,
        ) as number) ?? 0)
      if (totalDecreased > 0) {
        if (totalDecreased > youthDecreased) {
          // case 1 : 전체 상시근로자 수 감소, 전체 감소 > 청년등 감소
          const youthDecreasedForCalculation = Math.min(
            youthDecreased,
            totalDecreased,
          )
          const middleDecreasedForCalculation = Math.min(
            middleDecreased,
            totalDecreased,
          )
          calculatedAmount = Math.min(
            (youthDecreasedForCalculation * youthMultiplier +
              middleDecreasedForCalculation * middleMultiplier) *
              prevCreditCount,
            totalLimit,
          )
        } else {
          // case 2 : 전체 상시근로자 수 감소, 전체 감소 <= 청년등 감소
          calculatedAmount = Math.min(
            ((youthDecreased - totalDecreased) *
              (youthMultiplier - middleMultiplier) +
              totalDecreased * youthMultiplier) *
              prevCreditCount,
            totalLimit,
          )
        }
      } else if (
        youthDecreased > 0 &&
        credit1stMap.get(`firstCreditYouthYear${variationYearIdx - 3}`) !==
          undefined
      ) {
        // case 3 : 전체 상시근로자 수 유지 또는 증가, 청년등 감소
        calculatedAmount = Math.min(
          youthDecreased *
            (youthMultiplier - middleMultiplier) *
            prevCreditCount,
          totalLimit,
        )
      }
      resultMap.set(
        `secondPaidTaxYear${variationYearIdx - 1}`,
        Math.min(calculatedAmount - prevPaid, totalLimit),
      )
    }
    return Object.fromEntries(resultMap)
  }
}

// 3. 사회보험 세액공제
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
export class CalculateSocialInsuranceCredit {
  private static getIndustrialSocialRate = (
    industrialSocialRateArr: Partial<SocialInsuranceRateModel>[],
  ): T.NumberObject => {
    let result: T.NumberObject = {}
    if (industrialSocialRateArr.length === 0) {
      result = {}
    } else if (industrialSocialRateArr.length === 1) {
      result = CalculateBasicUtils.pickPropertiesFromObject(
        industrialSocialRateArr[0],
        'totalRate',
      ) as T.NumberObject
    } else {
      const totalRateKeys = new Set(
        industrialSocialRateArr.flatMap(industrialSocialRate =>
          Object.keys(industrialSocialRate).filter(key =>
            key.includes('totalRate'),
          ),
        ),
      )

      totalRateKeys.forEach(totalRateKey => {
        const totalRateValues = industrialSocialRateArr.map(
          industrialSocialRate => industrialSocialRate[totalRateKey] || 0,
        )
        const selected = totalRateValues.some(value => value > 0)
          ? Math.min(
              ...totalRateValues.filter(totalRateValue => totalRateValue > 0),
            )
          : 0
        result[totalRateKey] = selected
      })
    }
    return result
  }

  // 데이터 검증 메소드
  private static validationEmployeeData = (
    yearlyCount: Partial<IncreaseEmployeeYearlyModel>,
    totalSalary: Partial<TotalSalaryYearlyModel>,
    industrialInsuranceArr: Partial<SocialInsuranceRateModel>[],
  ): T.ValidationError | null => {
    if (!yearlyCount)
      return {
        message: '사회보험 연도별 상시근로자 수 데이터가 없습니다',
        code: 'NO_EMPLOYEE_DATA',
      }

    if (Object.values(yearlyCount).every(value => value === 0))
      return {
        message: '사회보험 연도별 상시근로자 수 증감이 없습니다',
        code: 'NO_VARIATION',
      }

    const firstYearlyVariation = CalculateBasicUtils.pickPropertiesFromObject(
      yearlyCount,
      'firstVariation',
    )

    if (Object.values(firstYearlyVariation).every((value: number) => value < 0))
      return {
        message: '연도별 상시근로자수가 지속적으로 감소합니다',
        code: 'NEGATIVE_VARIATION',
      }

    if (!Object.keys(totalSalary).length)
      return { message: '총급여 데이터가 없습니다', code: 'NO_WAGE' }
    if (!industrialInsuranceArr.length)
      return { message: '사회보험 요율이 존재하지 않습니다', code: 'NO_RATE' }
    return null
  }

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
  // 사회보험 계산 메인 프로세스
  public static calculateSocialInsuranceCreditData = (
    userId: string,
    increaseYearlyCount: Partial<IncreaseEmployeeYearlyModel>,
    totalSalary: Partial<TotalSalaryYearlyModel>,
    industrialInsuranceArr: Partial<SocialInsuranceRateModel>[],
    yearIndexes: T.NumberObject,
  ): Partial<T.CalculateResult> => {
    try {
      const validateError = this.validationEmployeeData(
        increaseYearlyCount,
        totalSalary,
        industrialInsuranceArr,
      )
      if (validateError)
        return { socialInsuranceTaxCredit: null, error: validateError }

      const credit1st = this.socialInsuranceCredit1st(
        increaseYearlyCount,
        totalSalary,
        industrialInsuranceArr,
        yearIndexes,
      )
      const credit2nd = this.socialInsuranceCredit2nd(
        credit1st,
        increaseYearlyCount,
      )

      const totalCredit = CreditHelper.reduceCredit(credit1st, credit2nd)

      console.log(`${userId} : 사회보험 1차 공제`, credit1st)
      console.log(`${userId} : 사회보험 2차 공제`, credit2nd)
      console.log(`${userId} : 사회보험 공제 총액 계산`, totalCredit)

      return {
        socialInsuranceTaxCredit: {
          userId,
          ...credit1st,
          ...credit2nd,
          ...totalCredit,
        },
        error: null,
      }
    } catch (error) {
      console.log(error.stack)
      return {
        socialInsuranceTaxCredit: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : '사회보험 세액공제 계산 도중 오류 발생',
          code: 'PROCESSING_ERROR',
        },
      }
    }
  }

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
  // 사회보험 공제액 및 납부액 계산 메소드
  // 사회보험 1차 공제
  private static socialInsuranceCredit1st = (
    increaseYearlyCount: Partial<IncreaseEmployeeYearlyModel>,
    totalSalary: Partial<TotalSalaryYearlyModel>,
    industrialInsuranceArr: Partial<SocialInsuranceRateModel>[],
    yearIndexes: T.NumberObject,
  ): Partial<SocialInsuranceTaxCreditModel> => {
    const resultMap = new Map()
    const positiveYoY1stMap = new Map(
      Object.entries(
        CreditHelper.selectPosNegVariation(
          increaseYearlyCount,
          'firstVariation',
          true,
        ),
      ),
    )
    const industrialInsurance = this.getIndustrialSocialRate(
      industrialInsuranceArr,
    )

    positiveYoY1stMap.forEach((value, key) => {
      const [creditType, _, employeeType, variationYear] =
        key.split(/(?=[A-Z])/)
      const variationYearIdx = Number(variationYear[variationYear.length - 1])
      const countYear = Number(
        CalculateBasicUtils.getYearFromIndex(yearIndexes, variationYearIdx),
      )
      const totalVariationYearly =
        positiveYoY1stMap.get(`${creditType}VariationTotal${variationYear}`) ??
        0

      // 조건 : (1) 상시근로자 수 합계 !== undefined (2) 상시근로자 수 합계 > 0 (3) year < 2022
      if (
        totalVariationYearly > 0 &&
        countYear < 2022 &&
        employeeType !== 'Total'
      ) {
        const totalKey = `${creditType}CreditTotalYear${variationYearIdx - 1}`
        if (!resultMap.has(totalKey)) {
          resultMap.set(totalKey, 0)
        }

        const genericSocialInsuranceRate =
          CreditHelper.getGenericSocialInsuranceRate(countYear)
        const socialRate = Number(
          (
            Object.values(genericSocialInsuranceRate).reduce(
              (acc, cur) => acc + cur,
              0,
            ) /
              100 +
            industrialInsurance[`totalRateYear${variationYearIdx - 1}`] / 1000
          ).toFixed(6),
        )

        const salary =
          totalSalary[`${employeeType}SalaryYear${variationYearIdx - 1}`] ?? 0
        const divider =
          increaseYearlyCount[`${employeeType}CountsYear${variationYearIdx}`] ??
          0
        const multiplier = Math.min(
          value,
          positiveYoY1stMap.get(`firstVariationTotalYear${variationYearIdx}`) ??
            0,
        )

        const creditAmt =
          divider > 0 && employeeType === 'Youth'
            ? Math.floor((salary * socialRate * multiplier) / divider)
            : Math.floor(((salary * socialRate * multiplier) / divider) * 0.5)

        const creditKey = `${creditType}Credit${employeeType}Year${variationYearIdx - 1}`
        if (!isNaN(creditAmt)) {
          resultMap.set(creditKey, (resultMap.get(creditKey) || 0) + creditAmt)
          resultMap.set(totalKey, (resultMap.get(totalKey) || 0) + creditAmt)
        }
      }
    })
    return Object.fromEntries(resultMap)
  }

  private static socialInsuranceCredit2nd = (
    credit1st: Partial<SocialInsuranceTaxCreditModel>,
    increaseYearlyCount: Partial<IncreaseEmployeeYearlyModel>,
  ): Partial<SocialInsuranceTaxCreditModel> => {
    const resultMap = new Map()
    const positiveYoY2ndMap = new Map(
      Object.entries(
        CreditHelper.selectPosNegVariation(
          increaseYearlyCount,
          'secondVariation',
          true,
        ),
      ),
    )

    positiveYoY2ndMap.forEach((_, key) => {
      const [creditType, __, employeeType, variationYear] =
        key.split(/(?=[A-Z])/)
      // 1차년도 공제금액 가져올때 : variationYearIdx - 2
      // 2차년도 공제 연도 설정할때 : variationYearIdx - 1
      const variationYearIdx = Number(variationYear[variationYear.length - 1])
      // 전체 상시근로자 수 유지, 증가한 경우 -> 1차공제분 찾아서 추가할당
      if (
        positiveYoY2ndMap.has(`${creditType}VariationTotal${variationYear}`) &&
        employeeType !== 'Total'
      ) {
        const totalKey = `${creditType}CreditTotalYear${variationYearIdx - 1}`
        if (!resultMap.has(totalKey)) {
          resultMap.set(totalKey, 0)
        }

        const prevCredit =
          credit1st[`firstCredit${employeeType}Year${variationYearIdx - 2}`] ??
          0
        resultMap.set(
          `${creditType}Credit${employeeType}Year${variationYearIdx - 1}`,
          prevCredit,
        )
        resultMap.set(totalKey, resultMap.get(totalKey) + prevCredit)
      }
    })
    return Object.fromEntries(resultMap)
  }
}
