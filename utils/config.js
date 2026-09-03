const config = {
  network: process.env.NEXT_PUBLIC_NETWORK || 'sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia.publicnode.com',
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xaE036c65C649172b43ef7156b009c6221B596B8b',
  defaultGridSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_GRID_SIZE || '4'),
  defaultPlayers: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PLAYERS || '2'),
  dailyBonus: parseInt(process.env.NEXT_PUBLIC_DAILY_BONUS || '3'),
  initialBalance: parseInt(process.env.NEXT_PUBLIC_INITIAL_BALANCE || '10'),
};

export default config;
