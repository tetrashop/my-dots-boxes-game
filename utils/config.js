const config = {
  network: process.env.NEXT_PUBLIC_NETWORK || 'sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia.publicnode.com',
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xf8e81D47203A594245E36C48e151709F0C19fBe8',
  // ... بقیه متغیرها به همان صورت
};

export default config;
