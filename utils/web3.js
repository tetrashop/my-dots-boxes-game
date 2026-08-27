import { ethers } from 'ethers';
import config from './config';
import contractABI from './contractABI.json';

let provider, signer, contract;

export const initWeb3 = async () => {
  // بررسی وجود متامسک
  if (typeof window === 'undefined') {
    throw new Error('مرورگر پشتیبانی نمی‌شود');
  }
  
  if (!window.ethereum) {
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
    
    // بررسی آدرس قرارداد
    const contractAddress = config.contractAddress;
    if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
      contract = new ethers.Contract(contractAddress, contractABI, signer);
    } else {
      console.warn('⚠️ آدرس قرارداد تنظیم نشده است');
      contract = null;
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

// تابع ضرب NFT
export const mintNFT = async (recipient, uri) => {
  if (!contract) throw new Error('قرارداد متصل نیست');
  try {
    const tx = await contract.mintNFT(recipient, uri);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('خطا در ضرب NFT:', error);
    throw new Error('خطا در ضرب NFT: ' + error.message);
  }
};

// تابع ارتقا NFT
export const upgradeNFT = async (tokenId) => {
  if (!contract) throw new Error('قرارداد متصل نیست');
  try {
    const tx = await contract.upgradeNFT(tokenId);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('خطا در ارتقا NFT:', error);
    throw new Error('خطا در ارتقا NFT: ' + error.message);
  }
};

// دریافت جزئیات NFT
export const getNFTDetails = async (tokenId) => {
  if (!contract) throw new Error('قرارداد متصل نیست');
  try {
    return await contract.nftDetails(tokenId);
  } catch (error) {
    console.error('خطا در دریافت جزئیات NFT:', error);
    return null;
  }
};

// دریافت مالک NFT
export const getOwner = async (tokenId) => {
  if (!contract) throw new Error('قرارداد متصل نیست');
  try {
    return await contract.ownerOf(tokenId);
  } catch (error) {
    console.error('خطا در دریافت مالک:', error);
    return null;
  }
};
