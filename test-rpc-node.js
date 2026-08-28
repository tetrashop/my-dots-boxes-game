const { ethers } = require('ethers');

const RPCS = [
  'https://ethereum-sepolia.publicnode.com',
  'https://sepolia.gateway.tenderly.co',
  'https://rpc.ankr.com/eth_sepolia',
  'https://rpc.sepolia.org'
];

async function testRPCs() {
  for (const rpc of RPCS) {
    try {
      console.log(`🔍 Testing ${rpc} ...`);
      const provider = new ethers.JsonRpcProvider(rpc);
      const chainId = await provider.getNetwork();
      console.log(`✅ Working! Chain ID: ${chainId.chainId}`);
      return rpc;
    } catch (e) {
      console.log(`❌ Failed: ${e.message}`);
    }
  }
  console.log('❌ No working RPC found.');
}

testRPCs();
