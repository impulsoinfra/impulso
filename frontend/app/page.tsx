import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ROUTES } from '@/lib/constants'
import { Camera, Feather, Target } from 'lucide-react'

const LINEUP = [
  { label: 'DJS', color: 'text-tinta' },
  { label: 'ARTISTAS', color: 'text-rosa' },
  { label: 'MÚSICOS', color: 'text-tinta' },
  { label: 'FOTÓGRAFOS', color: 'text-naranja' },
  { label: 'ESCRITORES', color: 'text-tinta' },
  { label: 'PODCASTERS', color: 'text-rosa' },
  { label: 'STREAMERS', color: 'text-tinta' },
  { label: 'EMPRENDEDORES', color: 'text-naranja' },
]

const STEPS = [
  { n: 1, title: 'Creá tu perfil', text: 'Elegí tu username, contá quién sos y subí tu foto.' },
  { n: 2, title: 'Compartí tu trabajo', text: 'Publicá fotos, audio o texto. Tu comunidad lo ve todo en un solo lugar.' },
  { n: 3, title: 'Recibí apoyo en pesos', text: 'Tus fans te apoyan vía MercadoPago, directo a tu cuenta.' },
]

const FEATURED = [
  { name: 'Vale Ilustra', meta: 'Arte · Córdoba', pct: 71, current: 85000, target: 120000, accent: '#F0355C', btnBorder: '#F0355C', btnText: '#F0355C' },
  { name: 'Mati Foto', meta: 'Fotografía · Rosario', pct: 80, current: 48000, target: 60000, accent: '#FF9D3D', btnBorder: '#FF9D3D', btnText: '#994f0a' },
  { name: 'DJ Pablo', meta: 'Música · Buenos Aires', pct: 70, current: 140000, target: 200000, accent: '#1B1A2E', btnBorder: '#1B1A2E', btnText: '#1B1A2E' },
]

// Hero waveform bars (height %, naranja accent on the tall ones)
const WAVE = [
  { h: 40, n: false }, { h: 80, n: false }, { h: 55, n: false },
  { h: 100, n: true }, { h: 65, n: false }, { h: 45, n: false }, { h: 75, n: true },
]

export default function ImpulsoLanding() {
  return (
    <div className="min-h-screen bg-crema">
      <Header />

      {/* Hero */}
      <section className="bg-tinta">
        <div className="wrap pt-12 pb-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-naranja text-xs font-bold uppercase tracking-[0.12em] mb-4">
                Plataforma argentina de creadores
              </p>
              <h1 className="disp text-crema text-[38px] md:text-[52px] leading-[1.06] mb-4">
                HACÉ LO QUE <span className="text-rosa">AMÁS.</span><br />
                RECIBÍ EL <span className="text-naranja">APOYO</span><br />
                QUE MERECÉS.
              </h1>
              <p className="text-[rgba(251,247,242,0.65)] text-[15px] leading-relaxed max-w-md mb-6">
                Compartí tu trabajo, creá una meta y recibí donaciones de tu comunidad en pesos, directo a tu cuenta.
              </p>
              <div className="flex flex-wrap gap-2.5 mb-3">
                <Link
                  href={ROUTES.REGISTER}
                  className="bg-rosa hover:bg-rosa-hover text-white rounded-lg px-5 py-3 text-sm font-semibold transition-colors"
                >
                  Crear mi perfil gratis
                </Link>
                <Link
                  href={ROUTES.DISCOVER}
                  className="border border-[rgba(251,247,242,0.35)] text-crema hover:bg-[rgba(251,247,242,0.08)] rounded-lg px-5 py-3 text-sm font-semibold transition-colors"
                >
                  Explorar creadores
                </Link>
              </div>
              <p className="text-[rgba(251,247,242,0.4)] text-xs">
                Sin costo fijo · solo pagás cuando recibís apoyo
              </p>
            </div>

            {/* Tilted card collage — three creator cards */}
            <div className="relative h-[330px] w-full max-w-[460px] mx-auto mt-6 md:mt-0">
              {/* Mati Foto — top right */}
              <div className="absolute -top-[25px] -right-[25px] w-[150px] bg-white border-2 border-tinta rounded-[10px] rotate-[9deg] overflow-hidden z-[1]">
                <div className="h-[5px] bg-naranja" />
                <div className="p-[11px]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-full bg-naranja shrink-0" />
                    <div>
                      <p className="text-[10.5px] font-semibold text-tinta leading-none">Mati Foto</p>
                      <p className="text-[8.5px] text-txt2 leading-none mt-0.5">Fotografía</p>
                    </div>
                  </div>
                  <p className="text-[9.5px] text-tinta mb-1.5 flex items-center gap-1">
                    <Camera className="w-2.5 h-2.5 text-naranja-ink shrink-0" /> Nuevo lente
                  </p>
                  <div className="h-1 bg-track rounded-full overflow-hidden">
                    <div className="h-full bg-naranja" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>

              {/* DJ Pablo — main card */}
              <div className="absolute top-11 left-[70px] right-[70px] bg-white border-2 border-tinta rounded-xl rotate-[-3deg] overflow-hidden z-[3] box-border">
                <div className="h-1.5 bg-naranja" />
                <div className="p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-tinta shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-tinta leading-tight">DJ Pablo</p>
                      <p className="text-[11px] text-txt2 leading-tight">Música · Buenos Aires</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-[3px] h-[26px] mb-3">
                    {WAVE.map((b, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-[2px]"
                        style={{ height: `${b.h}%`, background: b.n ? '#FF9D3D' : '#F0355C' }}
                      />
                    ))}
                  </div>
                  <p className="text-[12px] font-semibold text-tinta mb-1.5 flex items-center gap-1">
                    <Target className="w-3 h-3 text-naranja shrink-0" /> Quiero un Pioneer CDJ
                  </p>
                  <div className="h-[7px] bg-track rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-rosa" style={{ width: '70%' }} />
                  </div>
                  <p className="text-[10.5px] text-txt2">$140.000 / $200.000 · 87 apoyos</p>
                </div>
              </div>

              {/* Nacho Ilustra — bottom left */}
              <div className="absolute top-[212px] -left-1 w-[150px] bg-white border-2 border-tinta rounded-[10px] rotate-[-9deg] overflow-hidden z-[1]">
                <div className="h-[5px] bg-rosa" />
                <div className="p-[11px]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-full bg-rosa shrink-0" />
                    <div>
                      <p className="text-[10.5px] font-semibold text-tinta leading-none">Nacho Ilustra</p>
                      <p className="text-[8.5px] text-txt2 leading-none mt-0.5">Arte · Córdoba</p>
                    </div>
                  </div>
                  <p className="text-[9.5px] text-tinta mb-1.5 flex items-center gap-1">
                    <Feather className="w-2.5 h-2.5 text-rosa shrink-0" /> Mi primer libro
                  </p>
                  <div className="h-1 bg-track rounded-full overflow-hidden">
                    <div className="h-full bg-rosa" style={{ width: '71%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lineup marquee */}
      <div className="bg-crema border-y border-tinta overflow-hidden py-4">
        {/* 4 copies so the track is always wider than 2x the viewport — the
            -50% loop stays seamless (no blank gaps) on any screen. */}
        <div className="impulso-marquee">
          {[0, 1, 2, 3].map((dup) => (
            <div key={dup} className="inline-flex" aria-hidden={dup > 0}>
              {LINEUP.map((c, i) => (
                <span key={`${dup}-${i}`} className={`disp text-[22px] pr-3.5 ${c.color}`}>
                  {c.label} ·
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Cómo funciona */}
      <section id="como-funciona" className="bg-crema py-12">
        <div className="wrap">
          <p className="text-rosa text-xs font-bold uppercase tracking-[0.1em] mb-1.5">El proceso</p>
          <h2 className="disp text-tinta text-[26px] mb-7">Cómo funciona</h2>
          <div className="relative pl-11 max-w-xl">
            <div className="absolute left-[15px] top-1.5 bottom-1.5 w-0.5 bg-[rgba(27,26,46,0.15)]" />
            {STEPS.map((s, i) => (
              <div key={s.n} className={`relative ${i < STEPS.length - 1 ? 'mb-7' : ''}`}>
                <div className="disp absolute -left-11 top-0 w-8 h-8 rounded-full bg-rosa text-white flex items-center justify-center text-[15px]">
                  {s.n}
                </div>
                <p className="font-semibold text-sm text-tinta mb-1">{s.title}</p>
                <p className="text-[13px] text-txt2 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creadores destacados */}
      <section id="creadores" className="bg-crema pb-12">
        <div className="wrap">
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="disp text-tinta text-[24px]">Creadores destacados</h2>
            <Link href={ROUTES.DISCOVER} className="text-xs font-semibold text-rosa hover:text-rosa-hover">
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            {FEATURED.map((c) => (
              <div key={c.name} className="bg-white border border-borde rounded-[10px] overflow-hidden">
                <div className="h-1" style={{ background: c.accent }} />
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-tinta mb-0.5">{c.name}</p>
                  <p className="text-[11px] text-txt2 mb-2.5">{c.meta}</p>
                  <div className="h-1.5 bg-track rounded-full overflow-hidden mb-1.5">
                    <div className="h-full" style={{ width: `${c.pct}%`, background: c.accent }} />
                  </div>
                  <p className="text-[10px] text-txt2 mb-2.5">
                    ${c.current.toLocaleString('es-AR')} / ${c.target.toLocaleString('es-AR')}
                  </p>
                  <Link
                    href={ROUTES.DISCOVER}
                    className="block text-center w-full rounded-md py-1.5 text-xs font-semibold border transition-colors hover:bg-black/[0.03]"
                    style={{ borderColor: c.btnBorder, color: c.btnText }}
                  >
                    Apoyar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-tinta py-12">
        <div className="wrap text-center">
          <h2 className="disp text-crema text-[26px] md:text-[30px] leading-tight mb-2.5">
            ¿LISTO PARA RECIBIR<br />EL APOYO QUE MERECÉS?
          </h2>
          <p className="text-[rgba(251,247,242,0.6)] text-sm mb-5 max-w-md mx-auto">
            Uníte a los creadores argentinos que ya están usando Impulso.
          </p>
          <Link
            href={ROUTES.REGISTER}
            className="inline-block bg-rosa hover:bg-rosa-hover text-white rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
          >
            Crear mi perfil gratis
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
