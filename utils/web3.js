import { ethers } from 'ethers';
import config from './config';
import contractABI from './contractABI.json';

let provider, signer, contract;

export const initWeb3 = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('متامسک نصب نیست');
  }
  
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  
  if (config.contractAddress && config.contractAddress !== '0x0000000000000000000000000000000000000000') {
    contract = new ethers.Contract(config.contractAddress, contractABI, signer);
  }
  
  return { provider, signer, contract };
};

export const getContract = () => contract;
export const getProvider = () => provider;
export const getSigner = () => signer;
export const getConfig = () => config;

export const mintNFT = async (recipient, uri) => {
  if (!contract) throw new Error('قرارداد متصل نیست');
  const tx = await contract.mintNFT(recipient, uri);
  return await tx.wait();
};

export const upgradeNFT = async (tokenId) => {
  if (!contract) throw new Error('قرارداد متصل نیست');
  const tx = await contract.upgradeNFT(tokenId);
  return await tx.wait();
};
