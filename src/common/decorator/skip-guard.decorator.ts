// skip-guard.decorator.ts
import { SetMetadata } from '@nestjs/common'

export const SKIP_GUARD = 'skipGuard'
export const SkipGuard = () => SetMetadata(SKIP_GUARD, true)
