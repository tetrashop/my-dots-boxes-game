export default function GameStatus({
  scores,
  currentPlayer,
  gameOver,
  winner,
  playerColors,
  numPlayers,
  remaining,
}) {
  const status = () => {
    if (gameOver) {
      if (winner === -1) return '🤝 مساوی';
      return `🏆 برنده: بازیکن ${winner + 1}`;
    }
    if (currentPlayer === 0) return '👤 نوبت شما';
    return `🤖 نوبت بازیکن ${currentPlayer + 1}`;
  };

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {scores.map((s, i) => (
            <div
              key={i}
              className={'badge ' + (i === currentPlayer && !gameOver ? 'active' : '')}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: playerColors[i],
                  display: 'inline-block',
                }}
              />
              بازیکن {i + 1}: {s}
            </div>
          ))}
        </div>
        <div className="badge" style={{ background: gameOver ? '#ef4444' : '#6366f1', color: 'white' }}>
          {status()}
        </div>
      </div>
      {!gameOver && remaining !== undefined && (
        <div className="muted center">
          ⏳ حرکات باقی‌مانده: {remaining}
        </div>
      )}
    </div>
  );
}
