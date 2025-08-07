import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: string
      }
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      error: 'Token de acceso requerido'
    })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as any
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    }
    next()
  } catch (error) {
    res.status(403).json({
      error: 'Token inválido'
    })
  }
}

// Middleware para verificar roles específicos
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Autenticación requerida'
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Permisos insuficientes'
      })
      return
    }

    next()
  }
} 