import {
  HometaxFillingPerson,
  ReportPerson,
  TAX_CODES,
  ValidationError,
} from './hometax-filling.type'

export class ProcessHometaxFilling {
  private static toNumber(value: string | number): number {
    return typeof value === 'string' ? Number(value) : value
  }

  // private static calculateRate(amount: number, total: number): number {
  //   return ((amount / total) * 100) / 100
  // }

  private static sumArrayValues(items: Array<{ Amount: string }>): number {
    return items.reduce((acc, item) => acc + this.toNumber(item.Amount), 0)
  }

  private static filterAndSumByCode(
    rows: Array<{ ereCd: string; ereAmt: string }>,
    codes: Record<string, boolean>,
  ): number {
    return rows
      .filter(row => codes[row.ereCd])
      .reduce((acc, row) => acc + this.toNumber(row.ereAmt), 0)
  }

  private static getReportByName(
    reports: ReportPerson[],
    reportName: string,
  ): ReportPerson | undefined {
    console.log('searching for:', reportName)

    reports.forEach(report => {
      console.log('checking:', report.ReportName)
      console.log('includes?:', report.ReportName?.includes(reportName))
    })

    // console.log('get report name', reportName)
    // console.log('reports', reports)
    if (!reports) {
      console.log('get report name error')
      return undefined
    }

    return reports.find(report => report.ReportName?.includes(reportName))
  }

  private static validateReports(
    reports: ReportPerson[],
    yearIdx: number,
  ): ValidationError | null {
    const requiredReports = {
      납부계산서: true,
      사업소득명세서: yearIdx > 0,
      종합소득금액및결손금이월결손금공제명세서: yearIdx > 0,
      소득공제명세서: yearIdx > 0,
      세액공제명세서: yearIdx > 0,
    }

    for (const [reportName, isRequired] of Object.entries(requiredReports)) {
      if (isRequired && !this.getReportByName(reports, reportName)) {
        return {
          message: `전자신고결과조회 데이터에 오류가 있습니다.\n오류내용: ${reportName} 페이지가 조회되지 않습니다.`,
          code: 'MISSING_REPORT',
        }
      }
    }

    if (yearIdx > 0) {
      const structureError = this.validateReportStructures(reports)
      if (structureError) return structureError
    }

    return null
  }

  private static validateReportStructures(
    reports: ReportPerson[],
  ): ValidationError | null {
    const thirdPage = this.getReportByName(
      reports,
      '종합소득금액및결손금이월결손금공제명세서',
    )

    if (thirdPage) {
      if (!thirdPage.ttirndl012DVOList?.rows) {
        return {
          message:
            '종합소득금액및결손금이월결손금공제명세서의 데이터 구조가 올바르지 않습니다.',
          code: 'INVALID_STRUCTURE',
        }
      }

      const hasBusinessIncome = thirdPage.ttirndl012DVOList.rows.some(
        row => row.incClCd === '40' && row.incAmt,
      )

      if (!hasBusinessIncome) {
        return {
          message:
            '종합소득금액및결손금이월결손금공제명세서에서 사업소득 데이터를 찾을 수 없습니다.',
          code: 'NO_BUSINESS_INCOME',
        }
      }
    }

    const fifthPage = this.getReportByName(reports, '세액공제명세서')
    if (fifthPage && !fifthPage.txamtDdcReSpecBrkdDVOList?.rows) {
      return {
        message: '세액공제명세서의 데이터 구조가 올바르지 않습니다.',
        code: 'INVALID_STRUCTURE',
      }
    }

    const fourthPage = this.getReportByName(reports, '소득공제명세서')
    if (fourthPage && !fourthPage.Items) {
      return {
        message: '소득공제명세서의 데이터 구조가 올바르지 않습니다.',
        code: 'INVALID_STRUCTURE',
      }
    }

    return null
  }

  public static processHometaxFillingData(
    reports: ReportPerson[],
    startYear: number,
  ): { data: HometaxFillingPerson | null; error: ValidationError | null } {
    try {
      const rptFirstPage = this.getReportByName(reports, '납부계산서')
      if (!rptFirstPage) {
        return {
          data: null,
          error: {
            message: '납부계산서를 찾을 수 없습니다.',
            code: 'MISSING_REPORT',
          },
        }
      }

      const year = Number(rptFirstPage.ttirnam101DVO.txnrmStrtDt.slice(0, 4))
      const yearIdx = year - startYear + 1

      const validationError = this.validateReports(reports, yearIdx)
      if (validationError) {
        return { data: null, error: validationError }
      }

      const result = this.initializeBasicData(rptFirstPage, yearIdx)

      if (yearIdx > 0) {
        this.processBusinessIncome(reports, result, yearIdx)
        this.processDeductions(reports, result, yearIdx)
        this.processTaxCreditsAndReductions(reports, result, yearIdx)
      }

      return { data: result, error: null }
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : '데이터 처리 중 오류가 발생했습니다.',
          code: 'PROCESSING_ERROR',
        },
      }
    }
  }

  private static initializeBasicData(
    rptFirstPage: ReportPerson,
    yearIdx: number,
  ): HometaxFillingPerson {
    return {
      [`account_duty_year${yearIdx}`]: rptFirstPage.ttirndm001DVO.bkpDutyClCd,
      [`filling_type_year${yearIdx}`]:
        rptFirstPage.ttirndm001DVO.inctxRtnTypeCd,
      [`total_income_year${yearIdx}`]: this.toNumber(
        rptFirstPage.ttirndm001DVO.agiAmt,
      ),
      [`taxation_standard_year${yearIdx}`]: this.toNumber(
        rptFirstPage.ttirnam101DVO.stasAmt,
      ),
      [`calculated_tax_year${yearIdx}`]: this.toNumber(
        rptFirstPage.ttirnam101DVO.cmptTxamt,
      ),
      [`tax_reduction_year${yearIdx}`]: this.toNumber(
        rptFirstPage.ttirnam101DVO.reTxamt,
      ),
      [`tax_credit_year${yearIdx}`]: this.toNumber(
        rptFirstPage.ttirnam101DVO.ddcTxamt,
      ),
      [`determined_tax_year${yearIdx}`]: this.toNumber(
        rptFirstPage.ttirnam101DVO.dcsTxamt,
      ),
      [`additional_tax_year${yearIdx}`]: 0,
      [`pre_paid_tax_year${yearIdx}`]: this.toNumber(
        rptFirstPage.ttirnam101DVO.ppmTxamt,
      ),
      [`paid_agricultural_tax_year${yearIdx}`]: 0,
    }
  }

  private static processBusinessIncome(
    reports: ReportPerson[],
    result: HometaxFillingPerson,
    yearIdx: number,
  ): void {
    const rptThirdPage = this.getReportByName(
      reports,
      '종합소득금액및결손금이월결손금공제명세서',
    )
    const businessIncome = this.toNumber(
      rptThirdPage?.ttirndl012DVOList?.rows.find(row => row.incClCd === '40')
        ?.incAmt || '0',
    )

    result[`business_income_year${yearIdx}`] = businessIncome
    // result[`business_income_rate_year${yearIdx}`] = this.calculateRate(
    //   businessIncome,
    //   result[`total_income_year${yearIdx}`] as number,
    // )
  }

  private static processDeductions(
    reports: ReportPerson[],
    result: HometaxFillingPerson,
    yearIdx: number,
  ): void {
    const rptFourthPage = this.getReportByName(reports, '소득공제명세서')
    if (rptFourthPage?.Items) {
      result[`income_deduction_year${yearIdx}`] = this.sumArrayValues(
        rptFourthPage.Items,
      )
    }
  }

  private static processTaxCreditsAndReductions(
    reports: ReportPerson[],
    result: HometaxFillingPerson,
    yearIdx: number,
  ): void {
    const rptFifthPage = this.getReportByName(reports, '세액공제명세서')
    if (rptFifthPage?.txamtDdcReSpecBrkdDVOList?.rows) {
      const rows = rptFifthPage.txamtDdcReSpecBrkdDVOList.rows

      result[`tax_reduction_excluded_year${yearIdx}`] = this.filterAndSumByCode(
        rows,
        TAX_CODES.REDUCTION,
      )

      result[`tax_credit_excluded_year${yearIdx}`] = this.filterAndSumByCode(
        rows,
        TAX_CODES.CREDIT,
      )

      this.calculateIncludedTaxes(result, yearIdx)
    }
  }

  private static calculateIncludedTaxes(
    result: HometaxFillingPerson,
    yearIdx: number,
  ): void {
    result[`tax_reduction_included_year${yearIdx}`] =
      (result[`tax_reduction_year${yearIdx}`] as number) -
      (result[`tax_reduction_excluded_year${yearIdx}`] as number)

    result[`tax_credit_included_year${yearIdx}`] =
      (result[`tax_credit_year${yearIdx}`] as number) -
      (result[`tax_credit_excluded_year${yearIdx}`] as number)
  }
}
