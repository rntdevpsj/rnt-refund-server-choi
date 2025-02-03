import { BaseGeneralEmployRequest } from './base-general-employ-request.interface'

export interface GeneralEmployEmploymentInfoRequest
  extends BaseGeneralEmployRequest {
  BusinessNumber: string
  UserGroupFlag: string
  IndividualFlag: string
  GwanriNo: string
  BoheomFg: string
  GyStatusCd: string
  GeunrojaNm: string
  GeunrojaRgNo: string
}
