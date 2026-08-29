const { ethers } = require('ethers');

const ABI = [
  "function owner() view returns (address)",
  "function ROYALTY_PERCENT() view returns (uint256)",
  "function RENTAL_FEE_PERCENT() view returns (uint256)",
  "function prizePool() view returns (address)"
];

const CONTRACT_ADDRESS = '0x1c91347f2A44538ce62453BEBd9Aa907C662b4bD';
const RPC = 'https://ethereum-sepolia.publicnode.com';

async function finalTest() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  
  console.log('🧪 تست اتصال قرارداد...');
  
  try {
    const owner = await contract.owner();
    console.log(`✅ owner(): ${owner}`);
  } catch (e) {
    console.log(`❌ owner(): ${e.message}`);
  }
  
  try {
    const royalty = await contract.ROYALTY_PERCENT();
    console.log(`✅ ROYALTY_PERCENT(): ${royalty}`);
  } catch (e) {
    console.log(`❌ ROYALTY_PERCENT(): ${e.message}`);
  }
  
  try {
    const rental = await contract.RENTAL_FEE_PERCENT();
    console.log(`✅ RENTAL_FEE_PERCENT(): ${rental}`);
  } catch (e) {
    console.log(`❌ RENTAL_FEE_PERCENT(): ${e.message}`);
  }
  
  try {
    const pool = await contract.prizePool();
    console.log(`✅ prizePool(): ${pool}`);
  } catch (e) {
    console.log(`❌ prizePool(): ${e.message}`);
  }
}

finalTest();
