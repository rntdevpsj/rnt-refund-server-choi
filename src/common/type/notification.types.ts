import { ErrorType, ProcessStep, ServiceOperation } from './common.types'
import { ErrorDetails } from './error.types'

export interface PartnerNotificationData {
  status: 'SUCCESS' | 'FAILED' | 'NOT_ELIGIBLE'
  error?: {
    type: ErrorType
    message: string
    processStep: ProcessStep
    operation: ServiceOperation
    details?: ErrorDetails
  }
  data?: {
    refundAmount: number
    message: string
    details?: any
  }
}
