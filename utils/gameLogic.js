export class GameLogic {
  constructor(gridSize = 4, numPlayers = 2) {
    this.gridSize = gridSize;
    this.numPlayers = numPlayers;
    this.reset();
  }

  reset() {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    
    // ===== ماتریس‌های بازی =====
    this.horizontalLines = Array.from({ length: boxes }, () => Array(dots).fill(false));
    this.verticalLines = Array.from({ length: dots }, () => Array(boxes).fill(false));
    this.boxes = Array.from({ length: boxes }, () => Array(boxes).fill(0));
    this.scores = Array(this.numPlayers).fill(0);
    this.currentPlayer = 0;
    this.gameOver = false;
    this.moveHistory = [];
    this.totalMoves = 0;
    this.totalBoxes = boxes * boxes;
    
    // ===== هوش مصنوعی =====
    this.aiMemory = [];
    this.aiLearningRate = 0.1;
    this.aiDiscountFactor = 0.9;
    this.aiExplorationRate = 0.2;
  }

  // ===== حرکت اصلی =====
  makeMove(row, col, isHorizontal, player) {
    if (this.gameOver) return { success: false, reason: 'game_over' };
    if (player !== this.currentPlayer) return { success: false, reason: 'wrong_turn' };

    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    
    // ===== اعتبارسنجی =====
    const validation = this.validateMove(row, col, isHorizontal);
    if (!validation.valid) {
      // کسر امتیاز برای حرکت اشتباه
      this.penalizePlayer(player);
      return { success: false, reason: validation.reason };
    }

    // ===== ثبت حرکت =====
    if (isHorizontal) {
      this.horizontalLines[row][col] = true;
    } else {
      this.verticalLines[row][col] = true;
    }

    this.totalMoves++;
    this.moveHistory.push({ row, col, isHorizontal, player });
    
    // ===== بررسی مربع‌ها =====
    const filledBoxes = this.checkAndFillBoxes(row, col, isHorizontal, player + 1);
    const filledCount = filledBoxes.length;

    // ===== قانون نوبت‌گیری (حتی اگر مربع ساخته شود) =====
    this.currentPlayer = (this.currentPlayer + 1) % this.numPlayers;

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

  // ===== اعتبارسنجی حرکت =====
  validateMove(row, col, isHorizontal) {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    
    if (isHorizontal) {
      if (row < 0 || row >= boxes || col < 0 || col >= dots)
        return { valid: false, reason: 'invalid_position' };
      if (this.horizontalLines[row][col])
        return { valid: false, reason: 'already_drawn' };
    } else {
      if (row < 0 || row >= dots || col < 0 || col >= boxes)
        return { valid: false, reason: 'invalid_position' };
      if (this.verticalLines[row][col])
        return { valid: false, reason: 'already_drawn' };
    }
    return { valid: true };
  }

  // ===== کسر امتیاز برای حرکات اشتباه =====
  penalizePlayer(player) {
    if (player < 0 || player >= this.numPlayers) return;
    this.scores[player] = Math.max(0, this.scores[player] - 1);
  }

  // ===== بررسی مربع‌ها =====
  checkAndFillBoxes(row, col, isHorizontal, player) {
    const filledBoxes = [];
    const boxes = this.gridSize - 1;
    
    const checkBox = (r, c) => {
      if (r < 0 || r >= boxes || c < 0 || c >= boxes) return false;
      if (this.boxes[r][c] !== 0) return false;
      
      const top = this.horizontalLines[r]?.[c] || false;
      const bottom = (r + 1 < this.horizontalLines.length) ? this.horizontalLines[r + 1]?.[c] || false : false;
      const left = this.verticalLines[r]?.[c] || false;
      const right = this.verticalLines[r]?.[c + 1] || false;
      
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

  // ===== هوش مصنوعی Q-Learning =====
  getAIMove(player) {
    if (this.currentPlayer !== player) return null;
    
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    const allMoves = [];
    
    // ===== جمع‌آوری تمام حرکات ممکن =====
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < dots; c++) {
        if (!this.horizontalLines[r][c]) {
          allMoves.push({ row: r, col: c, isHorizontal: true });
        }
      }
    }
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < boxes; c++) {
        if (!this.verticalLines[r][c]) {
          allMoves.push({ row: r, col: c, isHorizontal: false });
        }
      }
    }

    if (allMoves.length === 0) return null;

    // ===== ارزیابی با Q-Learning =====
    const evaluated = allMoves.map(move => {
      const moveKey = `${move.row},${move.col},${move.isHorizontal}`;
      const existingQ = this.aiMemory.find(m => m.key === moveKey);
      const qValue = existingQ ? existingQ.q : 0;
      
      const myFilled = this.simulateMove(move.row, move.col, move.isHorizontal, player + 1);
      
      // ===== ترکیب Q-Value و امتیاز مربع =====
      const score = (qValue * this.aiLearningRate) + (myFilled.length * 10);
      
      return {
        ...move,
        qValue,
        score,
        myFilled: myFilled.length
      };
    });

    // ===== انتخاب با ε-greedy =====
    const shouldExplore = Math.random() < this.aiExplorationRate;
    
    if (shouldExplore) {
      // حرکت تصادفی (اکتشاف)
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    } else {
      // بهترین حرکت (استخراج)
      evaluated.sort((a, b) => b.score - a.score);
      const bestMove = evaluated[0];
      
      // ===== به‌روزرسانی Q-Learning =====
      if (bestMove) {
        const moveKey = `${bestMove.row},${bestMove.col},${bestMove.isHorizontal}`;
        const existing = this.aiMemory.find(m => m.key === moveKey);
        const reward = bestMove.myFilled * 10 - 1;
        const newQ = (existing ? existing.q : 0) + this.aiLearningRate * (reward + this.aiDiscountFactor * 0 - (existing ? existing.q : 0));
        
        if (existing) {
          existing.q = newQ;
        } else {
          this.aiMemory.push({ key: moveKey, q: newQ });
        }
      }
      
      return bestMove || allMoves[0];
    }
  }

  // ===== شبیه‌سازی حرکت =====
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
    const boxes = this.gridSize - 1;
    
    const checkBox = (r, c) => {
      if (r < 0 || r >= boxes || c < 0 || c >= boxes) return;
      if (this.boxes[r][c] !== 0) return;
      const top = this.horizontalLines[r]?.[c] || false;
      const bottom = (r + 1 < this.horizontalLines.length) ? this.horizontalLines[r + 1]?.[c] || false : false;
      const left = this.verticalLines[r]?.[c] || false;
      const right = this.verticalLines[r]?.[c + 1] || false;
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

  checkGameOver() {
    const boxes = this.gridSize - 1;
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

  getRemainingMoves() {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    let count = 0;
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < dots; c++) {
        if (!this.horizontalLines[r][c]) count++;
      }
    }
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < boxes; c++) {
        if (!this.verticalLines[r][c]) count++;
      }
    }
    return count;
  }
}
