import { BaseSimpleEmployReqeust } from './base-simple-employ-request.interface'

export interface SimpleEmployBusinessRateApiReqData
  extends BaseSimpleEmployReqeust {
  UserGroupFlag: string
  IndividualFlag: string
  GwanriNo?: string
  Year: string
}
