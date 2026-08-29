const config = {
  network: process.env.NEXT_PUBLIC_NETWORK || 'sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org',
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xddaAd340b0f1Ef65169Ae5E41A8b10776a75482d',
  defaultGridSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_GRID_SIZE || '4'),
  defaultPlayers: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PLAYERS || '2'),
  dailyBonus: parseInt(process.env.NEXT_PUBLIC_DAILY_BONUS || '3'),
  initialBalance: parseInt(process.env.NEXT_PUBLIC_INITIAL_BALANCE || '10'),
};

export default config;
