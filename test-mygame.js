const { ethers } = require('ethers');

// ===== ABI قرارداد MyGame =====
const ABI = [
  "function owner() view returns (address)",
  "function prizePool() view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function ROYALTY_PERCENT() view returns (uint256)",
  "function RENTAL_FEE_PERCENT() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function nftLevels(uint256) view returns (uint256)"
];

// ===== آدرس قرارداد =====
const CONTRACT_ADDRESS = '0x3328358128832A260C76A4141e19E2A943CD4B6D';
const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

async function testMyGame() {
  console.log('========================================');
  console.log('🔍 تست قرارداد MyGame (بدون دیپلوی)');
  console.log('========================================');
  console.log(`📄 آدرس: ${CONTRACT_ADDRESS}`);
  console.log(`📡 RPC: ${RPC}`);
  console.log('');

  const provider = new ethers.JsonRpcProvider(RPC);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  // ۱. بررسی بایت‌کد
  try {
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log(`📏 طول بایت‌کد: ${code.length} کاراکتر`);
    
    if (code.length > 5000) {
      console.log('✅ بایت‌کد طولانی - قرارداد MyGame صحیح است');
    } else if (code.length > 100) {
      console.log('⚠️ بایت‌کد کوتاه - این Counters است، نه MyGame');
    } else {
      console.log('❌ قراردادی در این آدرس وجود ندارد');
      return;
    }
    console.log('');
  } catch (e) {
    console.log(`❌ خطا در دریافت بایت‌کد: ${e.message}`);
    return;
  }

  // ۲. تست توابع
  const tests = [
    { name: 'owner()', fn: () => contract.owner() },
    { name: 'prizePool()', fn: () => contract.prizePool() },
    { name: 'name()', fn: () => contract.name() },
    { name: 'symbol()', fn: () => contract.symbol() },
    { name: 'ROYALTY_PERCENT()', fn: () => contract.ROYALTY_PERCENT() },
    { name: 'RENTAL_FEE_PERCENT()', fn: () => contract.RENTAL_FEE_PERCENT() },
    { name: 'totalSupply()', fn: () => contract.totalSupply() },
  ];

  for (const test of tests) {
    try {
      const value = await test.fn();
      console.log(`✅ ${test.name}: ${value}`);
    } catch (e) {
      console.log(`❌ ${test.name}: ${e.message.substring(0, 70)}`);
    }
  }

  console.log('');
  console.log('========================================');
  console.log('🏁 تست کامل شد');
  console.log('========================================');
}

testMyGame().catch(console.error);
