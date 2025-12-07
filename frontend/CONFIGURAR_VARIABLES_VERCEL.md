# Configurar Variables de Entorno en Vercel (Producción)

## ⚠️ Problema Actual

Si estás viendo el error:
```
Missing Supabase environment variables: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
```

Esto significa que las variables de entorno no están configuradas en tu proyecto de Vercel.

## ✅ Solución: Configurar Variables en Vercel

### Paso 1: Obtener los Valores de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) > **API**
4. Copia los siguientes valores:
   - **Project URL** → Este será el valor de `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Este será el valor de `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Paso 2: Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Haz clic en tu proyecto
3. Ve a **Settings** (⚙️) en el menú superior
4. Haz clic en **Environment Variables** en el menú lateral
5. Agrega las siguientes variables:

#### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://gfaaktmeqpdksqdnzral.supabase.co` (o tu URL de Supabase)
- **Environment**: Selecciona **Production** (y también **Preview** y **Development** si quieres)

#### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (tu clave anon de Supabase)
- **Environment**: Selecciona **Production** (y también **Preview** y **Development** si quieres)

### Paso 3: Redeploy

**IMPORTANTE**: Después de agregar las variables de entorno:

1. Ve a la pestaña **Deployments** en Vercel
2. Haz clic en los tres puntos (⋯) del deployment más reciente
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo push a tu repositorio

## 🔍 Verificar que Funciona

Después del redeploy:

1. Abre tu aplicación en producción
2. Abre la consola del navegador (F12)
3. No deberías ver el error de variables faltantes
4. Intenta registrar un usuario - debería funcionar correctamente

## 📝 Notas Importantes

- Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el cliente (navegador)
- Asegúrate de seleccionar el entorno correcto (Production, Preview, Development)
- Después de agregar variables, **siempre** haz un redeploy
- Los archivos `.env.local` solo funcionan en desarrollo local, no en producción

## 🆘 Si Sigue Sin Funcionar

1. Verifica que las variables estén escritas exactamente como se muestra (case-sensitive)
2. Asegúrate de haber seleccionado el entorno correcto (Production)
3. Verifica que hayas hecho un redeploy después de agregar las variables
4. Revisa los logs de build en Vercel para ver si hay otros errores
5. Verifica que los valores copiados de Supabase sean correctos

## 🔗 Enlaces Útiles

- [Documentación de Vercel sobre Variables de Entorno](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentación de Supabase](https://supabase.com/docs)

