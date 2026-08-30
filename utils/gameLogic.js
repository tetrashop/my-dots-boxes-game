export class GameLogic {
  constructor(gridSize = 4, numPlayers = 2) {
    // gridSize = تعداد نقاط در هر سطر/ستون (مثلاً 4 نقطه)
    // تعداد مربع‌ها = (gridSize - 1)² = 9 مربع
    this.gridSize = gridSize;
    this.numPlayers = numPlayers;
    this.reset();
  }

  reset() {
    const dots = this.gridSize;          // تعداد نقاط = 4
    const boxes = this.gridSize - 1;     // تعداد مربع‌ها در هر سطر = 3
    const totalBoxes = boxes * boxes;    // مجموع مربع‌ها = 9
    
    // ===== خطوط افقی: boxes ردیف × dots ستون =====
    // هر خط افقی بین دو نقطه مجاور در یک سطر
    this.horizontalLines = Array.from({ length: boxes }, () => Array(dots).fill(false));
    
    // ===== خطوط عمودی: dots ردیف × boxes ستون =====
    // هر خط عمودی بین دو نقطه مجاور در یک ستون
    this.verticalLines = Array.from({ length: dots }, () => Array(boxes).fill(false));
    
    // ===== مربع‌ها: boxes × boxes =====
    this.boxes = Array.from({ length: boxes }, () => Array(boxes).fill(0));
    this.scores = Array(this.numPlayers).fill(0);
    this.currentPlayer = 0;
    this.gameOver = false;
    this.moveHistory = [];
    this.totalMoves = 0;
    this.lastFilledBoxes = [];
    this.totalBoxes = totalBoxes;
  }

  makeMove(row, col, isHorizontal, player) {
    if (this.gameOver) return { success: false, reason: 'game_over' };
    if (player !== this.currentPlayer) return { success: false, reason: 'wrong_turn' };

    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    
    // ===== اعتبارسنجی دقیق موقعیت =====
    if (isHorizontal) {
      // خط افقی: ردیف 0 تا boxes-1، ستون 0 تا dots-1
      if (row < 0 || row >= boxes || col < 0 || col >= dots)
        return { success: false, reason: 'invalid_position' };
      if (this.horizontalLines[row][col])
        return { success: false, reason: 'already_drawn' };
      this.horizontalLines[row][col] = true;
    } else {
      // خط عمودی: ردیف 0 تا dots-1، ستون 0 تا boxes-1
      if (row < 0 || row >= dots || col < 0 || col >= boxes)
        return { success: false, reason: 'invalid_position' };
      if (this.verticalLines[row][col])
        return { success: false, reason: 'already_drawn' };
      this.verticalLines[row][col] = true;
    }

    this.totalMoves++;
    this.moveHistory.push({ row, col, isHorizontal, player });
    
    // ===== بررسی مربع‌های ساخته شده =====
    const filledBoxes = this.checkAndFillBoxes(row, col, isHorizontal, player + 1);
    const filledCount = filledBoxes.length;
    this.lastFilledBoxes = filledBoxes;

    // ===== قانون امتیازدهی و نوبت‌گیری =====
    if (filledCount > 0) {
      // اگر مربعی ساخته شد، امتیاز می‌گیرد و دوباره حرکت می‌کند
      // هیچ امتیازی کسر نمی‌شود
    } else {
      // اگر مربعی ساخته نشد، نوبت به بازیکن بعدی می‌رود
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
    const boxes = this.gridSize - 1;
    
    const checkBox = (r, c) => {
      if (r < 0 || r >= boxes || c < 0 || c >= boxes) return false;
      if (this.boxes[r][c] !== 0) return false;
      
      // چهار ضلع مربع:
      // بالا: horizontalLines[r][c]
      // پایین: horizontalLines[r+1][c]
      // چپ: verticalLines[r][c]
      // راست: verticalLines[r][c+1]
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
      // مربع بالا (اگر ردیف > 0)
      if (row > 0) checkBox(row - 1, col);
      // مربع پایین (اگر ردیف < boxes-1)
      if (row < boxes) checkBox(row, col);
    } else {
      // مربع چپ (اگر ستون > 0)
      if (col > 0) checkBox(row, col - 1);
      // مربع راست (اگر ستون < boxes-1)
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

    // ===== ارزیابی حرکات =====
    const evaluated = allMoves.map(move => {
      const myFilled = this.simulateMove(move.row, move.col, move.isHorizontal, player + 1);
      return {
        ...move,
        myScore: myFilled.length
      };
    });

    // ===== اولویت با حرکتی که بیشترین مربع را بسازد =====
    evaluated.sort((a, b) => b.myScore - a.myScore);
    
    const maxScore = evaluated[0]?.myScore || 0;
    const bestMoves = evaluated.filter(m => m.myScore === maxScore);
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

  // ===== تشخیص خطاهای هوش مصنوعی =====
  detectError(move, player) {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    
    if (move.isHorizontal) {
      if (move.row < 0 || move.row >= boxes || move.col < 0 || move.col >= dots)
        return { error: true, reason: 'invalid_position' };
      if (this.horizontalLines[move.row][move.col])
        return { error: true, reason: 'already_drawn' };
    } else {
      if (move.row < 0 || move.row >= dots || move.col < 0 || move.col >= boxes)
        return { error: true, reason: 'invalid_position' };
      if (this.verticalLines[move.row][move.col])
        return { error: true, reason: 'already_drawn' };
    }
    
    return { error: false };
  }

  // ===== کسر امتیاز برای حرکات اشتباه =====
  penalizePlayer(player) {
    if (player < 0 || player >= this.numPlayers) return;
    this.scores[player] = Math.max(0, this.scores[player] - 1);
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
