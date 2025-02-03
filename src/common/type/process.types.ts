import {
  AuthType,
  ErrorType,
  ProcessStatus,
  ProcessStep,
  ServiceOperation,
} from './common.types'

export interface ProcessData {
  userId: string
  cashnoteUid: string
  redirectUrl: string
  authType: AuthType
  status: ProcessStatus
  isNotified: boolean // 파트너사 통보 여부
  errorInfo?: {
    type: ErrorType
    processStep: ProcessStep
    operation: ServiceOperation
    message: string
  }
}
