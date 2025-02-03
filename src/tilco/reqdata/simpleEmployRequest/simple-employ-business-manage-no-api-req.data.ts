import { BaseSimpleEmployReqeust } from './base-simple-employ-request.interface'

export interface SimpleEmployBusinessManageNoApiReqData
  extends BaseSimpleEmployReqeust {
  BusinessNumber: string
  UserGroupFlag: string
  IndividualFlag: string
}
