// refund-yearly.entity.ts - Part 1
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseModel } from './base.entity'
import { RefundUserModel } from './refund-user.entity'

@Entity('tb_refund_yearly')
@Unique('tb_refund_yearly_user_id_key', ['userId'])
export class RefundYearlyModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_refund_yearly_pkey',
  })
  id: string

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string

  @Column({
    type: 'integer',
    name: 'refund_limit_year1',
    nullable: true,
    default: 0,
    comment: '환급가능한도 1차년도',
  })
  refundLimitYear1: number

  @Column({
    type: 'integer',
    name: 'refund_limit_year2',
    nullable: true,
    default: 0,
    comment: '환급가능한도 2차년도',
  })
  refundLimitYear2: number

  @Column({
    type: 'integer',
    name: 'refund_limit_year3',
    nullable: true,
    default: 0,
    comment: '환급가능한도 3차년도',
  })
  refundLimitYear3: number

  @Column({
    type: 'integer',
    name: 'refund_limit_year4',
    nullable: true,
    default: 0,
    comment: '환급가능한도 4차년도',
  })
  refundLimitYear4: number

  @Column({
    type: 'integer',
    name: 'refund_limit_year5',
    nullable: true,
    default: 0,
    comment: '환급가능한도 5차년도',
  })
  refundLimitYear5: number

  // Surplus tax fields
  @Column({
    type: 'integer',
    name: 'surplus_tax_year1',
    nullable: true,
    default: 0,
    comment: '추가납부세액 1차년도',
  })
  surplusTaxYear1: number

  @Column({
    type: 'integer',
    name: 'surplus_tax_year2',
    nullable: true,
    default: 0,
    comment: '추가납부세액 2차년도',
  })
  surplusTaxYear2: number

  @Column({
    type: 'integer',
    name: 'surplus_tax_year3',
    nullable: true,
    default: 0,
    comment: '추가납부세액 3차년도',
  })
  surplusTaxYear3: number

  @Column({
    type: 'integer',
    name: 'surplus_tax_year4',
    nullable: true,
    default: 0,
    comment: '추가납부세액 4차년도',
  })
  surplusTaxYear4: number

  @Column({
    type: 'integer',
    name: 'surplus_tax_year5',
    nullable: true,
    default: 0,
    comment: '추가납부세액 5차년도',
  })
  surplusTaxYear5: number

  // Paid agricultural tax fields
  @Column({
    type: 'integer',
    name: 'paid_agricultural_tax_year1',
    nullable: true,
    default: 0,
    comment: '농특세납부액 1차년도',
  })
  paidAgriculturalTaxYear1: number

  @Column({
    type: 'integer',
    name: 'paid_agricultural_tax_year2',
    nullable: true,
    default: 0,
    comment: '농특세납부액 2차년도',
  })
  paidAgriculturalTaxYear2: number

  @Column({
    type: 'integer',
    name: 'paid_agricultural_tax_year3',
    nullable: true,
    default: 0,
    comment: '농특세납부액 3차년도',
  })
  paidAgriculturalTaxYear3: number

  @Column({
    type: 'integer',
    name: 'paid_agricultural_tax_year4',
    nullable: true,
    default: 0,
    comment: '농특세납부액 4차년도',
  })
  paidAgriculturalTaxYear4: number

  @Column({
    type: 'integer',
    name: 'paid_agricultural_tax_year5',
    nullable: true,
    default: 0,
    comment: '농특세납부액 5차년도',
  })
  paidAgriculturalTaxYear5: number

  // Increase total credit fields
  @Column({
    type: 'integer',
    name: 'increase_total_credit_year1',
    nullable: true,
    default: 0,
    comment: '고용증대 공제액 합계 1차년도',
  })
  increaseTotalCreditYear1: number

  @Column({
    type: 'integer',
    name: 'increase_total_credit_year2',
    nullable: true,
    default: 0,
    comment: '고용증대 공제액 합계 2차년도',
  })
  increaseTotalCreditYear2: number

  @Column({
    type: 'integer',
    name: 'increase_total_credit_year3',
    nullable: true,
    default: 0,
    comment: '고용증대 공제액 합계 3차년도',
  })
  increaseTotalCreditYear3: number

  @Column({
    type: 'integer',
    name: 'increase_total_credit_year4',
    nullable: true,
    default: 0,
    comment: '고용증대 공제액 합계 4차년도',
  })
  increaseTotalCreditYear4: number

  @Column({
    type: 'integer',
    name: 'increase_total_credit_year5',
    nullable: true,
    default: 0,
    comment: '고용증대 공제액 합계 5차년도',
  })
  increaseTotalCreditYear5: number

  // Integrate total credit fields
  @Column({
    type: 'integer',
    name: 'integrate_total_credit_year1',
    nullable: true,
    default: 0,
    comment: '통합고용 공제액 합계 1차년도',
  })
  integrateTotalCreditYear1: number

  @Column({
    type: 'integer',
    name: 'integrate_total_credit_year2',
    nullable: true,
    default: 0,
    comment: '통합고용 공제액 합계 2차년도',
  })
  integrateTotalCreditYear2: number

  @Column({
    type: 'integer',
    name: 'integrate_total_credit_year3',
    nullable: true,
    default: 0,
    comment: '통합고용 공제액 합계 3차년도',
  })
  integrateTotalCreditYear3: number

  @Column({
    type: 'integer',
    name: 'integrate_total_credit_year4',
    nullable: true,
    default: 0,
    comment: '통합고용 공제액 합계 4차년도',
  })
  integrateTotalCreditYear4: number

  @Column({
    type: 'integer',
    name: 'integrate_total_credit_year5',
    nullable: true,
    default: 0,
    comment: '통합고용 공제액 합계 5차년도',
  })
  integrateTotalCreditYear5: number

  // Social insurance credit fields
  @Column({
    type: 'integer',
    name: 'social_insurance_total_credit_year1',
    nullable: true,
    default: 0,
    comment: '사회보험 공제액 합계 1차년도',
  })
  socialInsuranceTotalCreditYear1: number

  @Column({
    type: 'integer',
    name: 'social_insurance_total_credit_year2',
    nullable: true,
    default: 0,
    comment: '사회보험 공제액 합계 2차년도',
  })
  socialInsuranceTotalCreditYear2: number

  @Column({
    type: 'integer',
    name: 'social_insurance_total_credit_year3',
    nullable: true,
    default: 0,
    comment: '사회보험 공제액 합계 3차년도',
  })
  socialInsuranceTotalCreditYear3: number

  @Column({
    type: 'integer',
    name: 'social_insurance_total_credit_year4',
    nullable: true,
    default: 0,
    comment: '사회보험 공제액 합계 4차년도',
  })
  socialInsuranceTotalCreditYear4: number

  @Column({
    type: 'integer',
    name: 'social_insurance_total_credit_year5',
    nullable: true,
    default: 0,
    comment: '사회보험 공제액 합계 5차년도',
  })
  socialInsuranceTotalCreditYear5: number

  // Increase total pay tax fields
  @Column({
    type: 'integer',
    name: 'increase_total_pay_tax_year1',
    nullable: true,
    default: 0,
    comment: '고용증대 추가납부액 합계 1차년도',
  })
  increaseTotalPayTaxYear1: number

  @Column({
    type: 'integer',
    name: 'increase_total_pay_tax_year2',
    nullable: true,
    default: 0,
    comment: '고용증대 추가납부액 합계 2차년도',
  })
  increaseTotalPayTaxYear2: number

  @Column({
    type: 'integer',
    name: 'increase_total_pay_tax_year3',
    nullable: true,
    default: 0,
    comment: '고용증대 추가납부액 합계 3차년도',
  })
  increaseTotalPayTaxYear3: number

  @Column({
    type: 'integer',
    name: 'increase_total_pay_tax_year4',
    nullable: true,
    default: 0,
    comment: '고용증대 추가납부액 합계 4차년도',
  })
  increaseTotalPayTaxYear4: number

  @Column({
    type: 'integer',
    name: 'increase_total_pay_tax_year5',
    nullable: true,
    default: 0,
    comment: '고용증대 추가납부액 합계 5차년도',
  })
  increaseTotalPayTaxYear5: number

  // Integrate total pay tax fields
  @Column({
    type: 'integer',
    name: 'integrate_total_pay_tax_year1',
    nullable: true,
    default: 0,
    comment: '통합고용 추가납부액 합계 1차년도',
  })
  integrateTotalPayTaxYear1: number

  @Column({
    type: 'integer',
    name: 'integrate_total_pay_tax_year2',
    nullable: true,
    default: 0,
    comment: '통합고용 추가납부액 합계 2차년도',
  })
  integrateTotalPayTaxYear2: number

  @Column({
    type: 'integer',
    name: 'integrate_total_pay_tax_year3',
    nullable: true,
    default: 0,
    comment: '통합고용 추가납부액 합계 3차년도',
  })
  integrateTotalPayTaxYear3: number

  @Column({
    type: 'integer',
    name: 'integrate_total_pay_tax_year4',
    nullable: true,
    default: 0,
    comment: '통합고용 추가납부액 합계 4차년도',
  })
  integrateTotalPayTaxYear4: number

  @Column({
    type: 'integer',
    name: 'integrate_total_pay_tax_year5',
    nullable: true,
    default: 0,
    comment: '통합고용 추가납부액 합계 5차년도',
  })
  integrateTotalPayTaxYear5: number

  // Social insurance total pay tax fields
  @Column({
    type: 'integer',
    name: 'social_insurance_total_pay_tax_year1',
    nullable: true,
    default: 0,
    comment: '사회보험 추가납부세액 합계 1차년도',
  })
  socialInsuranceTotalPayTaxYear1: number

  @Column({
    type: 'integer',
    name: 'social_insurance_total_pay_tax_year2',
    nullable: true,
    default: 0,
    comment: '사회보험 추가납부세액 합계 2차년도',
  })
  socialInsuranceTotalPayTaxYear2: number

  @Column({
    type: 'integer',
    name: 'social_insurance_total_pay_tax_year3',
    nullable: true,
    default: 0,
    comment: '사회보험 추가납부세액 합계 3차년도',
  })
  socialInsuranceTotalPayTaxYear3: number

  @Column({
    type: 'integer',
    name: 'social_insurance_total_pay_tax_year4',
    nullable: true,
    default: 0,
    comment: '사회보험 추가납부세액 합계 4차년도',
  })
  socialInsuranceTotalPayTaxYear4: number

  @Column({
    type: 'integer',
    name: 'social_insurance_total_pay_tax_year5',
    nullable: true,
    default: 0,
    comment: '사회보험 추가납부세액 합계 5차년도',
  })
  socialInsuranceTotalPayTaxYear5: number

  // Increase yearly use credit fields
  @Column({
    type: 'integer',
    name: 'increase_yearly_use_credit_year1',
    nullable: true,
    default: 0,
    comment: '고용증대 연도별사용액 1차년도',
  })
  increaseYearlyUseCreditYear1: number

  @Column({
    type: 'integer',
    name: 'increase_yearly_use_credit_year2',
    nullable: true,
    default: 0,
    comment: '고용증대 연도별사용액 2차년도',
  })
  increaseYearlyUseCreditYear2: number

  @Column({
    type: 'integer',
    name: 'increase_yearly_use_credit_year3',
    nullable: true,
    default: 0,
    comment: '고용증대 연도별사용액 3차년도',
  })
  increaseYearlyUseCreditYear3: number

  @Column({
    type: 'integer',
    name: 'increase_yearly_use_credit_year4',
    nullable: true,
    default: 0,
    comment: '고용증대 연도별사용액 4차년도',
  })
  increaseYearlyUseCreditYear4: number

  @Column({
    type: 'integer',
    name: 'increase_yearly_use_credit_year5',
    nullable: true,
    default: 0,
    comment: '고용증대 연도별사용액 5차년도',
  })
  increaseYearlyUseCreditYear5: number

  // Integrate yearly use credit fields
  @Column({
    type: 'integer',
    name: 'integrate_yearly_use_credit_year1',
    nullable: true,
    default: 0,
    comment: '통합고용 연도별사용액 1차년도',
  })
  integrateYearlyUseCreditYear1: number

  @Column({
    type: 'integer',
    name: 'integrate_yearly_use_credit_year2',
    nullable: true,
    default: 0,
    comment: '통합고용 연도별사용액 2차년도',
  })
  integrateYearlyUseCreditYear2: number

  @Column({
    type: 'integer',
    name: 'integrate_yearly_use_credit_year3',
    nullable: true,
    default: 0,
    comment: '통합고용 연도별사용액 3차년도',
  })
  integrateYearlyUseCreditYear3: number

  @Column({
    type: 'integer',
    name: 'integrate_yearly_use_credit_year4',
    nullable: true,
    default: 0,
    comment: '통합고용 연도별사용액 4차년도',
  })
  integrateYearlyUseCreditYear4: number

  @Column({
    type: 'integer',
    name: 'integrate_yearly_use_credit_year5',
    nullable: true,
    default: 0,
    comment: '통합고용 연도별사용액 5차년도',
  })
  integrateYearlyUseCreditYear5: number

  // Social insurance yearly use credit fields
  @Column({
    type: 'integer',
    name: 'social_insurance_yearly_use_credit_year1',
    nullable: true,
    default: 0,
    comment: '사회보험 연도별사용액 1차년도',
  })
  socialInsuranceYearlyUseCreditYear1: number

  @Column({
    type: 'integer',
    name: 'social_insurance_yearly_use_credit_year2',
    nullable: true,
    default: 0,
    comment: '사회보험 연도별사용액 2차년도',
  })
  socialInsuranceYearlyUseCreditYear2: number

  @Column({
    type: 'integer',
    name: 'social_insurance_yearly_use_credit_year3',
    nullable: true,
    default: 0,
    comment: '사회보험 연도별사용액 3차년도',
  })
  socialInsuranceYearlyUseCreditYear3: number

  @Column({
    type: 'integer',
    name: 'social_insurance_yearly_use_credit_year4',
    nullable: true,
    default: 0,
    comment: '사회보험 연도별사용액 4차년도',
  })
  socialInsuranceYearlyUseCreditYear4: number

  @Column({
    type: 'integer',
    name: 'social_insurance_yearly_use_credit_year5',
    nullable: true,
    default: 0,
    comment: '사회보험 연도별사용액 5차년도',
  })
  socialInsuranceYearlyUseCreditYear5: number

  // Create agricultural tax fields
  @Column({
    type: 'integer',
    name: 'create_agricultural_tax_year1',
    nullable: true,
    default: 0,
    comment: '농특세발생액 1차년도',
  })
  createAgriculturalTaxYear1: number

  @Column({
    type: 'integer',
    name: 'create_agricultural_tax_year2',
    nullable: true,
    default: 0,
    comment: '농특세발생액 2차년도',
  })
  createAgriculturalTaxYear2: number

  @Column({
    type: 'integer',
    name: 'create_agricultural_tax_year3',
    nullable: true,
    default: 0,
    comment: '농특세발생액 3차년도',
  })
  createAgriculturalTaxYear3: number

  @Column({
    type: 'integer',
    name: 'create_agricultural_tax_year4',
    nullable: true,
    default: 0,
    comment: '농특세발생액 4차년도',
  })
  createAgriculturalTaxYear4: number

  @Column({
    type: 'integer',
    name: 'create_agricultural_tax_year5',
    nullable: true,
    default: 0,
    comment: '농특세발생액 5차년도',
  })
  createAgriculturalTaxYear5: number

  // Increase carried tax fields
  @Column({
    type: 'integer',
    name: 'increase_carried_tax_year1',
    nullable: true,
    default: 0,
    comment: '고용증대 이월공제세액 1차년도',
  })
  increaseCarriedTaxYear1: number

  @Column({
    type: 'integer',
    name: 'increase_carried_tax_year2',
    nullable: true,
    default: 0,
    comment: '고용증대 이월공제세액 2차년도',
  })
  increaseCarriedTaxYear2: number

  @Column({
    type: 'integer',
    name: 'increase_carried_tax_year3',
    nullable: true,
    default: 0,
    comment: '고용증대 이월공제세액 3차년도',
  })
  increaseCarriedTaxYear3: number

  @Column({
    type: 'integer',
    name: 'increase_carried_tax_year4',
    nullable: true,
    default: 0,
    comment: '고용증대 이월공제세액 4차년도',
  })
  increaseCarriedTaxYear4: number

  @Column({
    type: 'integer',
    name: 'increase_carried_tax_year5',
    nullable: true,
    default: 0,
    comment: '고용증대 이월공제세액 5차년도',
  })
  increaseCarriedTaxYear5: number

  // Integrate carried tax fields
  @Column({
    type: 'integer',
    name: 'integrate_carried_tax_year1',
    nullable: true,
    default: 0,
    comment: '통합고용 이월공제세액 1차년도',
  })
  integrateCarriedTaxYear1: number

  @Column({
    type: 'integer',
    name: 'integrate_carried_tax_year2',
    nullable: true,
    default: 0,
    comment: '통합고용 이월공제세액 2차년도',
  })
  integrateCarriedTaxYear2: number

  @Column({
    type: 'integer',
    name: 'integrate_carried_tax_year3',
    nullable: true,
    default: 0,
    comment: '통합고용 이월공제세액 3차년도',
  })
  integrateCarriedTaxYear3: number

  @Column({
    type: 'integer',
    name: 'integrate_carried_tax_year4',
    nullable: true,
    default: 0,
    comment: '통합고용 이월공제세액 4차년도',
  })
  integrateCarriedTaxYear4: number

  @Column({
    type: 'integer',
    name: 'integrate_carried_tax_year5',
    nullable: true,
    default: 0,
    comment: '통합고용 이월공제세액 5차년도',
  })
  integrateCarriedTaxYear5: number

  // Social insurance carried tax fields
  @Column({
    type: 'integer',
    name: 'social_insurance_carried_tax_year1',
    nullable: true,
    default: 0,
    comment: '사회보험 이월세액공제액 1차년도',
  })
  socialInsuranceCarriedTaxYear1: number

  @Column({
    type: 'integer',
    name: 'social_insurance_carried_tax_year2',
    nullable: true,
    default: 0,
    comment: '사회보험 이월세액공제액 2차년도',
  })
  socialInsuranceCarriedTaxYear2: number

  @Column({
    type: 'integer',
    name: 'social_insurance_carried_tax_year3',
    nullable: true,
    default: 0,
    comment: '사회보험 이월세액공제액 3차년도',
  })
  socialInsuranceCarriedTaxYear3: number

  @Column({
    type: 'integer',
    name: 'social_insurance_carried_tax_year4',
    nullable: true,
    default: 0,
    comment: '사회보험 이월세액공제액 4차년도',
  })
  socialInsuranceCarriedTaxYear4: number

  @Column({
    type: 'integer',
    name: 'social_insurance_carried_tax_year5',
    nullable: true,
    default: 0,
    comment: '사회보험 이월세액공제액 5차년도',
  })
  socialInsuranceCarriedTaxYear5: number

  // Total carried tax fields
  @Column({
    type: 'integer',
    name: 'total_carried_tax_year1',
    nullable: true,
    default: 0,
    comment: '총 이월세액공제액 1차년도',
  })
  totalCarriedTaxYear1: number

  @Column({
    type: 'integer',
    name: 'total_carried_tax_year2',
    nullable: true,
    default: 0,
    comment: '총 이월세액공제액 2차년도',
  })
  totalCarriedTaxYear2: number

  @Column({
    type: 'integer',
    name: 'total_carried_tax_year3',
    nullable: true,
    default: 0,
    comment: '총 이월세액공제액 3차년도',
  })
  totalCarriedTaxYear3: number

  @Column({
    type: 'integer',
    name: 'total_carried_tax_year4',
    nullable: true,
    default: 0,
    comment: '총 이월세액공제액 4차년도',
  })
  totalCarriedTaxYear4: number

  @Column({
    type: 'integer',
    name: 'total_carried_tax_year5',
    nullable: true,
    default: 0,
    comment: '총 이월세액공제액 5차년도',
  })
  totalCarriedTaxYear5: number

  // Refund amount fields
  @Column({
    type: 'integer',
    name: 'refund_amt_year1',
    nullable: true,
    default: 0,
    comment: '연도별 환급금 1차년도',
  })
  refundAmtYear1: number

  @Column({
    type: 'integer',
    name: 'refund_amt_year2',
    nullable: true,
    default: 0,
    comment: '연도별 환급금 2차년도',
  })
  refundAmtYear2: number

  @Column({
    type: 'integer',
    name: 'refund_amt_year3',
    nullable: true,
    default: 0,
    comment: '연도별 환급금 3차년도',
  })
  refundAmtYear3: number

  @Column({
    type: 'integer',
    name: 'refund_amt_year4',
    nullable: true,
    default: 0,
    comment: '연도별 환급금 4차년도',
  })
  refundAmtYear4: number

  @Column({
    type: 'integer',
    name: 'refund_amt_year5',
    nullable: true,
    default: 0,
    comment: '연도별 환급금 5차년도',
  })
  refundAmtYear5: number

  @OneToOne(() => RefundUserModel, user => user.refundYearly, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'tb_refund_yearly_user_id_tb_refund_user_id_fk',
    },
  ])
  user: RefundUserModel
}
