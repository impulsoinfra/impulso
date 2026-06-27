# Impulso — Definición de Producto MVP

## Concepto

Plataforma argentina donde creadores (artistas, músicos, DJs, fotógrafos, escritores) y emprendedores publican su trabajo, construyen una audiencia y reciben apoyo económico a través de donaciones libres y metas de financiamiento colectivo.

**Tagline:** *"El impulso que necesitás"*

**URL del creador:** `impulso.ar/@username`

---

## Problema que resuelve

| Plataforma actual | Problema |
|---|---|
| YouTube / SoundCloud | Bajan sets de DJs por copyright. No monetizan contenido argentino |
| Cafecito | Solo el botón de donación — sin contenido, sin metas, sin comunidad |
| Patreon | En USD, sin MercadoPago, sin soporte local |
| Ko-fi | Sin localización argentina, sin pesos, sin MP |
| GoFundMe | Solo campañas de emergencia, no para proyectos creativos/emprendimientos |

**El gap:** No existe una plataforma en Argentina donde un creador o emprendedor pueda publicar su trabajo Y recibir apoyo económico en pesos via MercadoPago con metas de financiamiento integradas.

---

## Usuarios objetivo

### Creadores
- DJs / músicos — suben sets, tracks, fotos de fechas
- Fotógrafos / ilustradores / artistas visuales — suben su obra
- Escritores / podcasters — publican texto o audio
- Streamers / youtubers — complementan su monetización

### Emprendedores
- Proyectos en etapa inicial que necesitan financiamiento colectivo
- Emprendimientos creativos (imprimir un libro, grabar un disco, abrir un local)
- Cualquier persona con una meta concreta y una comunidad que los apoya

---

## Modelo de negocio

- **Comisión:** 10% sobre cada donación recibida
- MercadoPago maneja el cobro — el creador recibe el 90% neto
- Sin costo fijo para el creador
- Solo paga cuando recibe dinero

**Proyección conservadora:**
```
Mes 6:   50 creadores × 20 donaciones × $1.500 ARS promedio × 10% = $150.000 ARS/mes
Mes 12: 200 creadores × 25 donaciones × $2.000 ARS promedio × 10% = $1.000.000 ARS/mes
```

---

## MVP — Alcance

### ✅ Incluido en MVP

- Perfil público del creador (`impulso.ar/@username`)
- Publicar contenido: foto, audio, texto
- Donación libre con MercadoPago (monto a elección del donante)
- Meta de financiamiento con barra de progreso
- Registro y login
- Dashboard básico del creador
- Landing page
- Notificación por email al creador cuando recibe una donación

### ❌ Fuera del MVP (próximas versiones)

- Contenido exclusivo para supporters
- Membresías / suscripción mensual recurrente
- Múltiples metas simultáneas
- Comentarios en publicaciones
- Página de discovery / explorar creadores
- Video propio (MVP solo soporta embed de YouTube/Spotify)
- App mobile (iOS / Android)
- Notificaciones push
- Splits entre co-creadores
- Facturación electrónica automática

---

## Pantallas del MVP

### Públicas (sin login)
1. **Landing page** — qué es Impulso, cómo funciona, CTA para registrarse
2. **Perfil público** — `impulso.ar/@username` — contenido + meta + botón de apoyo
3. **Pantalla de donación** — selector de monto, mensaje opcional, checkout MP

### Del creador (con login)
4. **Registro / Login** — email + contraseña o magic link
5. **Onboarding / Setup de perfil** — nombre, bio, foto, categoría, username
6. **Dashboard** — resumen de donaciones, progreso de meta, últimas publicaciones
7. **Nueva publicación** — elegir tipo (foto/audio/texto), subir archivo, título, descripción
8. **Crear / editar meta** — título, descripción, monto objetivo

---

## Wireframes de pantallas clave

### Perfil público
```
┌─────────────────────────────────────┐
│  [foto]  DJ Pablo                   │
│          @djpablo · Música · BA     │
│          "Techno y electrónica"     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🎯 Quiero un Pioneer CDJ   │    │
│  │  ████████░░  $140k / $200k  │    │
│  │  87 personas apoyaron       │    │
│  └─────────────────────────────┘    │
│                                     │
│       [ ♥  Apoyar a Pablo ]         │
│                                     │
│  ── Publicaciones ──                │
│                                     │
│  🎵 Underground Session Vol.4       │
│  ▶ ──────────────────── 1:23:00    │
│                                     │
│  📷 Fotos de la fecha en Niceto     │
│  [img] [img] [img]                  │
│                                     │
│  📝 Cómo empecé en el DJing         │
│  "Todo empezó en 2018 cuando..."    │
└─────────────────────────────────────┘
```

### Pantalla de donación
```
┌─────────────────────────────────┐
│  Apoyar a DJ Pablo              │
│                                 │
│  ¿Cuánto querés aportar?        │
│                                 │
│  [ $500 ] [ $1.000 ] [ $2.000 ] │
│  [ Otro monto: _______  ]       │
│                                 │
│  Dejá un mensaje (opcional)     │
│  ┌─────────────────────────┐    │
│  │ "Seguí rompiendo Pablo!"│    │
│  └─────────────────────────┘    │
│                                 │
│  [ Continuar con MercadoPago ]  │
│                                 │
│  🔒 Pago seguro vía MP          │
└─────────────────────────────────┘
```

---

## Flujos principales

### Flujo 1 — Creador se registra
```
Landing
  → Click "Crear mi perfil"
  → Registro (email + pass)
  → Onboarding: nombre / bio / foto / categoría / username
  → Dashboard vacío con CTA: "Publicá tu primer contenido" y "Creá una meta"
```

### Flujo 2 — Fan dona
```
Fan recibe link impulso.ar/@djpablo (por Instagram, WhatsApp, etc.)
  → Ve perfil: contenido + meta
  → Click "Apoyar a Pablo"
  → Elige monto (sugerido o libre)
  → Deja mensaje opcional
  → MercadoPago Checkout
  → Confirmación en pantalla
  → Creador recibe email: "Recibiste una donación de $1.000 de @fan"
```

### Flujo 3 — Creador publica contenido
```
Dashboard
  → Click "Nueva publicación"
  → Elige tipo: Foto / Audio / Texto
  → Sube archivo (foto o audio) o escribe el texto
  → Agrega título y descripción
  → Click "Publicar"
  → Aparece en su perfil público
```

### Flujo 4 — Creador crea una meta
```
Dashboard
  → Click "Crear meta"
  → Título: "Quiero un Pioneer CDJ"
  → Descripción: por qué lo necesita
  → Monto objetivo: $200.000
  → Publicar
  → Barra de progreso visible en su perfil
  → Se actualiza automáticamente con cada donación
```

---

## Stack tecnológico

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack, SSR, fácil deploy en Vercel |
| Auth | Supabase Auth | Magic link + email/pass, integrado con DB |
| Base de datos | Supabase (PostgreSQL) | Gratis para empezar, escala bien |
| Storage | Cloudflare R2 | Barato para archivos grandes (sets de audio 100-300MB) |
| Audio player | Wavesurfer.js | Open source, visualización de onda, excelente UX |
| Pagos | MercadoPago Checkout Pro + Webhooks | Pesos, todas las tarjetas AR |
| Email | Resend | Moderna, buena deliverability, SDK simple |
| Deploy | Vercel | CI/CD automático, integración nativa con Next.js |
| Estilos | Tailwind CSS | Rápido para prototipar |

**Costo de infraestructura mes 1: $0**
Todos los servicios tienen free tier suficiente para el MVP.

---

## Schema de base de datos (Supabase)

### `users` (manejado por Supabase Auth)
```sql
id            uuid PRIMARY KEY
email         text UNIQUE
created_at    timestamp
```

### `profiles`
```sql
id            uuid PRIMARY KEY REFERENCES users(id)
username      text UNIQUE NOT NULL
display_name  text NOT NULL
bio           text
avatar_url    text
category      text  -- 'musica' | 'arte' | 'fotografia' | 'emprendimiento' | 'otro'
location      text
created_at    timestamp DEFAULT now()
```

### `posts`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
profile_id    uuid REFERENCES profiles(id)
type          text NOT NULL  -- 'text' | 'image' | 'audio' | 'embed'
title         text
body          text
file_url      text   -- para image y audio
embed_url     text   -- para YouTube / Spotify
created_at    timestamp DEFAULT now()
```

### `goals`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
profile_id    uuid REFERENCES profiles(id)
title         text NOT NULL
description   text
target_amount integer NOT NULL  -- en centavos (ARS)
current_amount integer DEFAULT 0
is_active     boolean DEFAULT true
created_at    timestamp DEFAULT now()
```

### `donations`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
profile_id      uuid REFERENCES profiles(id)
goal_id         uuid REFERENCES goals(id) NULL
amount          integer NOT NULL  -- en centavos (ARS)
message         text
donor_name      text
mp_payment_id   text UNIQUE      -- ID de MercadoPago para reconciliación
status          text DEFAULT 'pending'  -- 'pending' | 'approved' | 'rejected'
created_at      timestamp DEFAULT now()
```

---

## Flujo de pago con MercadoPago

```
1. Fan click "Apoyar" → POST /api/donations/create
2. Backend crea preferencia en MP:
   {
     items: [{ title: "Apoyo a DJ Pablo", unit_price: 1000 }],
     back_urls: { success, failure, pending },
     notification_url: "impulso.ar/api/webhooks/mp"
   }
3. Fan redirige a MP Checkout → paga
4. MP llama al webhook → POST /api/webhooks/mp
5. Backend verifica el pago con MP API
6. Si approved:
   → UPDATE donations SET status = 'approved'
   → UPDATE goals SET current_amount = current_amount + amount
   → Enviar email al creador via Resend
7. Fan ve pantalla de confirmación
```

---

## Roadmap de construcción

| Semana | Qué construís | Entregable |
|---|---|---|
| **1** | Setup proyecto + Auth + onboarding + perfil público | `impulso.ar/@username` funciona |
| **2** | Donación con MP + webhook + email de confirmación | Se puede donar y el creador lo recibe |
| **3** | Upload de fotos + audio + texto en el perfil | El perfil tiene contenido real |
| **4** | Meta de financiamiento + barra de progreso | El diferenciador vs Cafecito está listo |
| **5** | Landing page + pulido UI + deploy a producción | Listo para compartir con primeros usuarios |

---

## Go-to-market (primeros 30 días)

1. **Beta cerrada** — onboardear manualmente 5-10 DJs/artistas conocidos
2. **0% de comisión** los primeros 3 meses para usuarios fundadores
3. Ellos comparten `impulso.ar/@suusername` en sus redes → tráfico orgánico
4. Iterar en base al feedback de los primeros creadores
5. **Fase 2:** abrir registro público + artículo en medios de tecnología/emprendimiento

---

## Competencia directa

| Plataforma | Fortaleza | Debilidad vs Impulso |
|---|---|---|
| Cafecito | Muy conocido en AR | Sin contenido, sin metas, sin comunidad |
| Ko-fi | Modelo completo | Sin MP, sin pesos, sin soporte local |
| Patreon | Marca global | USD, sin MP, caro para creadores AR |
| GoFundMe | Confianza en crowdfunding | Sin perfil de creador, sin contenido, USD |

---

## Decisiones pendientes

- [ ] Verificar disponibilidad de `impulso.ar` e `impulso.com.ar` en **nic.ar**
- [ ] Definir si el username es editable después del registro
- [ ] Definir límite de tamaño de archivo para audio (sugerido: 500MB)
- [ ] Definir si las donaciones a una meta también suman al total general del creador
- [ ] Definir política de retiro de fondos (¿cuándo y cómo cobra el creador?)

---

*Documento generado: Junio 2026*
