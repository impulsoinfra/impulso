import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Tipos para las requests
interface RegisterRequest extends Request {
  body: {
    name: string
    email: string
    password: string
    role: 'artist' | 'supporter'
  }
}

interface LoginRequest extends Request {
  body: {
    email: string
    password: string
  }
}

// Generar tokens JWT
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env['JWT_SECRET'] || 'fallback-secret',
    { expiresIn: '15m' }
  )
  
  const refreshToken = jwt.sign(
    { userId, role },
    process.env['JWT_REFRESH_SECRET'] || 'fallback-refresh-secret',
    { expiresIn: '7d' }
  )
  
  return { accessToken, refreshToken }
}

// Registrar nuevo usuario
export const register = async (req: RegisterRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    })

    // Generar tokens
    const tokens = generateTokens(user.id, user.role)

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tokens
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({
      error: 'Error al registrar usuario'
    })
  }
}

// Login de usuario
export const login = async (req: LoginRequest, res: Response) => {
  try {
    const { email, password } = req.body

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      })
    }

    // Generar tokens
    const tokens = generateTokens(user.id, user.role)

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tokens
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({
      error: 'Error al hacer login'
    })
  }
}

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    // En una implementación real, aquí invalidarías el refresh token
    res.json({
      message: 'Logout exitoso'
    })
  } catch (error) {
    console.error('Error en logout:', error)
    res.status(500).json({
      error: 'Error al hacer logout'
    })
  }
}

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token requerido'
      })
    }

    // Verificar refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env['JWT_REFRESH_SECRET'] || 'fallback-refresh-secret'
    ) as any

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      })
    }

    // Generar nuevos tokens
    const tokens = generateTokens(user.id, user.role)

    res.json({
      message: 'Token refrescado exitosamente',
      tokens
    })
  } catch (error) {
    console.error('Error al refrescar token:', error)
    res.status(401).json({
      error: 'Token inválido'
    })
  }
} 