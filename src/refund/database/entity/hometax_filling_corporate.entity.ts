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

@Entity('tb_hometax_filling_corporate')
@Unique('tb_hometax_filling_corporate_user_id_key', ['userId'])
export class HometaxFillingCorporateModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_hometax_filling_corporate_pkey',
  })
  id: string

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string

  @Column({
    type: 'text',
    name: 'business_period_year1',
    nullable: true,
    comment: '사업연도 1차년도',
  })
  businessPeriodYear1: string

  @Column({
    type: 'text',
    name: 'business_period_year2',
    nullable: true,
    comment: '사업연도 2차년도',
  })
  businessPeriodYear2: string

  @Column({
    type: 'text',
    name: 'business_period_year3',
    nullable: true,
    comment: '사업연도 3차년도',
  })
  businessPeriodYear3: string

  @Column({
    type: 'text',
    name: 'business_period_year4',
    nullable: true,
    comment: '사업연도 4차년도',
  })
  businessPeriodYear4: string

  @Column({
    type: 'text',
    name: 'business_period_year5',
    nullable: true,
    comment: '사업연도 5차년도',
  })
  businessPeriodYear5: string

  // Taxation Standard Years 1-5
  @Column({
    type: 'integer',
    name: 'taxation_standard_year1',
    nullable: true,
    default: 0,
    comment: '과세표준 1차년도',
  })
  taxationStandardYear1: number

  @Column({
    type: 'integer',
    name: 'taxation_standard_year2',
    nullable: true,
    default: 0,
    comment: '과세표준 2차년도',
  })
  taxationStandardYear2: number

  @Column({
    type: 'integer',
    name: 'taxation_standard_year3',
    nullable: true,
    default: 0,
    comment: '과세표준 3차년도',
  })
  taxationStandardYear3: number

  @Column({
    type: 'integer',
    name: 'taxation_standard_year4',
    nullable: true,
    default: 0,
    comment: '과세표준 4차년도',
  })
  taxationStandardYear4: number

  @Column({
    type: 'integer',
    name: 'taxation_standard_year5',
    nullable: true,
    default: 0,
    comment: '과세표준 5차년도',
  })
  taxationStandardYear5: number

  // Calculated Tax Years 1-5
  @Column({
    type: 'integer',
    name: 'calculated_tax_year1',
    nullable: true,
    default: 0,
    comment: '산출세액 1차년도',
  })
  calculatedTaxYear1: number

  @Column({
    type: 'integer',
    name: 'calculated_tax_year2',
    nullable: true,
    default: 0,
    comment: '산출세액 2차년도',
  })
  calculatedTaxYear2: number

  @Column({
    type: 'integer',
    name: 'calculated_tax_year3',
    nullable: true,
    default: 0,
    comment: '산출세액 3차년도',
  })
  calculatedTaxYear3: number

  @Column({
    type: 'integer',
    name: 'calculated_tax_year4',
    nullable: true,
    default: 0,
    comment: '산출세액 4차년도',
  })
  calculatedTaxYear4: number

  @Column({
    type: 'integer',
    name: 'calculated_tax_year5',
    nullable: true,
    default: 0,
    comment: '산출세액 5차년도',
  })
  calculatedTaxYear5: number

  // Tax Reduction Years 1-5
  @Column({
    type: 'integer',
    name: 'tax_reduction_year1',
    nullable: true,
    default: 0,
    comment: '세액감면 1차년도',
  })
  taxReductionYear1: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_year2',
    nullable: true,
    default: 0,
    comment: '세액감면 2차년도',
  })
  taxReductionYear2: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_year3',
    nullable: true,
    default: 0,
    comment: '세액감면 3차년도',
  })
  taxReductionYear3: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_year4',
    nullable: true,
    default: 0,
    comment: '세액감면 4차년도',
  })
  taxReductionYear4: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_year5',
    nullable: true,
    default: 0,
    comment: '세액감면 5차년도',
  })
  taxReductionYear5: number

  // Tax Credit Years 1-5
  @Column({
    type: 'integer',
    name: 'tax_credit_year1',
    nullable: true,
    default: 0,
    comment: '세액공제 1차년도',
  })
  taxCreditYear1: number

  @Column({
    type: 'integer',
    name: 'tax_credit_year2',
    nullable: true,
    default: 0,
    comment: '세액공제 2차년도',
  })
  taxCreditYear2: number

  @Column({
    type: 'integer',
    name: 'tax_credit_year3',
    nullable: true,
    default: 0,
    comment: '세액공제 3차년도',
  })
  taxCreditYear3: number

  @Column({
    type: 'integer',
    name: 'tax_credit_year4',
    nullable: true,
    default: 0,
    comment: '세액공제 4차년도',
  })
  taxCreditYear4: number

  @Column({
    type: 'integer',
    name: 'tax_credit_year5',
    nullable: true,
    default: 0,
    comment: '세액공제 5차년도',
  })
  taxCreditYear5: number

  // Tax Reduction Excluded Years 1-5
  @Column({
    type: 'integer',
    name: 'tax_reduction_excluded_year1',
    nullable: true,
    default: 0,
    comment: '한도제외 세액감면 1차년도',
  })
  taxReductionExcludedYear1: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_excluded_year2',
    nullable: true,
    default: 0,
    comment: '한도제외 세액감면 2차년도',
  })
  taxReductionExcludedYear2: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_excluded_year3',
    nullable: true,
    default: 0,
    comment: '한도제외 세액감면 3차년도',
  })
  taxReductionExcludedYear3: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_excluded_year4',
    nullable: true,
    default: 0,
    comment: '한도제외 세액감면 4차년도',
  })
  taxReductionExcludedYear4: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_excluded_year5',
    nullable: true,
    default: 0,
    comment: '한도제외 세액감면 5차년도',
  })
  taxReductionExcludedYear5: number

  // Tax Reduction Included Years 1-5
  @Column({
    type: 'integer',
    name: 'tax_reduction_included_year1',
    nullable: true,
    default: 0,
    comment: '한도포함 세액감면 1차년도',
  })
  taxReductionIncludedYear1: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_included_year2',
    nullable: true,
    default: 0,
    comment: '한도포함 세액감면 2차년도',
  })
  taxReductionIncludedYear2: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_included_year3',
    nullable: true,
    default: 0,
    comment: '한도포함 세액감면 3차년도',
  })
  taxReductionIncludedYear3: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_included_year4',
    nullable: true,
    default: 0,
    comment: '한도포함 세액감면 4차년도',
  })
  taxReductionIncludedYear4: number

  @Column({
    type: 'integer',
    name: 'tax_reduction_included_year5',
    nullable: true,
    default: 0,
    comment: '한도포함 세액감면 5차년도',
  })
  taxReductionIncludedYear5: number

  // Tax Credit Excluded Years 1-5
  @Column({
    type: 'integer',
    name: 'tax_credit_excluded_year1',
    nullable: true,
    default: 0,
    comment: '한도제외 세액공제 1차년도',
  })
  taxCreditExcludedYear1: number

  @Column({
    type: 'integer',
    name: 'tax_credit_excluded_year2',
    nullable: true,
    default: 0,
    comment: '한도제외 세액공제 2차년도',
  })
  taxCreditExcludedYear2: number

  @Column({
    type: 'integer',
    name: 'tax_credit_excluded_year3',
    nullable: true,
    default: 0,
    comment: '한도제외 세액공제 3차년도',
  })
  taxCreditExcludedYear3: number

  @Column({
    type: 'integer',
    name: 'tax_credit_excluded_year4',
    nullable: true,
    default: 0,
    comment: '한도제외 세액공제 4차년도',
  })
  taxCreditExcludedYear4: number

  @Column({
    type: 'integer',
    name: 'tax_credit_excluded_year5',
    nullable: true,
    default: 0,
    comment: '한도제외 세액공제 5차년도',
  })
  taxCreditExcludedYear5: number

  // Tax Credit Included Years 1-5
  @Column({
    type: 'integer',
    name: 'tax_credit_included_year1',
    nullable: true,
    default: 0,
    comment: '한도포함 세액공제 1차년도',
  })
  taxCreditIncludedYear1: number

  @Column({
    type: 'integer',
    name: 'tax_credit_included_year2',
    nullable: true,
    default: 0,
    comment: '한도포함 세액공제 2차년도',
  })
  taxCreditIncludedYear2: number

  @Column({
    type: 'integer',
    name: 'tax_credit_included_year3',
    nullable: true,
    default: 0,
    comment: '한도포함 세액공제 3차년도',
  })
  taxCreditIncludedYear3: number

  @Column({
    type: 'integer',
    name: 'tax_credit_included_year4',
    nullable: true,
    default: 0,
    comment: '한도포함 세액공제 4차년도',
  })
  taxCreditIncludedYear4: number

  @Column({
    type: 'integer',
    name: 'tax_credit_included_year5',
    nullable: true,
    default: 0,
    comment: '한도포함 세액공제 5차년도',
  })
  taxCreditIncludedYear5: number

  // Determined Tax Years 1-5
  @Column({
    type: 'integer',
    name: 'determined_tax_year1',
    nullable: true,
    default: 0,
    comment: '결정세액 1차년도',
  })
  determinedTaxYear1: number

  @Column({
    type: 'integer',
    name: 'determined_tax_year2',
    nullable: true,
    default: 0,
    comment: '결정세액 2차년도',
  })
  determinedTaxYear2: number

  @Column({
    type: 'integer',
    name: 'determined_tax_year3',
    nullable: true,
    default: 0,
    comment: '결정세액 3차년도',
  })
  determinedTaxYear3: number

  @Column({
    type: 'integer',
    name: 'determined_tax_year4',
    nullable: true,
    default: 0,
    comment: '결정세액 4차년도',
  })
  determinedTaxYear4: number

  @Column({
    type: 'integer',
    name: 'determined_tax_year5',
    nullable: true,
    default: 0,
    comment: '결정세액 5차년도',
  })
  determinedTaxYear5: number

  // Additional Tax Years 1-5
  @Column({
    type: 'integer',
    name: 'additional_tax_year1',
    nullable: true,
    default: 0,
    comment: '가산세 1차년도',
  })
  additionalTaxYear1: number

  @Column({
    type: 'integer',
    name: 'additional_tax_year2',
    nullable: true,
    default: 0,
    comment: '가산세 2차년도',
  })
  additionalTaxYear2: number

  @Column({
    type: 'integer',
    name: 'additional_tax_year3',
    nullable: true,
    default: 0,
    comment: '가산세 3차년도',
  })
  additionalTaxYear3: number

  @Column({
    type: 'integer',
    name: 'additional_tax_year4',
    nullable: true,
    default: 0,
    comment: '가산세 4차년도',
  })
  additionalTaxYear4: number

  @Column({
    type: 'integer',
    name: 'additional_tax_year5',
    nullable: true,
    default: 0,
    comment: '가산세 5차년도',
  })
  additionalTaxYear5: number

  // Surplus Tax Years 1-5
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

  // Pre-paid Tax Years 1-5
  @Column({
    type: 'integer',
    name: 'pre_paid_tax_year1',
    nullable: true,
    default: 0,
    comment: '기납부세액 1차년도',
  })
  prePaidTaxYear1: number

  @Column({
    type: 'integer',
    name: 'pre_paid_tax_year2',
    nullable: true,
    default: 0,
    comment: '기납부세액 2차년도',
  })
  prePaidTaxYear2: number

  @Column({
    type: 'integer',
    name: 'pre_paid_tax_year3',
    nullable: true,
    default: 0,
    comment: '기납부세액 3차년도',
  })
  prePaidTaxYear3: number

  @Column({
    type: 'integer',
    name: 'pre_paid_tax_year4',
    nullable: true,
    default: 0,
    comment: '기납부세액 4차년도',
  })
  prePaidTaxYear4: number

  @Column({
    type: 'integer',
    name: 'pre_paid_tax_year5',
    nullable: true,
    default: 0,
    comment: '기납부세액 5차년도',
  })
  prePaidTaxYear5: number

  // Paid Agricultural Tax Years 1-5
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

  // Refund Limit Years 1-5
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

  @OneToOne(() => RefundUserModel, user => user.hometaxFillingCorporate, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName:
        'tb_hometax_filling_corporate_user_id_tb_refund_user_id_fk',
    },
  ])
  user: RefundUserModel
}
