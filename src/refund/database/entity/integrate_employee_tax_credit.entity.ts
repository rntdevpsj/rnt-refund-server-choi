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

@Entity('tb_integrate_employee_tax_credit')
@Unique('tb_integrate_employee_tax_credit_user_id_key', ['userId'])
export class IntegrateEmployeeTaxCreditModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_integrate_employee_tax_credit_pkey',
  })
  id: string

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string

  @Column({
    type: 'integer',
    name: 'first_credit_youth_year1',
    nullable: true,
    default: 0,
    comment: '1차공제 청년등 1차년도',
  })
  firstCreditYouthYear1: number

  @Column({
    type: 'integer',
    name: 'first_credit_middle_year1',
    nullable: true,
    default: 0,
    comment: '1차공제 청년외 1차년도',
  })
  firstCreditMiddleYear1: number

  @Column({
    type: 'integer',
    name: 'first_credit_total_year1',
    nullable: true,
    default: 0,
    comment: '1차공제 합계 1차년도',
  })
  firstCreditTotalYear1: number

  @Column({
    type: 'integer',
    name: 'first_credit_youth_year2',
    nullable: true,
    default: 0,
    comment: '1차공제 청년등 2차년도',
  })
  firstCreditYouthYear2: number

  @Column({
    type: 'integer',
    name: 'first_credit_middle_year2',
    nullable: true,
    default: 0,
    comment: '1차공제 청년외 2차년도',
  })
  firstCreditMiddleYear2: number

  @Column({
    type: 'integer',
    name: 'first_credit_total_year2',
    nullable: true,
    default: 0,
    comment: '1차공제 합계 2차년도',
  })
  firstCreditTotalYear2: number

  @Column({
    type: 'integer',
    name: 'first_credit_youth_year3',
    nullable: true,
    default: 0,
    comment: '1차공제 청년등 3차년도',
  })
  firstCreditYouthYear3: number

  @Column({
    type: 'integer',
    name: 'first_credit_middle_year3',
    nullable: true,
    default: 0,
    comment: '1차공제 청년외 3차년도',
  })
  firstCreditMiddleYear3: number

  @Column({
    type: 'integer',
    name: 'first_credit_total_year3',
    nullable: true,
    default: 0,
    comment: '1차공제 합계 3차년도',
  })
  firstCreditTotalYear3: number

  @Column({
    type: 'integer',
    name: 'first_credit_youth_year4',
    nullable: true,
    default: 0,
    comment: '1차공제 청년등 4차년도',
  })
  firstCreditYouthYear4: number

  @Column({
    type: 'integer',
    name: 'first_credit_middle_year4',
    nullable: true,
    default: 0,
    comment: '1차공제 청년외 4차년도',
  })
  firstCreditMiddleYear4: number

  @Column({
    type: 'integer',
    name: 'first_credit_total_year4',
    nullable: true,
    default: 0,
    comment: '1차공제 합계 4차년도',
  })
  firstCreditTotalYear4: number

  @Column({
    type: 'integer',
    name: 'first_credit_youth_year5',
    nullable: true,
    default: 0,
    comment: '1차공제 청년등 5차년도',
  })
  firstCreditYouthYear5: number

  @Column({
    type: 'integer',
    name: 'first_credit_middle_year5',
    nullable: true,
    default: 0,
    comment: '1차공제 청년외 5차년도',
  })
  firstCreditMiddleYear5: number

  @Column({
    type: 'integer',
    name: 'first_credit_total_year5',
    nullable: true,
    default: 0,
    comment: '1차공제 합계 5차년도',
  })
  firstCreditTotalYear5: number

  // Second Credit Years 1-5
  @Column({
    type: 'integer',
    name: 'second_credit_youth_year1',
    nullable: true,
    default: 0,
    comment: '2차공제 청년등 1차년도',
  })
  secondCreditYouthYear1: number

  @Column({
    type: 'integer',
    name: 'second_credit_middle_year1',
    nullable: true,
    default: 0,
    comment: '2차공제 청년외 1차년도',
  })
  secondCreditMiddleYear1: number

  @Column({
    type: 'integer',
    name: 'second_credit_total_year1',
    nullable: true,
    default: 0,
    comment: '2차공제 합계 1차년도',
  })
  secondCreditTotalYear1: number

  @Column({
    type: 'integer',
    name: 'second_credit_youth_year2',
    nullable: true,
    default: 0,
    comment: '2차공제 청년등 2차년도',
  })
  secondCreditYouthYear2: number

  @Column({
    type: 'integer',
    name: 'second_credit_middle_year2',
    nullable: true,
    default: 0,
    comment: '2차공제 청년외 2차년도',
  })
  secondCreditMiddleYear2: number

  @Column({
    type: 'integer',
    name: 'second_credit_total_year2',
    nullable: true,
    default: 0,
    comment: '2차공제 합계 2차년도',
  })
  secondCreditTotalYear2: number

  @Column({
    type: 'integer',
    name: 'second_credit_youth_year3',
    nullable: true,
    default: 0,
    comment: '2차공제 청년등 3차년도',
  })
  secondCreditYouthYear3: number

  @Column({
    type: 'integer',
    name: 'second_credit_middle_year3',
    nullable: true,
    default: 0,
    comment: '2차공제 청년외 3차년도',
  })
  secondCreditMiddleYear3: number

  @Column({
    type: 'integer',
    name: 'second_credit_total_year3',
    nullable: true,
    default: 0,
    comment: '2차공제 합계 3차년도',
  })
  secondCreditTotalYear3: number

  @Column({
    type: 'integer',
    name: 'second_credit_youth_year4',
    nullable: true,
    default: 0,
    comment: '2차공제 청년등 4차년도',
  })
  secondCreditYouthYear4: number

  @Column({
    type: 'integer',
    name: 'second_credit_middle_year4',
    nullable: true,
    default: 0,
    comment: '2차공제 청년외 4차년도',
  })
  secondCreditMiddleYear4: number

  @Column({
    type: 'integer',
    name: 'second_credit_total_year4',
    nullable: true,
    default: 0,
    comment: '2차공제 합계 4차년도',
  })
  secondCreditTotalYear4: number

  @Column({
    type: 'integer',
    name: 'second_credit_youth_year5',
    nullable: true,
    default: 0,
    comment: '2차공제 청년등 5차년도',
  })
  secondCreditYouthYear5: number

  @Column({
    type: 'integer',
    name: 'second_credit_middle_year5',
    nullable: true,
    default: 0,
    comment: '2차공제 청년외 5차년도',
  })
  secondCreditMiddleYear5: number

  @Column({
    type: 'integer',
    name: 'second_credit_total_year5',
    nullable: true,
    default: 0,
    comment: '2차공제 합계 5차년도',
  })
  secondCreditTotalYear5: number

  // Third Credit Years 1-5
  @Column({
    type: 'integer',
    name: 'third_credit_youth_year1',
    nullable: true,
    default: 0,
    comment: '3차공제 청년등 1차년도',
  })
  thirdCreditYouthYear1: number

  @Column({
    type: 'integer',
    name: 'third_credit_middle_year1',
    nullable: true,
    default: 0,
    comment: '3차공제 청년외 1차년도',
  })
  thirdCreditMiddleYear1: number

  @Column({
    type: 'integer',
    name: 'third_credit_total_year1',
    nullable: true,
    default: 0,
    comment: '3차공제 합계 1차년도',
  })
  thirdCreditTotalYear1: number

  @Column({
    type: 'integer',
    name: 'third_credit_youth_year2',
    nullable: true,
    default: 0,
    comment: '3차공제 청년등 2차년도',
  })
  thirdCreditYouthYear2: number

  @Column({
    type: 'integer',
    name: 'third_credit_middle_year2',
    nullable: true,
    default: 0,
    comment: '3차공제 청년외 2차년도',
  })
  thirdCreditMiddleYear2: number

  @Column({
    type: 'integer',
    name: 'third_credit_total_year2',
    nullable: true,
    default: 0,
    comment: '3차공제 합계 2차년도',
  })
  thirdCreditTotalYear2: number

  @Column({
    type: 'integer',
    name: 'third_credit_youth_year3',
    nullable: true,
    default: 0,
    comment: '3차공제 청년등 3차년도',
  })
  thirdCreditYouthYear3: number

  @Column({
    type: 'integer',
    name: 'third_credit_middle_year3',
    nullable: true,
    default: 0,
    comment: '3차공제 청년외 3차년도',
  })
  thirdCreditMiddleYear3: number

  @Column({
    type: 'integer',
    name: 'third_credit_total_year3',
    nullable: true,
    default: 0,
    comment: '3차공제 합계 3차년도',
  })
  thirdCreditTotalYear3: number

  @Column({
    type: 'integer',
    name: 'third_credit_youth_year4',
    nullable: true,
    default: 0,
    comment: '3차공제 청년등 4차년도',
  })
  thirdCreditYouthYear4: number

  @Column({
    type: 'integer',
    name: 'third_credit_middle_year4',
    nullable: true,
    default: 0,
    comment: '3차공제 청년외 4차년도',
  })
  thirdCreditMiddleYear4: number

  @Column({
    type: 'integer',
    name: 'third_credit_total_year4',
    nullable: true,
    default: 0,
    comment: '3차공제 합계 4차년도',
  })
  thirdCreditTotalYear4: number

  @Column({
    type: 'integer',
    name: 'third_credit_youth_year5',
    nullable: true,
    default: 0,
    comment: '3차공제 청년등 5차년도',
  })
  thirdCreditYouthYear5: number

  @Column({
    type: 'integer',
    name: 'third_credit_middle_year5',
    nullable: true,
    default: 0,
    comment: '3차공제 청년외 5차년도',
  })
  thirdCreditMiddleYear5: number

  @Column({
    type: 'integer',
    name: 'third_credit_total_year5',
    nullable: true,
    default: 0,
    comment: '3차공제 합계 5차년도',
  })
  thirdCreditTotalYear5: number

  // First Paid Tax Years 1-5
  @Column({
    type: 'integer',
    name: 'first_paid_tax_year1',
    nullable: true,
    default: 0,
    comment: '1차추가납부 1차년도',
  })
  firstPaidTaxYear1: number

  @Column({
    type: 'integer',
    name: 'first_paid_tax_year2',
    nullable: true,
    default: 0,
    comment: '1차추가납부 2차년도',
  })
  firstPaidTaxYear2: number

  @Column({
    type: 'integer',
    name: 'first_paid_tax_year3',
    nullable: true,
    default: 0,
    comment: '1차추가납부 3차년도',
  })
  firstPaidTaxYear3: number

  @Column({
    type: 'integer',
    name: 'first_paid_tax_year4',
    nullable: true,
    default: 0,
    comment: '1차추가납부 4차년도',
  })
  firstPaidTaxYear4: number

  @Column({
    type: 'integer',
    name: 'first_paid_tax_year5',
    nullable: true,
    default: 0,
    comment: '1차추가납부 5차년도',
  })
  firstPaidTaxYear5: number

  // Second Paid Tax Years 1-5
  @Column({
    type: 'integer',
    name: 'second_paid_tax_year1',
    nullable: true,
    default: 0,
    comment: '2차추가납부 1차년도',
  })
  secondPaidTaxYear1: number

  @Column({
    type: 'integer',
    name: 'second_paid_tax_year2',
    nullable: true,
    default: 0,
    comment: '2차추가납부 2차년도',
  })
  secondPaidTaxYear2: number

  @Column({
    type: 'integer',
    name: 'second_paid_tax_year3',
    nullable: true,
    default: 0,
    comment: '2차추가납부 3차년도',
  })
  secondPaidTaxYear3: number

  @Column({
    type: 'integer',
    name: 'second_paid_tax_year4',
    nullable: true,
    default: 0,
    comment: '2차추가납부 4차년도',
  })
  secondPaidTaxYear4: number

  @Column({
    type: 'integer',
    name: 'second_paid_tax_year5',
    nullable: true,
    default: 0,
    comment: '2차추가납부 5차년도',
  })
  secondPaidTaxYear5: number

  // Total Credit Years 1-5
  @Column({
    type: 'integer',
    name: 'total_credit_year1',
    nullable: true,
    default: 0,
    comment: '공제액합계 1차년도',
  })
  totalCreditYear1: number

  @Column({
    type: 'integer',
    name: 'total_credit_year2',
    nullable: true,
    default: 0,
    comment: '공제액합계 2차년도',
  })
  totalCreditYear2: number

  @Column({
    type: 'integer',
    name: 'total_credit_year3',
    nullable: true,
    default: 0,
    comment: '공제액합계 3차년도',
  })
  totalCreditYear3: number

  @Column({
    type: 'integer',
    name: 'total_credit_year4',
    nullable: true,
    default: 0,
    comment: '공제액합계 4차년도',
  })
  totalCreditYear4: number

  @Column({
    type: 'integer',
    name: 'total_credit_year5',
    nullable: true,
    default: 0,
    comment: '공제액합계 5차년도',
  })
  totalCreditYear5: number

  // Total Paid Tax Years 1-5
  @Column({
    type: 'integer',
    name: 'total_paid_tax_year1',
    nullable: true,
    default: 0,
    comment: '납부액합계 1차년도',
  })
  totalPaidTaxYear1: number

  @Column({
    type: 'integer',
    name: 'total_paid_tax_year2',
    nullable: true,
    default: 0,
    comment: '납부액합계 2차년도',
  })
  totalPaidTaxYear2: number

  @Column({
    type: 'integer',
    name: 'total_paid_tax_year3',
    nullable: true,
    default: 0,
    comment: '납부액합계 3차년도',
  })
  totalPaidTaxYear3: number

  @Column({
    type: 'integer',
    name: 'total_paid_tax_year4',
    nullable: true,
    default: 0,
    comment: '납부액합계 4차년도',
  })
  totalPaidTaxYear4: number

  @Column({
    type: 'integer',
    name: 'total_paid_tax_year5',
    nullable: true,
    default: 0,
    comment: '납부액합계 5차년도',
  })
  totalPaidTaxYear5: number

  @OneToOne(() => RefundUserModel, user => user.integrateTaxCredit, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName:
        'tb_integrate_employee_tax_credit_user_id_tb_refund_user_id_fk',
    },
  ])
  user: RefundUserModel
}
