import { useState, useEffect } from 'react';
import { initWeb3 } from '../utils/web3';

export default function WalletConnect({ onConnect, onDisconnect }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);

  // بررسی نصب متامسک
  useEffect(() => {
    const checkInstall = () => {
      if (typeof window !== 'undefined') {
        const hasEthereum = window.ethereum !== undefined && window.ethereum !== null;
        setIsInstalled(hasEthereum && window.ethereum.isMetaMask === true);
      }
    };
    checkInstall();

    // گوش دادن به تغییرات حساب
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAddress('');
          if (onDisconnect) onDisconnect();
        } else {
          setAddress(accounts[0]);
          if (onConnect) onConnect(accounts[0]);
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, [onConnect, onDisconnect]);

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { signer } = await initWeb3();
      const address = await signer.getAddress();
      setAddress(address);
      if (onConnect) onConnect(address);
    } catch (err) {
      console.error('Error:', err);
      if (err.code === 4001) {
        setError('درخواست اتصال رد شد');
      } else if (err.code === -32002) {
        setError('لطفاً درخواست متامسک را تأیید کنید');
      } else {
        setError(err.message || 'خطا در اتصال کیف پول');
      }
    }
    setLoading(false);
  };

  const installMetaMask = () => {
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isMobile) {
      window.open('https://metamask.app.link/dapp/' + window.location.href, '_blank');
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  return (
    <div>
      {!isInstalled ? (
        <button
          onClick={installMetaMask}
          style={{
            background: '#FF6B6B',
            padding: '6px 14px',
            borderRadius: '30px',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(255,107,107,0.3)'
          }}
        >
          📥 نصب متامسک
        </button>
      ) : (
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
            boxShadow: address ? '0 4px 12px rgba(0,184,148,0.3)' : '0 4px 12px rgba(108,92,231,0.3)',
            opacity: loading ? 0.6 : 1
          }}
          disabled={loading}
        >
          {loading ? '⏳ ...' : address ? `🟢 ${address.slice(0,6)}...${address.slice(-4)}` : '🔗 اتصال کیف پول'}
        </button>
      )}
      {error && (
        <div style={{
          marginTop: '4px',
          padding: '4px 10px',
          background: 'rgba(255,107,107,0.15)',
          borderRadius: '8px',
          color: '#FF6B6B',
          fontSize: '0.8rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
