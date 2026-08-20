-- Configuración de Supabase para la aplicación Impulso

-- 1. Crear la tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('creator', 'supporter')),
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    social_links JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de seguridad
-- Los usuarios pueden leer todos los perfiles
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

-- Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Los usuarios solo pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Crear función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'supporter')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Configurar storage para avatares (opcional)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 9. Política para storage de avatares (opcional)
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
--     FOR SELECT USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload avatars" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update own avatar" ON storage.objects
--     FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own avatar" ON storage.objects
--     FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Notas importantes:
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Asegúrate de que RLS esté habilitado en tu proyecto
-- 3. Las políticas de seguridad pueden necesitar ajustes según tus necesidades específicas
-- 4. El storage de avatares es opcional y puede configurarse más tarde

-- ============================================================
-- 10. Banner de portada del perfil (agregado en rediseño de perfil)
-- ============================================================

-- Columna para la URL del banner de portada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Bucket público para banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas del bucket 'banners': lectura pública, escritura solo del dueño.
-- Convención de path: {userId}/banner-*.ext  ->  foldername[1] = auth.uid()
DROP POLICY IF EXISTS "Public read banners" ON storage.objects;
CREATE POLICY "Public read banners" ON storage.objects
    FOR SELECT USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Owner insert banners" ON storage.objects;
CREATE POLICY "Owner insert banners" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner update banners" ON storage.objects;
CREATE POLICY "Owner update banners" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner delete banners" ON storage.objects;
CREATE POLICY "Owner delete banners" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 11. Ubicación + avatar (agregado en refactor del dashboard)
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Bucket público para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Owner insert avatars" ON storage.objects;
CREATE POLICY "Owner insert avatars" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner update avatars" ON storage.objects;
CREATE POLICY "Owner update avatars" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner delete avatars" ON storage.objects;
CREATE POLICY "Owner delete avatars" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 11b. Imágenes de publicaciones (posts con foto)
-- ============================================================

-- Varias imágenes por publicación (carrusel). `media_url` sigue guardando la
-- primera imagen (compat / miniaturas); `media_urls` guarda todas.
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_urls text[];

-- Artículos largos (tipo Medium/Patreon): cuerpo enriquecido guardado como JSON
-- de TipTap en `body`. `content` guarda un extracto en texto plano (preview del
-- feed + imagen social) y `media_url` la portada. Se agrega 'article' a los tipos.
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS body jsonb;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
  CHECK (post_type = ANY (ARRAY['text','image','audio','video','link','article']));

-- Bucket público para imágenes de publicaciones
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read posts" ON storage.objects;
CREATE POLICY "Public read posts" ON storage.objects
    FOR SELECT USING (bucket_id = 'posts');

DROP POLICY IF EXISTS "Owner insert posts" ON storage.objects;
CREATE POLICY "Owner insert posts" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner update posts" ON storage.objects;
CREATE POLICY "Owner update posts" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner delete posts" ON storage.objects;
CREATE POLICY "Owner delete posts" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 12. MercadoPago Split de Pagos 1:1 (integración de cobros)
-- ============================================================

-- Credenciales OAuth por creador. SECRETAS: RLS habilitado sin políticas,
-- solo la service_role key (backend) puede leer/escribir estos tokens.
CREATE TABLE IF NOT EXISTS public.mp_accounts (
  creator_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  mp_user_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  public_key text,
  expires_at timestamptz,
  connected_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.mp_accounts ENABLE ROW LEVEL SECURITY;

-- Flag público (no secreto) para que la UI sepa que el creador puede cobrar
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mp_connected boolean NOT NULL DEFAULT false;

-- Donaciones
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  supporter_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  marketplace_fee numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ARS',
  message text,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected | refunded
  mp_preference_id text,
  mp_payment_id text,
  payer_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Creator reads own donations" ON public.donations;
CREATE POLICY "Creator reads own donations" ON public.donations FOR SELECT USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Supporter reads own donations" ON public.donations;
CREATE POLICY "Supporter reads own donations" ON public.donations FOR SELECT USING (auth.uid() = supporter_id);
-- Sin políticas de insert/update/delete: las donaciones las escribe solo el backend (service_role).

CREATE INDEX IF NOT EXISTS donations_creator_idx ON public.donations(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS donations_pref_idx ON public.donations(mp_preference_id);

-- Suma atómica a la meta (llamada desde el webhook al aprobarse un pago)
CREATE OR REPLACE FUNCTION public.increment_goal(p_goal_id uuid, p_amount numeric)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.goals SET current_amount = current_amount + p_amount WHERE id = p_goal_id;
$$;

-- ============================================================
-- 13. Likes y comentarios en publicaciones
-- ============================================================

-- Likes: una fila por (publicación, usuario). Lectura pública (conteos + quién
-- likeó); cada usuario likea/deslikea como sí mismo.
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read post_likes" ON public.post_likes;
CREATE POLICY "Public read post_likes" ON public.post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "User inserts own like" ON public.post_likes;
CREATE POLICY "User inserts own like" ON public.post_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User deletes own like" ON public.post_likes;
CREATE POLICY "User deletes own like" ON public.post_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS post_likes_post_idx ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_idx ON public.post_likes(user_id);

-- Comentarios planos (sin hilos). Lectura pública; el autor puede borrar el
-- suyo y el dueño de la publicación puede moderar (borrar cualquiera en su post).
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read post_comments" ON public.post_comments;
CREATE POLICY "Public read post_comments" ON public.post_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "User inserts own comment" ON public.post_comments;
CREATE POLICY "User inserts own comment" ON public.post_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User deletes own comment or post owner moderates" ON public.post_comments;
CREATE POLICY "User deletes own comment or post owner moderates" ON public.post_comments
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id
    OR auth.uid() = (SELECT creator_id FROM public.posts WHERE id = post_id)
  );

CREATE INDEX IF NOT EXISTS post_comments_post_idx ON public.post_comments(post_id, created_at DESC);

-- ============================================================
-- 14. Configuración de la plataforma (comisión editable sin deploy)
-- ============================================================

-- Fila única con la comisión que cobra Impulso por cada apoyo. El preference
-- route la lee en runtime (con `getPlatformFeeRate`), así cambiarla es un UPDATE
-- desde el SQL editor — sin redeploy. Secreta como mp_accounts: RLS sin políticas,
-- solo la service_role la lee/escribe.
--   Para cambiar la comisión (ej. a 8%): update public.platform_config set fee_rate = 0.08, updated_at = now();
CREATE TABLE IF NOT EXISTS public.platform_config (
  id boolean PRIMARY KEY DEFAULT true,
  fee_rate numeric(4,3) NOT NULL DEFAULT 0.10 CHECK (fee_rate >= 0 AND fee_rate <= 1),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platform_config_singleton CHECK (id = true)
);
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.platform_config (id, fee_rate) VALUES (true, 0.10)
  ON CONFLICT (id) DO NOTHING;
