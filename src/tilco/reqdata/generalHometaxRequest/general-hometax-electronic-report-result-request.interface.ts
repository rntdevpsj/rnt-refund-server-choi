import { BaseGeneralHometaxRequest } from './base-general-hometax-request.interface'

export interface GeneralHometaxElectronicReportRequest
  extends BaseGeneralHometaxRequest {
  TaxItem: string
  BusinessNumber: string
  StartDate: string
  EndDate: string
  DocType: string
  NtplInfpYn: string
  IsClaim: string
}
