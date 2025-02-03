import { SocialInsuranceRateService } from './../database/service/social-insurance-rate.service'
import { EmployeeWorkerService } from './../database/service/employee-worker.service'
import { Injectable, Logger } from '@nestjs/common'
import { AppException } from 'src/common/exception/app.exception'
import { FileUtilService } from 'src/common/service/file-util.service'
import { getRectificationPeriod } from 'src/common/util/rectificationPeriod'
import { SupabaseRefundService } from 'src/supabase/supabase-refund.service'
import { SimpleAuthData } from 'src/tilco/resdata/auth-api-res.data'
import { TilcoService } from 'src/tilco/tilco.service'
import { RefundCompanyService } from '../database/service/refund-company.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class RefundEmployService {
  private readonly logger = new Logger(RefundEmployService.name)
  private readonly BATCH_SIZE = 3 // 동시 API 호출 제한

  constructor(
    private readonly tilcoService: TilcoService,
    private readonly supabaseRefund: SupabaseRefundService,
    private readonly fileUtilService: FileUtilService,
    private readonly refundCompanyService: RefundCompanyService,
    private readonly employeeWorkerService: EmployeeWorkerService,
    private readonly socialInsuranceRateService: SocialInsuranceRateService,
  ) {}

  async processEmployData(
    employAuth: SimpleAuthData,
    userId: string,
    requestId: string,
  ): Promise<{
    success: boolean
    data?: {
      workplaces: any[]
      rates: any[]
      salaries: any[]
      employmentInfos: any[]
    }
  }> {
    try {
      const gwanriNoList = await this.collectWorkplaceNoData(userId, employAuth)
      if (!gwanriNoList?.length) {
        return { success: false }
      }

      const { startYear, endYear } = this.getDataCollectionPeriod()

      for (const gwanriNo of gwanriNoList) {
        for (let year = startYear; year <= endYear; year++) {
          try {
            await this.collectRateData(
              employAuth,
              userId,
              requestId,
              gwanriNo,
              year,
              startYear,
            )
          } catch (error) {
            this.logger.error(
              `사업장요율 데이터수집 실패 관리번호: ${gwanriNo}, year: ${year}:`,
              JSON.stringify(error, null, 2),
            )
            throw AppException.from(
              error,
              `사업장 ${gwanriNo} ${year}년 사업장요율 데이터 수집 실패`,
              'employ-data',
              'refund-employ',
            )
          }
        }
      }

      for (const gwanriNo of gwanriNoList) {
        try {
          await this.collectEmploymentData(
            employAuth,
            userId,
            requestId,
            gwanriNo,
          )
        } catch (error) {
          this.logger.error(
            `고용정보 데이터수집 실패 관리번호: ${gwanriNo}`,
            JSON.stringify(error, null, 2),
          )
          throw AppException.from(
            error,
            `사업장 ${gwanriNo} 고용정보 데이터 수집 실패`,
            'employ-data',
            'refund-employ',
          )
        }
      }

      // 3. 모든 Employment 데이터가 생성된 후 Salary 데이터 수집 및 업데이트
      for (const gwanriNo of gwanriNoList) {
        for (let year = startYear; year <= endYear; year++) {
          try {
            await this.collectSalaryData(
              employAuth,
              userId,
              requestId,
              gwanriNo,
              year,
              startYear,
            )
          } catch (error) {
            this.logger.error(
              `급여 데이터수집 실패 관리번호: ${gwanriNo}, year: ${year}:`,
              JSON.stringify(error, null, 2),
            )
            throw AppException.from(
              error,
              `사업장 ${gwanriNo} ${year}년 급여 데이터 수집 실패`,
              'employ-data',
              'refund-employ',
            )
          }
        }
      }

      return {
        success: true,
      }
    } catch (error) {
      this.logger.error('고용산재작업업 실패:', error)

      if (!(error instanceof AppException)) {
        throw AppException.system(
          '고용산재 데이터 처리 중 시스템 오류 발생',
          'employ-data',
          { originalError: error.message },
        )
      }

      throw error
    }
  }

  async collectWorkplaceNoData(userId: string, employAuth: SimpleAuthData) {
    try {
      const workplaceNumbers = await this.tilcoService
        .getWorkplaceManagementNumbers(employAuth)
        .catch(error => {
          throw AppException.from(
            error,
            '사업장관리번호조회 실패',
            'employ-data',
            'my-work-no',
          )
        })

      await this.fileUtilService.saveResponseToFile(
        workplaceNumbers.Result,
        `${userId}_my_workplace.txt`,
      )
      const saupjangList =
        workplaceNumbers.Result?.sessionDto?.outDatasetList?.saupjangList
      if (!saupjangList?.length) return []

      await Promise.all(
        saupjangList.map(({ GWANRI_NO, SAEOPJA_DRNO }) =>
          this.refundCompanyService.updateCompanyGwanriNo(
            GWANRI_NO,
            SAEOPJA_DRNO,
          ),
        ),
      )

      return saupjangList.map(item => item.GWANRI_NO).filter(Boolean)
    } catch (error) {
      throw AppException.from(
        error,
        `사업장관리번호 데이터 수집 실패`,
        'employ-data',
        'my-work-no',
      )
    }
  }

  private async collectRateData(
    authData: SimpleAuthData,
    userId: string,
    requestId: string,
    gwanriNo: string,
    year: number,
    startYear: number,
  ): Promise<void> {
    console.log('collect rate', `${gwanriNo}<=>${year}`)
    try {
      const rateData = await this.tilcoService.getWorkplaceRate(
        authData,
        gwanriNo,
        year,
      )

      if (rateData?.Result?.dsOutSdgSaeopjang.length === 0) {
        console.log('사업장요율 데이터가 없습니다', year.toString())
        return
      }
      if (!rateData.PdfData || typeof rateData.PdfData !== 'string') {
        console.log('유효하지않은 pdf파일입니다')
        return
      }

      await Promise.all([
        this.supabaseRefund.uploadPdfToStorage(
          rateData.PdfData,
          userId,
          `${userId}/${gwanriNo}_${year}_rate.pdf`,
        ),
        this.processRateData(
          userId,
          requestId,
          gwanriNo,
          year,
          startYear,
          rateData.Result,
        ),
      ])
    } catch (error) {
      throw AppException.from(
        error,
        `사업장요율 데이터 수집 실패 (사업장: ${gwanriNo}, 년도: ${year})`,
        'employ-data',
        'workplace-rate',
      )
    }
  }

  private async collectSalaryData(
    authData: SimpleAuthData,
    userId: string,
    requestId: string,
    gwanriNo: string,
    year: number,
    startYear: number,
  ): Promise<void> {
    console.log('collect salary', `${gwanriNo}<=>${year}`)

    try {
      const salaryData = await this.tilcoService.getSalaryDeclaration(
        authData,
        gwanriNo,
        year,
      )
      if (salaryData?.Result?.dsMokrok.length === 0) {
        console.log('보수총액 데이터가 없습니다', year.toString())
        return
      }

      await Promise.all([
        this.supabaseRefund.uploadExcelToStorage(
          salaryData.ExcelData,
          userId,
          `${userId}/${gwanriNo}_${year}_salary.xlsx`,
        ),
        this.processSalaryData(
          userId,
          requestId,
          gwanriNo,
          year,
          startYear,
          salaryData.Result,
        ),
      ])
    } catch (error) {
      throw AppException.from(
        error,
        `보수총액 데이터 수집 실패 (사업장: ${gwanriNo}, 년도: ${year})`,
        'employ-data',
        'total-salary',
      )
    }
  }

  private async collectEmploymentData(
    authData: SimpleAuthData,
    userId: string,
    requestId: string,
    gwanriNo: string,
  ): Promise<void> {
    console.log('collect employee', `${gwanriNo}`)

    try {
      const employData = await this.tilcoService.getEmploymentInfo(
        authData,
        gwanriNo,
      )

      // await this.fileUtilService.saveResponseToFile(
      //   employmentData,
      //   `${userId}_${gwanriNo}_${year.toString()}_employment.txt`,
      // )

      // if (!employData.dsOutList?.length) return

      if (employData?.Result?.dsOutList.length === 0) {
        console.log('고용현황 데이터가 없습니다')
        return
      }

      await Promise.all([
        this.supabaseRefund.uploadExcelToStorage(
          employData.ExcelData,
          userId,
          `${userId}/${gwanriNo}_employment.xlsx`,
        ),
        this.processEmploymentData(
          userId,
          requestId,
          gwanriNo,
          employData.Result,
        ),
      ])
    } catch (error) {
      throw AppException.from(
        error,
        `고용정보 데이터 수집 실패 (사업장: ${gwanriNo})`,
        'employ-data',
        'employ-info',
      )
    }
  }

  private getDataCollectionPeriod() {
    const { startYear, endYear } = getRectificationPeriod(false)
    return {
      startYear,
      endYear,
    }
  }

  private async processRateData(
    userId: string,
    requestId: string,
    gwanriNo: string,
    year: number,
    startYear: number,
    rateData: any,
  ) {
    try {
      await this.fileUtilService.saveResponseToFile(
        rateData,
        `${userId}_${gwanriNo}_${year.toString()}_rate.txt`,
      )

      const data = rateData.dsOutSdgSaeopjang[0]
      const yearIndex = year - startYear + 1

      await this.socialInsuranceRateService.createSocialInsuranceRate(
        requestId,
        data.GWANRI_NO,
        data.ILBAN_YOYUL,
        data.CHULTOEGEUN_YOYUL,
        data.GOSI_BUDAMGEUM_RATE,
        yearIndex,
      )
    } catch (error) {
      // 전체 작업의 에러를 감싸서 throw
      throw AppException.from(
        error,
        '사업장요율율 데이터처리 실패',
        'employ-data',
        'get-data',
      )
    }
  }

  private async processSalaryData(
    userId: string,
    requestId: string,
    gwanriNo: string,
    year: number,
    startYear: number,
    salaryData: any,
  ) {
    try {
      await this.fileUtilService.saveResponseToFile(
        salaryData,
        `${userId}_${gwanriNo}_${year.toString()}_salary.txt`,
      )

      // await Promise.all(
      //   salaryData.dsMokrok.map(data =>
      //     this.employeeWorkerService.updateTotalSararyPerYear(
      //       data.RGNO,
      //       data.GYB_GY_DT,
      //       data.SJB_NYEONGAN_BOSU_CHONGAK,
      //       Number(data.BOHEOM_YEAR),
      //       startYear,
      //     ),
      //   ),
      // )
      for (const data of salaryData.dsMokrok) {
        try {
          await this.employeeWorkerService.updateTotalSararyPerYear(
            data.RGNO,
            data.GYB_GY_DT,
            data.SJB_NYEONGAN_BOSU_CHONGAK,
            Number(data.BOHEOM_YEAR),
            startYear,
          )
        } catch (updateError) {
          console.error('Salary update error:', {
            RGNO: data.RGNO,
            GYB_GY_DT: data.GYB_GY_DT,
            error: updateError,
          })
          throw updateError
        }
      }
    } catch (error) {
      // 전체 작업의 에러를 감싸서 throw
      console.log('salary처리 에러러', error)
      throw AppException.from(
        error,
        '보수총액 데이터처리 실패',
        'employ-data',
        'get-data',
      )
    }
  }

  private async processEmploymentData(
    userId: string,
    requestId: string,
    gwanriNo: string,
    employmentData: any,
  ) {
    try {
      await this.fileUtilService.saveResponseToFile(
        employmentData,
        `${userId}_${gwanriNo}_employment.txt`,
      )

      const employees = employmentData.dsOutList.map(data => ({
        employeeId: uuidv4(),
        userId: requestId,
        workplaceManageNo: gwanriNo,
        employeeName: data.GEUNROJA_NM,
        employeeSocialNo: data.GEUNROJA_RGNO,
        employeeStartDate: data.SJB_JAGYEOK_CHWIDEUK_DT,
        employeeEndDate: data.SJB_JAGYEOK_SANGSIL_DT,
      }))

      for (const employee of employees) {
        await this.employeeWorkerService.createEmployeeWorker(employee)
      }

      // await Promise.all(
      //   employees.map(data =>
      //     this.employeeWorkerService.createEmployeeWorker(data),
      //   ),
      // )
    } catch (error) {
      // 전체 작업의 에러를 감싸서 throw
      throw AppException.from(
        error,
        '고용정보현황 데이터처리 실패',
        'employ-data',
        'get-data',
      )
    }
  }
}
