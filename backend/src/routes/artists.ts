import express from 'express'
import { getArtists, getArtistById, updateArtist, followArtist } from '../controllers/artistController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Rutas públicas
router.get('/', getArtists)
router.get('/:id', getArtistById)

// Rutas protegidas
router.put('/:id', authenticateToken, updateArtist)
router.post('/:id/follow', authenticateToken, followArtist)

export default router 