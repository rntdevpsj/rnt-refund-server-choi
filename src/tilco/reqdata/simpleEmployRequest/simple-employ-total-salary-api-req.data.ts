import { BaseSimpleEmployReqeust } from './base-simple-employ-request.interface'

export interface SimpleEmployTotalSalaryApiReqData
  extends BaseSimpleEmployReqeust {
  BusinessNumber: string
  UserGroupFlag: string
  IndividualFlag: string
  BoheomYear: string
  GwanriNo: string
}
