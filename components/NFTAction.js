import { useState } from 'react';
import { mintNFT, upgradeNFT, initWeb3 } from '../utils/web3';

export default function NFTAction({ user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleMintNFT = async () => {
    setLoading(true);
    setMessage('');
    setTxHash('');
    
    try {
      const { contract } = await initWeb3();
      if (!contract) {
        throw new Error('قرارداد متصل نیست');
      }
      
      const uri = `https://my-dots-boxes-game.vercel.app/api/nft/${user.id}`;
      const tx = await contract.mintNFT(user.id, uri);
      const receipt = await tx.wait();
      
      setTxHash(receipt.hash);
      setMessage('✅ NFT با موفقیت ضرب شد!');
      if (onSuccess) onSuccess(receipt);
    } catch (error) {
      console.error(error);
      setMessage('❌ خطا در ضرب NFT: ' + error.message);
    }
    setLoading(false);
  };

  const handleUpgradeNFT = async (tokenId) => {
    setLoading(true);
    setMessage('');
    
    try {
      const { contract } = await initWeb3();
      if (!contract) throw new Error('قرارداد متصل نیست');
      
      const tx = await contract.upgradeNFT(tokenId);
      const receipt = await tx.wait();
      
      setTxHash(receipt.hash);
      setMessage('✅ NFT با موفقیت ارتقا یافت!');
      if (onSuccess) onSuccess(receipt);
    } catch (error) {
      console.error(error);
      setMessage('❌ خطا در ارتقا NFT: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleMintNFT}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #FDCB6E, #E5A800)',
            padding: '8px 20px',
            borderRadius: '30px',
            border: 'none',
            color: '#2D3436',
            fontWeight: '700',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ ...' : '🌟 ضرب NFT'}
        </button>
        <button
          onClick={() => handleUpgradeNFT(1)}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #6C5CE7, #5A4BD1)',
            padding: '8px 20px',
            borderRadius: '30px',
            border: 'none',
            color: 'white',
            fontWeight: '700',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ ...' : '⬆️ ارتقا NFT'}
        </button>
      </div>
      {message && (
        <p style={{
          marginTop: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: message.includes('✅') ? '#00B894' : '#FF6B6B',
          background: message.includes('✅') ? 'rgba(0,184,148,0.1)' : 'rgba(255,107,107,0.1)',
          border: message.includes('✅') ? '1px solid rgba(0,184,148,0.2)' : '1px solid rgba(255,107,107,0.2)'
        }}>
          {message}
        </p>
      )}
      {txHash && (
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
          TX: {txHash.slice(0,10)}...{txHash.slice(-8)}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#6C5CE7', marginLeft: '8px' }}
          >
            🔗 مشاهده
          </a>
        </p>
      )}
    </div>
  );
}
