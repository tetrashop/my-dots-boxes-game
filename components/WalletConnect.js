import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = await detectEthereumProvider();
      if (!provider) {
        setError('لطفاً متامسک نصب کنید');
        setLoading(false);
        return;
      }
      
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      setAddress(address);
      onConnect(address);
    } catch (err) {
      console.error(err);
      setError('خطا در اتصال کیف پول: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={connectWallet}
        style={{
          background: address ? '#00B894' : '#6C5CE7',
          padding: '6px 14px',
          borderRadius: '30px',
          border: 'none',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.9rem',
          boxShadow: address ? '0 4px 12px rgba(0,184,148,0.3)' : '0 4px 12px rgba(108,92,231,0.3)'
        }}
        disabled={loading}
      >
        {loading ? '⏳ ...' : address ? `🟢 ${address.slice(0,6)}...${address.slice(-4)}` : '🔗 اتصال کیف پول'}
      </button>
      {error && (
        <div style={{ marginTop: '4px', padding: '4px 10px', background: 'rgba(255,107,107,0.15)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.8rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}
