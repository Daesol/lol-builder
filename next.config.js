/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    RIOT_API_KEY: process.env.RIOT_API_KEY,
  },
}

module.exports = nextConfig 