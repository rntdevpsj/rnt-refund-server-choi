// import {
//   ErrorType,
//   ProcessStatus,
//   ProcessStep,
//   ServiceOperation,
// } from 'src/common/type/common.types'
// import { ErrorDetails } from 'src/common/type/error.types'

// interface BaseResponse<T = any> {
//   success: boolean
//   message?: string
//   data?: T
// }

// export interface SuccessResponse<T = any> extends BaseResponse {
//   success: true
//   data: T
// }

// export interface FailureResponse extends BaseResponse {
//   success: false
//   error: {
//     type: ErrorType
//     message: string
//     processStep: ProcessStep | ''
//     operation: ServiceOperation
//     details?: ErrorDetails
//   }
// }

// export interface ProcessInitResponse {
//   userId: string
//   status: ProcessStatus
//   message: string
// }

// // export interface PartnerNotificationData {
// //   success: boolean
// //   data?: {
// //     refundAmount: number
// //     message?: string
// //     details?: any
// //   }
// //   error?: {
// //     code: ErrorType
// //     message: string
// //     step: ProcessStep
// //   }
