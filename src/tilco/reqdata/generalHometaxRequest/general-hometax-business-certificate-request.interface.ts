import { BaseGeneralHometaxRequest } from './base-general-hometax-request.interface'

export interface GeneralHometaxBusinessCertiticateRequest
  extends BaseGeneralHometaxRequest {
  BusinessNumber: string
  EnglCvaAplnYn: string
  ResnoOpYn: string
  IssueType: string
  Organization: string
}
