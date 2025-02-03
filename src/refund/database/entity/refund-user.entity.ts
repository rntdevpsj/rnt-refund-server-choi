import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseModel } from './base.entity'
import { RefundCompanyModel } from './refund-company.entity'
import { IncreaseMonthlyCountModel } from './increase-monthly-counts.entity'
import { IntegrateMonthlyCountModel } from './integrate-monthly-count.entity'
import { SocialInsuranceRateModel } from './social-insurance-rate.entity'
import { IncreaseEmployeeYearlyModel } from './increase-employee-yearly.entity'
import { IntegrateEmployeeYearlyModel } from './integrate-employee-yearly.entity'
import { TotalSalaryYearlyModel } from './total-salary-yearly.entity'
import { IncreaseEmployeeTaxCreditModel } from './increase_employee_tax_credit.entity'
import { IntegrateEmployeeTaxCreditModel } from './integrate_employee_tax_credit.entity'
import { SocialInsuranceTaxCreditModel } from './social_insurance_tax_credit.entity'
import { HometaxFillingPersonModel } from './hometax_filling_person.entity'
import {
  AuthType,
  ProgressDetail,
  ProgressStatus,
  RefundStatus,
} from 'src/common/type/refund-enum.types'
import { RefundYearlyModel } from './refund_yearly.entity'
import { EmployeeWorkerModel } from './employee-worker.entity'
import { HometaxFillingCorporateModel } from './hometax_filling_corporate.entity'

@Entity('tb_refund_user')
@Unique('tb_refund_user_user_id_key', ['userId'])
export class RefundUserModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_refund_user_pkey',
  })
  id: string

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string

  @Column({
    type: 'text',
    name: 'app_route',
    nullable: false,
  })
  appRoute: string

  @Column({
    type: 'text',
    name: 'cashnote_uid',
    nullable: true,
    comment: 'cashnote 고객id',
  })
  cashnoteUid: string

  @Column({
    type: 'text',
    name: 'sales_code',
    nullable: true,
    comment: '영업자 코드',
  })
  salesCode: string

  @Column({
    type: 'text',
    name: 'user_name',
    nullable: false,
    comment: '조회한 고객 이름',
  })
  userName: string

  @Column({
    type: 'text',
    name: 'user_mobile_no',
    nullable: false,
    comment: '조회한 고객 전화번호',
  })
  userMobileNo: string

  @Column({
    type: 'text',
    name: 'user_social_no',
    nullable: false,
    comment: '조회한 고객 주민번호',
  })
  userSocialNo: string

  @Column({
    type: 'text',
    name: 'birth_date',
    nullable: false,
  })
  birthDate: string

  @Column({
    type: 'boolean',
    name: 'company_type',
    nullable: false,
    comment: '법인, 개인 여부 : true - 법인, false - 개인',
  })
  companyType: boolean

  @Column({
    type: 'text',
    name: 'auth_type',
    nullable: false,
    default: AuthType.SIMPLEAUTH,
  })
  authType: AuthType

  @Column({
    type: 'text',
    name: 'progress_status',
    nullable: false,
    default: ProgressStatus.PENDIG,
  })
  progressStatus: ProgressStatus

  @Column({
    type: 'text',
    name: 'progress_detail',
    nullable: false,
    default: ProgressDetail.REFUNDABLE,
  })
  progressDetail: ProgressDetail

  @Column({
    type: 'text',
    name: 'refund_status',
    nullable: false,
    default: RefundStatus.APPLY,
  })
  refundStatus: RefundStatus

  @Column({
    type: 'text',
    name: 'staff_name',
    nullable: true,
    comment: '세무법인 담당자명',
  })
  staffName: string

  @Column({
    type: 'integer',
    name: 'estimated_refund_amt',
    nullable: false,
    default: 0,
    comment: '예상 환급금',
  })
  estimatedRefundAmt: number

  @Column({
    type: 'integer',
    name: 'estimated_total_carried_tax_amt',
    nullable: false,
    default: 0,
    comment: '예상 이월세액공제액',
  })
  estimatedTotalCarriedTaxAmt: number

  @OneToOne(() => IncreaseEmployeeYearlyModel, yearly => yearly.user)
  increaseEmployeeYearly: IncreaseEmployeeYearlyModel

  @OneToOne(() => IntegrateEmployeeYearlyModel, yearly => yearly.user)
  integrateEmployeeYearly: IntegrateEmployeeYearlyModel

  @OneToOne(() => TotalSalaryYearlyModel, yearly => yearly.user)
  totalSalaryYearly: TotalSalaryYearlyModel

  @OneToOne(() => IncreaseEmployeeTaxCreditModel, taxCredit => taxCredit.user)
  increaseTaxCredit: IncreaseEmployeeTaxCreditModel

  @OneToOne(() => IntegrateEmployeeTaxCreditModel, taxCredit => taxCredit.user)
  integrateTaxCredit: IntegrateEmployeeTaxCreditModel

  @OneToOne(() => SocialInsuranceTaxCreditModel, taxCredit => taxCredit.user)
  socialInsuranceTaxCredit: SocialInsuranceTaxCreditModel

  @OneToOne(
    () => HometaxFillingPersonModel,
    fillingPerson => fillingPerson.user,
  )
  hometaxFillingPerson: HometaxFillingPersonModel

  @OneToOne(
    () => HometaxFillingCorporateModel,
    fillingCorporate => fillingCorporate.user,
  )
  hometaxFillingCorporate: HometaxFillingCorporateModel

  @OneToOne(() => RefundYearlyModel, refundYearly => refundYearly.user)
  refundYearly: RefundYearlyModel

  @OneToMany(() => RefundCompanyModel, company => company.refundUser)
  companies: RefundCompanyModel[]

  @OneToMany(() => EmployeeWorkerModel, worker => worker.user)
  employees: EmployeeWorkerModel[]

  @OneToMany(() => IncreaseMonthlyCountModel, monthlyCount => monthlyCount.user)
  monthlyCountsRecords: IncreaseMonthlyCountModel[]

  @OneToMany(
    () => IntegrateMonthlyCountModel,
    monthlyCount => monthlyCount.user,
  )
  integrateMonthlyCountsRecords: IntegrateMonthlyCountModel[]

  @OneToMany(() => SocialInsuranceRateModel, rate => rate.user)
  socialInsuranceRates: SocialInsuranceRateModel[]
}
