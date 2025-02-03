import { ErrorType, ProcessStep, ServiceOperation } from './common.types'
export interface ErrorDetails {
  [key: string]: any
}
// export interface ErrorDetails {
//   code?: string
//   originalError?: string
//   [key: string]: any
// }
export interface ErrorContext {
  type: ErrorType
  message: string
  processStep: ProcessStep | ''
  operation: ServiceOperation
  details?: ErrorDetails
}
export interface ErrorResponse {
  success: false
  error: {
    type: ErrorType
    message: string
    processStep: ProcessStep | ''
    operation: ServiceOperation
    details?: ErrorDetails
    errorHistory?: ErrorContext[]
  }
}
