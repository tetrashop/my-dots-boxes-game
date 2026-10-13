import { useState, useEffect, useCallback, useRef } from 'react';
import { GameLogic } from '../utils/gameLogic';
import { auth } from '../utils/auth';
import { calculateReward } from '../utils/scoring';
import AuthModal from '../components/AuthModal';
import Dashboard from '../components/Dashboard';
import GameSettings from '../components/GameSettings';
import GameStatus from '../components/GameStatus';
import GameBoard from '../components/GameBoard';
import Leaderboard from '../components/Leaderboard';

export default function Home() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState({
    scores: [],
    currentPlayer: 0,
    gameOver: false,
    winner: null,
  });

  const [playerColors, setPlayerColors] = useState(['#ef4444', '#3b82f6']);
  const [gridSize, setGridSize] = useState(4);
  const [numPlayers, setNumPlayers] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  const [view, setView] = useState('auth');
  const [result, setResult] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const aiTimer = useRef(null);

  // چک کردن موبایل
  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(
      window.innerWidth < 768 || 'ontouchstart' in window
    );
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // بارگذاری کاربر
  useEffect(() => {
    if (!mounted) return;
    const u = auth.getCurrentUser();
    if (u) {
      setUser(u);
      setView('menu');
    } else {
      setView('auth');
    }
  }, [mounted]);

  // مدیریت هوش مصنوعی
  useEffect(() => {
    if (!game || game.gameOver) return;
    if (game.currentPlayer === 0) return;
    if (aiThinking) return;

    const player = game.currentPlayer;

    setAiThinking(true);
    aiTimer.current = setTimeout(() => {
      const move = game.getAIMove(player);
      if (move) {
        game.makeMove(move.row, move.col, move.isHorizontal, player);
        setGameState({
          scores: [...game.scores],
          currentPlayer: game.currentPlayer,
          gameOver: game.gameOver,
          winner: game.getWinner(),
        });
        setRenderKey((k) => k + 1);

        if (game.gameOver) {
          handleGameEnd();
        }
      }
      setAiThinking(false);
    }, 500);

    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
    };
  }, [game?.currentPlayer, game?.gameOver, aiThinking]);

  const handleGameEnd = useCallback(() => {
    if (!game || !user) return;
    const winner = game.getWinner();
    const playerBoxes = game.scores[0];
    const isWinner = winner === 0;
    const isDraw = winner === -1;
    const opponentBoxes = Math.max(...game.scores.slice(1));

    const reward = calculateReward({
      boxesMade: playerBoxes,
      isWinner,
      isDraw,
      isPerfect: isWinner && opponentBoxes === 0,
    });

    const updated = auth.addGameResult(user.id, {
      boxes: playerBoxes,
      reward,
      isWinner,
      isDraw,
    });

    if (updated) setUser(updated);

    setResult({
      winner,
      reward,
      playerBoxes,
      isWinner,
      isDraw,
    });
  }, [game, user]);

  const handleMove = useCallback((row, col, isH) => {
    if (!game || game.gameOver) return;
    if (game.currentPlayer !== 0) return;
    if (aiThinking) return;

    const res = game.makeMove(row, col, isH, 0);
    if (!res.success) return;

    setGameState({
      scores: [...game.scores],
      currentPlayer: game.currentPlayer,
      gameOver: game.gameOver,
      winner: game.getWinner(),
    });
    setRenderKey((k) => k + 1);

    if (game.gameOver) {
      handleGameEnd();
    }
  }, [game, aiThinking, handleGameEnd]);

  const startGame = ({ gridSize: gs, numPlayers: np, playerColors: pc }) => {
    const g = new GameLogic(gs, np);
    setGame(g);
    setGridSize(gs);
    setNumPlayers(np);
    setPlayerColors(pc);
    setGameState({
      scores: [...g.scores],
      currentPlayer: 0,
      gameOver: false,
      winner: null,
    });
    setResult(null);
    setAiThinking(false);
    setRenderKey((k) => k + 1);
    setView('game');
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    setGame(null);
    setResult(null);
    setView('auth');
  };

  // اگر mount نشده، خالی برگردان (SSR-safe)
  if (!mounted) {
    return (
      <div className="container">
        <h1>🧩 بازی مربع‌سازی</h1>
        <div className="card center">
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>🧩 بازی مربع‌سازی</h1>

      {view === 'auth' && (
        <AuthModal
          onSuccess={(u) => {
            setUser(u);
            setView('menu');
          }}
        />
      )}

      {view === 'menu' && user && (
        <>
          <Dashboard user={user} onLogout={logout} onPlay={() => setView('settings')} />
          <Leaderboard />
        </>
      )}

      {view === 'settings' && (
        <>
          <GameSettings onStart={startGame} isMobile={isMobile} />
          <div className="center" style={{ marginTop: 8 }}>
            <button className="ghost" onClick={() => setView('menu')}>
              ↩️ بازگشت
            </button>
          </div>
        </>
      )}

      {view === 'game' && game && (
        <>
          <GameStatus
            scores={gameState.scores}
            currentPlayer={gameState.currentPlayer}
            gameOver={gameState.gameOver}
            winner={gameState.winner}
            playerColors={playerColors}
            numPlayers={numPlayers}
            remaining={game.getRemainingMoves()}
          />

          <GameBoard
            key={renderKey}
            game={game}
            onMove={handleMove}
            playerColors={playerColors}
            gridSize={gridSize}
            isMobile={isMobile}
          />

          {result && (
            <div
              className={
                'alert ' +
                (result.isWinner
                  ? 'alert-success'
                  : result.isDraw
                  ? 'alert-warning'
                  : 'alert-danger')
              }
            >
              {result.isWinner && (
                <>
                  🏆 برنده شدید! امتیاز دریافتی: <strong>+{result.reward}</strong>
                </>
              )}
              {result.isDraw && (
                <>
                  🤝 مساوی! امتیاز دریافتی: <strong>+{result.reward}</strong>
                </>
              )}
              {!result.isWinner && !result.isDraw && (
                <>
                  ❌ باخت! امتیاز: <strong>{result.reward}</strong>
                </>
              )}
              <div className="muted" style={{ marginTop: 4 }}>
                مربع‌های شما: {result.playerBoxes}
              </div>
            </div>
          )}

          <div className="controls">
            <button onClick={() => startGame({ gridSize, numPlayers, playerColors })}>
              🔄 بازی جدید
            </button>
            <button className="ghost" onClick={() => setView('menu')}>
              🏠 منوی اصلی
            </button>
          </div>
        </>
      )}
    </div>
  );
}
