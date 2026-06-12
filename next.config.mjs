/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Required for Railway deployment
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/adapter-pg'],
  },
}

export default nextConfig
