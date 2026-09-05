export class GameLogic {
  constructor(gridSize = 4, numPlayers = 2) {
    this.gridSize = gridSize;          // تعداد نقاط در هر سطر/ستون
    this.numPlayers = numPlayers;
    this.reset();
  }

  reset() {
    const dots = this.gridSize;          // تعداد نقاط
    const boxes = this.gridSize - 1;     // تعداد مربع‌ها در هر سطر/ستون
    
    // ===== آرایه‌های خطوط =====
    // خطوط افقی: (boxes) ردیف × (dots) ستون
    this.horizontalLines = Array.from({ length: boxes }, () => Array(dots).fill(false));
    // خطوط عمودی: (dots) ردیف × (boxes) ستون
    this.verticalLines = Array.from({ length: dots }, () => Array(boxes).fill(false));
    // مربع‌ها: (boxes) × (boxes)
    this.boxes = Array.from({ length: boxes }, () => Array(boxes).fill(0));
    this.scores = Array(this.numPlayers).fill(0);
    this.currentPlayer = 0;
    this.gameOver = false;
    this.moveHistory = [];
    this.totalMoves = 0;
  }

  // ===== اعتبارسنجی حرکت (قانون: مجاور بودن و نبودن یال) =====
  validateMove(row, col, isHorizontal) {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    
    // بررسی محدوده
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
    // مجاور بودن با توجه به isHorizontal تضمین شده است
    // درجه رأس‌ها محدودیتی ندارد
    return { valid: true };
  }

  // ===== حرکت اصلی (با رعایت قانون نوبت‌گیری) =====
  makeMove(row, col, isHorizontal, player) {
    if (this.gameOver) return { success: false, reason: 'game_over' };
    if (player !== this.currentPlayer) return { success: false, reason: 'wrong_turn' };

    const validation = this.validateMove(row, col, isHorizontal);
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    // ثبت خط
    if (isHorizontal) {
      this.horizontalLines[row][col] = true;
    } else {
      this.verticalLines[row][col] = true;
    }

    this.totalMoves++;
    this.moveHistory.push({ row, col, isHorizontal, player });
    
    // بررسی مربع‌های ساخته شده
    const filledBoxes = this.checkAndFillBoxes(row, col, isHorizontal, player + 1);
    const filledCount = filledBoxes.length;

    // ===== قانون نوبت‌گیری: اگر مربعی ساخته شد، نوبت عوض نمی‌شود =====
    if (filledCount === 0) {
      this.currentPlayer = (this.currentPlayer + 1) % this.numPlayers;
    }
    // در غیر این صورت، همان بازیکن ادامه می‌دهد

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

  // ===== بررسی و پر کردن مربع‌ها =====
  checkAndFillBoxes(row, col, isHorizontal, player) {
    const filledBoxes = [];
    const boxes = this.gridSize - 1;
    
    const checkBox = (r, c) => {
      if (r < 0 || r >= boxes || c < 0 || c >= boxes) return false;
      if (this.boxes[r][c] !== 0) return false;
      
      // چهار ضلع مربع
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

    // بررسی مربع‌های مجاور خط رسم‌شده
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

  // ===== هوش مصنوعی با اولویت مربع‌سازی =====
  getAIMove(player) {
    if (this.currentPlayer !== player) return null;
    
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    const allMoves = [];
    
    // جمع‌آوری تمام حرکات مجاز
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

    // ارزیابی: اولویت با حرکتی که مربع می‌سازد
    const evaluated = allMoves.map(move => {
      const filled = this.simulateMove(move.row, move.col, move.isHorizontal, player + 1);
      return { ...move, score: filled.length };
    });

    evaluated.sort((a, b) => b.score - a.score);
    const bestScore = evaluated[0]?.score || 0;
    const bestMoves = evaluated.filter(m => m.score === bestScore);
    
    return bestMoves[Math.floor(Math.random() * bestMoves.length)] || allMoves[0];
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
