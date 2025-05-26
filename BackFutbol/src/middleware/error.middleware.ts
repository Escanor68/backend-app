import type { Request, Response, NextFunction } from "express"

export class AppError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  console.error({
    message: "Error caught by global handler",
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
  })

  // Default status code and message
  let statusCode = 500
  let message = "Internal server error"

  // If it's our custom AppError, use its status and message
  if (err instanceof AppError) {
    statusCode = err.status
    message = err.message
  } else if (err.name === "ValidationError") {
    statusCode = 400
    message = err.message
  } else if (err.message.includes("not found")) {
    statusCode = 404
    message = err.message
  }

  res.status(statusCode).json({
    status: statusCode,
    message: message,
  })
}
