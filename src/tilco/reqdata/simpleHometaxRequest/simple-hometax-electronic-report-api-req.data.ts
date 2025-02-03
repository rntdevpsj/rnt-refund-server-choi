import { BaseSimpleHometaxReqeust } from './base-simple-hometax-request.interface'

export interface SimpleHometaxElectronicReportApiReqData
  extends BaseSimpleHometaxReqeust {
  TaxItem: string
  BusinessNumber: string
  StartDate: string
  EndDate: string
  DocType: string
  NtplInfpYn: string
  IsClaim: string
}
