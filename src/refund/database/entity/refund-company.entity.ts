import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseModel } from './base.entity'
import { RefundUserModel } from './refund-user.entity'

@Entity('tb_refund_company')
@Unique('tb_refund_company_company_id_key', ['companyId'])
export class RefundCompanyModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'tb_refund_company_pkey',
  })
  id: string

  @Column('uuid', {
    name: 'company_id',
    nullable: false,
  })
  companyId: string

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  userId: string

  @Column({
    type: 'text',
    name: 'company_name',
    nullable: true,
    comment: '사업장명',
  })
  companyName: string

  @Column({
    type: 'text',
    name: 'business_no',
    nullable: true,
    comment: '사업자번호',
  })
  businessNo: string

  @Column({
    type: 'text',
    name: 'address',
    nullable: true,
    comment: '사업장 주소',
  })
  address: string

  @Column({
    type: 'text',
    name: 'workplace_manage_no',
    nullable: true,
    comment: '사업장관리번호',
  })
  workplaceManageNo: string

  @Column({
    type: 'text',
    name: 'business_type_code',
    nullable: true,
    comment: '업종코드',
  })
  businessTypeCode: string

  @Column({
    type: 'text',
    name: 'business_start_date',
    nullable: true,
    default: '2018-01-01',
    comment: '사업개시일',
  })
  businessStartDate: string

  @Column({
    type: 'boolean',
    name: 'location_type',
    nullable: true,
    default: false,
    comment: '수도권 (서울, 경기, 인천) : true, 이외 : false',
  })
  locationType: boolean

  @ManyToOne(() => RefundUserModel, user => user.companies, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName:
        'tb_refund_company_user_id_tb_refund_user_id_fk',
    },
  ])
  refundUser: RefundUserModel

  // @OneToMany(() => EmployeeWorkerModel, worker => worker.company)
  // employees: EmployeeWorkerModel[]

  // @OneToOne(() => SocialInsuranceRateModel, rate => rate.company)
  // socialInsuranceRate: SocialInsuranceRateModel
}
