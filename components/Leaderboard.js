import { useEffect, useState } from 'react';
import { auth } from '../utils/auth';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(auth.getLeaderboard(10));
  }, []);

  if (users.length === 0) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>🏆 جدول رهبران</h3>
        <p className="muted center">هنوز بازیکنی ثبت نشده</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>🏆 جدول رهبران</h3>
      {users.map((u, i) => (
        <div key={u.id} className="list-item">
          <span>
            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}{' '}
            {u.name}
          </span>
          <span className="muted">
            ⭐ {u.score} | ✅ {u.wins}
          </span>
        </div>
      ))}
    </div>
  );
}
