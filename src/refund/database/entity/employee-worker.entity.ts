import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { WorkerType } from 'src/common/type/refund-enum.types'
import { BaseModel } from './base.entity'
import { IncreaseMonthlyCountModel } from './increase-monthly-counts.entity'
import { IntegrateMonthlyCountModel } from './integrate-monthly-count.entity'
import { RefundUserModel } from './refund-user.entity'

@Entity('tb_employee_worker')
@Unique('tb_employee_worker_employee_id_key', ['employeeId'])
export class EmployeeWorkerModel extends BaseModel {
  // 시스템 id - 관계에서 사용되는 키키
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_employee_worker_pkey',
  })
  id: string
  // 고유 비즈니스 uuid키
  @Column('uuid', {
    name: 'employee_id',
    nullable: false,
  })
  employeeId: string

  // user테이블의 id대입
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
    name: 'employee_start_date',
    nullable: true,
    comment: '입사일',
  })
  employeeStartDate: string

  @Column({
    type: 'text',
    name: 'employee_end_date',
    nullable: true,
    comment: '퇴사일',
  })
  employeeEndDate: string

  @Column({
    type: 'integer',
    name: 'total_salary_per_employee_year1',
    nullable: true,
    default: 0,
    comment: '근로자별 총급여 1차년도',
  })
  totalSalaryPerEmployeeYear1: number

  @Column({
    type: 'integer',
    name: 'total_salary_per_employee_year2',
    nullable: true,
    default: 0,
    comment: '근로자별 총급여 2차년도',
  })
  totalSalaryPerEmployeeYear2: number

  @Column({
    type: 'integer',
    name: 'total_salary_per_employee_year3',
    nullable: true,
    default: 0,
    comment: '근로자별 총급여 3차년도',
  })
  totalSalaryPerEmployeeYear3: number

  @Column({
    type: 'integer',
    name: 'total_salary_per_employee_year4',
    nullable: true,
    default: 0,
    comment: '근로자별 총급여 4차년도',
  })
  totalSalaryPerEmployeeYear4: number

  @Column({
    type: 'integer',
    name: 'total_salary_per_employee_year5',
    nullable: true,
    default: 0,
    comment: '근로자별 총급여 5차년도',
  })
  totalSalaryPerEmployeeYear5: number

  @Column({
    type: 'text',
    name: 'worker_type',
    nullable: true,
    default: WorkerType.OVER1YEAR,
    comment: '근로유형',
  })
  workerType: WorkerType
  @ManyToOne(() => RefundUserModel, user => user.employees, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName:
        'tb_employee_worker_user_id_tb_refund_user_id_fk',
    },
  ])
  user: RefundUserModel

  @OneToOne(
    () => IncreaseMonthlyCountModel,
    increaseMonthlyCount => increaseMonthlyCount.employee,
  )
  increaseMonthlyCount: IncreaseMonthlyCountModel

  @OneToOne(
    () => IntegrateMonthlyCountModel,
    monthlyCount => monthlyCount.employee,
  )
  integrateMonthlyCount: IntegrateMonthlyCountModel
}
