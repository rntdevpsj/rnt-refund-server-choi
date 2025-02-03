import { Injectable, Logger } from '@nestjs/common'
import { HttpService as NestHttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AppException } from '../exception/app.exception'

@Injectable()
export class HttpApiService {
  private readonly logger = new Logger(HttpApiService.name)
  private readonly baseUrl: string

  constructor(private readonly httpService: NestHttpService) {}

  // async get<T, R>(endpoint: string, params?: T, headers?: any): Promise<R> {
  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get<any>(endpoint, {
  //         headers,
  //         params,
  //       }),
  //     )

  //     this.logger.debug('HTTP Response:', {
  //       status: response.status,
  //       statusText: response.statusText,
  //       data: response.data,
  //       headers: response.headers,
  //     })

  //     if (response.data.ErrorCode !== 0) {
  //       throw new AppException('api-error', 'http-post에러러', '', 'system', {
  //         // userId,
  //         // cashnoteUid: requestDto.cashnoteUid,
  //         // userName: requestDto.userName,
  //         // attempts: job.attemptsMade,
  //         // error: error.message,
  //       })
  //     }

  //     return response.data
  //   } catch (error) {
  //     // 이미 AppException이면 그대로 throw
  //     if (error instanceof AppException) {
  //       throw error
  //     }

  //     // HTTP 응답이 있는 경우
  //     if (error.response) {
  //       throw new AppException('api-error', 'http-post에러러', '', 'system', {
  //         // userId,
  //         // cashnoteUid: requestDto.cashnoteUid,
  //         // userName: requestDto.userName,
  //         // attempts: job.attemptsMade,
  //         error: error.message,
  //       })
  //     }

  //     // 기타 에러
  //     throw new AppException('api-error', 'http-post에러러', '', 'system', {
  //       // userId,
  //       // cashnoteUid: requestDto.cashnoteUid,
  //       // userName: requestDto.userName,
  //       // attempts: job.attemptsMade,
  //       error: error.message,
  //     })
  //   }
  // }

  async post<Treq>(endpoint: string, data: Treq, headers?: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<any>(endpoint, data, {
          headers,
        }),
      )
      return response.data
    } catch (error) {
      throw AppException.externalApi(
        'API호출 실패',
        'http', // 현재 진행 중인 프로세스 단계
        'external-api', // 구체적인 작업
        { originalError: error.message }, // 상세 정보
      )
    }
  }
}
