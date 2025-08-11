import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Importar rutas
import authRoutes from './routes/auth'
import artistRoutes from './routes/artists'
import userRoutes from './routes/users'
import supportRoutes from './routes/support'
import postRoutes from './routes/posts'
import transactionRoutes from './routes/transactions'

// Configuración de variables de entorno
dotenv.config()

const app = express()
const PORT = process.env['PORT'] || 3001

// Middleware de seguridad
app.use(helmet())

// Configuración de CORS
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas requests desde esta IP'
})
app.use('/api/', limiter)

// Middleware de logging
app.use(morgan('combined'))

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/artists', artistRoutes)
app.use('/api/users', userRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/transactions', transactionRoutes)

// Ruta de health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development'
  })
})

// Middleware de manejo de errores
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: process.env['NODE_ENV'] === 'development' ? err.message : 'Error interno del servidor'
  })
})

// Ruta 404 para endpoints no encontrados
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🌍 Ambiente: ${process.env['NODE_ENV'] || 'development'}`)
})

export default app 