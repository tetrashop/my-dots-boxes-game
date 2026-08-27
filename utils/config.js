const config = {
  network: process.env.NEXT_PUBLIC_NETWORK || 'sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org',
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x13d053b2a3ad829a9152c365105c17e3a3178999',
  infuraId: process.env.NEXT_PUBLIC_INFURA_ID || '',
  alchemyKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY || '',
  etherscanApiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
  defaultGridSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_GRID_SIZE || '4'),
  defaultPlayers: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PLAYERS || '2'),
  dailyBonus: parseInt(process.env.NEXT_PUBLIC_DAILY_BONUS || '3'),
  initialBalance: parseInt(process.env.NEXT_PUBLIC_INITIAL_BALANCE || '10'),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

export default config;
