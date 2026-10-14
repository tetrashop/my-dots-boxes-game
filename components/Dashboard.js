import { useState } from 'react';
import { auth } from '../utils/auth';
import { getScoreLevel } from '../utils/scoring';

export default function Dashboard({ user, onLogout, onPlay }) {
  const [bonusMsg, setBonusMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const level = getScoreLevel(user.score);

  const claimBonus = () => {
    const result = auth.claimDailyBonus(user.id);
    if (result.success) {
      setBonusMsg(`🎁 ${result.bonus} اعتبار دریافت شد!`);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setBonusMsg(`⚠️ ${result.error}`);
      setTimeout(() => setBonusMsg(''), 3000);
    }
  };

  const share = async () => {
    const text = `🧩 بازی مربع‌سازی\n${level.level} - امتیاز: ${user.score}\nبرد: ${user.wins} | باخت: ${user.losses} | مساوی: ${user.draws}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'بازی مربع‌سازی', text }); } catch {}
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert('متن کپی شد!');
    }
  };

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <strong>👤 {user.name}</strong>
            <span className="badge" style={{ background: level.color, color: 'white' }}>
              {level.level}
            </span>
          </div>
          <div className="muted">
            💰 اعتبار: {user.balance} | ⭐ امتیاز: {user.score}
          </div>
          <div className="muted">
            ✅ {user.wins} برد | ❌ {user.losses} باخت | 🤝 {user.draws} مساوی
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="success" onClick={claimBonus}>🎁 جایزه</button>
          <button className="warning" onClick={share}>📤 اشتراک</button>
          <button className="danger" onClick={onLogout}>🚪 خروج</button>
        </div>
      </div>

      {bonusMsg && (
        <div className="alert alert-info" style={{ marginTop: 12 }}>
          {bonusMsg}
        </div>
      )}

      <button
        onClick={onPlay}
        style={{
          width: '100%',
          marginTop: 12,
          padding: 14,
          fontSize: '1.05rem',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
        }}
      >
        🚀 شروع بازی جدید
      </button>
    </div>
  );
}
