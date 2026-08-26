import { useState, useEffect } from 'react';
import { auth } from '../utils/auth';

export default function Leaderboard({ isMobile }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(auth.getLeaderboard());
  }, []);

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <h3 style={{ marginBottom: '12px', color: '#A29BFE' }}>🏆 جدول رهبران</h3>
      {users.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>هنوز کاربری ثبت‌نام نکرده است.</p>
      ) : (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {users.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: isMobile ? '0.85rem' : '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
              <span>{i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : `#${i+1}`}{u.name}</span>
              <span style={{ color: '#A29BFE' }}>⭐ {u.score} | 💰 {u.balance}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
