import { SetMetadata } from '@nestjs/common'

export const ALLOWED_ORIGINS_KEY = 'allowedOrigins'
export const AllowOrigins = (origins: string[]) =>
  SetMetadata(ALLOWED_ORIGINS_KEY, origins)
