import { RefundUserService } from './database/service/refund-user.service'
import { RedisService } from './../common/service/redis.service'
import { CommonModule } from './../common/common.module'
import { Module } from '@nestjs/common'
import { RefundController } from './refund.controller'
import { TilcoModule } from 'src/tilco/tilco.module'
import { BullModule } from '@nestjs/bull'
import { RefundService } from './refund.service'
import { HttpModule } from '@nestjs/axios'
import { AuthProcessor } from './processor/auth.processor'
import { RefundProcessor } from './processor/refund.processor'
import { RefundHometaxService } from './service/refund-hometax.service'
import { FileUtilService } from 'src/common/service/file-util.service'
import { RefundEmployService } from './service/refund-employ.service'
import { NotificationProcessor } from './processor/notification.processor'
import { RefundCalculateService } from './service/refund-calculate.service'
import { SupabaseModule } from 'src/supabase/supabase.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EmployeeWorkerModel } from './database/entity/employee-worker.entity'
import { HometaxFillingCorporateModel } from './database/entity/hometax_filling_corporate.entity'
import { HometaxFillingPersonModel } from './database/entity/hometax_filling_person.entity'
import { IncreaseEmployeeTaxCreditModel } from './database/entity/increase_employee_tax_credit.entity'
import { IncreaseEmployeeYearlyModel } from './database/entity/increase-employee-yearly.entity'
import { IncreaseMonthlyCountModel } from './database/entity/increase-monthly-counts.entity'
import { IntegrateEmployeeTaxCreditModel } from './database/entity/integrate_employee_tax_credit.entity'
import { IntegrateEmployeeYearlyModel } from './database/entity/integrate-employee-yearly.entity'
import { IntegrateMonthlyCountModel } from './database/entity/integrate-monthly-count.entity'
import { RefundCompanyModel } from './database/entity/refund-company.entity'
import { RefundUserModel } from './database/entity/refund-user.entity'
import { SocialInsuranceTaxCreditModel } from './database/entity/social_insurance_tax_credit.entity'
import { SocialInsuranceRateModel } from './database/entity/social-insurance-rate.entity'
import { TotalSalaryYearlyModel } from './database/entity/total-salary-yearly.entity'
import { RefundYearlyModel } from './database/entity/refund_yearly.entity'
import { RefundCompanyService } from './database/service/refund-company.service'
import { HometaxFillingPersonService } from './database/service/hometax_filling_person.service'
import { HometaxFillingCorporateService } from './database/service/hometax_filling_corporate.service'
import { EmployeeWorkerService } from './database/service/employee-worker.service'
import { SocialInsuranceRateService } from './database/service/social-insurance-rate.service'
import { IncreaseMonthlyCountService } from './database/service/increse-monthly-counts.service'
import { IntegrateMonthlyCountService } from './database/service/integrate-monthly-count.service'
import { IncreaseEmployeeYearlyService } from './database/service/increase-employee-yearly.service'
import { IntegrateEmployeeYearlyService } from './database/service/integrate-employee-yearly.service'
import { TotalSalaryYearlyService } from './database/service/total-salary-yearly.service'
import { IncreaseEmployeeTaxCreditService } from './database/service/increase_employee_tax_credit.service'
import { IntegrateEmployeeTaxCreditService } from './database/service/integrate_employee_tax_credit.service'
import { SocialInsuranceTaxCreditService } from './database/service/social_insurance_tax_credit.service'
import { RefundYearlyService } from './database/service/refund_yearly.service'

@Module({
  imports: [
    CommonModule,
    SupabaseModule,
    TilcoModule,
    HttpModule,
    TypeOrmModule.forFeature([
      EmployeeWorkerModel,
      HometaxFillingCorporateModel,
      HometaxFillingPersonModel,
      IncreaseEmployeeTaxCreditModel,
      IncreaseEmployeeYearlyModel,
      IncreaseMonthlyCountModel,
      IntegrateEmployeeTaxCreditModel,
      IntegrateEmployeeYearlyModel,
      IntegrateMonthlyCountModel,
      RefundCompanyModel,
      RefundUserModel,
      SocialInsuranceTaxCreditModel,
      SocialInsuranceRateModel,
      TotalSalaryYearlyModel,
      RefundYearlyModel,
    ]),
    BullModule.registerQueue(
      { name: 'auth-queue' },
      { name: 'refund-queue' },
      { name: 'notification-queue' },
    ),
  ],
  controllers: [RefundController],
  providers: [
    AuthProcessor,
    RefundProcessor,
    NotificationProcessor,
    RefundService,
    RedisService,
    RefundHometaxService,
    RefundEmployService,
    RefundCalculateService,
    FileUtilService,
    RefundUserService,
    RefundCompanyService,
    HometaxFillingPersonService,
    HometaxFillingCorporateService,
    EmployeeWorkerService,
    SocialInsuranceRateService,
    IncreaseMonthlyCountService,
    IntegrateMonthlyCountService,
    IncreaseEmployeeYearlyService,
    IntegrateEmployeeYearlyService,
    TotalSalaryYearlyService,
    IncreaseEmployeeTaxCreditService,
    IntegrateEmployeeTaxCreditService,
    SocialInsuranceTaxCreditService,
    RefundYearlyService,
  ],
  exports: [
    RefundUserService,
    RefundHometaxService,
    RefundEmployService,
    RefundCalculateService,
  ],
})
export class RefundModule {}
