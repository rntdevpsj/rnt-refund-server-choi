import { HometaxFillingPersonService } from './../database/service/hometax_filling_person.service'
import { Injectable, Logger } from '@nestjs/common'
import { AppException } from 'src/common/exception/app.exception'
import { FileUtilService } from 'src/common/service/file-util.service'
import { getRectificationPeriod } from 'src/common/util/rectificationPeriod'
import { SupabaseRefundService } from 'src/supabase/supabase-refund.service'
import { SimpleAuthData } from 'src/tilco/resdata/auth-api-res.data'
import { TilcoService } from 'src/tilco/tilco.service'
import { RefundCompanyModel } from '../database/entity/refund-company.entity'
import { v4 as uuidv4 } from 'uuid'
import { RefundCompanyService } from '../database/service/refund-company.service'
import { ProcessHometaxFilling } from '../util/process-hometax-filling.util'
import { HometaxFillingPerson } from '../util/hometax-filling.type'

@Injectable()
export class RefundHometaxService {
  private readonly logger = new Logger(RefundHometaxService.name)
  private readonly BATCH_SIZE = 3

  constructor(
    private readonly tilcoService: TilcoService,
    private readonly supabaseRefund: SupabaseRefundService,
    private readonly fileUtilService: FileUtilService,
    private readonly refundCompanyService: RefundCompanyService,
    private readonly hometaxFillingPersonService: HometaxFillingPersonService,
  ) {}

  async processHometaxData(
    hometaxAuth: SimpleAuthData,
    userId: string,
    requestId: string,
  ): Promise<{
    success: boolean
    data?: {
      businesses: any[]
      closures: any[]
      registrations: any[]
      declarations: any[]
    }
  }> {
    try {
      // 내사업자정보조회
      const businessNumbers = await this.tilcoService
        .myBusinessRegisterSearch(hometaxAuth)
        .catch(error => {
          throw AppException.from(
            error,
            '내사업자정보조회 실패',
            'hometax-data',
            'refund-hometax',
          )
        })

      if (!businessNumbers?.Result) {
        return { success: false }
      }

      await this.fileUtilService.saveResponseToFile(
        businessNumbers.Result,
        `${userId}_my_business.txt`,
      )

      // 사업자번호 분류
      const { activeBusinessNumbers, closedBusinessNumbers } =
        this.classifyBusinessNumbers(businessNumbers.Result)

      if (
        activeBusinessNumbers.length === 0 &&
        closedBusinessNumbers.length === 0
      ) {
        return { success: false }
      }

      console.log('my buisenss close-result', closedBusinessNumbers)
      console.log('my buisenss active-result', activeBusinessNumbers)

      // 폐업증명원 처리
      if (closedBusinessNumbers.length > 0) {
        try {
          await this.collectClosedBusiness(
            closedBusinessNumbers[0],
            userId,
            requestId,
            hometaxAuth,
          )
        } catch (error) {
          this.logger.error(
            `홈택스데이터수집 실패 - 폐업증명원, 사업자번호: ${closedBusinessNumbers[0]}`,
            error,
          )
          throw AppException.from(
            error,
            `폐업증명원 데이터 수집 실패 (사업자번호: ${closedBusinessNumbers[0]})`,
            'hometax-data',
            'refund-hometax',
          )
        }
      }

      // 사업자등록증 처리 (모든 활성 사업자번호에 대해)
      for (const businessNumber of activeBusinessNumbers) {
        try {
          await this.collectActiveBusiness(
            businessNumber,
            userId,
            requestId,
            hometaxAuth,
          )
        } catch (error) {
          this.logger.error(
            `홈택스데이터수집 실패 - 사업자등록증, 사업자번호: ${businessNumber}`,
            error,
          )
          throw AppException.from(
            error,
            `사업자등록증 데이터 수집 실패 (사업자번호: ${businessNumber})`,
            'hometax-data',
            'refund-hometax',
          )
        }
      }

      // 전자신고 처리
      const years = this.getTargetYears()
      for (const year of years) {
        try {
          await this.collectElectronicDeclaration(
            userId,
            requestId,
            year,
            hometaxAuth,
          )
        } catch (error) {
          this.logger.error(
            `홈택스데이터수집 실패 - 전자신고, 연도: ${year}`,
            error,
          )
          throw AppException.from(
            error,
            `전자신고 데이터 수집 실패 (연도: ${year})`,
            'hometax-data',
            'refund-hometax',
          )
        }
      }

      return {
        success: true,
      }
    } catch (error) {
      throw AppException.from(
        error,
        '홈택스 데이터수집 실패',
        'hometax-data',
        'refund-hometax',
      )
    }
  }
  /*
  async processHometaxData(
    hometaxAuth: SimpleAuthData,
    userId: string,
    requestId: string,
  ): Promise<{
    success: boolean
    data?: {
      businesses: any[]
      closures: any[]
      registrations: any[]
      declarations: any[]
    }
  }> {
    try {
      // 내사업자정보조회
      const businessNumbers = await this.tilcoService
        .myBusinessRegisterSearch(hometaxAuth)
        .catch(error => {
          throw AppException.from(
            error,
            '내사업자정보조회 실패',
            'hometax-data',
            'refund-hometax',
          )
        })

      if (!businessNumbers?.Result) {
        return { success: false }
      }

      await this.fileUtilService.saveResponseToFile(
        businessNumbers.Result,
        `${userId}_my_business.txt`,
      )

      // 사업자번호 분류
      const { activeBusinessNumbers, closedBusinessNumbers } =
        this.classifyBusinessNumbers(businessNumbers.Result)

      if (
        activeBusinessNumbers.length === 0 &&
        closedBusinessNumbers.length === 0
      ) {
        return { success: false }
      }

      console.log('my buisenss close-result', closedBusinessNumbers)
      console.log('my buisenss active-result', activeBusinessNumbers)

      // 데이터 수집 작업 생성
      const tasks = []

      // 폐업증명원 작업 추가
      if (closedBusinessNumbers.length !== 0) {
        tasks.push({
          task: () =>
            this.collectClosedBusiness(
              closedBusinessNumbers[0],
              userId,
              requestId,
              hometaxAuth,
            ),
          type: 'closure',
          businessNumber: closedBusinessNumbers[0],
          year: null,
        })
      }

      // 사업자등록증 작업 추가
      if (activeBusinessNumbers.length !== 0) {
        tasks.push({
          task: () =>
            this.collectActiveBusiness(
              activeBusinessNumbers[0],
              userId,
              requestId,
              hometaxAuth,
            ),
          type: 'registration',
          businessNumber: activeBusinessNumbers[0],
          year: null,
        })
      }

      // 전자신고 작업 추가
      const years = this.getTargetYears()
      years.forEach(year => {
        tasks.push({
          task: () =>
            this.collectElectronicDeclaration(
              userId,
              requestId,
              year,
              hometaxAuth,
            ),
          type: 'declaration',
          businessNumber: null,
          year,
        })
      })

      // 순차적 처리
      for (const task of tasks) {
        try {
          await task.task()
        } catch (error) {
          const errorMessage =
            `홈택스데이터수집 실패 - 타입: ${task.type}` +
            (task.businessNumber
              ? `, 사업자번호: ${task.businessNumber}`
              : '') +
            (task.year ? `, 연도: ${task.year}` : '')

          this.logger.error(errorMessage, error)

          throw AppException.from(
            error,
            `${task.type} 데이터 수집 실패` +
              (task.businessNumber
                ? ` (사업자번호: ${task.businessNumber})`
                : '') +
              (task.year ? ` (연도: ${task.year})` : ''),
            'hometax-data',
            'refund-hometax',
          )
        }
      }

      return {
        success: true,
      }
    } catch (error) {
      throw AppException.from(
        error,
        '홈택스 데이터수집 실패',
        'hometax-data',
        'refund-hometax',
      )
    }
  }
    */
  /*
  async processHometaxData(
    hometaxAuth: SimpleAuthData,
    userId: string,
    requestId: string,
  ): Promise<{
    success: boolean
    data?: {
      businesses: any[]
      closures: any[]
      registrations: any[]
      declarations: any[]
    }
  }> {
    try {
      // 내사업자정보조회
      const businessNumbers = await this.tilcoService
        .myBusinessRegisterSearch(hometaxAuth)
        .catch(error => {
          throw AppException.from(
            error,
            '내사업자정보조회 실패',
            'hometax-data',
            'refund-hometax',
          )
        })

      if (!businessNumbers?.Result) {
        return { success: false }
        // throw new Error('사업자 정보가 없습니다')
      }

      await this.fileUtilService.saveResponseToFile(
        businessNumbers.Result,
        `${userId}_my_business.txt`,
      )

      // 사업자번호 분류
      const { activeBusinessNumbers, closedBusinessNumbers } =
        this.classifyBusinessNumbers(businessNumbers.Result)

      if (
        activeBusinessNumbers.length === 0 &&
        closedBusinessNumbers.length === 0
      ) {
        return { success: false }
      }

      console.log('my buisenss close-result', closedBusinessNumbers)
      console.log('my buisenss active-result', activeBusinessNumbers)

      // 데이터 수집 작업 생성
      const tasks = []

      // 폐업증명원 작업 추가
      // closedBusinessNumbers.forEach(businessNumber => {
      //   tasks.push({
      //     task: () =>
      //       this.collectClosedBusiness(
      //         businessNumber,
      //         userId,
      //         hometaxAuth,
      //         // collectedData,
      //       ),
      //     type: 'closure',
      //     businessNumber,
      //     year: null,
      //   })
      // })
      if (closedBusinessNumbers.length !== 0) {
        tasks.push({
          task: () =>
            this.collectClosedBusiness(
              closedBusinessNumbers[0],
              userId,
              requestId,
              hometaxAuth,
              // collectedData,
            ),
          type: 'closure',
          businessNumber: closedBusinessNumbers[0],
          year: null,
        })
      }

      // 사업자등록증증 작업 추가
      // activeBusinessNumbers.forEach(businessNumber => {
      //   tasks.push({
      //     task: () =>
      //       this.collectActiveBusiness(businessNumber, userId, hometaxAuth),
      //     type: 'registration',
      //     businessNumber,
      //     year: null,
      //   })
      // })
      if (activeBusinessNumbers.length !== 0) {
        tasks.push({
          task: () =>
            this.collectActiveBusiness(
              activeBusinessNumbers[0],
              userId,
              requestId,
              hometaxAuth,
            ),
          type: 'registration',
          businessNumber: activeBusinessNumbers[0],
          year: null,
        })
      }
      // 전자신고 작업 추가
      const years = this.getTargetYears()
      years.forEach(year => {
        tasks.push({
          task: () =>
            this.collectElectronicDeclaration(
              userId,
              requestId,
              year,
              hometaxAuth,
            ),
          type: 'declaration',
          businessNumber: null,
          year,
        })
      })

      // 배치 처리
      for (let i = 0; i < tasks.length; i += this.BATCH_SIZE) {
        const batch = tasks.slice(i, i + this.BATCH_SIZE)
        try {
          await Promise.all(
            batch.map(async ({ task, type, businessNumber, year }) => {
              try {
                await task()
              } catch (error) {
                const errorMessage =
                  `홈택스데이터수집 실패 - 타입: ${type}` +
                  (businessNumber ? `, 사업자번호: ${businessNumber}` : '') +
                  (year ? `, 연도: ${year}` : '')

                this.logger.error(errorMessage, error)

                throw AppException.from(
                  error,
                  `${type} 데이터 수집 실패` +
                    (businessNumber ? ` (사업자번호: ${businessNumber})` : '') +
                    (year ? ` (연도: ${year})` : ''),
                  'hometax-data',
                  'refund-hometax',
                )
              }
            }),
          )
        } catch (error) {
          throw error
        }
      }

      return {
        success: true,
        // data: collectedData,
      }
    } catch (error) {
      throw AppException.from(
        error,
        '홈택스 데이터수집 실패',
        'hometax-data', // 현재 프로세스 step
        'refund-hometax', // 현재 작업 operation
      )
      // this.logger.error('홈택스작업 실패', error)
      // if (!(error instanceof AppException)) {
      //   throw AppException.system(
      //     '홈택스 데이터 처리 중 시스템 오류 발생',
      //     'hometax-data',
      //     { originalError: error.message },
      //   )
      // }
      // throw error
    }
  }
    */

  private classifyBusinessNumbers(businesses: any[]) {
    const activeBusinessNumbers: string[] = []
    const closedBusinessNumbers: string[] = []

    businesses.forEach(business => {
      const businessNumber = business.txprDscmNoEncCntn
      if (business.txprStatNm === '계속사업자') {
        activeBusinessNumbers.push(businessNumber)
      } else if (business.txprStatNm === '폐업') {
        closedBusinessNumbers.push(businessNumber)
      }
    })

    return { activeBusinessNumbers, closedBusinessNumbers }
  }

  private async collectClosedBusiness(
    businessNumber: string,
    userId: string,
    requestId: string,
    authData: SimpleAuthData,
  ): Promise<void> {
    try {
      const closureInfos = await this.tilcoService.getBusinessClosureInfo(
        userId,
        businessNumber,
        authData,
      )

      if (!closureInfos?.Result) {
        throw new Error('폐업증명서 데이터가 없습니다')
      }

      for (const closureInfo of closureInfos.Result) {
        if (closureInfo.PdfData) {
          await Promise.all([
            this.supabaseRefund.uploadPdfToStorage(
              closureInfo.PdfData,
              userId,
              `${userId}/${closureInfo.BusinessNumber}_closure_info.pdf`,
            ),
            this.processCloseBusinessData(userId, requestId, closureInfo),
          ]).catch(error => {
            throw AppException.from(
              error,
              '폐업증명서 자료저장 실패',
              'hometax-data',
              'system',
            )
          })

          // collectedData.closures.push(info)
        }
      }
    } catch (error) {
      throw AppException.from(
        error,
        `폐업증명서 처리 실패 (사업자번호: ${businessNumber})`,
        'hometax-data',
        'business-closure',
      )
    }
  }

  private async collectActiveBusiness(
    businessNumber: string,
    userId: string,
    requestId: string,
    authData: SimpleAuthData,
  ): Promise<void> {
    try {
      const activeInfo = await this.tilcoService.getBusinessRegistration(
        userId,
        businessNumber,
        authData,
      )

      // await this.fileUtilService.saveResponseToFile(
      //   activeInfos,
      //   `${userId}_${activeInfos.BusinessNumber}_active_info.txt`,
      // )

      if (!activeInfo?.Result) {
        throw new Error('사업자등록증 데이터가 없습니다')
      }

      if (activeInfo?.Result?.PdfData) {
        await Promise.all([
          this.supabaseRefund.uploadPdfToStorage(
            activeInfo.Result.PdfData,
            userId,
            `${userId}/${activeInfo.Result.BusinessNumber}_active_info.pdf`,
          ),
          this.processActiveBusinessData(userId, requestId, activeInfo.Result),
        ]).catch(error => {
          throw AppException.from(
            error,
            '사업자등록증 자료저장 실패',
            'hometax-data',
            'system',
          )
        })
        // collectedData.registrations.push(info)
      }
    } catch (error) {
      throw AppException.from(
        error,
        `사업자등록증 처리 실패 (사업자번호: ${businessNumber})`,
        'hometax-data',
        'business-register',
      )
    }
  }

  private async collectElectronicDeclaration(
    userId: string,
    requestId: string,
    year: number,
    authData: SimpleAuthData,
  ): Promise<void> {
    try {
      const declaration = await this.tilcoService.getElectronicDeclaration(
        userId,
        year.toString(),
        authData,
      )

      if (declaration.PdfList?.length > 0) {
        await Promise.all([
          // PDF 파일 업로드
          this.supabaseRefund.uploadPdfToStorage(
            declaration.PdfList[0], // 첫 번째 PDF 데이터
            userId,
            `${userId}/${year.toString()}_declaration.pdf`,
          ),
          // Result 데이터 처리
          this.processDeclarationData(
            userId,
            requestId,
            year,
            declaration.Result[0],
          ),
        ]).catch(error => {
          throw AppException.from(
            error,
            '전자신고 자료저장 실패',
            'hometax-data',
            'system',
          )
        })
        // collectedData.declarations.push(declaration.Result[0])
      }
    } catch (error) {
      throw AppException.from(
        error,
        `전자신고 처리 실패 (년도: ${year})`,
        'hometax-data',
        'electronic-declaration',
      )
    }
  }

  private async processCloseBusinessData(
    userId: string,
    requestId: string,
    closureInfo: any,
  ) {
    try {
      await this.fileUtilService.saveResponseToFile(
        closureInfo,
        `${userId}_${closureInfo.BusinessNumber}_business_closure.txt`,
      )

      const createData: Partial<RefundCompanyModel> = {
        userId: requestId,
        companyId: uuidv4(),
        companyName: closureInfo.JsonData.cvaTticaad014DVO.tnmNm,
        businessNo: closureInfo.BusinessNumber,
        address: closureInfo.JsonData.cvaTticaad014DVO.ldAdr,
        locationType: ['서울', '경기', '인천'].includes(
          closureInfo.JsonData.cvaTticaad014DVO.ldAdr.slice(0, 2),
        ),
      }
      await this.refundCompanyService.createCompany(createData)
    } catch (error) {
      // 전체 작업의 에러를 감싸서 throw
      throw AppException.from(
        error,
        '폐업증명원 데이터처리 실패',
        'hometax-data',
        'get-data',
      )
    }
  }

  private async processActiveBusinessData(
    userId: string,
    requestId: string,
    activeInfo: any,
  ) {
    try {
      await this.fileUtilService.saveResponseToFile(
        activeInfo,
        `${userId}_${activeInfo.BusinessNumber}_active_info.txt`,
      )

      const createData: Partial<RefundCompanyModel> = {
        userId: requestId,
        companyId: uuidv4(),
        companyName: activeInfo.JsonData.cvaTticaad014DVO.tnmNm,
        businessNo: activeInfo.BusinessNumber,
        address: activeInfo.JsonData.cvaTticaad014DVO.ldAdr,
        locationType: ['서울', '경기', '인천'].includes(
          activeInfo.JsonData.cvaTticaad014DVO.ldAdr.slice(0, 2),
        ),
      }
      await this.refundCompanyService.createCompany(createData)
    } catch (error) {
      // 전체 작업의 에러를 감싸서 throw
      throw AppException.from(
        error,
        '사업자증명서 데이터처리 실패',
        'hometax-data',
        'get-data',
      )
    }
  }

  private async processDeclarationData(
    userId: string,
    requestId: string,
    year: number,
    declaration: any,
  ) {
    try {
      await this.fileUtilService.saveResponseToFile(
        declaration,
        `${userId}_${year.toString()}_declaration.txt`,
      )

      // declaration데이터를 ReportPerson구조로 데이터변환작업 필요
      const { data, error } = ProcessHometaxFilling.processHometaxFillingData(
        declaration.Reports,
        year,
      )
      if (error) {
        throw AppException.from(
          new Error(error.message),
          'hometax-filling 데이터 처리 실패',
          'hometax-data',
          'get-data',
        )
      }

      console.log('hometax filling person start')
      const hometaxData: HometaxFillingPerson = {
        ...data,
        userId: requestId,
      }
      await this.hometaxFillingPersonService.createHometaxFillingPerson(
        hometaxData,
      )

      console.log('hometax filling person end')

      const businessReport = declaration?.Reports?.find(
        item => item.ReportName === '사업소득명세서',
      )
      if (!businessReport?.ttirndl008DVOList?.rows?.length) return

      // console.log('type code update시작', businessReport)

      await Promise.all(
        businessReport.ttirndl008DVOList.rows.map(({ bsno, mtfbCd }) =>
          this.refundCompanyService.updateBusinessTypeCode(bsno, mtfbCd),
        ),
      )
      console.log('type code 완료료')
    } catch (error) {
      // 전체 작업의 에러를 감싸서 throw
      throw AppException.from(
        error,
        '사업자증명서 데이터처리 실패',
        'hometax-data',
        'get-data',
      )
    }
  }

  private getTargetYears(): number[] {
    const { startYear, endYear } = getRectificationPeriod(false)
    const years: number[] = []
    for (let year = startYear; year <= endYear; year++) {
      years.push(year)
    }
    return years
  }
}
