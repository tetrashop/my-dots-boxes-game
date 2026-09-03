const { ethers } = require('ethers');
const ABI = require('./utils/contractABI.json');

// ===== آدرس قرارداد جدید =====
const CONTRACT_ADDRESS = '0xaE036c65C649172b43ef7156b009c6221B596B8b';
const RPC = 'https://ethereum-sepolia.publicnode.com';

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
