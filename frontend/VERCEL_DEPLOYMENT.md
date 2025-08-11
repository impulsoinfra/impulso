# Guía de Deployment en Vercel

## Problema Resuelto: Error de Prerendering

El error `supabaseUrl is required` durante el prerendering en Vercel ha sido resuelto mediante las siguientes modificaciones:

### 1. Modificaciones en `lib/supabase.ts`
- El cliente de Supabase ahora solo se crea cuando las variables de entorno están disponibles
- Se agregó una función helper `getSupabaseClient()` para manejar casos donde el cliente no esté disponible
- Todas las funciones ahora verifican la disponibilidad del cliente antes de usarlo

### 2. Modificaciones en `hooks/use-auth.ts`
- El hook ahora verifica si está ejecutándose en el cliente antes de inicializar Supabase
- Se agregó un estado `isClient` para evitar ejecución durante SSR
- El contexto solo se actualiza cuando estemos en el cliente

### 3. Modificaciones en `components/layout/header.tsx`
- El header ahora es seguro para SSR
- Solo usa el hook de autenticación cuando esté en el cliente
- Proporciona fallbacks para el estado de autenticación durante el prerendering

### 4. Configuración de Next.js
- Se agregaron configuraciones experimentales para evitar problemas de prerendering
- Se configuró `output: 'standalone'` para mejor compatibilidad con Vercel

## Configuración de Variables de Entorno en Vercel

### Paso 1: Configurar Variables en Vercel
1. Ve a tu proyecto en Vercel
2. Ve a **Settings** > **Environment Variables**
3. Agrega las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Paso 2: Obtener Valores de Supabase
1. Ve a tu proyecto de Supabase
2. Ve a **Settings** > **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Paso 3: Redeploy
1. Después de configurar las variables, haz un nuevo deploy
2. Las variables estarán disponibles en el runtime

## Verificación

Para verificar que todo funciona:

1. **Build local**: `npm run build`
2. **Test local**: `npm start`
3. **Deploy en Vercel**: Las variables de entorno deben estar configuradas
4. **Verificar logs**: No debe haber errores de `supabaseUrl is required`

## Notas Importantes

- Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el cliente
- El prerendering ahora es seguro y no fallará por falta de variables de entorno
- La autenticación solo se inicializa en el cliente, no durante SSR
- Todos los componentes son compatibles con SSR y prerendering

## Troubleshooting

Si sigues teniendo problemas:

1. **Verifica variables de entorno**: Asegúrate de que estén configuradas en Vercel
2. **Revisa logs de build**: Busca errores relacionados con Supabase
3. **Verifica prefijos**: Las variables deben tener `NEXT_PUBLIC_`
4. **Redeploy**: Después de cambiar variables, haz un nuevo deploy
