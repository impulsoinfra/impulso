-- Script de limpieza para Supabase - ELIMINA TODO Y EMPIEZA DESDE CERO
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos y configuraciones
-- Ejecuta esto solo si estás seguro de que quieres empezar desde cero

-- 1. Eliminar triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- 1.1. Verificar y eliminar triggers en auth.users (esquema por defecto)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created' 
        AND event_object_schema = 'auth'
    ) THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    END IF;
END $$;

-- 2. Eliminar funciones personalizadas
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 2.1. Verificar y eliminar funciones en todos los esquemas
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user'
    ) THEN
        DROP FUNCTION IF EXISTS handle_new_user();
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'update_updated_at_column'
    ) THEN
        DROP FUNCTION IF EXISTS update_updated_at_column();
    END IF;
END $$;

-- 3. Eliminar políticas de seguridad (RLS)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 4. Deshabilitar RLS
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- 5. Eliminar la tabla profiles (esto eliminará TODOS los datos)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 6. Limpiar cualquier dato residual en auth.users (opcional, ten cuidado)
-- NOTA: Esto eliminará TODOS los usuarios registrados
-- DELETE FROM auth.users;

-- 7. Verificar que todo esté limpio
-- Deberías ver "0 rows" en todas estas consultas:
SELECT 'Triggers restantes:' as info;
SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';

SELECT 'Funciones restantes:' as info;
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

SELECT 'Tablas restantes:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles';

-- Mensaje de confirmación
SELECT 'Limpieza completada. Puedes ejecutar supabase-setup.sql ahora.' as mensaje;
