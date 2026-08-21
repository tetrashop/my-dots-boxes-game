export default function PlayerSettings({
  player1Color,
  player2Color,
  onPlayer1ColorChange,
  onPlayer2ColorChange
}) {
  return (
    <div className="settings-section">
      <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>
        🎨 تنظیمات رنگ بازیکنان
      </h3>
      <div className="color-picker">
        <div className="color-group">
          <label>👤 بازیکن ۱ (شما):</label>
          <input
            type="color"
            value={player1Color}
            onChange={(e) => onPlayer1ColorChange(e.target.value)}
          />
        </div>
        <div className="color-group">
          <label>🤖 بازیکن ۲ (هوش مصنوعی):</label>
          <input
            type="color"
            value={player2Color}
            onChange={(e) => onPlayer2ColorChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
