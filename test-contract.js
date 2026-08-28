const { ethers } = require('ethers');

const RPC = 'https://ethereum-sepolia.publicnode.com';
const CONTRACT_ADDRESS = '0xf8e81D47203A594245E36C48e151709F0C19fBe8';

// ABI مختصر برای تست
const ABI = [
  "function owner() view returns (address)",
  "function ROYALTY_PERCENT() view returns (uint256)",
  "function RENTAL_FEE_PERCENT() view returns (uint256)",
  "function prizePool() view returns (address)",
];

async function testContract() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  
  console.log('🔍 تست قرارداد...');
  
  try {
    const owner = await contract.owner();
    console.log(`✅ owner(): ${owner}`);
  } catch (e) {
    console.log(`❌ owner() خطا: ${e.message}`);
  }
  
  try {
    const royalty = await contract.ROYALTY_PERCENT();
    console.log(`✅ ROYALTY_PERCENT(): ${royalty}`);
  } catch (e) {
    console.log(`❌ ROYALTY_PERCENT() خطا: ${e.message}`);
  }
  
  try {
    const rental = await contract.RENTAL_FEE_PERCENT();
    console.log(`✅ RENTAL_FEE_PERCENT(): ${rental}`);
  } catch (e) {
    console.log(`❌ RENTAL_FEE_PERCENT() خطا: ${e.message}`);
  }
  
  try {
    const pool = await contract.prizePool();
    console.log(`✅ prizePool(): ${pool}`);
  } catch (e) {
    console.log(`❌ prizePool() خطا: ${e.message}`);
  }
}

testContract();
