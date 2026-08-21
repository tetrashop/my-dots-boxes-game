import { useState, useEffect } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);
  const [playerColors, setPlayerColors] = useState(
    COLORS.slice(0, initialPlayers).map((c, i) => ({ 
      id: i, 
      color: c, 
      name: `بازیکن ${i + 1}${i === 0 ? ' (شما)' : i === 1 ? ' (AI)' : ''}`
    }))
  );

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNumPlayersChange = (num) => {
    setNumPlayers(num);
    const newColors = COLORS.slice(0, num).map((c, i) => ({
      id: i,
      color: c,
      name: `بازیکن ${i + 1}${i === 0 ? ' (شما)' : i === 1 ? ' (AI)' : ''}`
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
      padding: isMobile ? '15px' : '20px',
      marginBottom: '20px',
      border: '2px solid #e2e8f0'
    }}>
      <h3 style={{ 
        marginBottom: '15px', 
        color: '#1a202c',
        fontSize: isMobile ? '1rem' : '1.2rem',
        textAlign: isMobile ? 'center' : 'right'
      }}>
        ⚙️ تنظیمات بازی
      </h3>
      
      <div style={{ 
        display: 'flex', 
        gap: isMobile ? '10px' : '20px', 
        flexWrap: 'wrap', 
        marginBottom: '15px',
        justifyContent: isMobile ? 'center' : 'flex-start'
      }}>
        <div style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'center' : 'right' }}>
          <label style={{ fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '4px' }}>
            اندازه شبکه:
          </label>
          <select 
            value={gridSize} 
            onChange={(e) => setGridSize(Number(e.target.value))}
            style={{
              padding: isMobile ? '8px 12px' : '6px 12px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white',
              width: isMobile ? '100%' : 'auto',
              fontSize: isMobile ? '14px' : '16px'
            }}
          >
            {[3,4,5,6,7,8].map(n => (
              <option key={n} value={n}>{n}×{n}</option>
            ))}
          </select>
        </div>
        
        <div style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'center' : 'right' }}>
          <label style={{ fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '4px' }}>
            تعداد بازیکنان:
          </label>
          <select 
            value={numPlayers} 
            onChange={(e) => handleNumPlayersChange(Number(e.target.value))}
            style={{
              padding: isMobile ? '8px 12px' : '6px 12px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white',
              width: isMobile ? '100%' : 'auto',
              fontSize: isMobile ? '14px' : '16px'
            }}
          >
            {[2,3,4].map(n => (
              <option key={n} value={n}>{n} نفر</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: isMobile ? '8px' : '15px', 
        marginBottom: '15px',
        justifyContent: isMobile ? 'center' : 'flex-start'
      }}>
        {playerColors.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'white',
            padding: isMobile ? '4px 8px' : '6px 12px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            justifyContent: 'center',
            width: isMobile ? '100%' : 'auto'
          }}>
            <input
              type="color"
              value={p.color}
              onChange={(e) => handleColorChange(i, e.target.value)}
              style={{
                width: isMobile ? '30px' : '36px',
                height: isMobile ? '30px' : '36px',
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
                width: isMobile ? '80px' : '100px',
                fontSize: isMobile ? '12px' : '14px'
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
          padding: isMobile ? '12px 20px' : '10px 30px',
          borderRadius: '40px',
          fontWeight: '700',
          fontSize: isMobile ? '0.9rem' : '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s',
          width: isMobile ? '100%' : 'auto',
          display: 'block',
          margin: '0 auto'
        }}
      >
        🚀 شروع بازی جدید
      </button>
    </div>
  );
}
