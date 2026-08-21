import { useState, useEffect, useCallback } from 'react';
import { GameLogic } from '../utils/gameLogic';
import Board from '../components/Board';
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
  const [testResults, setTestResults] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  const updateGameState = useCallback(() => {
    if (!game) return;
    setGameState({
      scores: [...game.scores],
      currentPlayer: game.currentPlayer,
      gameOver: game.gameOver,
      winner: game.getWinner()
    });
  }, [game]);

  const makeAIMove = useCallback(() => {
    if (!game || game.gameOver || game.currentPlayer === 0 || isAIThinking) return;

    setIsAIThinking(true);
    setTimeout(() => {
      const move = game.getAIMove(game.currentPlayer);
      if (move) {
        const result = game.makeMove(move.row, move.col, move.isHorizontal, game.currentPlayer);
        updateGameState();
        if (!result.gameOver && game.currentPlayer !== 0 && game.currentPlayer < numPlayers) {
          makeAIMove();
        }
      }
      setIsAIThinking(false);
    }, 400 + Math.random() * 300);
  }, [game, isAIThinking, updateGameState, numPlayers]);

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
    setTestResults([]);
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
    }
  };

  const runTests = () => {
    const results = [];
    
    // تست 1: حرکت معتبر
    const testGame = new GameLogic(3, 2);
    const move1 = testGame.makeMove(0, 0, true, 0);
    results.push({
      name: 'حرکت معتبر',
      passed: move1.success === true,
      message: move1.success ? '✅ موفق' : '❌ خطا'
    });

    // تست 2: حرکت تکراری
    const move2 = testGame.makeMove(0, 0, true, 0);
    results.push({
      name: 'جلوگیری از حرکت تکراری',
      passed: move2.success === false && move2.reason === 'already_drawn',
      message: move2.success === false ? '✅ موفق' : '❌ خطا'
    });

    // تست 3: تشخیص نوبت
    const move3 = testGame.makeMove(0, 1, true, 1);
    results.push({
      name: 'تشخیص نوبت',
      passed: move3.success === false && move3.reason === 'wrong_turn',
      message: move3.success === false ? '✅ موفق' : '❌ خطا'
    });

    // تست 4: ساخت مربع
    const game4 = new GameLogic(2, 2);
    game4.makeMove(0, 0, true, 0);
    game4.makeMove(0, 0, false, 1);
    game4.makeMove(1, 0, true, 0);
    const move4 = game4.makeMove(1, 0, false, 1);
    results.push({
      name: 'ساخت مربع',
      passed: move4.success && move4.filled > 0,
      message: move4.success && move4.filled > 0 ? '✅ موفق' : '❌ خطا'
    });

    // تست 5: بازی با 3 بازیکن
    const game5 = new GameLogic(3, 3);
    const move5 = game5.makeMove(0, 0, true, 0);
    results.push({
      name: 'بازی با 3 بازیکن',
      passed: move5.success === true && game5.numPlayers === 3,
      message: move5.success ? '✅ موفق' : '❌ خطا'
    });

    setTestResults(results);
  };

  if (!gameStarted) {
    return (
      <div className="container">
        <h1>🧩 بازی مربع‌سازی</h1>
        <p style={{ textAlign: 'center', color: '#4a5568', marginBottom: '20px' }}>
          تنظیمات بازی را انتخاب کنید و شروع کنید!
        </p>
        <GameSettings onStartGame={handleStartGame} />
        <div style={{ marginTop: '20px' }}>
          <button onClick={runTests} style={{ 
            background: '#48bb78', 
            padding: '10px 20px',
            border: 'none',
            borderRadius: '40px',
            color: 'white',
            fontWeight: '700',
            cursor: 'pointer'
          }}>
            🧪 تست خودکار
          </button>
          {testResults.length > 0 && (
            <div style={{
              marginTop: '15px',
              background: '#fefcbf',
              padding: '15px',
              borderRadius: '12px'
            }}>
              <h4>📊 نتایج تست:</h4>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {testResults.map((r, i) => `${i+1}. ${r.name}: ${r.message}`).join('\n')}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>🧩 بازی مربع‌سازی</h1>
      
      <GameSettings 
        onStartGame={handleStartGame}
        initialGridSize={gridSize}
        initialPlayers={numPlayers}
      />

      <GameStatus
        scores={gameState.scores}
        currentPlayer={gameState.currentPlayer}
        gameOver={gameState.gameOver}
        winner={gameState.winner}
        playerColors={playerColors}
        numPlayers={numPlayers}
        remainingMoves={game?.getRemainingMoves() || 0}
      />

      {game && (
        <Board
          game={game}
          onMove={handlePlayerMove}
          playerColors={playerColors}
          gridSize={gridSize}
        />
      )}

      <div className="controls">
        <button onClick={resetGame}>🔄 بازی جدید</button>
        <button className="reset" onClick={() => { setGameStarted(false); setGame(null); }}>
          🏠 بازگشت به تنظیمات
        </button>
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
