import { BaseGeneralEmployRequest } from './base-general-employ-request.interface'

export interface GeneralEmployBusinessManageNoRequest
  extends BaseGeneralEmployRequest {
  BusinessNumber: string
  UserGroupFlag: string
  IndividualFlag: string
}
