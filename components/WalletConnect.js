import { useState } from 'react';
import { ethers } from 'ethers';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('');

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        alert('لطفاً متامسک نصب کنید!');
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      setAddress(address);
      setBalance(ethers.formatEther(balance));
      onConnect(address);
    } catch (error) {
      console.error(error);
      alert('خطا در اتصال کیف پول');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={connectWallet}
      style={{
        background: address ? '#48bb78' : '#4299e1',
        padding: '8px 18px',
        borderRadius: '30px',
        border: 'none',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.9rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
      disabled={loading}
    >
      {loading ? '⏳ ...' : address ? `🟢 ${address.slice(0,6)}...${address.slice(-4)}` : '🔗 اتصال کیف پول'}
    </button>
  );
}
