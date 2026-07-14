// Satori (the engine behind next/og) can't use Google Fonts at runtime, so we
// bundle the brand TTFs and load them. `new URL('./x', import.meta.url)` is
// rewritten by Next into a served asset URL, so we fetch it (fs.readFile won't
// work — it's an HTTP asset, not a file path).
export type OgFont = {
  name: string
  data: ArrayBuffer
  weight: 400 | 600
  style: 'normal'
}

let cached: OgFont[] | null = null

export async function loadOgFonts(): Promise<OgFont[]> {
  if (cached) return cached

  const [anton, interRegular, interSemiBold] = await Promise.all([
    fetch(new URL('./Anton-Regular.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL('./Inter-Regular.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL('./Inter-SemiBold.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
  ])

  cached = [
    { name: 'Anton', data: anton, weight: 400, style: 'normal' },
    { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
    { name: 'Inter', data: interSemiBold, weight: 600, style: 'normal' },
  ]
  return cached
}
