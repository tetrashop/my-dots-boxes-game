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
  }, [game]);

  const makeAIMove = useCallback(() => {
    if (!game || game.gameOver || game.currentPlayer === 0 || isAIThinking) return;

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
  }, [game, isAIThinking, updateGameState, isMobile]);

  useEffect(() => {
    if (game && game.currentPlayer !== 0 && !game.gameOver) {
      makeAIMove();
    }
  }, [game, game?.currentPlayer, game?.gameOver, makeAIMove]);

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
  };

  const handlePlayerMove = (row, col, isHorizontal) => {
    if (!game || game.gameOver || game.currentPlayer !== 0 || isAIThinking) return;
    const result = game.makeMove(row, col, isHorizontal, 0);
    if (result.success) {
      updateGameState();
    }
  };

  const resetGame = () => {
    if (game) {
      game.reset();
      updateGameState();
      setIsAIThinking(false);
      setRenderKey(prev => prev + 1);
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

      <GameBoard
        key={renderKey}
        game={game}
        onMove={handlePlayerMove}
        playerColors={playerColors}
        gridSize={gridSize}
        isMobile={isMobile}
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
