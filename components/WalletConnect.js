import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // بررسی نصب متامسک در هر دو حالت (موبایل و دسکتاپ)
  useEffect(() => {
    const checkMetaMask = () => {
      // روش تشخیص متامسک
      const hasEthereum = typeof window !== 'undefined' && window.ethereum;
      const isMetaMask = hasEthereum && window.ethereum.isMetaMask;
      
      // تشخیص متامسک در موبایل (از طریق ethereum provider)
      const hasMetaMaskProvider = hasEthereum && (
        window.ethereum.isMetaMask || 
        window.ethereum.providers?.some(p => p.isMetaMask)
      );
      
      setIsMetaMaskInstalled(!!(isMetaMask || hasMetaMaskProvider));
    };
    
    checkMetaMask();
    
    // گوش دادن به تغییرات provider
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      // بررسی مجدد وجود متامسک
      if (typeof window === 'undefined' || !window.ethereum) {
        // تلاش برای باز کردن متامسک در موبایل
        const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
        if (isMobile) {
          // باز کردن متامسک از طریق deep link
          window.open('https://metamask.app.link/dapp/' + window.location.href, '_blank');
          setError('لطفاً متامسک را باز کنید و سپس به این صفحه برگردید.');
          setLoading(false);
          return;
        }
        throw new Error('متامسک نصب نیست!');
      }
      
      // درخواست اتصال به حساب‌ها
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setAddress(address);
        onConnect(address);
        
        // دریافت شبکه
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          console.log('Network:', chainId);
        } catch (e) {
          console.log('Network check failed:', e);
        }
      } else {
        setError('هیچ حسابی در متامسک یافت نشد');
      }
    } catch (err) {
      console.error('خطای اتصال:', err);
      if (err.code === 4001) {
        setError('درخواست اتصال توسط کاربر رد شد');
      } else if (err.code === -32002) {
        setError('لطفاً درخواست متامسک را تأیید کنید');
      } else {
        setError('خطا در اتصال: ' + err.message);
      }
    }
    setLoading(false);
  };

  // نصب متامسک
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
      {!isMetaMaskInstalled ? (
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
            boxShadow: address ? '0 4px 12px rgba(0,184,148,0.3)' : '0 4px 12px rgba(108,92,231,0.3)'
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
