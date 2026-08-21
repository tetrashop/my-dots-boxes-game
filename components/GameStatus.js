export default function GameStatus({
  scores,
  currentPlayer,
  gameOver,
  winner,
  playerColors,
  numPlayers,
  remainingMoves,
  isMobile = false
}) {
  const getTurnText = () => {
    if (gameOver) return '🎯 بازی تمام شد!';
    if (currentPlayer === 0) return '👤 نوبت شماست';
    return `🤖 نوبت بازیکن ${currentPlayer + 1}`;
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
      padding: isMobile ? '12px 15px' : '15px 20px',
      marginBottom: '20px',
      border: '2px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: isMobile ? '6px' : '10px'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '6px' : '15px', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: isMobile ? '100%' : 'auto'
        }}>
          {scores.map((score, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: '700',
              fontSize: isMobile ? '0.8rem' : '1rem',
              padding: isMobile ? '2px 8px' : '4px 12px',
              borderRadius: '20px',
              background: i === currentPlayer && !gameOver ? '#e2e8f0' : 'transparent',
              border: i === currentPlayer && !gameOver ? '2px solid #4299e1' : 'none'
            }}>
              <span style={{
                display: 'inline-block',
                width: isMobile ? '10px' : '14px',
                height: isMobile ? '10px' : '14px',
                borderRadius: '4px',
                background: playerColors[i] || '#000'
              }}></span>
              {isMobile ? `P${i+1}` : `بازیکن ${i+1}`}: {score}
            </div>
          ))}
        </div>
        
        <div style={{
          background: gameOver ? '#fc8181' : '#4299e1',
          color: 'white',
          padding: isMobile ? '4px 12px' : '6px 18px',
          borderRadius: '30px',
          fontWeight: '700',
          fontSize: isMobile ? '0.75rem' : '0.9rem',
          width: isMobile ? '100%' : 'auto',
          textAlign: 'center'
        }}>
          {getTurnText()}
        </div>
      </div>

      {remainingMoves !== undefined && !gameOver && (
        <div style={{
          marginTop: isMobile ? '4px' : '8px',
          fontSize: isMobile ? '0.7rem' : '0.85rem',
          color: '#4a5568',
          textAlign: 'center'
        }}>
          ⏳ حرکات باقیمانده: {remainingMoves}
        </div>
      )}

      {gameOver && (
        <div style={{
          marginTop: isMobile ? '8px' : '10px',
          padding: isMobile ? '8px' : '10px',
          borderRadius: '12px',
          background: '#f0fff4',
          textAlign: 'center',
          fontSize: isMobile ? '1rem' : '1.2rem',
          fontWeight: '800',
          color: '#22543d'
        }}>
          {getWinnerText()}
          <div style={{ 
            fontSize: isMobile ? '0.7rem' : '0.9rem', 
            fontWeight: '400', 
            color: '#4a5568', 
            marginTop: '4px' 
          }}>
            {scores.map((s, i) => `P${i+1}: ${s}`).join(' | ')}
          </div>
        </div>
      )}
    </div>
  );
}
