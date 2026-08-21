import { useState } from 'react';

const COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#eab308',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export default function GameSettings({ 
  onStartGame,
  initialGridSize = 4,
  initialPlayers = 2
}) {
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [numPlayers, setNumPlayers] = useState(initialPlayers);
  const [playerColors, setPlayerColors] = useState(
    COLORS.slice(0, initialPlayers).map((c, i) => ({ 
      id: i, 
      color: c, 
      name: `بازیکن ${i + 1}${i === 0 ? ' (شما)' : i === 1 ? ' (هوش مصنوعی)' : ''}`
    }))
  );

  const handleNumPlayersChange = (num) => {
    setNumPlayers(num);
    const newColors = COLORS.slice(0, num).map((c, i) => ({
      id: i,
      color: c,
      name: `بازیکن ${i + 1}${i === 0 ? ' (شما)' : i === 1 ? ' (هوش مصنوعی)' : ''}`
    }));
    setPlayerColors(newColors);
  };

  const handleColorChange = (index, color) => {
    const newColors = [...playerColors];
    newColors[index].color = color;
    setPlayerColors(newColors);
  };

  const handleNameChange = (index, name) => {
    const newColors = [...playerColors];
    newColors[index].name = name;
    setPlayerColors(newColors);
  };

  const handleStart = () => {
    onStartGame({
      gridSize,
      numPlayers,
      playerColors: playerColors.map(p => p.color)
    });
  };

  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      border: '2px solid #e2e8f0'
    }}>
      <h3 style={{ marginBottom: '15px', color: '#1a202c' }}>
        ⚙️ تنظیمات بازی
      </h3>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <div>
          <label style={{ fontWeight: '600', color: '#4a5568' }}>
            اندازه شبکه:
          </label>
          <select 
            value={gridSize} 
            onChange={(e) => setGridSize(Number(e.target.value))}
            style={{
              marginLeft: '10px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white'
            }}
          >
            {[3,4,5,6,7,8].map(n => (
              <option key={n} value={n}>{n}×{n}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ fontWeight: '600', color: '#4a5568' }}>
            تعداد بازیکنان:
          </label>
          <select 
            value={numPlayers} 
            onChange={(e) => handleNumPlayersChange(Number(e.target.value))}
            style={{
              marginLeft: '10px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white'
            }}
          >
            {[2,3,4].map(n => (
              <option key={n} value={n}>{n} نفر</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
        {playerColors.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0'
          }}>
            <input
              type="color"
              value={p.color}
              onChange={(e) => handleColorChange(i, e.target.value)}
              style={{
                width: '36px',
                height: '36px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              value={p.name}
              onChange={(e) => handleNameChange(i, e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: '600',
                color: '#2d3748',
                width: '100px'
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        style={{
          background: '#4299e1',
          color: 'white',
          border: 'none',
          padding: '10px 30px',
          borderRadius: '40px',
          fontWeight: '700',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        🚀 شروع بازی جدید
      </button>
    </div>
  );
}
