import { AuthType } from '../../common/type/common.types'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'

export class BaseAuthRequestDto {
  @IsString()
  @IsNotEmpty()
  identityNumber: string

  @IsString()
  @IsNotEmpty()
  birthDate: string

  @IsString()
  @IsNotEmpty()
  privateAuthType: string

  @IsString()
  @IsNotEmpty()
  userName: string

  @IsString()
  @IsNotEmpty()
  userCellphoneNumber: string

  @IsBoolean()
  @IsNotEmpty()
  companyType: boolean

  @IsString()
  @IsOptional()
  cashnoteUid?: string

  @IsString()
  @IsUrl()
  @IsOptional()
  redirectUrl?: string
}

export class SimpleAuthRequestDto extends BaseAuthRequestDto {
  // @IsLiteral('simple-auth') // 특정 값만 허용

  @IsEnum(['simple-auth', 'general-auth'])
  authType: AuthType
}

export class GeneralAuthRequestDto extends BaseAuthRequestDto {
  // @IsLiteral('general-auth')

  @IsEnum(['simple-auth', 'general-auth'])
  authType: AuthType
}
