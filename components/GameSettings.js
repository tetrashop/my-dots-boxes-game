import { useState } from 'react';
import config from '../utils/config';

const DEFAULT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];

export default function GameSettings({ onStart, isMobile }) {
  const [gridSize, setGridSize] = useState(4);
  const [numPlayers, setNumPlayers] = useState(2);
  const [colors, setColors] = useState(DEFAULT_COLORS.slice(0, 2));

  const handlePlayers = (n) => {
    setNumPlayers(n);
    const next = [...colors];
    while (next.length < n) next.push(DEFAULT_COLORS[next.length]);
    setColors(next.slice(0, n));
  };

  const handleColor = (i, color) => {
    const next = [...colors];
    next[i] = color;
    setColors(next);
  };

  const start = () => {
    onStart({ gridSize, numPlayers, playerColors: colors });
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>⚙️ تنظیمات بازی</h3>

      <div className="row" style={{ marginBottom: 12 }}>
        <div className="col">
          <label>📐 اندازه شبکه</label>
          <select
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
          >
            {Array.from({ length: config.gridMax - config.gridMin + 1 }, (_, i) => i + config.gridMin).map(
              (n) => (
                <option key={n} value={n}>
                  {n}×{n} نقطه ({(n - 1) * (n - 1)} مربع)
                </option>
              )
            )}
          </select>
        </div>

        <div className="col">
          <label>👥 تعداد بازیکنان</label>
          <select
            value={numPlayers}
            onChange={(e) => handlePlayers(Number(e.target.value))}
          >
            {[2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} نفر {n > 2 ? '(با AI)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {colors.map((c, i) => (
          <div
            key={i}
            className="badge"
            style={{ padding: '6px 10px', gap: 6 }}
          >
            <span>بازیکن {i + 1}</span>
            <input
              type="color"
              value={c}
              onChange={(e) => handleColor(i, e.target.value)}
              style={{
                width: 30,
                height: 30,
                border: 'none',
                padding: 0,
                background: 'transparent',
                cursor: 'pointer',
              }}
            />
          </div>
        ))}
      </div>

      <button onClick={start} style={{ width: '100%' }}>
        🚀 شروع بازی
      </button>
    </div>
  );
}
