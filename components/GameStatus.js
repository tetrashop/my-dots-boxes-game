export default function GameStatus({
  scores,
  currentPlayer,
  gameOver,
  winner,
  player1Color,
  player2Color
}) {
  const getTurnText = () => {
    if (gameOver) return '🎯 بازی تمام شد!';
    return currentPlayer === 0 ? '👤 نوبت شماست' : '🤖 هوش مصنوعی در حال فکر کردن...';
  };

  const getWinnerText = () => {
    if (winner === 0) return '🏆 برنده: بازیکن ۱ (شما)!';
    if (winner === 1) return '🏆 برنده: هوش مصنوعی!';
    if (winner === -1) return '🤝 بازی مساوی!';
    return '';
  };

  return (
    <div className="game-info">
      <div className="player-score">
        <span className="color-indicator" style={{ background: player1Color }}></span>
        بازیکن ۱: {scores[0]} امتیاز
      </div>
      <div className="turn-badge">{getTurnText()}</div>
      <div className="player-score">
        <span className="color-indicator" style={{ background: player2Color }}></span>
        بازیکن ۲: {scores[1]} امتیاز
      </div>
      {gameOver && (
        <div className="winner-message" style={{ width: '100%' }}>
          {getWinnerText()}
        </div>
      )}
    </div>
  );
}
