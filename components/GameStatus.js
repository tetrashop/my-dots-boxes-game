export default function GameStatus({
  scores,
  currentPlayer,
  gameOver,
  winner,
  playerColors,
  isMobile = false
}) {
  const getStatus = () => {
    if (gameOver) {
      if (winner === -1) return '🤝 مساوی!';
      if (winner !== null) return '🏆 بازیکن ' + (winner + 1) + ' برنده شد!';
      return '🎯 بازی تمام شد!';
    }
    return currentPlayer === 0 ? '👤 نوبت شما' : '🤖 نوبت بازیکن ' + (currentPlayer + 1);
  };

  return (
    <div style={{ background: '#f7fafc', borderRadius: '16px', padding: isMobile ? '12px' : '15px', marginBottom: '20px', border: '2px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: isMobile ? '8px' : '15px', flexWrap: 'wrap' }}>
          {scores.map((score, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: isMobile ? '0.85rem' : '1rem', padding: '4px 10px', borderRadius: '20px', background: i === currentPlayer && !gameOver ? '#e2e8f0' : 'transparent' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '4px', background: playerColors[i] || '#000' }}></span>
              {isMobile ? 'P' + (i+1) : 'بازیکن ' + (i+1)}: {score}
            </div>
          ))}
        </div>
        <div style={{ background: gameOver ? '#fc8181' : '#4299e1', color: 'white', padding: isMobile ? '4px 14px' : '6px 20px', borderRadius: '30px', fontWeight: '700', fontSize: isMobile ? '0.8rem' : '0.95rem', textAlign: 'center', minWidth: isMobile ? '100%' : 'auto' }}>
          {getStatus()}
        </div>
      </div>
    </div>
  );
}
