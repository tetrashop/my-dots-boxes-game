/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_DEFAULT_GRID_SIZE: process.env.NEXT_PUBLIC_DEFAULT_GRID_SIZE,
    NEXT_PUBLIC_DEFAULT_PLAYERS: process.env.NEXT_PUBLIC_DEFAULT_PLAYERS,
    NEXT_PUBLIC_DAILY_BONUS: process.env.NEXT_PUBLIC_DAILY_BONUS,
    NEXT_PUBLIC_INITIAL_BALANCE: process.env.NEXT_PUBLIC_INITIAL_BALANCE,
  },
}

module.exports = nextConfig
