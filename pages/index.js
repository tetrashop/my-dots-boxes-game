import { useState, useEffect, useCallback } from 'react';
import { GameLogic } from '../utils/gameLogic';
import GameBoard from '../components/GameBoard';
import GameSettings from '../components/GameSettings';
import GameStatus from '../components/GameStatus';

export default function Home() {
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState({
    scores: [],
    currentPlayer: 0,
    gameOver: false,
    winner: null
  });
  const [playerColors, setPlayerColors] = useState(['#ef4444', '#3b82f6']);
  const [gridSize, setGridSize] = useState(4);
  const [numPlayers, setNumPlayers] = useState(2);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [renderKey, setRenderKey] = useState(0);

  // ===== وضعیت مربی =====
  const [coachMode, setCoachMode] = useState(false);
  const [suggestedMove, setSuggestedMove] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateGameState = useCallback(() => {
    if (!game) return;
    setGameState({
      scores: [...game.scores],
      currentPlayer: game.currentPlayer,
      gameOver: game.gameOver,
      winner: game.getWinner()
    });
    setRenderKey(prev => prev + 1);
    
    // بعد از هر تغییر، اگر مربی فعال است، پیشنهاد را به‌روز کن
    if (coachMode && !game.gameOver && game.currentPlayer === 0) {
      const move = game.getAIMove(0);
      setSuggestedMove(move);
    } else {
      setSuggestedMove(null);
    }
  }, [game, coachMode]);

  // هوش مصنوعی خودکار (فقط زمانی که مربی خاموش باشد)
  const makeAIMove = useCallback(() => {
    if (!game || game.gameOver || game.currentPlayer === 0 || isAIThinking) return;
    if (coachMode) return; // در حالت مربی، هوش مصنوعی حرکت نمی‌کند

    setIsAIThinking(true);
    const delay = isMobile ? 600 + Math.random() * 400 : 400 + Math.random() * 300;
    
    setTimeout(() => {
      const move = game.getAIMove(game.currentPlayer);
      if (move) {
        const result = game.makeMove(move.row, move.col, move.isHorizontal, game.currentPlayer);
        updateGameState();
        if (!result.gameOver && game.currentPlayer !== 0) {
          makeAIMove();
        }
      }
      setIsAIThinking(false);
    }, delay);
  }, [game, isAIThinking, updateGameState, isMobile, coachMode]);

  useEffect(() => {
    if (game && game.currentPlayer !== 0 && !game.gameOver && !coachMode) {
      makeAIMove();
    }
  }, [game, game?.currentPlayer, game?.gameOver, makeAIMove, coachMode]);

  // به‌روزرسانی پیشنهاد مربی هنگام تغییر نوبت یا فعال شدن مربی
  useEffect(() => {
    if (game && coachMode && !game.gameOver && game.currentPlayer === 0) {
      const move = game.getAIMove(0);
      setSuggestedMove(move);
    } else {
      setSuggestedMove(null);
    }
  }, [game, coachMode, game?.currentPlayer, game?.gameOver]);

  const handleStartGame = ({ gridSize: size, numPlayers: players, playerColors: colors }) => {
    const newGame = new GameLogic(size, players);
    setGame(newGame);
    setPlayerColors(colors);
    setGridSize(size);
    setNumPlayers(players);
    setGameStarted(true);
    setGameState({
      scores: Array(players).fill(0),
      currentPlayer: 0,
      gameOver: false,
      winner: null
    });
    setIsAIThinking(false);
    setRenderKey(prev => prev + 1);
    setSuggestedMove(null);
  };

  const handlePlayerMove = (row, col, isHorizontal) => {
    if (!game || game.gameOver || game.currentPlayer !== 0 || isAIThinking) return;
    const result = game.makeMove(row, col, isHorizontal, 0);
    if (result.success) {
      updateGameState();
      // پس از حرکت، پیشنهاد جدید محاسبه می‌شود
    }
  };

  const resetGame = () => {
    if (game) {
      game.reset();
      updateGameState();
      setIsAIThinking(false);
      setRenderKey(prev => prev + 1);
      setSuggestedMove(null);
    }
  };

  const toggleCoach = () => {
    setCoachMode(prev => !prev);
    if (!coachMode) {
      // فعال شدن مربی: بلافاصله پیشنهاد بگیر
      if (game && !game.gameOver && game.currentPlayer === 0) {
        const move = game.getAIMove(0);
        setSuggestedMove(move);
      }
    } else {
      setSuggestedMove(null);
    }
  };

  const runTests = () => {
    const results = [];
    const testGame = new GameLogic(3, 2);
    const move1 = testGame.makeMove(0, 0, true, 0);
    results.push({ name: 'حرکت معتبر', passed: move1.success });
    const move2 = testGame.makeMove(0, 0, true, 0);
    results.push({ name: 'جلوگیری از تکراری', passed: !move2.success });
    const move3 = testGame.makeMove(0, 1, true, 1);
    results.push({ name: 'تشخیص نوبت', passed: !move3.success });
    const game4 = new GameLogic(2, 2);
    game4.makeMove(0, 0, true, 0);
    game4.makeMove(0, 0, false, 1);
    game4.makeMove(1, 0, true, 0);
    const move4 = game4.makeMove(1, 0, false, 1);
    results.push({ name: 'نوبت بعد از مربع', passed: game4.currentPlayer === 0 });
    setTestResults(results);
  };

  if (!gameStarted) {
    return (
      <div className="container">
        <h1>🧩 بازی مربع‌سازی</h1>
        <p style={{ textAlign: 'center', color: '#4a5568', marginBottom: '20px' }}>
          نقاط را به هم وصل کنید و مربع بسازید!
        </p>
        <GameSettings onStartGame={handleStartGame} isMobile={isMobile} />
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button onClick={runTests} style={{
            background: '#48bb78',
            boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)'
          }}>
            🧪 تست خودکار
          </button>
          {testResults.length > 0 && (
            <div style={{
              marginTop: '15px',
              background: '#fefcbf',
              padding: '15px',
              borderRadius: '12px',
              textAlign: 'right'
            }}>
              {testResults.map((r, i) => (
                <div key={i}>{i+1}. {r.name}: {r.passed ? '✅ موفق' : '❌ خطا'}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>🧩 بازی مربع‌سازی</h1>
      
      <GameStatus
        scores={gameState.scores}
        currentPlayer={gameState.currentPlayer}
        gameOver={gameState.gameOver}
        winner={gameState.winner}
        playerColors={playerColors}
        isMobile={isMobile}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={toggleCoach}
          style={{
            background: coachMode ? '#ed8936' : '#a0aec0',
            boxShadow: coachMode ? '0 4px 16px rgba(237, 137, 54, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {coachMode ? '🧑‍🏫 مربی: فعال' : '🧑‍🏫 مربی: غیرفعال'}
        </button>
        {coachMode && suggestedMove && (
          <span style={{
            background: '#f6ad55',
            color: '#1a202c',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 2px 12px rgba(246, 173, 85, 0.3)'
          }}>
            ⭐ پیشنهاد: روی خط زرد رنگ کلیک کنید
          </span>
        )}
      </div>

      <GameBoard
        key={renderKey}
        game={game}
        onMove={handlePlayerMove}
        playerColors={playerColors}
        gridSize={gridSize}
        isMobile={isMobile}
        suggestedMove={coachMode ? suggestedMove : null}
      />

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        <button onClick={resetGame}>🔄 بازی جدید</button>
        <button className="reset" onClick={() => { setGameStarted(false); setGame(null); }}>
          🏠 تنظیمات
        </button>
        <button onClick={runTests} style={{
          background: '#48bb78',
          boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)'
        }}>
          🧪 تست
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{
          marginTop: '15px',
          background: '#fefcbf',
          padding: '15px',
          borderRadius: '12px'
        }}>
          {testResults.map((r, i) => (
            <div key={i}>{i+1}. {r.name}: {r.passed ? '✅ موفق' : '❌ خطا'}</div>
          ))}
        </div>
      )}
    </div>
  );
}
