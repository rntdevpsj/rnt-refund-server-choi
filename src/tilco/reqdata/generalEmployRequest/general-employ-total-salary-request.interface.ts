import { BaseGeneralEmployRequest } from './base-general-employ-request.interface'

export interface GeneralEmployTotalSalaryRequest
  extends BaseGeneralEmployRequest {
  BusinessNumber: string
  UserGroupFlag: string
  IndividualFlag: string
  BoheomYear: string
  GwanriNo: string
}
