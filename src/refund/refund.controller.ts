import { Controller, Post, Body, Logger, Req } from '@nestjs/common'
import { SkipGuard } from 'src/common/decorator/skip-guard.decorator'
import { SimpleAuthRequestDto } from './dto/cashnote-request.dto'
import { RefundService } from './refund.service'
import { RedisService } from 'src/common/service/redis.service'
import { Request } from 'express'
import { SuccessResponse } from 'src/common/type/sucess.types'

// express request객체에 userId라는 새로운 필드넣기 위해서 타입재정의
interface RequestWithUserId extends Request {
  userId?: string
}

@Controller('refund')
export class RefundController {
  private readonly logger = new Logger(RefundController.name)

  constructor(
    private readonly refundService: RefundService,
    private readonly redisService: RedisService,
  ) {}

  @Post('/cashnote/simple-auth')
  @SkipGuard()
  async initiateSimpleAuth(
    @Req() request: RequestWithUserId,
    @Body() requestDto: SimpleAuthRequestDto,
  ): Promise<SuccessResponse> {
    // 새로운 userId 생성해서 request객체에 저장. 전역필터,인터셉트에서 userId사용할수 있게
    try {
      // 이미 환급금조회신청을 한 사용자인지 체크 - cashnote uid
      const isExist = await this.refundService.isExistCashnoteRefundAmount(
        requestDto.cashnoteUid,
      )
      console.log('기존 신청자인지 체크', isExist)
      if (isExist) {
        return {
          success: true,
          message: '이미 환급금조회 신청한 완료한 고객입니다',
          data: {
            status: 'completed',
          },
        }
      }

      const userId = await this.redisService.generateUserId()
      request.userId = userId

      await this.refundService.initiateSimpleAuthProcess(userId, requestDto)
      // 즉시 응답 반환
      return {
        success: true,
        message: '환급금 조회 후 연락드리겠습니다.',
        data: {
          userId,
          status: 'processing',
        },
      }
    } catch (error) {
      // 컨트롤러에서는 에러를 변환하지 않고 그대로 throw 전역필터에서 처리됨
      this.logger.error('환급금 간편인증 작업 실패:', error)
      throw error
    }
  }
}
