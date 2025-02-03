import { BaseGeneralHometaxRequest } from './base-general-hometax-request.interface'

export interface GeneralHometaxBusinessClosureRequest
  extends BaseGeneralHometaxRequest {
  BusinessNumber: string
  EnglCvaAplnYn: string
  ResnoOpYn: string
  IssueType: string
  Organization: string
}
