export default function GameStatus({
  scores,
  currentPlayer,
  gameOver,
  winner,
  playerColors,
  numPlayers,
  remainingMoves
}) {
  const getTurnText = () => {
    if (gameOver) return '🎯 بازی تمام شد!';
    if (currentPlayer === 0) return '👤 نوبت شماست';
    return `🤖 نوبت بازیکن ${currentPlayer + 1} (هوش مصنوعی)`;
  };

  const getWinnerText = () => {
    if (winner === -1) return '🤝 بازی مساوی!';
    if (winner !== null) return `🏆 برنده: بازیکن ${winner + 1}!`;
    return '';
  };

  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '15px 20px',
      marginBottom: '20px',
      border: '2px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {scores.map((score, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: '20px',
              background: i === currentPlayer && !gameOver ? '#e2e8f0' : 'transparent',
              border: i === currentPlayer && !gameOver ? '2px solid #4299e1' : 'none'
            }}>
              <span style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                borderRadius: '4px',
                background: playerColors[i] || '#000'
              }}></span>
              بازیکن {i + 1}: {score}
            </div>
          ))}
        </div>
        
        <div style={{
          background: gameOver ? '#fc8181' : '#4299e1',
          color: 'white',
          padding: '6px 18px',
          borderRadius: '30px',
          fontWeight: '700',
          fontSize: '0.9rem'
        }}>
          {getTurnText()}
        </div>
      </div>

      {remainingMoves !== undefined && !gameOver && (
        <div style={{
          marginTop: '8px',
          fontSize: '0.85rem',
          color: '#4a5568',
          textAlign: 'center'
        }}>
          ⏳ حرکات باقیمانده: {remainingMoves}
        </div>
      )}

      {gameOver && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          borderRadius: '12px',
          background: '#f0fff4',
          textAlign: 'center',
          fontSize: '1.2rem',
          fontWeight: '800',
          color: '#22543d'
        }}>
          {getWinnerText()}
          <div style={{ fontSize: '0.9rem', fontWeight: '400', color: '#4a5568', marginTop: '4px' }}>
            امتیاز نهایی: {scores.map((s, i) => `بازیکن ${i+1}: ${s}`).join(' | ')}
          </div>
        </div>
      )}
    </div>
  );
}
