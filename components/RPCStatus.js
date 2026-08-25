import { useState, useEffect } from 'react';
import { getWorkingRPC } from '../utils/rpcProviders';

export default function RPCStatus() {
  const [status, setStatus] = useState('در حال بررسی...');
  const [rpc, setRpc] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkRPC = async () => {
      const workingRPC = await getWorkingRPC();
      setRpc(workingRPC);
      setStatus('✅ متصل');
      setIsBlocked(false);
      
      // بررسی تحریم
      try {
        const response = await fetch(workingRPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 1
          }),
          signal: AbortSignal.timeout(3000)
        });
        if (!response.ok) {
          setStatus('⚠️ محدودیت');
          setIsBlocked(true);
        }
      } catch {
        setStatus('⚠️ محدودیت');
        setIsBlocked(true);
      }
    };
    
    checkRPC();
    const interval = setInterval(checkRPC, 30000); // بررسی هر ۳۰ ثانیه
    return () => clearInterval(interval);
  }, []);

  if (isBlocked) {
    return (
      <div style={{
        background: 'rgba(255, 107, 107, 0.15)',
        border: '1px solid #FF6B6B',
        borderRadius: '12px',
        padding: '8px 16px',
        color: '#FF6B6B',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>🛡️</span>
        <span>اتصال با محدودیت مواجه است، در حال تغییر...</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(0, 184, 148, 0.1)',
      border: '1px solid #00B894',
      borderRadius: '12px',
      padding: '6px 14px',
      color: '#00B894',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <span>🟢</span>
      <span>{status}</span>
    </div>
  );
}
