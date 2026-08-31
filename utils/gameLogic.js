export class GameLogic {
  constructor(gridSize = 4, numPlayers = 2) {
    this.gridSize = gridSize;
    this.numPlayers = numPlayers;
    this.reset();
  }

  reset() {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    
    this.horizontalLines = Array.from({ length: boxes }, () => Array(dots).fill(false));
    this.verticalLines = Array.from({ length: dots }, () => Array(boxes).fill(false));
    this.boxes = Array.from({ length: boxes }, () => Array(boxes).fill(0));
    this.scores = Array(this.numPlayers).fill(0);
    this.currentPlayer = 0;
    this.gameOver = false;
    this.moveHistory = [];
    this.totalMoves = 0;
    this.totalBoxes = boxes * boxes;
    
    // حافظه هوش مصنوعی
    this.aiMemory = [];
    this.aiLearningRate = 0.1;
    this.aiDiscountFactor = 0.9;
    this.aiExplorationRate = 0.2;
  }

  // ===== محاسبه درجه یک رأس =====
  getDegree(row, col) {
    let degree = 0;
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    
    // بررسی خط افقی چپ
    if (col > 0 && this.horizontalLines[row]?.[col - 1]) degree++;
    // بررسی خط افقی راست
    if (col < dots - 1 && this.horizontalLines[row]?.[col]) degree++;
    // بررسی خط عمودی بالا
    if (row > 0 && this.verticalLines[row - 1]?.[col]) degree++;
    // بررسی خط عمودی پایین
    if (row < dots - 1 && this.verticalLines[row]?.[col]) degree++;
    
    return degree;
  }

  // ===== اعتبارسنجی حرکت (بر اساس قانون جدید) =====
  validateMove(row, col, isHorizontal) {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    
    // ===== ۱. بررسی محدوده =====
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

    // ===== ۲. بررسی درجه رأس‌ها (قانون جدید) =====
    // دو رأس مجاور را پیدا کن
    let r1, c1, r2, c2;
    if (isHorizontal) {
      r1 = row; c1 = col;
      r2 = row; c2 = col + 1;
    } else {
      r1 = row; c1 = col;
      r2 = row + 1; c2 = col;
    }

    // درجه دو رأس
    const deg1 = this.getDegree(r1, c1);
    const deg2 = this.getDegree(r2, c2);

    // قانون جدید: حرکت مجاز است اگر:
    // ۱. یال بین دو رأس وجود نداشته باشد (قبلاً بررسی شد)
    // ۲. رأس‌ها مجاور باشند (با توجه به isHorizontal، مجاور هستند)
    // ۳. درجه هر دو رأس می‌تواند هر مقداری داشته باشد، هیچ محدودیتی نیست!
    // فقط شرط نبودن یال کافی است

    return { valid: true };
  }

  // ===== حرکت اصلی =====
  makeMove(row, col, isHorizontal, player) {
    if (this.gameOver) return { success: false, reason: 'game_over' };
    if (player !== this.currentPlayer) return { success: false, reason: 'wrong_turn' };

    const validation = this.validateMove(row, col, isHorizontal);
    if (!validation.valid) {
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
    
    const filledBoxes = this.checkAndFillBoxes(row, col, isHorizontal, player + 1);
    const filledCount = filledBoxes.length;

    // ===== نوبت بعدی =====
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

  // ===== کسر امتیاز =====
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

  // ===== هوش مصنوعی =====
  getAIMove(player) {
    if (this.currentPlayer !== player) return null;
    
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    const allMoves = [];
    
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

    const evaluated = allMoves.map(move => {
      const myFilled = this.simulateMove(move.row, move.col, move.isHorizontal, player + 1);
      
      // محاسبه درجه‌های رأس‌ها برای ارزیابی بهتر
      let degreeScore = 0;
      if (move.isHorizontal) {
        degreeScore += this.getDegree(move.row, move.col);
        degreeScore += this.getDegree(move.row, move.col + 1);
      } else {
        degreeScore += this.getDegree(move.row, move.col);
        degreeScore += this.getDegree(move.row + 1, move.col);
      }
      
      return {
        ...move,
        myScore: myFilled.length,
        degreeScore: degreeScore
      };
    });

    // اولویت: مربع‌سازی > درجه رأس‌ها
    evaluated.sort((a, b) => {
      if (b.myScore !== a.myScore) return b.myScore - a.myScore;
      return b.degreeScore - a.degreeScore;
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
