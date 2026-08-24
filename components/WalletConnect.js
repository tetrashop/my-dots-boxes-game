import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(null);

  // تشخیص provider در اندروید و دسکتاپ
  useEffect(() => {
    const initProvider = async () => {
      const detectedProvider = await detectEthereumProvider();
      if (detectedProvider) {
        setProvider(detectedProvider);
      } else {
        // بررسی وجود ethereum در پنجره (برای مرورگرهای دسکتاپ)
        if (typeof window !== 'undefined' && window.ethereum) {
          setProvider(window.ethereum);
        }
      }
    };
    initProvider();
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      // بررسی وجود provider
      let ethProvider = provider;
      
      // اگر provider وجود ندارد، دوباره تلاش کن
      if (!ethProvider) {
        const detected = await detectEthereumProvider();
        if (detected) {
          ethProvider = detected;
          setProvider(detected);
        } else if (typeof window !== 'undefined' && window.ethereum) {
          ethProvider = window.ethereum;
          setProvider(window.ethereum);
        }
      }

      if (!ethProvider) {
        // بررسی نصب متامسک در اندروید
        const isAndroid = /android/i.test(navigator.userAgent);
        if (isAndroid) {
          // باز کردن متامسک از طریق deep link
          window.open('https://metamask.app.link/dapp/' + window.location.href, '_blank');
          setError('لطفاً متامسک را باز کنید و سپس به این صفحه برگردید.');
        } else {
          setError('لطفاً متامسک را نصب کنید: https://metamask.io/download/');
        }
        setLoading(false);
        return;
      }

      // درخواست اتصال به حساب‌ها
      const accounts = await ethProvider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setAddress(address);
        onConnect(address);
        
        // نمایش پیام موفقیت
        setError('');
      } else {
        setError('هیچ حسابی پیدا نشد');
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

  // راهنمای نصب متامسک در اندروید
  const installMetaMask = () => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    
    if (isAndroid) {
      window.open('https://play.google.com/store/apps/details?id=io.metamask', '_blank');
    } else if (isIOS) {
      window.open('https://apps.apple.com/app/metamask/id1438144202', '_blank');
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  return (
    <div>
      <button
        onClick={connectWallet}
        style={{
          background: address ? '#48bb78' : '#4299e1',
          padding: '6px 14px',
          borderRadius: '30px',
          border: 'none',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: '120px'
        }}
        disabled={loading}
      >
        {loading ? '⏳ ...' : address ? `🟢 ${address.slice(0,6)}...${address.slice(-4)}` : '🔗 اتصال کیف پول'}
      </button>
      
      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: '#fed7d7',
          borderRadius: '8px',
          color: '#c53030',
          fontSize: '0.85rem',
          maxWidth: '300px'
        }}>
          {error}
          {error.includes('نصب') && (
            <button
              onClick={installMetaMask}
              style={{
                display: 'block',
                marginTop: '6px',
                background: '#4299e1',
                border: 'none',
                borderRadius: '20px',
                padding: '4px 16px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              📥 نصب متامسک
            </button>
          )}
        </div>
      )}
    </div>
  );
}
