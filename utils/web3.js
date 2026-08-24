import { ethers } from 'ethers';
import contractABI from './contractABI.json';

const CONTRACT_ADDRESS = '0x...'; // بعد از دیپلوی جایگزین می‌شود

let provider, signer, contract;

export const initWeb3 = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    return { provider, signer, contract };
  }
  throw new Error('MetaMask not installed');
};

export const getContract = () => contract;

export const mintNFT = async (recipient, uri) => {
  const tx = await contract.mintNFT(recipient, uri);
  return await tx.wait();
};

export const upgradeNFT = async (tokenId) => {
  const tx = await contract.upgradeNFT(tokenId);
  return await tx.wait();
};

export const rentNFT = async (tokenId, duration, price) => {
  const tx = await contract.rentNFT(tokenId, duration, { value: price });
  return await tx.wait();
};

export const getNFTDetails = async (tokenId) => {
  return await contract.nftDetails(tokenId);
};

export const getOwner = async (tokenId) => {
  return await contract.ownerOf(tokenId);
};
