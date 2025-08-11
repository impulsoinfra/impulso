/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuraciones adicionales para evitar problemas de prerendering
  experimental: {
    // Evitar prerendering de páginas que pueden causar problemas
    missingSuspenseWithCSRError: false,
  },
  // Configuración para páginas estáticas
  trailingSlash: false,
  // Configuración para Vercel
  output: 'standalone',
}

export default nextConfig