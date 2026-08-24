import { useState, useEffect } from 'react';
import { auth } from '../utils/auth';

export default function Leaderboard({ isMobile }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(auth.getLeaderboard());
  }, []);

  return (
    <div style={{
      background: '#f7fafc',
      borderRadius: '16px',
      padding: '16px',
      border: '2px solid #e2e8f0',
      marginTop: '16px'
    }}>
      <h3 style={{ marginBottom: '12px', color: '#1a202c' }}>🏆 جدول رهبران</h3>
      {users.length === 0 ? (
        <p style={{ color: '#a0aec0' }}>هنوز کاربری ثبت‌نام نکرده است.</p>
      ) : (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {users.map((u, i) => (
            <div key={u.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderBottom: '1px solid #e2e8f0',
              fontSize: isMobile ? '0.85rem' : '0.95rem'
            }}>
              <span>
                {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : `#${i+1}`}
                {u.name}
              </span>
              <span>⭐ {u.score} | 💰 {u.balance}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
