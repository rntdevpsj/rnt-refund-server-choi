// imports
import { Injectable } from '@nestjs/common'
import { AppException } from 'src/common/exception/app.exception'
// db 조회 및 입력 클래스 import
import { RefundCompanyModel } from '../database/entity/refund-company.entity'
import { EmployeeWorkerModel } from '../database/entity/employee-worker.entity'
import { SocialInsuranceRateModel } from '../database/entity/social-insurance-rate.entity'
import { HometaxFillingPersonModel } from '../database/entity/hometax_filling_person.entity'
import { HometaxFillingCorporateModel } from '../database/entity/hometax_filling_corporate.entity'
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
import { RefundUserService } from '../database/service/refund-user.service'
import { RefundCompanyService } from '../database/service/refund-company.service'
import { EmployeeWorkerService } from '../database/service/employee-worker.service'
import { SocialInsuranceRateService } from '../database/service/social-insurance-rate.service'
import { HometaxFillingPersonService } from '../database/service/hometax_filling_person.service'
import { HometaxFillingCorporateService } from '../database/service/hometax_filling_corporate.service'
import { IncreaseMonthlyCountService } from '../database/service/increse-monthly-counts.service'
import { IntegrateMonthlyCountService } from '../database/service/integrate-monthly-count.service'
import { IncreaseEmployeeYearlyService } from '../database/service/increase-employee-yearly.service'
import { IntegrateEmployeeYearlyService } from '../database/service/integrate-employee-yearly.service'
import { TotalSalaryYearlyService } from '../database/service/total-salary-yearly.service'
import { IncreaseEmployeeTaxCreditService } from '../database/service/increase_employee_tax_credit.service'
import { IntegrateEmployeeTaxCreditService } from '../database/service/integrate_employee_tax_credit.service'
import { SocialInsuranceTaxCreditService } from '../database/service/social_insurance_tax_credit.service'
import { RefundYearlyService } from '../database/service/refund_yearly.service'
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
// 계산 util함수 import
import { CalculateBasicUtils } from '../util/calculate-basics.utils'
import { CalculateEmployeeCount } from '../util/calculate-employee-count.utils'
import {
  CalculateIncreaseEmployeeCredit,
  CalculateIntegrateEmployeeCredit,
  CalculateSocialInsuranceCredit,
} from '../util/calculate-employee-credit.utils'
import { CalculateRefundYearly } from '../util/calculate-refund-yearly.utils'

@Injectable()
export class RefundCalculateService {
  constructor(
    private readonly refundUserService: RefundUserService,
    private readonly refundCompanyService: RefundCompanyService,
    private readonly employeeWorkerService: EmployeeWorkerService,
    private readonly socialInsuranceRateService: SocialInsuranceRateService,
    private readonly hometaxFillingPersonService: HometaxFillingPersonService,
    private readonly hometaxFillingCorporateService: HometaxFillingCorporateService,
    private readonly increaseMonthlyCountService: IncreaseMonthlyCountService,
    private readonly integrateMonthlyCountService: IntegrateMonthlyCountService,
    private readonly increaseEmployeeYearlyService: IncreaseEmployeeYearlyService,
    private readonly integrateEmployeeYearlyService: IntegrateEmployeeYearlyService,
    private readonly totalSalaryYearlyService: TotalSalaryYearlyService,
    private readonly increaseEmployeeTaxCreditService: IncreaseEmployeeTaxCreditService,
    private readonly integrateEmployeeTaxCreditService: IntegrateEmployeeTaxCreditService,
    private readonly socialInsuranceTaxCreditService: SocialInsuranceTaxCreditService,
    private readonly refundYearlyService: RefundYearlyService,
  ) {}
  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // 경정청구 계산함수
  async calculateRefund(userId: string, requestId: string): Promise<number> {
    try {
      // 계산시 필요한 기초 데이터 호출
      const calculationBaseData = await this.getCalculationData(
        userId,
        requestId,
      )
      const {
        corpBool,
        refundCompanies,
        employeeWorkers,
        socialInsuranceRates,
      } = calculationBaseData

      const hometaxFilling = corpBool
        ? calculationBaseData.hometaxFillingCorporate
        : calculationBaseData.hometaxFillingPerson

      console.log(calculationBaseData)
      console.log('경정청구 기초 데이터 조회 완료. 계산 시작')

      // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // 경정청구 연도, yearIndex 및 수도권여부 설정
      const rectPeriod = CalculateBasicUtils.getRectificationPeriod(corpBool)
      const yearIndexesOfEmployeeData =
        CalculateBasicUtils.yearIndexesOfEmployeeData(rectPeriod)
      const locationType = CalculateBasicUtils.setEntireLocationType(
        refundCompanies,
        employeeWorkers,
        rectPeriod,
      )

      // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // 근로자수 데이터 계산. 계산결과 없는 경우 프로세스 종료
      const employeeData = CalculateEmployeeCount.calculateEmployeeCountData(
        userId,
        employeeWorkers,
        rectPeriod,
        corpBool,
      )

      if (employeeData.error) {
        console.log('근로자 증감 없음. 환급금 계산 종료')
        return
      }

      const {
        increaseMonthlyCounts,
        integrateMonthlyCounts,
        increaseEmployeeYearly,
        integrateEmployeeYearly,
        totalSalaryYearly,
      } = employeeData

      // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // 세액공제액 데이터 계산 (고용증대, 통합고용, 사회보험)
      const increaseCreditData =
        CalculateIncreaseEmployeeCredit.calculateIncreaseEmployeeCreditData(
          userId,
          increaseEmployeeYearly ?? {},
          yearIndexesOfEmployeeData,
          locationType,
        ).increaseEmployeeTaxCredit

      const integrateCreditData =
        CalculateIntegrateEmployeeCredit.calculateIntegrateEmployeeCreditData(
          userId,
          integrateEmployeeYearly ?? {},
          yearIndexesOfEmployeeData,
          locationType,
        ).integrateEmployeeTaxCredit

      const socialInsuranceCreditData =
        CalculateSocialInsuranceCredit.calculateSocialInsuranceCreditData(
          userId,
          increaseEmployeeYearly ?? {},
          totalSalaryYearly ?? {},
          socialInsuranceRates,
          yearIndexesOfEmployeeData,
        ).socialInsuranceTaxCredit

      // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // 연도별 환급금 계산
      const refundLimit = CalculateRefundYearly.setRefundLimit(
        hometaxFilling,
        corpBool,
        rectPeriod,
      )

      const refundYearly = CalculateRefundYearly.calculateRefundYearlyData(
        userId,
        hometaxFilling,
        refundLimit,
        socialInsuranceCreditData ?? {},
        increaseCreditData ?? {},
        integrateCreditData ?? {},
        corpBool,
      )

      const totalRefundAmt: number = Object.values(
        CalculateBasicUtils.pickPropertiesFromObject(
          refundYearly,
          'refundAmt',
        ) as { [key: string]: number },
      ).reduce((acc: number, cur: number) => acc + cur, 0)

      console.log('환급금 계산 완료')
      // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // 계산한 데이터들 입력

      // 1. tb_increase_monthly_counts
      for (const increaseMonthlyCount of increaseMonthlyCounts) {
        await this.increaseMonthlyCountService.createIncreaseMonthlyCount(
          increaseMonthlyCount,
        )
      }

      // 2. tb_integrate_monthly_counts
      for (const integrateMonthlyCount of integrateMonthlyCounts) {
        await this.integrateMonthlyCountService.createMonthlyCount(
          integrateMonthlyCount,
        )
      }

      // 3. tb_increase_employee_yearly
      await this.increaseEmployeeYearlyService.createIncreaseEmployeeYearly(
        increaseEmployeeYearly,
      )

      // 4. tb_integrate_employee_yearly
      await this.integrateEmployeeYearlyService.createIntegrateEmployeeYearly(
        integrateEmployeeYearly,
      )

      // 5. tb_total_salary_yearly
      await this.totalSalaryYearlyService.createTotalSalaryYearly(
        totalSalaryYearly,
      )

      // 6. tb_increase_tax_credit
      await this.increaseEmployeeTaxCreditService.createIncreaseEmployeeTaxCredit(
        increaseCreditData,
      )

      // 7. tb_integrate_tax_credit
      await this.integrateEmployeeTaxCreditService.createIntegrateEmployeeTaxCredit(
        integrateCreditData,
      )

      // 8. tb_social_insurance_tax_credit
      await this.socialInsuranceTaxCreditService.createSocialInsuranceTaxCredit(
        socialInsuranceCreditData,
      )

      // 9. tb_hometax_filling (person / corporate)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      corpBool
        ? await this.hometaxFillingCorporateService.updateRefundLimit(
            requestId,
            refundLimit,
          )
        : await this.hometaxFillingPersonService.updateRefundLimit(
            requestId,
            refundLimit,
          )

      // 10. tb_refund_yearly
      await this.refundYearlyService.createRefundYearly(refundYearly)

      console.log(`DB 저장 입력 완료`)
      // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // 결과 데이터 반환

      // const calculationResult = {
      //   amount: totalRefundAmt, // 실제 계산된 금액
      //   userId,
      //   details: {
      //     calculatedAt: new Date(),
      //     reason: '',
      //     factors: {
      //       // 계산에 사용된 요소들 <-- 안씀
      //     },
      //     breakdown: {
      //       // 계산 내역 <-- 안씀
      //     },
      //   },
      // }
      // return calculationResult
      return totalRefundAmt
    } catch (error) {
      console.log(error.stack)
      throw AppException.from(
        error,
        '환급금 계산 실패',
        'refund-calculation',
        'process-completion',
      )
    }
  }

  // 계산시 필요한 데이터들 호출하는 메서드
  private async getCalculationData(
    userId: string,
    requestId: string,
  ): Promise<{
    corpBool: boolean
    refundCompanies: Partial<RefundCompanyModel>[]
    employeeWorkers: Partial<EmployeeWorkerModel>[]
    socialInsuranceRates: Partial<SocialInsuranceRateModel>[]
    hometaxFillingPerson?: Partial<HometaxFillingPersonModel>
    hometaxFillingCorporate?: Partial<HometaxFillingCorporateModel>
  }> {
    const companyType = await this.refundUserService.getRefundUser(userId)

    return companyType
      ? {
          corpBool: companyType,
          refundCompanies:
            await this.refundCompanyService.getRefundCompanies(requestId),
          employeeWorkers:
            await this.employeeWorkerService.getEmployeeWorkers(requestId),
          socialInsuranceRates:
            await this.socialInsuranceRateService.getSocialInsuranceRates(
              requestId,
            ),
          hometaxFillingCorporate:
            await this.hometaxFillingCorporateService.getHometaxFilling(
              requestId,
            ),
        }
      : {
          corpBool: companyType,
          refundCompanies:
            await this.refundCompanyService.getRefundCompanies(requestId),
          employeeWorkers:
            await this.employeeWorkerService.getEmployeeWorkers(requestId),
          socialInsuranceRates:
            await this.socialInsuranceRateService.getSocialInsuranceRates(
              requestId,
            ),
          hometaxFillingPerson:
            await this.hometaxFillingPersonService.getHometaxFilling(requestId),
        }
  }
}
