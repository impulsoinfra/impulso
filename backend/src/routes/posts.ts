import express from 'express'
import { createPost, getArtistPosts, deletePost } from '../controllers/postController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Crear nueva publicación
router.post('/', createPost)

// Obtener publicaciones del artista
router.get('/my-posts', getArtistPosts)

// Eliminar publicación
router.delete('/:id', deletePost)

export default router
