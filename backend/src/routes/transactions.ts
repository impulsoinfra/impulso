import express from 'express'
import { getArtistEarnings, getEarningsSummary } from '../controllers/transactionController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Obtener ganancias del artista
router.get('/earnings', getArtistEarnings)

// Obtener resumen de ganancias para dashboard
router.get('/earnings-summary', getEarningsSummary)

export default router
