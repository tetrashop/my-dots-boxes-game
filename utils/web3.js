import { ethers } from 'ethers';
import config from './config';
import contractABI from './contractABI.json';

let provider, signer, contract;

export const initWeb3 = async () => {
  // بررسی وجود متامسک
  if (typeof window === 'undefined') {
    throw new Error('مرورگر پشتیبانی نمی‌شود');
  }
  
  // بررسی ethereum provider
  if (!window.ethereum) {
    // بررسی موبایل
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isMobile) {
      window.open('https://metamask.app.link/dapp/' + window.location.href, '_blank');
      throw new Error('لطفاً متامسک را باز کنید');
    }
    throw new Error('متامسک نصب نیست');
  }
  
  try {
    // درخواست اتصال
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    
    // مقداردهی قرارداد
    if (config.contractAddress && config.contractAddress !== '0x0000000000000000000000000000000000000000') {
      contract = new ethers.Contract(config.contractAddress, contractABI, signer);
    }
    
    return { provider, signer, contract };
  } catch (error) {
    console.error('خطا در اتصال به متامسک:', error);
    throw error;
  }
};

export const getContract = () => contract;
export const getProvider = () => provider;
export const getSigner = () => signer;
export const getConfig = () => config;
