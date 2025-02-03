import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import { DataSource, QueryRunner, QueryFailedError } from 'typeorm'
import { Request } from 'express'
import { AppException } from '../exception/app.exception'

interface RequestWithQueryRunner extends Request {
  queryRunner: QueryRunner
}

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<RequestWithQueryRunner>()
    const qr = this.dataSource.createQueryRunner()

    try {
      await qr.connect()
      await qr.startTransaction()

      req.queryRunner = qr

      return next.handle().pipe(
        catchError(async error => {
          try {
            if (qr.isTransactionActive) {
              await qr.rollbackTransaction()
            }
          } catch (rollbackError) {
            console.error('트랜잭션 롤백 실패:', rollbackError)
          }

          if (error instanceof QueryFailedError) {
            throw new AppException(
              'database-error',
              '데이터베이스 쿼리 실패패',
              '',
              'system',
              {},
            )
          }

          throw new AppException(
            'database-error',
            '데이터베이스 트랜잭션 실패패',
            '',
            'system',
            {},
          )
        }),
        tap(async () => {
          try {
            if (qr.isTransactionActive) {
              await qr.commitTransaction()
            }
          } catch (commitError) {
            console.error('트랜잭션 커밋 실패:', commitError)
            if (qr.isTransactionActive) {
              await qr.rollbackTransaction()
            }
            throw new AppException(
              'database-error',
              '트랜잭션 커밋 실패',
              '',
              'system',
              {},
            )
          }
        }),
      )
    } catch (error) {
      console.error('트랜잭션 초기화 실패:', error)
      throw new AppException(
        'database-error',
        '트랜잭션 초기화 실패패',
        '',
        'system',
        {},
      )
    } finally {
      try {
        await qr.release()
      } catch (releaseError) {
        console.error('QueryRunner 해제 실패:', releaseError)
      }
    }
  }
}
