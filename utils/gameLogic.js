export class GameLogic {
  constructor(gridSize = 4, numPlayers = 2) {
    // gridSize = تعداد نقاط در هر ردیف/ستون (مثلاً ۴ نقطه)
    // تعداد مربع‌ها = gridSize (مثلاً ۴ مربع)
    this.gridSize = gridSize;
    this.numPlayers = numPlayers;
    this.reset();
  }

  reset() {
    const dots = this.gridSize;           // تعداد نقاط = gridSize
    const boxes = this.gridSize;          // تعداد مربع‌ها = gridSize
    
    // خطوط افقی: boxes ردیف × (boxes) ستون (بین نقاط)
    this.horizontalLines = Array.from({ length: boxes }, () => Array(boxes).fill(false));
    // خطوط عمودی: boxes ردیف × boxes ستون (بین نقاط)
    this.verticalLines = Array.from({ length: boxes }, () => Array(boxes).fill(false));
    // مربع‌ها: boxes × boxes
    this.boxes = Array.from({ length: boxes }, () => Array(boxes).fill(0));
    this.scores = Array(this.numPlayers).fill(0);
    this.currentPlayer = 0;
    this.gameOver = false;
    this.moveHistory = [];
    this.totalMoves = 0;
  }

  makeMove(row, col, isHorizontal, player) {
    if (this.gameOver) return { success: false, reason: 'game_over' };
    if (player !== this.currentPlayer) return { success: false, reason: 'wrong_turn' };

    const boxes = this.gridSize;      // تعداد مربع‌ها
    
    if (isHorizontal) {
      // ردیف: 0 تا boxes-1، ستون: 0 تا boxes-1
      if (row < 0 || row >= boxes || col < 0 || col >= boxes)
        return { success: false, reason: 'invalid_position' };
      if (this.horizontalLines[row][col])
        return { success: false, reason: 'already_drawn' };
      this.horizontalLines[row][col] = true;
    } else {
      // ردیف: 0 تا boxes-1، ستون: 0 تا boxes-1
      if (row < 0 || row >= boxes || col < 0 || col >= boxes)
        return { success: false, reason: 'invalid_position' };
      if (this.verticalLines[row][col])
        return { success: false, reason: 'already_drawn' };
      this.verticalLines[row][col] = true;
    }

    this.totalMoves++;
    this.moveHistory.push({ row, col, isHorizontal, player });
    
    const filledBoxes = this.checkAndFillBoxes(row, col, isHorizontal, player + 1);
    const filledCount = filledBoxes.length;

    if (filledCount === 0) {
      this.currentPlayer = (this.currentPlayer + 1) % this.numPlayers;
    }

    this.gameOver = this.checkGameOver();

    return {
      success: true,
      filled: filledCount,
      filledBoxes,
      gameOver: this.gameOver,
      scores: [...this.scores],
      currentPlayer: this.currentPlayer
    };
  }

  checkAndFillBoxes(row, col, isHorizontal, player) {
    const filledBoxes = [];
    const boxes = this.gridSize;      // تعداد مربع‌ها
    
    const checkBox = (r, c) => {
      if (r < 0 || r >= boxes || c < 0 || c >= boxes) return false;
      if (this.boxes[r][c] !== 0) return false;
      
      const top = this.horizontalLines[r]?.[c] || false;
      const bottom = (r + 1 < boxes) ? this.horizontalLines[r + 1]?.[c] || false : false;
      const left = this.verticalLines[r]?.[c] || false;
      const right = (c + 1 < boxes) ? this.verticalLines[r]?.[c + 1] || false : false;
      
      if (top && bottom && left && right) {
        this.boxes[r][c] = player;
        this.scores[player - 1]++;
        filledBoxes.push({ row: r, col: c });
        return true;
      }
      return false;
    };

    if (isHorizontal) {
      if (row > 0) checkBox(row - 1, col);
      if (row < boxes) checkBox(row, col);
    } else {
      if (col > 0) checkBox(row, col - 1);
      if (col < boxes) checkBox(row, col);
    }
    
    return filledBoxes;
  }

  checkGameOver() {
    const boxes = this.gridSize;
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < boxes; c++) {
        if (this.boxes[r][c] === 0) return false;
      }
    }
    return true;
  }

  getWinner() {
    if (!this.gameOver) return null;
    const maxScore = Math.max(...this.scores);
    const winners = this.scores.map((s, i) => s === maxScore ? i : -1).filter(i => i >= 0);
    return winners.length === 1 ? winners[0] : -1;
  }

  getAIMove(player) {
    if (this.currentPlayer !== player) return null;
    
    const boxes = this.gridSize;
    const allMoves = [];
    
    // خطوط افقی: boxes ردیف × boxes ستون
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < boxes; c++) {
        if (!this.horizontalLines[r][c]) {
          allMoves.push({ row: r, col: c, isHorizontal: true });
        }
      }
    }
    // خطوط عمودی: boxes ردیف × boxes ستون
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < boxes; c++) {
        if (!this.verticalLines[r][c]) {
          allMoves.push({ row: r, col: c, isHorizontal: false });
        }
      }
    }

    if (allMoves.length === 0) return null;

    const evaluated = allMoves.map(move => {
      const myFilled = this.simulateMove(move.row, move.col, move.isHorizontal, player + 1);
      
      let opponentThreat = 0;
      const backupH = this.horizontalLines.map(row => [...row]);
      const backupV = this.verticalLines.map(row => [...row]);
      const backupB = this.boxes.map(row => [...row]);
      const backupS = [...this.scores];
      
      if (move.isHorizontal) {
        this.horizontalLines[move.row][move.col] = true;
      } else {
        this.verticalLines[move.row][move.col] = true;
      }
      
      const opponent = (player + 1) % this.numPlayers;
      for (let r = 0; r < boxes; r++) {
        for (let c = 0; c < boxes; c++) {
          if (!this.horizontalLines[r][c]) {
            const oppFilled = this.simulateMove(r, c, true, opponent + 1);
            opponentThreat += oppFilled.length;
          }
        }
      }
      for (let r = 0; r < boxes; r++) {
        for (let c = 0; c < boxes; c++) {
          if (!this.verticalLines[r][c]) {
            const oppFilled = this.simulateMove(r, c, false, opponent + 1);
            opponentThreat += oppFilled.length;
          }
        }
      }
      
      this.horizontalLines = backupH;
      this.verticalLines = backupV;
      this.boxes = backupB;
      this.scores = backupS;
      
      return {
        ...move,
        myScore: myFilled.length,
        opponentThreat: opponentThreat
      };
    });

    evaluated.sort((a, b) => {
      const scoreA = a.myScore * 10 - a.opponentThreat * 5;
      const scoreB = b.myScore * 10 - b.opponentThreat * 5;
      return scoreB - scoreA;
    });

    return evaluated[0] || allMoves[0];
  }

  simulateMove(row, col, isHorizontal, player) {
    const backupH = this.horizontalLines.map(row => [...row]);
    const backupV = this.verticalLines.map(row => [...row]);
    const backupB = this.boxes.map(row => [...row]);
    const backupS = [...this.scores];
    
    if (isHorizontal) {
      this.horizontalLines[row][col] = true;
    } else {
      this.verticalLines[row][col] = true;
    }
    
    const filled = [];
    const boxes = this.gridSize;
    
    const checkBox = (r, c) => {
      if (r < 0 || r >= boxes || c < 0 || c >= boxes) return;
      if (this.boxes[r][c] !== 0) return;
      const top = this.horizontalLines[r]?.[c] || false;
      const bottom = (r + 1 < boxes) ? this.horizontalLines[r + 1]?.[c] || false : false;
      const left = this.verticalLines[r]?.[c] || false;
      const right = (c + 1 < boxes) ? this.verticalLines[r]?.[c + 1] || false : false;
      if (top && bottom && left && right) {
        this.boxes[r][c] = player;
        this.scores[player - 1]++;
        filled.push({ row: r, col: c });
      }
    };
    
    if (isHorizontal) {
      if (row > 0) checkBox(row - 1, col);
      if (row < boxes) checkBox(row, col);
    } else {
      if (col > 0) checkBox(row, col - 1);
      if (col < boxes) checkBox(row, col);
    }
    
    this.horizontalLines = backupH;
    this.verticalLines = backupV;
    this.boxes = backupB;
    this.scores = backupS;
    
    return filled;
  }

  getRemainingMoves() {
    const boxes = this.gridSize;
    let count = 0;
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < boxes; c++) {
        if (!this.horizontalLines[r][c]) count++;
      }
    }
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < boxes; c++) {
        if (!this.verticalLines[r][c]) count++;
      }
    }
    return count;
  }
}
