const config = {
  network: process.env.NEXT_PUBLIC_NETWORK || 'sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xe2899bddFD890e320e643044c6b95B9B0b84157A',
  gridMin: 3,
  gridMax: 8,
  playersMin: 2,
  playersMax: 4,
};

export default config;
