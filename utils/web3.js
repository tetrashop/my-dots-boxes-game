import { ethers } from 'ethers';
import config from './config';
import ABI from './contractABI.json';

let provider = null;
let signer = null;
let contract = null;

export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask نصب نیست');
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  signer = await provider.getSigner();

  if (config.contractAddress) {
    contract = new ethers.Contract(config.contractAddress, ABI, signer);
  }

  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    address,
    chainId: Number(network.chainId),
  };
}

export function getContract() {
  return contract;
}

export function isConnected() {
  return !!signer;
}

export async function mintNFT(uri = 'https://example.com/nft.json') {
  if (!contract) throw new Error('قرارداد متصل نیست');
  const address = await signer.getAddress();
  const tx = await contract.mintNFT(address, uri);
  return await tx.wait();
}

export async function upgradeNFT(tokenId) {
  if (!contract) throw new Error('قرارداد متصل نیست');
  const tx = await contract.upgradeNFT(tokenId);
  return await tx.wait();
}

export async function getContractInfo() {
  if (!contract) return null;
  try {
    const [owner, pool, name, symbol, total] = await Promise.all([
      contract.owner(),
      contract.prizePool(),
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
    ]);
    return {
      owner,
      prizePool: pool,
      name,
      symbol,
      totalSupply: Number(total),
    };
  } catch (err) {
    return null;
  }
}
