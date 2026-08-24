import { useState } from 'react';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];

export default function GameSettings({ onStartGame, isMobile = false }) {
  const [gridSize, setGridSize] = useState(4);
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerColors, setPlayerColors] = useState(COLORS.slice(0, 2));

  const handleStart = () => {
    onStartGame({ gridSize, numPlayers, playerColors });
  };

  const handleColorChange = (index, color) => {
    const newColors = [...playerColors];
    newColors[index] = color;
    setPlayerColors(newColors);
  };

  return (
    <div style={{ background: '#f7fafc', borderRadius: '16px', padding: isMobile ? '15px' : '20px', marginBottom: '20px', border: '2px solid #e2e8f0' }}>
      <h3 style={{ marginBottom: '15px', color: '#1a202c', fontSize: isMobile ? '1rem' : '1.2rem', textAlign: 'center' }}>⚙️ تنظیمات بازی</h3>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '15px' }}>
        <div>
          <label style={{ fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '4px' }}>📐 اندازه شبکه</label>
          <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #e2e8f0', background: 'white', fontSize: '14px', width: isMobile ? '100%' : 'auto' }}>
            {[3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}×{n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '4px' }}>👥 تعداد بازیکنان</label>
          <select value={numPlayers} onChange={(e) => { const n = Number(e.target.value); setNumPlayers(n); setPlayerColors(COLORS.slice(0, n)); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #e2e8f0', background: 'white', fontSize: '14px', width: isMobile ? '100%' : 'auto' }}>
            {[2,3,4].map(n => <option key={n} value={n}>{n} نفر</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
        {playerColors.map((color, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>بازیکن {i + 1}</span>
            <input type="color" value={color} onChange={(e) => handleColorChange(i, e.target.value)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
          </div>
        ))}
      </div>
      <button onClick={handleStart} style={{ background: '#4299e1', color: 'white', border: 'none', padding: isMobile ? '12px 20px' : '10px 30px', borderRadius: '40px', fontWeight: '700', fontSize: isMobile ? '0.9rem' : '1rem', cursor: 'pointer', transition: 'all 0.3s', width: isMobile ? '100%' : 'auto', display: 'block', margin: '0 auto' }}>🚀 شروع بازی</button>
    </div>
  );
}
