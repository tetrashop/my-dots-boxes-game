import { useState, useEffect, useCallback } from 'react';
import { GameLogic } from '../utils/gameLogic';
import GameBoard from '../components/GameBoard';
import GameSettings from '../components/GameSettings';
import GameStatus from '../components/GameStatus';
import AuthModal from '../components/AuthModal';
import Dashboard from '../components/Dashboard';
import Leaderboard from '../components/Leaderboard';
import { auth } from '../utils/auth';

export default function Home() {
  const [user, setUser] = useState(null);
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState({ scores: [], currentPlayer: 0, gameOver: false, winner: null });
  const [playerColors, setPlayerColors] = useState(['#ef4444', '#3b82f6']);
  const [gridSize, setGridSize] = useState(4);
  const [numPlayers, setNumPlayers] = useState(2);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [showAuth, setShowAuth] = useState(true);
  const [coachMode, setCoachMode] = useState(false);
  const [suggestedMove, setSuggestedMove] = useState(null);
  const [gameResult, setGameResult] = useState(null);

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
    if (coachMode && !game.gameOver && game.currentPlayer === 0) {
      setSuggestedMove(game.getAIMove(0));
    } else {
      setSuggestedMove(null);
    }
  }, [game, coachMode]);

  // ===== هوش مصنوعی =====
  const makeAIMove = useCallback(() => {
    if (!game || game.gameOver || game.currentPlayer === 0 || isAIThinking) return;
    if (coachMode) return;

    setIsAIThinking(true);
    const delay = isMobile ? 600 + Math.random() * 400 : 400 + Math.random() * 300;
    
    setTimeout(() => {
      const move = game.getAIMove(game.currentPlayer);
      if (move) {
        const result = game.makeMove(move.row, move.col, move.isHorizontal, game.currentPlayer);
        updateGameState();
        // نوبت به بازیکن بعدی می‌رود (حتی اگر مربع ساخته شود)
        if (!result.gameOver && game.currentPlayer !== 0 && !coachMode) {
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

  useEffect(() => {
    if (game && coachMode && !game.gameOver && game.currentPlayer === 0) {
      setSuggestedMove(game.getAIMove(0));
    } else {
      setSuggestedMove(null);
    }
  }, [game, coachMode, game?.currentPlayer, game?.gameOver]);

  // ===== مدیریت نتیجه بازی =====
  useEffect(() => {
    if (game && game.gameOver && user) {
      const winner = game.getWinner();
      if (winner === 0) {
        auth.addWin(user.id);
        auth.addScore(user.id, 5 + game.scores[0] * 2);
        auth.addBoxes(user.id, game.scores[0]);
        setGameResult('win');
      } else if (winner === -1) {
        auth.addScore(user.id, 2);
        setGameResult('draw');
      } else if (winner === 1) {
        auth.addLoss(user.id);
        auth.addScore(user.id, 1);
        setGameResult('loss');
      }
      const updated = auth.getUser(user.id);
      if (updated) setUser(updated);
    }
  }, [game?.gameOver]);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowAuth(true);
    setGameStarted(false);
    setGame(null);
    setGameResult(null);
  };

  const handleStartGame = ({ gridSize: size, numPlayers: players, playerColors: colors }) => {
    if (!user) return;
    const newGame = new GameLogic(size, players);
    setGame(newGame);
    setPlayerColors(colors);
    setGridSize(size);
    setNumPlayers(players);
    setGameStarted(true);
    setGameState({ scores: Array(players).fill(0), currentPlayer: 0, gameOver: false, winner: null });
    setIsAIThinking(false);
    setRenderKey(prev => prev + 1);
    setSuggestedMove(null);
    setGameResult(null);
  };

  const handlePlayerMove = (row, col, isHorizontal) => {
    if (!game || game.gameOver || game.currentPlayer !== 0 || isAIThinking) return;
    const result = game.makeMove(row, col, isHorizontal, 0);
    if (result.success) {
      updateGameState();
      // نوبت به بازیکن بعدی می‌رود
    } else {
      // نمایش خطا به کاربر
      alert('حرکت نامعتبر: ' + result.reason);
    }
  };

  const resetGame = () => {
    if (game) {
      game.reset();
      updateGameState();
      setIsAIThinking(false);
      setRenderKey(prev => prev + 1);
      setSuggestedMove(null);
      setGameResult(null);
    }
  };

  const toggleCoach = () => {
    setCoachMode(prev => !prev);
    if (!coachMode && game && !game.gameOver && game.currentPlayer === 0) {
      setSuggestedMove(game.getAIMove(0));
    } else {
      setSuggestedMove(null);
    }
  };

  if (showAuth) {
    return (
      <div className="container">
        <h1>🧩 بازی مربع‌سازی</h1>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
          ثبت‌نام کنید و ۱۰ اعتبار رایگان دریافت کنید!
        </p>
        <AuthModal onLogin={handleLogin} isMobile={isMobile} />
        <Leaderboard isMobile={isMobile} />
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="container">
        <h1>🧩 بازی مربع‌سازی</h1>
        <Dashboard user={user} onLogout={handleLogout} onPlay={() => setGameStarted(true)} isMobile={isMobile} />
        <Leaderboard isMobile={isMobile} />
        <GameSettings onStartGame={handleStartGame} isMobile={isMobile} />
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>🧩 بازی مربع‌سازی</h1>
      <Dashboard user={user} onLogout={handleLogout} onPlay={() => {}} isMobile={isMobile} />
      <GameStatus
        scores={gameState.scores}
        currentPlayer={gameState.currentPlayer}
        gameOver={gameState.gameOver}
        winner={gameState.winner}
        playerColors={playerColors}
        isMobile={isMobile}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button
          onClick={toggleCoach}
          className={coachMode ? 'coach-btn active' : 'coach-btn'}
          style={{
            padding: '8px 20px',
            borderRadius: '30px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {coachMode ? '🧑‍🏫 مربی: فعال' : '🧑‍🏫 مربی: غیرفعال'}
        </button>
        {coachMode && suggestedMove && (
          <span style={{
            background: 'rgba(253, 203, 110, 0.15)',
            color: '#FDCB6E',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            border: '1px solid rgba(253, 203, 110, 0.2)'
          }}>
            ⭐ پیشنهاد: خط زرد را بکشید
          </span>
        )}
        {gameResult && (
          <span style={{
            background: gameResult === 'win' ? 'rgba(0, 184, 148, 0.2)' : gameResult === 'draw' ? 'rgba(253, 203, 110, 0.2)' : 'rgba(255, 107, 107, 0.2)',
            color: gameResult === 'win' ? '#00B894' : gameResult === 'draw' ? '#FDCB6E' : '#FF6B6B',
            padding: '4px 16px',
            borderRadius: '30px',
            fontWeight: '700',
            fontSize: '0.9rem',
            border: '1px solid ' + (gameResult === 'win' ? 'rgba(0, 184, 148, 0.3)' : gameResult === 'draw' ? 'rgba(253, 203, 110, 0.3)' : 'rgba(255, 107, 107, 0.3)')
          }}>
            {gameResult === 'win' ? '🏆 برد!' : gameResult === 'draw' ? '🤝 مساوی' : '❌ باخت'}
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
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
        <button onClick={resetGame}>🔄 بازی جدید</button>
        <button className="reset" onClick={() => { setGameStarted(false); setGame(null); }}>
          🏠 منوی اصلی
        </button>
      </div>
    </div>
  );
}
