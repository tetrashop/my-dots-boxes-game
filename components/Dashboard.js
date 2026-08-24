import { useState } from 'react';
import { auth } from '../utils/auth';

export default function Dashboard({ user, onLogout, onPlay, isMobile }) {
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [bonusMsg, setBonusMsg] = useState('');

  const claimDailyBonus = () => {
    const result = auth.addDailyBonus(user.id);
    if (result.success) {
      setBonusMsg(`✅ ${result.bonus} اعتبار رایگان دریافت کردید!`);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setBonusMsg('⚠️ ' + result.error);
    }
    setShowDailyBonus(true);
    setTimeout(() => setShowDailyBonus(false), 4000);
  };

  const shareResult = () => {
    const text = `🧩 بازی مربع‌سازی!\nامتیاز من: ${user.score}\nبرد: ${user.wins} | باخت: ${user.losses}\nمربع‌ها: ${user.boxes}\nاعتبار: ${user.balance}\nبه من بپیوندید!`;
    if (navigator.share) {
      navigator.share({ title: 'بازی مربع‌سازی', text });
    } else {
      navigator.clipboard.writeText(text).then(() => alert('نتایج کپی شد!'));
    }
  };

  return (
    <div style={{
      background: '#f7fafc',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '16px',
      border: '2px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <strong style={{ fontSize: '1.1rem' }}>👤 {user.name}</strong>
          <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
            💰 اعتبار: {user.balance} | 🏆 امتیاز: {user.score}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#718096' }}>
            ✅ {user.wins} برد | ❌ {user.losses} باخت | 📦 {user.boxes} مربع
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={claimDailyBonus} style={{
            background: '#48bb78',
            padding: '8px 16px',
            borderRadius: '30px',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}>
            🎁 جایزه روزانه
          </button>
          <button onClick={shareResult} style={{
            background: '#805ad5',
            padding: '8px 16px',
            borderRadius: '30px',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}>
            📤 اشتراک‌گذاری
          </button>
          <button onClick={onLogout} style={{
            background: '#fc8181',
            padding: '8px 16px',
            borderRadius: '30px',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}>
            🚪 خروج
          </button>
        </div>
      </div>
      {showDailyBonus && (
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          background: '#fefcbf',
          borderRadius: '12px',
          color: '#744210',
          textAlign: 'center'
        }}>
          {bonusMsg}
        </div>
      )}
      <div style={{ marginTop: '12px' }}>
        <button onClick={onPlay} style={{
          width: '100%',
          padding: '12px',
          background: '#4299e1',
          border: 'none',
          borderRadius: '40px',
          color: 'white',
          fontWeight: '700',
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(66,153,225,0.3)'
        }}>
          🚀 شروع بازی
        </button>
      </div>
    </div>
  );
}
