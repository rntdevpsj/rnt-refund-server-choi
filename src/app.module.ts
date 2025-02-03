import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthGuard } from './auth/guards/auth.guard'
import { CommonModule } from './common/common.module'
import { ENV_SUPABASE_REFUND_SUPAVISOR_URL } from './common/const/env-keys.const'
import { RefundModule } from './refund/refund.module'
import { TilcoModule } from './tilco/tilco.module'
import { BullModule } from '@nestjs/bull'
import { SupabaseModule } from './supabase/supabase.module'
import { AllExceptionsFilter } from './common/filter/alli-exception'
import { RedisService } from './common/service/redis.service'
import { RequestContextInterceptor } from './common/interceptor/request-context.interceptor'
import { EmployeeWorkerModel } from './refund/database/entity/employee-worker.entity'
import { HometaxFillingCorporateModel } from './refund/database/entity/hometax_filling_corporate.entity'
import { HometaxFillingPersonModel } from './refund/database/entity/hometax_filling_person.entity'
import { IncreaseEmployeeTaxCreditModel } from './refund/database/entity/increase_employee_tax_credit.entity'
import { IncreaseEmployeeYearlyModel } from './refund/database/entity/increase-employee-yearly.entity'
import { IncreaseMonthlyCountModel } from './refund/database/entity/increase-monthly-counts.entity'
import { IntegrateEmployeeTaxCreditModel } from './refund/database/entity/integrate_employee_tax_credit.entity'
import { IntegrateEmployeeYearlyModel } from './refund/database/entity/integrate-employee-yearly.entity'
import { IntegrateMonthlyCountModel } from './refund/database/entity/integrate-monthly-count.entity'
import { RefundCompanyModel } from './refund/database/entity/refund-company.entity'
import { RefundUserModel } from './refund/database/entity/refund-user.entity'
import { SocialInsuranceTaxCreditModel } from './refund/database/entity/social_insurance_tax_credit.entity'
import { SocialInsuranceRateModel } from './refund/database/entity/social-insurance-rate.entity'
import { TotalSalaryYearlyModel } from './refund/database/entity/total-salary-yearly.entity'
import { RefundYearlyModel } from './refund/database/entity/refund_yearly.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env[ENV_SUPABASE_REFUND_SUPAVISOR_URL],
      entities: [
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
      ],
      synchronize: process.env.NODE_ENV !== 'production', // 개발환경에서만 synchronize 활성화
      logging: false,
      migrationsRun: false,
      poolSize: 10, // 커넥션 풀 크기 설정
      extra: {
        max: 10, // 최대 커넥션 수
        connectionTimeoutMillis: 3000, // 커넥션 타임아웃
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisPassword = configService.get<string>('REDIS_PASSWORD')
        const redisUrl = `redis://default:${redisPassword}@redis-15469.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com:15469`

        return {
          redis: redisUrl,
          prefix: 'bull',
          defaultJobOptions: {
            attempts: 1, // 재시도 없음
            timeout: 300000, // 5분
            removeOnComplete: true, // 완료된 작업 자동 제거
            removeOnFail: true, // 실패한 작업 자동 제거
            preventRepublish: true, // 중복 발행 방지
          },
        }
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'auth-queue' },
      { name: 'refund-queue' },
      { name: 'notification-queue' },
    ),
    SupabaseModule,
    CommonModule,
    RefundModule,
    TilcoModule,
  ],
  controllers: [AppController],
  providers: [
    RedisService,
    // 전역으로 등록, 컨트롤러에서 데코레이터사용해서 개별로 추가할필요없음음
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
  ],
})
export class AppModule {}
