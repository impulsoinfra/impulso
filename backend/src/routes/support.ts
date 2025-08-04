import express from 'express'
import { createSupport, getSupportHistory } from '../controllers/supportController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

router.post('/', createSupport)
router.get('/history', getSupportHistory)

export default router 