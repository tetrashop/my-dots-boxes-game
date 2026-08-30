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
    <div className="card" style={{ marginBottom: '16px' }}>
      <h3 style={{ marginBottom: '15px', color: '#A29BFE', textAlign: 'center' }}>⚙️ تنظیمات بازی</h3>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '15px' }}>
        <div>
          <label style={{ fontWeight: '600', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>📐 اندازه شبکه</label>
          <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', width: isMobile ? '100%' : 'auto' }}>
            {[3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}×{n}</option>)}
          </select>
          <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', display: 'block', marginTop: '4px' }}>
            {gridSize}×{gridSize} نقطه ← {(gridSize-1)}×{(gridSize-1)} مربع
          </small>
        </div>
        <div>
          <label style={{ fontWeight: '600', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>👥 تعداد بازیکنان</label>
          <select value={numPlayers} onChange={(e) => { const n = Number(e.target.value); setNumPlayers(n); setPlayerColors(COLORS.slice(0, n)); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', width: isMobile ? '100%' : 'auto' }}>
            {[2,3,4].map(n => <option key={n} value={n}>{n} نفر</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
        {playerColors.map((color, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontWeight: '600', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>بازیکن {i + 1}</span>
            <input type="color" value={color} onChange={(e) => handleColorChange(i, e.target.value)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '2px', background: 'transparent' }} />
          </div>
        ))}
      </div>
      <button onClick={handleStart} style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>🚀 شروع بازی</button>
    </div>
  );
}
