import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RefundCompanyModel } from '../entity/refund-company.entity'
import { AppException } from 'src/common/exception/app.exception'

@Injectable()
export class RefundCompanyService {
  constructor(
    @InjectRepository(RefundCompanyModel)
    private readonly refundCompanyRepository: Repository<RefundCompanyModel>,
  ) {}

  /**
   * 단일 회사 생성
   * @param company - 생성할 회사 정보
   */
  async createCompany(
    company: Partial<RefundCompanyModel>,
  ): Promise<RefundCompanyModel> {
    try {
      const companyEntity = this.refundCompanyRepository.create(company)
      return await this.refundCompanyRepository.save(companyEntity)
    } catch (error) {
      throw AppException.database('company 테이블 생성 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async updateCompanyGwanriNo(gwanriNo: string, businessNo: string) {
    try {
      return this.refundCompanyRepository.update(
        { businessNo },
        { workplaceManageNo: gwanriNo },
      )
    } catch (error) {
      throw AppException.database(
        'company 테이블 관리번호 수정 실패',
        'system',
        {
          originalError: error.message,
        },
      )
    }
  }

  async updateBusinessTypeCode(bsno: string, businessTypeCode: string) {
    try {
      return this.refundCompanyRepository.update(
        { businessNo: bsno },
        { businessTypeCode },
      )
    } catch (error) {
      throw AppException.database(
        'company 테이블 업종코드 수정 실패',
        'system',
        {
          originalError: error.message,
        },
      )
    }
  }

  async getRefundCompanies(userId: string) {
    try {
      const refundCompanies = await this.refundCompanyRepository.find({
        where: { userId },
      })

      return refundCompanies
    } catch (error) {
      throw AppException.database('company 테이블 조회 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  /**************************************************************
   * 여러 회사 정보를 일괄 생성
   * @param companies - 생성할 회사 정보 배열
   */
  async createCompanies(
    companies: Partial<RefundCompanyModel>[],
  ): Promise<RefundCompanyModel[]> {
    const companyEntities = this.refundCompanyRepository.create(companies)
    return await this.refundCompanyRepository.save(companyEntities)
  }

  /**
   * 여러 회사 정보를 일괄 업데이트
   * @param companies - 업데이트할 회사 정보 배열 (id 필수)
   */
  async updateCompanies(
    companies: Partial<RefundCompanyModel>[],
  ): Promise<RefundCompanyModel[]> {
    const validCompanies = companies.filter(company => company.id)

    const updatePromises = validCompanies.map(async company => {
      const existingCompany = await this.refundCompanyRepository.findOne({
        where: { id: company.id },
      })

      if (existingCompany) {
        Object.assign(existingCompany, company)
        return await this.refundCompanyRepository.save(existingCompany)
      }
      return null
    })

    const updatedCompanies = await Promise.all(updatePromises)
    return updatedCompanies.filter(company => company !== null)
  }

  /**
   * userId로 회사 정보 목록 조회
   * @param userId - 조회할 사용자 ID
   */
  async findByUserId(userId: string): Promise<RefundCompanyModel[]> {
    return await this.refundCompanyRepository.find({
      where: { userId },
      relations: ['refundUser'],
    })
  }

  /**
   * 단일 회사 업데이트
   * @param id - 업데이트할 회사의 id
   * @param companyData - 업데이트할 데이터
   */
  async updateCompany(
    id: string,
    companyData: Partial<RefundCompanyModel>,
  ): Promise<RefundCompanyModel> {
    await this.refundCompanyRepository.update(id, companyData)
    return await this.refundCompanyRepository.findOne({
      where: { id },
      relations: ['refundUser'],
    })
  }

  /**
   * 사업자등록번호로 회사 정보 조회
   * @param businessNo - 조회할 사업자등록번호
   */
  async findByBusinessNo(businessNo: string): Promise<RefundCompanyModel> {
    return await this.refundCompanyRepository.findOne({
      where: { businessNo },
      relations: ['refundUser'],
    })
  }

  /**
   * 특정 사용자의 회사 정보 삭제
   * @param userId - 삭제할 회사들의 사용자 ID
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.refundCompanyRepository.delete({ userId })
  }

  /**
   * id로 회사 존재 여부 확인
   * @param id - 확인할 회사의 id
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.refundCompanyRepository.count({
      where: { id },
    })
    return count > 0
  }
}

/*
// 회사 정보 생성
const company = {
  userId: 'user-uuid',
  companyName: '테스트 회사',
  businessNo: '123-45-67890',
  // businessStartDate와 locationType은 기본값이 자동으로 설정됨
}

// 생성
const createdCompany = await refundCompanyService.createCompany(company);

// userId로 회사 목록 조회
const userCompanies = await refundCompanyService.findByUserId('user-uuid');

// 사업자등록번호로 조회
const companyByBusinessNo = await refundCompanyService.findByBusinessNo('123-45-67890');
*/
