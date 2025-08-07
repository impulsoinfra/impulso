import express from 'express'
import { body } from 'express-validator'
import { register, login, logout, refreshToken } from '../controllers/authController'
import { validateRequest } from '../middleware/validation'

const router = express.Router()

// Validación para registro
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('role')
    .isIn(['ARTIST', 'SUPPORTER'])
    .withMessage('El rol debe ser ARTIST o SUPPORTER')
]

// Validación para login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
]

// Rutas de autenticación
router.post('/register', registerValidation, validateRequest, register)
router.post('/login', loginValidation, validateRequest, login)
router.post('/logout', logout)
router.post('/refresh', refreshToken)

export default router 