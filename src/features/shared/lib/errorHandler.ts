import { NextResponse } from 'next/server'
import { z } from 'zod'

export interface ApiError {
  message: string
  status: number
  code?: string
}

export class AppError extends Error {
  public readonly status: number
  public readonly code?: string
  public readonly isOperational: boolean

  constructor(message: string, status: number = 500, code?: string, isOperational: boolean = true) {
    super(message)
    this.status = status
    this.code = code
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Centralized error handler for API routes
 * Ensures consistent error responses without exposing sensitive information
 */
export function handleApiError(error: unknown): NextResponse {
  // Log error using structured logger
  if (error instanceof Error) {
    console.error('API Error', error, error.constructor.name)
  } else {
    console.error('Unknown API Error', String(error))
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      },
      { status: 400 }
    )
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.status }
    )
  }

  // Handle authentication and authorization errors
  if (error instanceof Error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Admin privileges required') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    // Handle specific known errors
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      )
    }
  }

  // Default to generic error message for security
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  UNAUTHORIZED: new AppError('Authentication required', 401),
  FORBIDDEN: new AppError('Admin privileges required', 403),
  NOT_FOUND: new AppError('Resource not found', 404),
  CONFLICT: new AppError('Resource already exists', 409),
  VALIDATION_ERROR: new AppError('Invalid input data', 400),
  INTERNAL_ERROR: new AppError('Internal server error', 500)
} as const

/**
 * Async wrapper for API route handlers
 * Automatically catches and handles errors
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse | R>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const result = await handler(...args)
      return result instanceof NextResponse ? result : NextResponse.json(result)
    } catch (error) {
      return handleApiError(error)
    }
  }
}