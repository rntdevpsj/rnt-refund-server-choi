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

@Entity('tb_total_salary_yearly')
@Unique('tb_total_salary_yearly_user_id_key', ['userId'])
export class TotalSalaryYearlyModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_total_salary_yearly_pkey',
  })
  id: string

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string

  @Column({
    type: 'integer',
    name: 'youth_salary_year1',
    nullable: true,
    default: 0,
    comment: '청년등 총급여 1차년도',
  })
  youthSalaryYear1: number

  @Column({
    type: 'integer',
    name: 'middle_salary_year1',
    nullable: true,
    default: 0,
    comment: '청년외 총급여 1차년도',
  })
  middleSalaryYear1: number

  @Column({
    type: 'integer',
    name: 'total_salary_year1',
    nullable: true,
    default: 0,
    comment: '합계 총급여 1차년도',
  })
  totalSalaryYear1: number

  // Year 2
  @Column({
    type: 'integer',
    name: 'youth_salary_year2',
    nullable: true,
    default: 0,
    comment: '청년등 총급여 2차년도',
  })
  youthSalaryYear2: number

  @Column({
    type: 'integer',
    name: 'middle_salary_year2',
    nullable: true,
    default: 0,
    comment: '청년외 총급여 2차년도',
  })
  middleSalaryYear2: number

  @Column({
    type: 'integer',
    name: 'total_salary_year2',
    nullable: true,
    default: 0,
    comment: '합계 총급여 2차년도',
  })
  totalSalaryYear2: number

  // Year 3
  @Column({
    type: 'integer',
    name: 'youth_salary_year3',
    nullable: true,
    default: 0,
    comment: '청년등 총급여 3차년도',
  })
  youthSalaryYear3: number

  @Column({
    type: 'integer',
    name: 'middle_salary_year3',
    nullable: true,
    default: 0,
    comment: '청년외 총급여 3차년도',
  })
  middleSalaryYear3: number

  @Column({
    type: 'integer',
    name: 'total_salary_year3',
    nullable: true,
    default: 0,
    comment: '합계 총급여 3차년도',
  })
  totalSalaryYear3: number

  // Year 4
  @Column({
    type: 'integer',
    name: 'youth_salary_year4',
    nullable: true,
    default: 0,
    comment: '청년등 총급여 4차년도',
  })
  youthSalaryYear4: number

  @Column({
    type: 'integer',
    name: 'middle_salary_year4',
    nullable: true,
    default: 0,
    comment: '청년외 총급여 4차년도',
  })
  middleSalaryYear4: number

  @Column({
    type: 'integer',
    name: 'total_salary_year4',
    nullable: true,
    default: 0,
    comment: '합계 총급여 4차년도',
  })
  totalSalaryYear4: number

  // Year 5
  @Column({
    type: 'integer',
    name: 'youth_salary_year5',
    nullable: true,
    default: 0,
    comment: '청년등 총급여 5차년도',
  })
  youthSalaryYear5: number

  @Column({
    type: 'integer',
    name: 'middle_salary_year5',
    nullable: true,
    default: 0,
    comment: '청년외 총급여 5차년도',
  })
  middleSalaryYear5: number

  @Column({
    type: 'integer',
    name: 'total_salary_year5',
    nullable: true,
    default: 0,
    comment: '합계 총급여 5차년도',
  })
  totalSalaryYear5: number

  @OneToOne(() => RefundUserModel, user => user.totalSalaryYearly, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName:
        'tb_total_salary_yearly_user_id_tb_refund_user_id_fk',
    },
  ])
  user: RefundUserModel
}
