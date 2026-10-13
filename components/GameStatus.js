export default function GameStatus({
  scores,
  currentPlayer,
  gameOver,
  winner,
  playerColors,
  remaining,
  aiPending,
}) {
  const statusText = () => {
    if (gameOver) {
      if (winner === -1) return '🤝 مساوی';
      return `🏆 برنده: بازیکن ${winner + 1}`;
    }
    if (currentPlayer === 0) return '👤 نوبت شما';
    return aiPending ? `🤖 در حال فکر...` : `🤖 نوبت بازیکن ${currentPlayer + 1}`;
  };

  return (
    <div className="card">
      <div className="status-row">
        <div className="status-players">
          {scores.map((s, i) => (
            <div
              key={i}
              className={
                'badge ' + (i === currentPlayer && !gameOver ? 'active' : '')
              }
            >
              <span
                className="player-dot"
                style={{ background: playerColors[i] }}
              />
              <span>بازیکن {i + 1}: {s}</span>
            </div>
          ))}
        </div>
        <div
          className={
            'badge ' + (gameOver ? 'badge-danger' : 'badge-primary')
          }
        >
          {statusText()}
        </div>
      </div>
      {!gameOver && typeof remaining === 'number' && (
        <div className="muted center" style={{ marginTop: 8 }}>
          ⏳ حرکات باقی‌مانده: {remaining}
        </div>
      )}
    </div>
  );
}
