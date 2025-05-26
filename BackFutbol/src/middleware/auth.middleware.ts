import jwt from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"
import { AppError } from "./error.middleware"

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    throw new AppError("Authentication token is required", 401)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    req.user = decoded
    next()
  } catch (err) {
    throw new AppError("Invalid or expired token", 403)
  }
}

export function authorizeRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401)
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("Insufficient permissions", 403)
    }

    next()
  }
}
