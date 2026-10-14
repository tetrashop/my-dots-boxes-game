import { useState, useEffect } from 'react';
import { connectWallet, getContractInfo, isConnected } from '../utils/web3';

export default function WalletConnect() {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('idle');
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => {
          if (accounts.length > 0) setAddress(accounts[0]);
        })
        .catch(() => {});
    }
  }, []);

  const connect = async () => {
    setStatus('connecting');
    try {
      const res = await connectWallet();
      setAddress(res.address);
      setStatus('connected');
      const cInfo = await getContractInfo();
      setInfo(cInfo);
    } catch (err) {
      setStatus('error');
      alert(err.message);
    }
  };

  if (address && status === 'connected') {
    return (
      <button
        className="success"
        onClick={() => {
          setAddress('');
          setStatus('idle');
        }}
        title={info ? `قرارداد: ${info.name}` : 'متصل'}
      >
        🟢 {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <button onClick={connect} disabled={status === 'connecting'}>
      {status === 'connecting' ? '⏳ ...' : '🔗 اتصال کیف پول'}
    </button>
  );
}
