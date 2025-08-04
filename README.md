# Impulso - Plataforma de Apoyo a Artistas Independientes

Impulso es una plataforma web que conecta artistas independientes con su comunidad, permitiendo que reciban apoyo económico a cambio de contenido exclusivo, agradecimientos o conexión directa.

## 🏗️ Estructura del Monorepo

```
impulso/
├── frontend/                    # Aplicación Next.js
│   ├── app/                    # Páginas (App Router)
│   ├── components/             # Componentes React
│   ├── lib/                   # Utilidades
│   └── public/                # Archivos estáticos
├── backend/                    # API Express.js
│   ├── src/
│   │   ├── controllers/       # Controladores
│   │   ├── routes/           # Rutas de la API
│   │   ├── middleware/       # Middlewares
│   │   ├── services/         # Servicios externos
│   │   └── types/           # Tipos TypeScript
│   ├── prisma/               # Esquema de base de datos
│   └── tests/                # Tests
├── shared/                    # Tipos y utilidades compartidas
│   ├── types/                # Interfaces compartidas
│   └── utils/                # Funciones utilitarias
└── package.json              # Configuración del monorepo
```

## 🚀 Características

### Frontend (Next.js 15)
- **Landing Page** - Página principal con información sobre la plataforma
- **Autenticación** - Sistema de login y registro para usuarios
- **Perfiles de Artistas** - Páginas detalladas con obras, información y opciones de apoyo
- **Descubrimiento** - Página para explorar y buscar artistas
- **Sistema de Apoyo** - Múltiples niveles de apoyo con beneficios exclusivos
- **Diseño Responsivo** - Optimizado para móviles y desktop
- **Tema Claro/Oscuro** - Soporte para diferentes temas

### Backend (Express.js + TypeScript)
- **API RESTful** - Endpoints para todas las funcionalidades
- **Autenticación JWT** - Sistema seguro de autenticación
- **Base de Datos PostgreSQL** - Con Prisma como ORM
- **Validación de Datos** - Con express-validator
- **Rate Limiting** - Protección contra spam
- **Upload de Archivos** - Para imágenes de artistas
- **Integración MercadoPago** - Para procesamiento de pagos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utilitario
- **shadcn/ui** - Componentes de UI
- **Lucide React** - Iconos
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Backend
- **Node.js + Express.js** - Servidor web
- **TypeScript** - Tipado estático
- **PostgreSQL** - Base de datos
- **Prisma** - ORM para base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **Multer** - Upload de archivos
- **MercadoPago SDK** - Procesamiento de pagos
- **Nodemailer** - Envío de emails

## 📦 Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- PostgreSQL
- npm o pnpm

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd impulso
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Configurar variables de entorno
```bash
# Backend
cp backend/env.example backend/.env
# Editar backend/.env con tus valores
```

### 4. Configurar base de datos
```bash
cd backend
npm run db:generate
npm run db:push
```

### 5. Ejecutar en desarrollo
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev

# O ejecutar por separado
npm run dev:frontend  # Puerto 3000
npm run dev:backend   # Puerto 3001
```

## 🔧 Scripts Disponibles

### Monorepo
```bash
npm run dev              # Ejecutar frontend y backend
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend
npm run build            # Build de ambos
npm run test             # Tests de ambos
npm run install:all      # Instalar todas las dependencias
```

### Backend
```bash
cd backend
npm run dev              # Desarrollo con nodemon
npm run build            # Compilar TypeScript
npm run start            # Ejecutar en producción
npm run db:generate      # Generar cliente Prisma
npm run db:push          # Sincronizar esquema
npm run db:migrate       # Ejecutar migraciones
npm run db:studio        # Abrir Prisma Studio
```

### Frontend
```bash
cd frontend
npm run dev              # Desarrollo
npm run build            # Build para producción
npm run start            # Ejecutar en producción
```

## 📱 Páginas Implementadas

### ✅ Frontend Completadas
- [x] Landing Page (`/`)
- [x] Login (`/auth/login`)
- [x] Register (`/auth/register`)
- [x] Artist Profile (`/artist/[id]`)
- [x] Discover (`/discover`)

### 🚧 Backend Pendientes
- [ ] Autenticación completa
- [ ] CRUD de artistas
- [ ] Sistema de seguimiento
- [ ] Upload de imágenes
- [ ] Integración MercadoPago
- [ ] Sistema de notificaciones

## 🗄️ Base de Datos

### Modelos Principales
- **User** - Usuarios del sistema
- **ArtistProfile** - Perfiles de artistas
- **Follows** - Relaciones de seguimiento
- **SupportTier** - Niveles de apoyo
- **SupportTransaction** - Transacciones de apoyo
- **Post** - Publicaciones de artistas
- **Comment** - Comentarios en posts

## 🔐 Autenticación

### Endpoints
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refrescar token

### Seguridad
- **JWT Tokens** - Access token (15min) + Refresh token (7días)
- **bcrypt** - Encriptación de contraseñas
- **Rate Limiting** - Protección contra spam
- **CORS** - Configurado para frontend
- **Helmet** - Headers de seguridad

## 🚀 Próximos Pasos

### Fase 1: Backend Core (1-2 semanas)
1. **Completar controladores** - CRUD básico
2. **Implementar autenticación** - JWT completo
3. **Upload de archivos** - Imágenes de artistas
4. **Tests unitarios** - Cobertura básica

### Fase 2: Integración (1 semana)
1. **Conectar frontend-backend** - API calls
2. **Estado de autenticación** - Context/Redux
3. **Manejo de errores** - UX mejorada
4. **Loading states** - Feedback visual

### Fase 3: Funcionalidades Avanzadas (2-3 semanas)
1. **MercadoPago** - Procesamiento de pagos
2. **Notificaciones** - Email y push
3. **Búsqueda avanzada** - Filtros y ordenamiento
4. **Analytics** - Métricas básicas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Contacto

Para preguntas o soporte, contactar a través de:
- Email: contacto@impulso.com
- GitHub Issues: [Crear un issue](https://github.com/impulso/issues)