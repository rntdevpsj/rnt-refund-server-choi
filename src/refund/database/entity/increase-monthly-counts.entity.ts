import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseModel } from './base.entity'
import { WorkerType } from 'src/common/type/refund-enum.types'
import { EmployeeWorkerModel } from './employee-worker.entity'
import { RefundUserModel } from './refund-user.entity'

@Entity('tb_increase_monthly_counts')
@Unique('tb_increase_monthly_counts_employee_id_key', ['employeeId'])
export class IncreaseMonthlyCountModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_increase_monthly_counts_pkey',
  })
  id: string
  @Column('uuid', {
    name: 'employee_id',
    nullable: false,
  })
  employeeId: string

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string

  @Column({
    type: 'text',
    name: 'employee_name',
    nullable: true,
    comment: '근로자이름',
  })
  employeeName: string

  @Column({
    type: 'text',
    name: 'employee_social_no',
    nullable: true,
    comment: '근로자주민번호',
  })
  employeeSocialNo: string

  @Column({
    type: 'text',
    name: 'worker_type',
    nullable: true,
    default: WorkerType.OVER1YEAR,
    comment: '근로유형',
  })
  workerType: WorkerType

  // Year 1
  @Column({
    type: 'integer',
    name: 'youth_monthly_counts_year1',
    nullable: true,
    default: 0,
    comment: '1차연도 청년등 근무월수',
  })
  youthMonthlyCountsYear1: number

  @Column({
    type: 'integer',
    name: 'middle_monthly_counts_year1',
    nullable: true,
    default: 0,
    comment: '1차연도 청년외 근무월수',
  })
  middleMonthlyCountsYear1: number

  @Column({
    type: 'integer',
    name: 'total_monthly_counts_year1',
    nullable: true,
    default: 0,
    comment: '1차연도 총 근무월수',
  })
  totalMonthlyCountsYear1: number

  // Year 2
  @Column({
    type: 'integer',
    name: 'youth_monthly_counts_year2',
    nullable: true,
    default: 0,
    comment: '2차연도 청년등 근무월수',
  })
  youthMonthlyCountsYear2: number

  @Column({
    type: 'integer',
    name: 'middle_monthly_counts_year2',
    nullable: true,
    default: 0,
    comment: '2차연도 청년외 근무월수',
  })
  middleMonthlyCountsYear2: number

  @Column({
    type: 'integer',
    name: 'total_monthly_counts_year2',
    nullable: true,
    default: 0,
    comment: '2차연도 총 근무월수',
  })
  totalMonthlyCountsYear2: number

  @Column({
    type: 'integer',
    name: 'youth_salary_per_employee_year2',
    nullable: true,
    default: 0,
    comment: '2차연도 청년등 총급여',
  })
  youthSalaryPerEmployeeYear2: number

  @Column({
    type: 'integer',
    name: 'middle_salary_per_employee_year2',
    nullable: true,
    default: 0,
    comment: '2차연도 청년외 총급여',
  })
  middleSalaryPerEmployeeYear2: number

  // Year 3
  @Column({
    type: 'integer',
    name: 'youth_monthly_counts_year3',
    nullable: true,
    default: 0,
    comment: '3차연도 청년등 근무월수',
  })
  youthMonthlyCountsYear3: number

  @Column({
    type: 'integer',
    name: 'middle_monthly_counts_year3',
    nullable: true,
    default: 0,
    comment: '3차연도 청년외 근무월수',
  })
  middleMonthlyCountsYear3: number

  @Column({
    type: 'integer',
    name: 'total_monthly_counts_year3',
    nullable: true,
    default: 0,
    comment: '3차연도 총 근무월수',
  })
  totalMonthlyCountsYear3: number

  @Column({
    type: 'integer',
    name: 'youth_salary_per_employee_year3',
    nullable: true,
    default: 0,
    comment: '3차연도 청년등 총급여',
  })
  youthSalaryPerEmployeeYear3: number

  @Column({
    type: 'integer',
    name: 'middle_salary_per_employee_year3',
    nullable: true,
    default: 0,
    comment: '3차연도 청년외 총급여',
  })
  middleSalaryPerEmployeeYear3: number

  // Year 4
  @Column({
    type: 'integer',
    name: 'youth_monthly_counts_year4',
    nullable: true,
    default: 0,
    comment: '4차연도 청년등 근무월수',
  })
  youthMonthlyCountsYear4: number

  @Column({
    type: 'integer',
    name: 'middle_monthly_counts_year4',
    nullable: true,
    default: 0,
    comment: '4차연도 청년외 근무월수',
  })
  middleMonthlyCountsYear4: number

  @Column({
    type: 'integer',
    name: 'total_monthly_counts_year4',
    nullable: true,
    default: 0,
    comment: '4차연도 총 근무월수',
  })
  totalMonthlyCountsYear4: number

  @Column({
    type: 'integer',
    name: 'youth_salary_per_employee_year4',
    nullable: true,
    default: 0,
    comment: '4차연도 청년등 총급여',
  })
  youthSalaryPerEmployeeYear4: number

  @Column({
    type: 'integer',
    name: 'middle_salary_per_employee_year4',
    nullable: true,
    default: 0,
    comment: '4차연도 청년외 총급여',
  })
  middleSalaryPerEmployeeYear4: number

  // Year 5
  @Column({
    type: 'integer',
    name: 'youth_monthly_counts_year5',
    nullable: true,
    default: 0,
    comment: '5차연도 청년등 근무월수',
  })
  youthMonthlyCountsYear5: number

  @Column({
    type: 'integer',
    name: 'middle_monthly_counts_year5',
    nullable: true,
    default: 0,
    comment: '5차연도 청년외 근무월수',
  })
  middleMonthlyCountsYear5: number

  @Column({
    type: 'integer',
    name: 'total_monthly_counts_year5',
    nullable: true,
    default: 0,
    comment: '5차연도 총 근무월수',
  })
  totalMonthlyCountsYear5: number

  @Column({
    type: 'integer',
    name: 'youth_salary_per_employee_year5',
    nullable: true,
    default: 0,
    comment: '5차연도 청년등 총급여',
  })
  youthSalaryPerEmployeeYear5: number

  @Column({
    type: 'integer',
    name: 'middle_salary_per_employee_year5',
    nullable: true,
    default: 0,
    comment: '5차연도 청년외 총급여',
  })
  middleSalaryPerEmployeeYear5: number

  // Year 6
  @Column({
    type: 'integer',
    name: 'youth_monthly_counts_year6',
    nullable: true,
    default: 0,
    comment: '6차연도 청년등 근무월수',
  })
  youthMonthlyCountsYear6: number

  @Column({
    type: 'integer',
    name: 'middle_monthly_counts_year6',
    nullable: true,
    default: 0,
    comment: '6차연도 청년외 근무월수',
  })
  middleMonthlyCountsYear6: number

  @Column({
    type: 'integer',
    name: 'total_monthly_counts_year6',
    nullable: true,
    default: 0,
    comment: '6차연도 총 근무월수',
  })
  totalMonthlyCountsYear6: number

  @Column({
    type: 'integer',
    name: 'youth_salary_per_employee_year6',
    nullable: true,
    default: 0,
    comment: '6차연도 청년등 총급여',
  })
  youthSalaryPerEmployeeYear6: number

  @Column({
    type: 'integer',
    name: 'middle_salary_per_employee_year6',
    nullable: true,
    default: 0,
    comment: '6차연도 청년외 총급여',
  })
  middleSalaryPerEmployeeYear6: number

  // Year 7
  @Column({
    type: 'integer',
    name: 'youth_monthly_counts_year7',
    nullable: true,
    default: 0,
    comment: '7차연도 청년등 근무월수',
  })
  youthMonthlyCountsYear7: number

  @Column({
    type: 'integer',
    name: 'middle_monthly_counts_year7',
    nullable: true,
    default: 0,
    comment: '7차연도 청년외 근무월수',
  })
  middleMonthlyCountsYear7: number

  @Column({
    type: 'integer',
    name: 'total_monthly_counts_year7',
    nullable: true,
    default: 0,
    comment: '7차연도 총 근무월수',
  })
  totalMonthlyCountsYear7: number

  @ManyToOne(() => RefundUserModel, user => user.monthlyCountsRecords, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName:
        'tb_increase_monthly_counts_user_id_tb_refund_user_id_fk',
    },
  ])
  user: RefundUserModel

  @OneToOne(() => EmployeeWorkerModel, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'employee_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName:
        'tb_increase_monthly_counts_employee_id_tb_employee_worker_employee_id_fk',
    },
  ])
  employee: EmployeeWorkerModel
}
