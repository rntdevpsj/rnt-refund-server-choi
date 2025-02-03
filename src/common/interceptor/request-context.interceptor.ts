import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { RedisService } from '../service/redis.service'
import { tap } from 'rxjs'

// request객체는 http접속이 끊나더라도 가베지컬렉션이 일어나기전까지는 메모리에 request정보를 가지고 있다
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    // 컨트롤러실행전 인터셉트 : request객체 가져온다다
    const request = context.switchToHttp().getRequest()

    // 만약 컨트롤러 실행 전에 userId가 요청에 담겨온다면 이 userId request에 저장
    // const originalUserId = Symbol('originalUserId')
    // request[originalUserId] = request.userId

    // 컨트롤러 실행후 인터셉트트 : response에서 userId가 포함되어 있다면 request에 저장
    return next.handle().pipe(
      tap(async response => {
        if (response?.userId) {
          request.userId = response.userId
        }
      }),
    )
  }
}
