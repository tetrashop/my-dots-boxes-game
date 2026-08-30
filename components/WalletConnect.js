import { useState, useEffect } from 'react';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstall = () => {
      if (typeof window !== 'undefined') {
        const hasEthereum = window.ethereum !== undefined && window.ethereum !== null;
        const isMetaMask = hasEthereum && window.ethereum.isMetaMask === true;
        setIsInstalled(!!isMetaMask);
      }
    };
    checkInstall();

    // گوش دادن به تغییرات
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
        if (isMobile) {
          window.open('https://metamask.app.link/dapp/' + window.location.href, '_blank');
          setError('لطفاً متامسک را باز کنید و سپس به این صفحه برگردید.');
          setLoading(false);
          return;
        }
        throw new Error('متامسک نصب نیست!');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        if (onConnect) onConnect(accounts[0]);
      } else {
        setError('هیچ حسابی یافت نشد');
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.code === 4001) {
        setError('درخواست اتصال رد شد');
      } else if (err.code === -32002) {
        setError('لطفاً درخواست متامسک را تأیید کنید');
      } else {
        setError('خطا: ' + (err.message || 'مشکل در اتصال'));
      }
    }
    setLoading(false);
  };

  return (
    <div>
      {!isInstalled ? (
        <button
          onClick={() => window.open('https://metamask.io/download/', '_blank')}
          style={{
            background: '#FF6B6B',
            padding: '6px 14px',
            borderRadius: '30px',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.9rem'
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
