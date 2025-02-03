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

@Entity('tb_increase_employee_yearly')
@Unique('tb_increase_employee_yearly_user_id_key', ['userId'])
export class IncreaseEmployeeYearlyModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_increase_employee_yearly_pkey',
  })
  id: string

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string

  @Column({
    name: 'youth_counts_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 상시근로자수 1차년도',
  })
  youthCountsYear1: number

  @Column({
    name: 'middle_counts_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 상시근로자수 1차년도',
  })
  middleCountsYear1: number

  @Column({
    name: 'total_counts_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 상시근로자수 1차년도',
  })
  totalCountsYear1: number

  @Column({
    name: 'youth_counts_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 상시근로자수 2차년도',
  })
  youthCountsYear2: number

  @Column({
    name: 'middle_counts_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 상시근로자수 2차년도',
  })
  middleCountsYear2: number

  @Column({
    name: 'total_counts_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 상시근로자수 2차년도',
  })
  totalCountsYear2: number

  @Column({
    name: 'youth_counts_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 상시근로자수 3차년도',
  })
  youthCountsYear3: number

  @Column({
    name: 'middle_counts_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 상시근로자수 3차년도',
  })
  middleCountsYear3: number

  @Column({
    name: 'total_counts_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 상시근로자수 3차년도',
  })
  totalCountsYear3: number

  @Column({
    name: 'youth_counts_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 상시근로자수 4차년도',
  })
  youthCountsYear4: number

  @Column({
    name: 'middle_counts_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 상시근로자수 4차년도',
  })
  middleCountsYear4: number

  @Column({
    name: 'total_counts_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 상시근로자수 4차년도',
  })
  totalCountsYear4: number

  @Column({
    name: 'youth_counts_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 상시근로자수 5차년도',
  })
  youthCountsYear5: number

  @Column({
    name: 'middle_counts_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 상시근로자수 5차년도',
  })
  middleCountsYear5: number

  @Column({
    name: 'total_counts_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 상시근로자수 5차년도',
  })
  totalCountsYear5: number

  @Column({
    name: 'youth_counts_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 상시근로자수 6차년도',
  })
  youthCountsYear6: number

  @Column({
    name: 'middle_counts_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 상시근로자수 6차년도',
  })
  middleCountsYear6: number

  @Column({
    name: 'total_counts_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 상시근로자수 6차년도',
  })
  totalCountsYear6: number

  @Column({
    name: 'youth_counts_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 상시근로자수 7차년도',
  })
  youthCountsYear7: number

  @Column({
    name: 'middle_counts_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 상시근로자수 7차년도',
  })
  middleCountsYear7: number

  @Column({
    name: 'total_counts_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 상시근로자수 7차년도',
  })
  totalCountsYear7: number

  // First variation
  // first variation year1
  @Column({
    name: 'first_variation_youth_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 1차증감 1차년도',
  })
  firstVariationYouthYear1: number

  @Column({
    name: 'first_variation_middle_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 1차증감 1차년도',
  })
  firstVariationMiddleYear1: number

  @Column({
    name: 'first_variation_total_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 1차증감 1차년도',
  })
  firstVariationTotalYear1: number

  // first variation year2
  @Column({
    name: 'first_variation_youth_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 1차증감 2차년도',
  })
  firstVariationYouthYear2: number

  @Column({
    name: 'first_variation_middle_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 1차증감 2차년도',
  })
  firstVariationMiddleYear2: number

  @Column({
    name: 'first_variation_total_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 1차증감 2차년도',
  })
  firstVariationTotalYear2: number

  // first variation year3
  @Column({
    name: 'first_variation_youth_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 1차증감 3차년도',
  })
  firstVariationYouthYear3: number

  @Column({
    name: 'first_variation_middle_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 1차증감 3차년도',
  })
  firstVariationMiddleYear3: number

  @Column({
    name: 'first_variation_total_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 1차증감 3차년도',
  })
  firstVariationTotalYear3: number

  // first variation year4
  @Column({
    name: 'first_variation_youth_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 1차증감 4차년도',
  })
  firstVariationYouthYear4: number

  @Column({
    name: 'first_variation_middle_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 1차증감 4차년도',
  })
  firstVariationMiddleYear4: number

  @Column({
    name: 'first_variation_total_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 1차증감 4차년도',
  })
  firstVariationTotalYear4: number

  // first variation year5
  @Column({
    name: 'first_variation_youth_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 1차증감 5차년도',
  })
  firstVariationYouthYear5: number

  @Column({
    name: 'first_variation_middle_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 1차증감 5차년도',
  })
  firstVariationMiddleYear5: number

  @Column({
    name: 'first_variation_total_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 1차증감 5차년도',
  })
  firstVariationTotalYear5: number

  // first variation year6
  @Column({
    name: 'first_variation_youth_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 1차증감 6차년도',
  })
  firstVariationYouthYear6: number

  @Column({
    name: 'first_variation_middle_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 1차증감 6차년도',
  })
  firstVariationMiddleYear6: number

  @Column({
    name: 'first_variation_total_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 1차증감 6차년도',
  })
  firstVariationTotalYear6: number

  // first variation year7
  @Column({
    name: 'first_variation_youth_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 1차증감 7차년도',
  })
  firstVariationYouthYear7: number

  @Column({
    name: 'first_variation_middle_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 1차증감 7차년도',
  })
  firstVariationMiddleYear7: number

  @Column({
    name: 'first_variation_total_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 1차증감 7차년도',
  })
  firstVariationTotalYear7: number

  // Second variation
  // second variation year1
  @Column({
    name: 'second_variation_youth_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 2차증감 1차년도',
  })
  secondVariationYouthYear1: number

  @Column({
    name: 'second_variation_middle_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 2차증감 1차년도',
  })
  secondVariationMiddleYear1: number

  @Column({
    name: 'second_variation_total_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 2차증감 1차년도',
  })
  secondVariationTotalYear1: number

  // second variation year2
  @Column({
    name: 'second_variation_youth_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 2차증감 2차년도',
  })
  secondVariationYouthYear2: number

  @Column({
    name: 'second_variation_middle_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 2차증감 2차년도',
  })
  secondVariationMiddleYear2: number

  @Column({
    name: 'second_variation_total_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 2차증감 2차년도',
  })
  secondVariationTotalYear2: number

  // second variation year3
  @Column({
    name: 'second_variation_youth_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 2차증감 3차년도',
  })
  secondVariationYouthYear3: number

  @Column({
    name: 'second_variation_middle_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 2차증감 3차년도',
  })
  secondVariationMiddleYear3: number

  @Column({
    name: 'second_variation_total_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 2차증감 3차년도',
  })
  secondVariationTotalYear3: number

  // second variation year4
  @Column({
    name: 'second_variation_youth_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 2차증감 4차년도',
  })
  secondVariationYouthYear4: number

  @Column({
    name: 'second_variation_middle_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 2차증감 4차년도',
  })
  secondVariationMiddleYear4: number

  @Column({
    name: 'second_variation_total_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 2차증감 4차년도',
  })
  secondVariationTotalYear4: number

  // second variation year5
  @Column({
    name: 'second_variation_youth_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 2차증감 5차년도',
  })
  secondVariationYouthYear5: number

  @Column({
    name: 'second_variation_middle_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 2차증감 5차년도',
  })
  secondVariationMiddleYear5: number

  @Column({
    name: 'second_variation_total_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 2차증감 5차년도',
  })
  secondVariationTotalYear5: number

  // second variation year6
  @Column({
    name: 'second_variation_youth_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 2차증감 6차년도',
  })
  secondVariationYouthYear6: number

  @Column({
    name: 'second_variation_middle_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 2차증감 6차년도',
  })
  secondVariationMiddleYear6: number

  @Column({
    name: 'second_variation_total_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 2차증감 6차년도',
  })
  secondVariationTotalYear6: number

  // second variation year7
  @Column({
    name: 'second_variation_youth_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 2차증감 7차년도',
  })
  secondVariationYouthYear7: number

  @Column({
    name: 'second_variation_middle_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 2차증감 7차년도',
  })
  secondVariationMiddleYear7: number

  @Column({
    name: 'second_variation_total_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 2차증감 7차년도',
  })
  secondVariationTotalYear7: number

  // Third variation
  // thrid variation year1
  @Column({
    name: 'third_variation_youth_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 3차증감 1차년도',
  })
  thirdVariationYouthYear1: number

  @Column({
    name: 'third_variation_middle_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 3차증감 1차년도',
  })
  thirdVariationMiddleYear1: number

  @Column({
    name: 'third_variation_total_year1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 3차증감 1차년도',
  })
  thirdVariationTotalYear1: number

  // third variation year2
  @Column({
    name: 'third_variation_youth_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 3차증감 2차년도',
  })
  thirdVariationYouthYear2: number

  @Column({
    name: 'third_variation_middle_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 3차증감 2차년도',
  })
  thirdVariationMiddleYear2: number

  @Column({
    name: 'third_variation_total_year2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 3차증감 2차년도',
  })
  thirdVariationTotalYear2: number

  // third variation year3
  @Column({
    name: 'third_variation_youth_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 3차증감 3차년도',
  })
  thirdVariationYouthYear3: number

  @Column({
    name: 'third_variation_middle_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 3차증감 3차년도',
  })
  thirdVariationMiddleYear3: number

  @Column({
    name: 'third_variation_total_year3',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 3차증감 3차년도',
  })
  thirdVariationTotalYear3: number

  // third variation year4
  @Column({
    name: 'third_variation_youth_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 3차증감 4차년도',
  })
  thirdVariationYouthYear4: number

  @Column({
    name: 'third_variation_middle_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 3차증감 4차년도',
  })
  thirdVariationMiddleYear4: number

  @Column({
    name: 'third_variation_total_year4',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 3차증감 4차년도',
  })
  thirdVariationTotalYear4: number

  // thrid variation year5
  @Column({
    name: 'third_variation_youth_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 3차증감 5차년도',
  })
  thirdVariationYouthYear5: number

  @Column({
    name: 'third_variation_middle_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 3차증감 5차년도',
  })
  thirdVariationMiddleYear5: number

  @Column({
    name: 'third_variation_total_year5',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 3차증감 5차년도',
  })
  thirdVariationTotalYear5: number

  // third variaion year6
  @Column({
    name: 'third_variation_youth_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 3차증감 6차년도',
  })
  thirdVariationYouthYear6: number

  @Column({
    name: 'third_variation_middle_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 3차증감 6차년도',
  })
  thirdVariationMiddleYear6: number

  @Column({
    name: 'third_variation_total_year6',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 3차증감 6차년도',
  })
  thirdVariationTotalYear6: number

  // third variation year7
  @Column({
    name: 'third_variation_youth_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년등 3차증감 7차년도',
  })
  thirdVariationYouthYear7: number

  @Column({
    name: 'third_variation_middle_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '청년외 3차증감 7차년도',
  })
  thirdVariationMiddleYear7: number

  @Column({
    name: 'third_variation_total_year7',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
    comment: '합계 3차증감 7차년도',
  })
  thirdVariationTotalYear7: number

  @OneToOne(() => RefundUserModel, user => user.increaseEmployeeYearly, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName:
        'tb_increase_employee_yearly_user_id_tb_refund_user_id_fk',
    },
  ])
  user: RefundUserModel
}
