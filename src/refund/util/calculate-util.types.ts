import { IncreaseEmployeeYearlyModel } from 'src/refund/database/entity/increase-employee-yearly.entity'
import { IncreaseMonthlyCountModel } from 'src/refund/database/entity/increase-monthly-counts.entity'
import { IncreaseEmployeeTaxCreditModel } from 'src/refund/database/entity/increase_employee_tax_credit.entity'
import { IntegrateEmployeeYearlyModel } from 'src/refund/database/entity/integrate-employee-yearly.entity'
import { IntegrateMonthlyCountModel } from 'src/refund/database/entity/integrate-monthly-count.entity'
import { IntegrateEmployeeTaxCreditModel } from 'src/refund/database/entity/integrate_employee_tax_credit.entity'
import { RefundYearlyModel } from 'src/refund/database/entity/refund_yearly.entity'
import { SocialInsuranceTaxCreditModel } from 'src/refund/database/entity/social_insurance_tax_credit.entity'
import { TotalSalaryYearlyModel } from 'src/refund/database/entity/total-salary-yearly.entity'

// 타입 정의 //
export interface NumberObject {
  [key: string]: number
}

export interface StringAndNumberObject {
  [key: string]: string | number
}

export interface StringNumerBoolObject {
  [key: string]: string | number | boolean
}

export interface DatesObject {
  [key: string]: Date
}

// ------------------------------------------------------------------------------------ //
export interface RectificationPeriod {
  startYear: number
  endYear: number
}

export interface NestedNumberObject {
  [key: number]: number[]
}
export interface TaxRateAndReduction {
  taxRateObj: NestedNumberObject
  reductionObj: NestedNumberObject
}

// ------------------------------------------------------------------------------------ //

export interface CalculateResult {
  increaseMonthlyCounts?: Partial<IncreaseMonthlyCountModel>[] | null
  integrateMonthlyCounts?: Partial<IntegrateMonthlyCountModel>[] | null
  increaseEmployeeYearly?: Partial<IncreaseEmployeeYearlyModel> | null
  integrateEmployeeYearly?: Partial<IntegrateEmployeeYearlyModel> | null
  totalSalaryYearly?: Partial<TotalSalaryYearlyModel> | null
  increaseEmployeeTaxCredit?: Partial<IncreaseEmployeeTaxCreditModel> | null
  integrateEmployeeTaxCredit?: Partial<IntegrateEmployeeTaxCreditModel> | null
  socialInsuranceTaxCredit?: Partial<SocialInsuranceTaxCreditModel> | null
  refundYearly?: Partial<RefundYearlyModel> | null
  error: ValidationError | null
}

export interface CreditData {
  socialInsuranceCredit: NumberObject
  increaseCredit: NumberObject
  integrateCredit: NumberObject
}

// ------------------------------------------------------------------------------------ //

export interface ValidationError {
  message: string
  code: string
}
