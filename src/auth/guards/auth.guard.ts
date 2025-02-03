import { SupabaseMainService } from './../../supabase/supabase-main.service'
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../../common/decorator/is-public.decorator'
import { ALLOWED_ORIGINS_KEY } from '../decorators/allowed-origins.decorator'
import { SKIP_GUARD } from './../../common/decorator/skip-guard.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabaseMainService: SupabaseMainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 스킵 체크
    const isSkipped = this.reflector.getAllAndOverride<boolean>(SKIP_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isSkipped) {
      return true
    }

    const request = context.switchToHttp().getRequest()

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const allowedOrigins = this.reflector.getAllAndOverride<string[]>(
      ALLOWED_ORIGINS_KEY,
      [context.getHandler(), context.getClass()],
    )

    const origin = request.headers.origin

    if (allowedOrigins?.includes(origin)) {
      return true
    }

    // localhost 체크
    if (
      process.env.NODE_ENV === 'development' &&
      (origin?.includes('localhost') || origin?.includes('127.0.0.1'))
    ) {
      return true
    }

    if (isPublic) {
      return true
    }

    const token = this.extractToken(request)
    if (!token) {
      throw new UnauthorizedException('Authorization token not found')
    }

    const { user, error } = await this.supabaseMainService.verifyToken(token)
    if (error || !user) {
      throw new UnauthorizedException('허가되지 않은 요청입니다')
    }

    request.user = user
    return true
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization
    if (!authHeader) return null

    const [bearer, token] = authHeader.split(' ')
    if (bearer !== 'Bearer') return null

    return token
  }
}
