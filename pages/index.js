import { useState, useEffect, useCallback } from 'react';
import { GameLogic } from '../utils/gameLogic';
import Board from '../components/Board';
import PlayerSettings from '../components/PlayerSettings';
import GameStatus from '../components/GameStatus';

export default function Home() {
  const [game] = useState(() => new GameLogic(4));
  const [player1Color, setPlayer1Color] = useState('#ef4444');
  const [player2Color, setPlayer2Color] = useState('#3b82f6');
  const [gameState, setGameState] = useState({
    scores: [0, 0],
    currentPlayer: 0,
    gameOver: false,
    winner: null
  });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // تابع به‌روزرسانی وضعیت
  const updateGameState = useCallback(() => {
    setGameState({
      scores: [...game.scores],
      currentPlayer: game.currentPlayer,
      gameOver: game.gameOver,
      winner: game.getWinner()
    });
  }, [game]);

  // حرکت هوش مصنوعی
  const makeAIMove = useCallback(() => {
    if (game.gameOver || game.currentPlayer !== 1 || isAIThinking) return;

    setIsAIThinking(true);
    setTimeout(() => {
      const move = game.getAIMove();
      if (move) {
        const result = game.makeMove(move.row, move.col, move.isHorizontal, 1);
        updateGameState();
        if (!result.gameOver && game.currentPlayer === 1) {
          makeAIMove();
        }
      }
      setIsAIThinking(false);
    }, 500);
  }, [game, isAIThinking, updateGameState]);

  // اجرای هوش مصنوعی هنگام تغییر نوبت
  useEffect(() => {
    if (game.currentPlayer === 1 && !game.gameOver) {
      makeAIMove();
    }
  }, [game.currentPlayer, game.gameOver, makeAIMove]);

  // حرکت بازیکن
  const handlePlayerMove = (row, col, isHorizontal) => {
    if (game.gameOver || game.currentPlayer !== 0 || isAIThinking) return;

    const result = game.makeMove(row, col, isHorizontal, 0);
    if (result.success) {
      updateGameState();
    }
  };

  // ریست بازی
  const resetGame = () => {
    game.reset();
    updateGameState();
    setIsAIThinking(false);
  };

  // تست خودکار
  const runTests = () => {
    const results = [];
    const testGame = new GameLogic(3);

    // تست 1: حرکت معتبر
    const move1 = testGame.makeMove(0, 0, true, 0);
    results.push({
      name: 'تست حرکت معتبر',
      passed: move1.success === true,
      message: move1.success ? '✅ حرکت با موفقیت انجام شد' : '❌ خطا در حرکت معتبر'
    });

    // تست 2: جلوگیری از حرکت تکراری
    const move2 = testGame.makeMove(0, 0, true, 0);
    results.push({
      name: 'تست جلوگیری از حرکت تکراری',
      passed: move2.success === false && move2.reason === 'already_drawn',
      message: move2.success === false ? '✅ حرکت تکراری شناسایی شد' : '❌ خطا در تشخیص حرکت تکراری'
    });

    // تست 3: تشخیص نوبت
    const move3 = testGame.makeMove(0, 1, true, 1);
    results.push({
      name: 'تست تشخیص نوبت',
      passed: move3.success === false && move3.reason === 'wrong_turn',
      message: move3.success === false ? '✅ حرکت در نوبت اشتباه رد شد' : '❌ خطا در تشخیص نوبت'
    });

    // تست 4: ساختن مربع
    const game4 = new GameLogic(2);
    game4.makeMove(0, 0, true, 0);
    game4.makeMove(0, 0, false, 1);
    game4.makeMove(1, 0, true, 0);
    const move4 = game4.makeMove(1, 0, false, 1);
    results.push({
      name: 'تست ساختن مربع',
      passed: move4.success && move4.filled > 0,
      message: move4.success && move4.filled > 0 ? '✅ مربع ساخته شد' : '❌ خطا در ساخت مربع'
    });

    setTestResults(results);
  };

  return (
    <div className="container">
      <h1>🧩 بازی مربع‌سازی</h1>
      <p style={{ textAlign: 'center', color: '#4a5568', marginBottom: '20px' }}>
        نقاط را به هم وصل کنید و مربع بسازید!
      </p>

      <PlayerSettings
        player1Color={player1Color}
        player2Color={player2Color}
        onPlayer1ColorChange={setPlayer1Color}
        onPlayer2ColorChange={setPlayer2Color}
      />

      <GameStatus
        scores={gameState.scores}
        currentPlayer={gameState.currentPlayer}
        gameOver={gameState.gameOver}
        winner={gameState.winner}
        player1Color={player1Color}
        player2Color={player2Color}
      />

      <Board
        game={game}
        onMove={handlePlayerMove}
        player1Color={player1Color}
        player2Color={player2Color}
      />

      <div className="controls">
        <button onClick={resetGame}>🔄 بازی جدید</button>
        <button className="reset" onClick={resetGame}>🗑️ ریست کامل</button>
        <button onClick={runTests} style={{ background: '#48bb78' }}>
          🧪 تست خودکار
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="test-results">
          <h4>📊 نتایج تست:</h4>
          <pre>
            {testResults.map((r, i) => `${i+1}. ${r.name}: ${r.message}`).join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
