import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ErrorType, ProcessStep, ServiceOperation } from '../type/common.types'
import { ErrorContext, ErrorDetails, ErrorResponse } from '../type/error.types'

@Injectable()
export class AppException extends HttpException {
  constructor(
    public readonly errorType: ErrorType,
    message: string,
    public readonly processStep: ProcessStep | '',
    public readonly operation: ServiceOperation,
    public readonly details?: ErrorDetails,
    public readonly errorHistory?: ErrorContext[],
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    const response: ErrorResponse = {
      success: false,
      error: {
        type: errorType,
        message,
        processStep,
        operation,
        details,
        errorHistory,
      },
    }

    super(response, status)
  }

  isAuthError(): boolean {
    return (
      this.processStep === 'simple-auth-request' ||
      this.processStep === 'auth-verification'
    )
  }

  static from(
    error: any,
    message: string,
    processStep: ProcessStep,
    operation: ServiceOperation,
  ): AppException {
    if (error instanceof AppException) {
      const previousContext: ErrorContext = {
        type: error.errorType,
        message: error.message,
        processStep: error.processStep,
        operation: error.operation,
        details: error.details,
      }

      const errorHistory = error.errorHistory
        ? [...error.errorHistory, previousContext]
        : [previousContext]

      return new AppException(
        error.errorType,
        message,
        processStep,
        operation,
        error.details,
        errorHistory,
        error.getStatus(),
      )
    }

    return AppException.system(message, processStep, {
      originalError: error.message,
    })
  }

  static validation(
    message: string,
    operation: ServiceOperation = 'request-validation',
    details?: ErrorDetails,
  ): AppException {
    return new AppException(
      'validation-error',
      message,
      'request-validation',
      operation,
      details,
    )
  }

  static externalApi(
    message: string,
    processStep: ProcessStep,
    operation: ServiceOperation,
    details?: ErrorDetails,
  ): AppException {
    return new AppException(
      'external-api-error',
      message,
      processStep,
      operation,
      details,
    )
  }

  static database(
    message: string,
    processStep: ProcessStep,
    details?: ErrorDetails,
  ): AppException {
    return new AppException(
      'database-error',
      message,
      processStep,
      'database',
      details,
    )
  }

  static redis(
    message: string,
    processStep: ProcessStep,
    details?: ErrorDetails,
  ): AppException {
    return new AppException(
      'redis-error',
      message,
      processStep,
      'redis',
      details,
    )
  }

  static queue(
    message: string,
    processStep: ProcessStep,
    details?: ErrorDetails,
  ): AppException {
    return new AppException(
      'queue-error',
      message,
      processStep,
      'queue',
      details,
    )
  }

  static business(
    message: string,
    processStep: ProcessStep,
    operation: ServiceOperation,
    details?: ErrorDetails,
  ): AppException {
    return new AppException(
      'business-error',
      message,
      processStep,
      operation,
      details,
    )
  }

  static system(
    message: string,
    processStep: ProcessStep = 'system',
    details?: ErrorDetails,
  ): AppException {
    return new AppException(
      'system-error',
      message,
      processStep,
      'system',
      details,
    )
  }
}
