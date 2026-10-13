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
  const [version, setVersion] = useState(0); // شمارنده‌ی نسخه - برای نیرو دادن به رندر
  const [state, setState] = useState({
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
  const [aiPending, setAiPending] = useState(false);

  // مرجع برای جلوگیری از حرکت هم‌زمان AI
  const gameRef = useRef(null);
  useEffect(() => { gameRef.current = game; }, [game]);

  // تشخیص موبایل
  useEffect(() => {
    setMounted(true);
    const check = () =>
      setIsMobile(
        typeof window !== 'undefined' &&
          (window.innerWidth < 768 || 'ontouchstart' in window)
      );
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  // بازیابی کاربر
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

  // ====== سنک کردن state با کلاس mutable Game ======
  const sync = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    setState({
      scores: [...g.scores],
      currentPlayer: g.currentPlayer,
      gameOver: g.gameOver,
      winner: g.getWinner(),
    });
    setVersion((v) => v + 1);
  }, []);

  // ====== پایان بازی ======
  const finishGame = useCallback(() => {
    const g = gameRef.current;
    if (!g || !user) return;
    const winner = g.getWinner();
    const myBoxes = g.scores[0];
    const isWinner = winner === 0;
    const isDraw = winner === -1;
    const oppBoxes = Math.max(...g.scores.slice(1));
    const reward = calculateReward({
      boxesMade: myBoxes,
      isWinner,
      isDraw,
      isPerfect: isWinner && oppBoxes === 0,
    });
    const updated = auth.addGameResult(user.id, {
      boxes: myBoxes,
      reward,
      isWinner,
      isDraw,
    });
    if (updated) setUser(updated);
    setResult({ winner, reward, myBoxes, isWinner, isDraw });
  }, [user]);

  // ====== حرکت بازیکن انسانی ======
  const handleMove = useCallback(
    (row, col, isH) => {
      const g = gameRef.current;
      if (!g || g.gameOver) return;
      if (g.currentPlayer !== 0) return;
      const res = g.makeMove(row, col, isH, 0);
      if (!res.success) return;
      sync();
      if (g.gameOver) finishGame();
    },
    [sync, finishGame]
  );

  // ====== هوش مصنوعی: افکت مستقل که با تغییر نسخه trigger می‌شود ======
  useEffect(() => {
    const g = gameRef.current;
    if (!g || g.gameOver) return;
    if (g.currentPlayer === 0) return;
    if (aiPending) return;

    const aiPlayer = g.currentPlayer;
    setAiPending(true);

    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      const gg = gameRef.current;
      if (!gg || gg.gameOver) {
        setAiPending(false);
        return;
      }
      if (gg.currentPlayer !== aiPlayer) {
        setAiPending(false);
        return;
      }

      const move = gg.getAIMove(aiPlayer);
      if (move) {
        gg.makeMove(move.row, move.col, move.isHorizontal, aiPlayer);
        sync();
        if (gg.gameOver) finishGame();
      }
      setAiPending(false);
    }, 480);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setAiPending(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, game]);

  // ====== شروع بازی جدید ======
  const startGame = ({ gridSize: gs, numPlayers: np, playerColors: pc }) => {
    const g = new GameLogic(gs, np);
    gameRef.current = g;
    setGame(g);
    setGridSize(gs);
    setNumPlayers(np);
    setPlayerColors(pc.slice(0, np));
    setState({
      scores: [...g.scores],
      currentPlayer: 0,
      gameOver: false,
      winner: null,
    });
    setResult(null);
    setVersion((v) => v + 1);
    setView('game');
  };

  // ====== خروج ======
  const logout = () => {
    auth.logout();
    setUser(null);
    setGame(null);
    gameRef.current = null;
    setResult(null);
    setView('auth');
  };

  // ====== رندر ======
  if (!mounted) {
    return (
      <div className="container">
        <h1>🧩 بازی مربع‌سازی</h1>
        <div className="card center">
          <p className="muted">در حال بارگذاری...</p>
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
          <Dashboard
            user={user}
            onLogout={logout}
            onPlay={() => setView('settings')}
          />
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
            scores={state.scores}
            currentPlayer={state.currentPlayer}
            gameOver={state.gameOver}
            winner={state.winner}
            playerColors={playerColors}
            numPlayers={numPlayers}
            remaining={game.getRemainingMoves()}
            aiPending={aiPending}
          />

          <GameBoard
            game={game}
            version={version}
            onMove={handleMove}
            playerColors={playerColors}
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
                  🏆 <strong>برنده شدید!</strong> امتیاز:{' '}
                  <strong>+{result.reward}</strong>
                </>
              )}
              {result.isDraw && (
                <>
                  🤝 <strong>مساوی!</strong> امتیاز:{' '}
                  <strong>+{result.reward}</strong>
                </>
              )}
              {!result.isWinner && !result.isDraw && (
                <>
                  ❌ <strong>باخت!</strong> امتیاز:{' '}
                  <strong>{result.reward}</strong>
                </>
              )}
              <div className="muted" style={{ marginTop: 4 }}>
                🟦 مربع‌های شما: {result.myBoxes}
              </div>
            </div>
          )}

          <div className="controls">
            <button
              onClick={() =>
                startGame({ gridSize, numPlayers, playerColors })
              }
            >
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
