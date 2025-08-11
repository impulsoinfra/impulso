# Configuración de Supabase para Impulso

Este documento te guía a través de la configuración de Supabase para la funcionalidad de autenticación de usuarios.

## 1. Configuración del Proyecto Supabase

### 1.1 Crear un nuevo proyecto
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y la anon key

### 1.2 Configurar variables de entorno
Las variables ya están configuradas en:
- `frontend/.env.local`
- `frontend/.env.production`

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 2. Configuración de la Base de Datos

### 2.1 Ejecutar el script SQL
1. Ve al SQL Editor en tu dashboard de Supabase
2. Copia y pega el contenido de `supabase-setup.sql`
3. Ejecuta el script

### 2.2 Verificar la configuración
Después de ejecutar el script, deberías ver:
- Una tabla `profiles` en el esquema `public`
- RLS habilitado en la tabla
- Políticas de seguridad configuradas
- Triggers para manejo automático de usuarios

## 3. Configuración de Autenticación

### 3.1 Configurar proveedores de email
1. Ve a Authentication > Settings en tu dashboard de Supabase
2. En "Email Auth", asegúrate de que esté habilitado
3. Configura el template de email de confirmación si es necesario

### 3.2 Configurar redirecciones
En Authentication > Settings > URL Configuration:
- Site URL: `http://localhost:3000` (desarrollo)
- Redirect URLs: 
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/dashboard`

## 4. Funcionalidades Implementadas

### 4.1 Registro de usuarios
- ✅ Formulario de registro con validación
- ✅ Creación de cuenta en Supabase Auth
- ✅ Creación automática de perfil en la tabla `profiles`
- ✅ Confirmación de email requerida

### 4.2 Inicio de sesión
- ✅ Formulario de login con validación
- ✅ Autenticación con Supabase
- ✅ Redirección al dashboard después del login exitoso

### 4.3 Gestión de sesión
- ✅ Contexto de autenticación global
- ✅ Protección de rutas
- ✅ Cierre de sesión
- ✅ Estado de carga y manejo de errores

### 4.4 Componentes
- ✅ `AuthProvider`: Contexto de autenticación
- ✅ `ProtectedRoute`: Protección de rutas
- ✅ Header actualizado con estado de autenticación
- ✅ Formularios de login y registro integrados

## 5. Uso en la Aplicación

### 5.1 Proteger rutas
```tsx
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Contenido protegido del dashboard</div>
    </ProtectedRoute>
  )
}
```

### 5.2 Usar el hook de autenticación
```tsx
import { useAuth } from '@/hooks/use-auth'

export default function MyComponent() {
  const { user, profile, signOut } = useAuth()
  
  if (!user) return <div>No autenticado</div>
  
  return (
    <div>
      <p>Hola, {profile?.name}</p>
      <button onClick={signOut}>Cerrar sesión</button>
    </div>
  )
}
```

## 6. Estructura de la Base de Datos

### 6.1 Tabla `profiles`
```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('artist', 'supporter')),
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### 6.2 Políticas de Seguridad
- **SELECT**: Todos los usuarios pueden ver todos los perfiles
- **INSERT**: Los usuarios solo pueden crear su propio perfil
- **UPDATE**: Los usuarios solo pueden actualizar su propio perfil
- **DELETE**: No permitido (cascade desde auth.users)

## 7. Próximos Pasos

### 7.1 Funcionalidades adicionales
- [ ] Recuperación de contraseña
- [ ] Autenticación con Google/GitHub
- [ ] Perfil de usuario editable
- [ ] Subida de avatares

### 7.2 Mejoras de seguridad
- [ ] Validación adicional en el frontend
- [ ] Rate limiting para intentos de login
- [ ] Logs de auditoría
- [ ] Verificación de email más robusta

## 8. Solución de Problemas

### 8.1 Error de conexión
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto esté activo en Supabase

### 8.2 Error de políticas RLS
- Verifica que RLS esté habilitado en la tabla
- Ejecuta nuevamente el script SQL si es necesario

### 8.3 Usuario no se crea en profiles
- Verifica que el trigger esté configurado correctamente
- Revisa los logs de Supabase para errores

## 9. Recursos Adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guía de autenticación](https://supabase.com/docs/guides/auth)
- [RLS y políticas de seguridad](https://supabase.com/docs/guides/auth/row-level-security)
- [Triggers y funciones](https://supabase.com/docs/guides/database/functions)
