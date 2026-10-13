const { ethers } = require('ethers');
const ABI = require('./utils/contractABI.json');

const CONTRACT_ADDRESS = '0xe2899bddFD890e320e643044c6b95B9B0b84157A';
const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

async function testContract() {
  console.log('========================================');
  console.log('🔍 تست قرارداد هوشمند');
  console.log('========================================');
  console.log(`📄 آدرس: ${CONTRACT_ADDRESS}`);
  console.log('');

  const provider = new ethers.JsonRpcProvider(RPC);

  try {
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log(`📏 طول بایت‌کد: ${code.length} کاراکتر`);

    if (code === '0x' || code.length < 100) {
      console.log('❌ قراردادی در این آدرس وجود ندارد!');
      return;
    }

    if (code.length > 5000) {
      console.log('✅ بایت‌کد طولانی - قرارداد صحیح است');
    } else {
      console.log('⚠️ بایت‌کد کوتاه - احتمالاً Counters');
    }
    console.log('');

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    try { console.log(`✅ owner(): ${await contract.owner()}`); } catch (e) { console.log(`❌ owner(): ${e.message.substring(0, 50)}`); }
    try { console.log(`✅ prizePool(): ${await contract.prizePool()}`); } catch (e) { console.log(`❌ prizePool(): ${e.message.substring(0, 50)}`); }
    try { console.log(`✅ name(): ${await contract.name()}`); } catch (e) { console.log(`❌ name(): ${e.message.substring(0, 50)}`); }
    try { console.log(`✅ symbol(): ${await contract.symbol()}`); } catch (e) { console.log(`❌ symbol(): ${e.message.substring(0, 50)}`); }
    try { console.log(`✅ ROYALTY_PERCENT(): ${await contract.ROYALTY_PERCENT()}`); } catch (e) {}
    try { console.log(`✅ RENTAL_FEE_PERCENT(): ${await contract.RENTAL_FEE_PERCENT()}`); } catch (e) {}
    try { console.log(`✅ totalSupply(): ${await contract.totalSupply()}`); } catch (e) {}

    console.log('');
    console.log('🎉 تست کامل شد');

  } catch (error) {
    console.log(`❌ خطا: ${error.message}`);
  }
}

testContract().catch(console.error);
