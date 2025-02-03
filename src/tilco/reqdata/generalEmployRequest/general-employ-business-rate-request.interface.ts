import { BaseGeneralEmployRequest } from './base-general-employ-request.interface'

export interface GeneralEmployBusinessRateRequest
  extends BaseGeneralEmployRequest {
  BusinessNumber: string
  UserGroupFlag: string
  IndividualFlag: string
  GwanriNo: string
  Year: string
}
