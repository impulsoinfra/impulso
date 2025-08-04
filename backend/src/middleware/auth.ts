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

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Token de acceso requerido'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as any
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    }
    next()
  } catch (error) {
    return res.status(403).json({
      error: 'Token inválido'
    })
  }
}

// Middleware para verificar roles específicos
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticación requerida'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permisos insuficientes'
      })
    }

    next()
  }
} 