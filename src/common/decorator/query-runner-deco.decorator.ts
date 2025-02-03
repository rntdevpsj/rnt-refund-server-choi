import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { AppException } from '../exception/app.exception'

export const QueryRunnerDeco = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest()

    if (!req.queryRunner) {
      throw new AppException('system-error', '쿼리러너 오류', '', 'system', {})
    }

    return req.queryRunner
  },
)
