import { ethers } from 'ethers';
import config from './config';
import contractABI from './contractABI.json';
import { getWorkingRPC, RPC_PROVIDERS } from './rpcProviders';

let provider, signer, contract;
let currentRPC = '';

// تشخیص تحریم با بررسی RPC
export const checkSanctions = async () => {
  try {
    const testProvider = new ethers.JsonRpcProvider(RPC_PROVIDERS[0].url);
    await testProvider.getBlockNumber();
    return false; // بدون تحریم
  } catch (e) {
    console.log('⚠️ RPC blocked, switching...');
    return true; // تحریم فعال است
  }
};

export const initWeb3 = async () => {
  // ابتدا RPC کار را پیدا کن
  currentRPC = await getWorkingRPC();
  console.log('✅ Using RPC:', currentRPC);
  
  // ایجاد provider با RPC جایگزین
  provider = new ethers.JsonRpcProvider(currentRPC);
  
  // اگر متامسک موجود است، از آن استفاده کن
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      signer = await browserProvider.getSigner();
    } catch (e) {
      console.log('⚠️ MetaMask not available, using fallback');
      // استفاده از کیف پول خواندنی (بدون امضا)
    }
  }
  
  // مقداردهی قرارداد
  if (config.contractAddress && config.contractAddress !== '0x0000000000000000000000000000000000000000') {
    contract = new ethers.Contract(config.contractAddress, contractABI, provider);
  }
  
  return { provider, signer, contract, currentRPC };
};

export const getContract = () => contract;
export const getProvider = () => provider;
export const getSigner = () => signer;
export const getRPC = () => currentRPC;
