import { useState } from 'react';
import { auth } from '../utils/auth';
import WalletConnect from './WalletConnect';

export default function Dashboard({ user, onLogout, onPlay, isMobile }) {
  const [bonusMsg, setBonusMsg] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const claimDailyBonus = () => {
    const result = auth.addDailyBonus(user.id);
    if (result.success) {
      setBonusMsg(`✅ ${result.bonus} اعتبار دریافت شد!`);
      setTimeout(() => window.location.reload(), 1200);
    } else {
      setBonusMsg('⚠️ ' + result.error);
    }
    setTimeout(() => setBonusMsg(''), 4000);
  };

  const shareResult = () => {
    const text = `🧩 بازی مربع‌سازی!\nامتیاز: ${user.score}\nبرد: ${user.wins} | باخت: ${user.losses}\nمربع‌ها: ${user.boxes}\nاعتبار: ${user.balance}`;
    if (navigator.share) {
      navigator.share({ title: 'بازی مربع‌سازی', text });
    } else {
      navigator.clipboard.writeText(text).then(() => alert('نتایج کپی شد!'));
    }
  };

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <strong style={{ fontSize: '1.1rem', color: '#A29BFE' }}>👤 {user.name}</strong>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            💰 {user.balance} اعتبار | ⭐ {user.score} امتیاز
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
            ✅ {user.wins} برد | ❌ {user.losses} باخت | 📦 {user.boxes} مربع
          </div>
          {walletAddress && (
            <div style={{ fontSize: '0.8rem', color: '#00CEC9', marginTop: '4px' }}>
              🔗 {walletAddress.slice(0,8)}...{walletAddress.slice(-6)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <WalletConnect onConnect={setWalletAddress} />
          <button className="success" onClick={claimDailyBonus} style={{ padding: '6px 14px', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
            🎁 جایزه روزانه
          </button>
          <button className="warning" onClick={shareResult} style={{ padding: '6px 14px', fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#2D3436' }}>
            📤 اشتراک‌گذاری
          </button>
          <button className="reset" onClick={onLogout} style={{ padding: '6px 14px', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
            🚪 خروج
          </button>
        </div>
      </div>
      {bonusMsg && (
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          background: 'rgba(253, 203, 110, 0.15)',
          borderRadius: '12px',
          color: '#FDCB6E',
          textAlign: 'center',
          border: '1px solid rgba(253, 203, 110, 0.2)'
        }}>
          {bonusMsg}
        </div>
      )}
      <div style={{ marginTop: '12px' }}>
        <button onClick={onPlay} style={{
          width: '100%',
          padding: '14px',
          borderRadius: '40px',
          background: 'linear-gradient(135deg, #6C5CE7, #00CEC9)',
          color: 'white',
          fontWeight: '800',
          fontSize: '1.1rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(108, 92, 231, 0.4)'
        }}>
          🚀 شروع بازی
        </button>
      </div>
    </div>
  );
}
