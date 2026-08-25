// سیستم احراز هویت با استفاده از امضای دیجیتال (بدون نیاز به سرور)
import { ethers } from 'ethers';

export const generateNonce = () => {
  return Math.floor(Math.random() * 1000000).toString();
};

export const verifySignature = async (address, signature, nonce) => {
  const message = `ورود به بازی مربع‌سازی با نانس: ${nonce}`;
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
};

// ذخیره اطلاعات کاربر به صورت محلی (بدون نیاز به سرور)
export const saveUserLocal = (address, data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`user_${address}`, JSON.stringify(data));
  }
};

export const getUserLocal = (address) => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(`user_${address}`);
    return data ? JSON.parse(data) : null;
  }
  return null;
};
