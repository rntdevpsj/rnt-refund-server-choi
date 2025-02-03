import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseModel } from './base.entity'
import { RefundUserModel } from './refund-user.entity'

@Entity('tb_social_insurance_rate')
export class SocialInsuranceRateModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_social_insurance_rate_pkey',
  })
  id: string

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string

  @Column({
    type: 'text',
    name: 'workplace_manage_no',
    nullable: true,
    comment: '사업장관리번호',
  })
  workplaceManageNo: string

  // Year 1
  @Column({
    name: 'normal_rate_year1',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '일반요율 1차연도',
  })
  normalRateYear1: number

  @Column({
    name: 'commute_accident_rate_year1',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '출퇴근재해요율 1차연도',
  })
  commuteAccidentRateYear1: number

  @Column({
    name: 'surplus_rate_year1',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '추가요율 1차연도',
  })
  surplusRateYear1: number

  @Column({
    name: 'total_rate_year1',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '총 요율 1차연도',
  })
  totalRateYear1: number

  // Year 2
  @Column({
    name: 'normal_rate_year2',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '일반요율 2차연도',
  })
  normalRateYear2: number

  @Column({
    name: 'commute_accident_rate_year2',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '출퇴근재해요율 2차연도',
  })
  commuteAccidentRateYear2: number

  @Column({
    name: 'surplus_rate_year2',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '추가요율 2차연도',
  })
  surplusRateYear2: number

  @Column({
    name: 'total_rate_year2',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '총 요율 n차연도',
  })
  totalRateYear2: number

  // Year 3
  @Column({
    name: 'normal_rate_year3',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '일반요율 3차연도',
  })
  normalRateYear3: number

  @Column({
    name: 'commute_accident_rate_year3',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '출퇴근재해요율 3차연도',
  })
  commuteAccidentRateYear3: number

  @Column({
    name: 'surplus_rate_year3',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '추가요율 3차연도',
  })
  surplusRateYear3: number

  @Column({
    name: 'total_rate_year3',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '총 요율 3차연도',
  })
  totalRateYear3: number

  // Year 4
  @Column({
    name: 'normal_rate_year4',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '일반요율 4차연도',
  })
  normalRateYear4: number

  @Column({
    name: 'commute_accident_rate_year4',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '출퇴근재해요율 4차연도',
  })
  commuteAccidentRateYear4: number

  @Column({
    name: 'surplus_rate_year4',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '추가요율 4차연도',
  })
  surplusRateYear4: number

  @Column({
    name: 'total_rate_year4',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '총 요율 4차연도',
  })
  totalRateYear4: number

  // Year 5
  @Column({
    name: 'normal_rate_year5',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '일반요율 5차연도',
  })
  normalRateYear5: number

  @Column({
    name: 'commute_accident_rate_year5',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '출퇴근재해요율 5차연도',
  })
  commuteAccidentRateYear5: number

  @Column({
    name: 'surplus_rate_year5',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '추가요율 5차연도',
  })
  surplusRateYear5: number

  @Column({
    name: 'total_rate_year5',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '총 요율 5차연도',
  })
  totalRateYear5: number

  @ManyToOne(() => RefundUserModel, user => user.socialInsuranceRates, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName:
        'tb_social_insurance_rate_user_id_tb_refund_user_id_fk',
    },
  ])
  user: RefundUserModel

  // @OneToOne(() => RefundCompanyModel, company => company.socialInsuranceRate, {
  //   onDelete: 'CASCADE',
  //   onUpdate: 'RESTRICT',
  // })
  // @JoinColumn([
  //   {
  //     name: 'company_id',
  //     referencedColumnName: 'companyId',
  //     foreignKeyConstraintName:
  //       'tb_social_insurance_rate_company_id_tb_refund_company_company_id_fk',
  //   },
  // ])
  // company: RefundCompanyModel
}
