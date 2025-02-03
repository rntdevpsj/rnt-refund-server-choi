import { BaseSimpleEmployReqeust } from './base-simple-employ-request.interface'

export interface SimpleEmployEmploymentInfoApiReqData
  extends BaseSimpleEmployReqeust {
  BusinessNumber: string
  UserGroupFlag: string
  IndividualFlag: string
  GwanriNo: string
  BoheomFg: string
  GyStatusCd: string
  GeunrojaNm?: string
  GeunrojaRgNo?: string
}
