export class GameLogic {
  constructor(gridSize = 4) {
    this.gridSize = gridSize;
    this.reset();
  }

  reset() {
    this.horizontalLines = Array.from({ length: this.gridSize - 1 }, () =>
      Array(this.gridSize - 1).fill(false)
    );
    this.verticalLines = Array.from({ length: this.gridSize - 1 }, () =>
      Array(this.gridSize - 1).fill(false)
    );
    this.boxes = Array.from({ length: this.gridSize - 1 }, () =>
      Array(this.gridSize - 1).fill(0)
    );
    this.scores = [0, 0];
    this.currentPlayer = 0;
    this.gameOver = false;
    this.moveHistory = [];
    this.lastFilledBoxes = [];
  }

  makeMove(row, col, isHorizontal, player) {
    if (this.gameOver) return { success: false, reason: 'game_over' };
    if (player !== this.currentPlayer) return { success: false, reason: 'wrong_turn' };

    // بررسی معتبر بودن حرکت
    if (isHorizontal) {
      if (row < 0 || row >= this.gridSize - 1 || col < 0 || col >= this.gridSize - 2)
        return { success: false, reason: 'invalid_position' };
      if (this.horizontalLines[row][col])
        return { success: false, reason: 'already_drawn' };
      this.horizontalLines[row][col] = true;
    } else {
      if (row < 0 || row >= this.gridSize - 2 || col < 0 || col >= this.gridSize - 1)
        return { success: false, reason: 'invalid_position' };
      if (this.verticalLines[row][col])
        return { success: false, reason: 'already_drawn' };
      this.verticalLines[row][col] = true;
    }

    this.moveHistory.push({ row, col, isHorizontal, player });
    
    // بررسی مربع‌ها
    const filledBoxes = this.checkAndFillBoxes(row, col, isHorizontal, player + 1);
    const filledCount = filledBoxes.length;
    
    // ثبت مربع‌های پر شده برای انیمیشن
    this.lastFilledBoxes = filledBoxes;

    // تغییر نوبت (اگر مربعی پر نشده باشد)
    if (filledCount === 0) {
      this.currentPlayer = 1 - this.currentPlayer;
    }

    // بررسی پایان بازی
    this.gameOver = this.checkGameOver();

    return {
      success: true,
      filled: filledCount,
      filledBoxes: filledBoxes,
      gameOver: this.gameOver,
      scores: this.scores,
      currentPlayer: this.currentPlayer
    };
  }

  checkAndFillBoxes(row, col, isHorizontal, player) {
    const filledBoxes = [];
    
    const checkBox = (r, c) => {
      if (r < 0 || r >= this.gridSize - 1 || c < 0 || c >= this.gridSize - 1) return false;
      if (this.boxes[r][c] !== 0) return false;
      
      const top = this.horizontalLines[r][c];
      const bottom = r + 1 < this.gridSize - 1 ? this.horizontalLines[r + 1][c] : false;
      const left = this.verticalLines[r][c];
      const right = c + 1 < this.gridSize - 1 ? this.verticalLines[r][c + 1] : false;
      
      if (top && bottom && left && right) {
        this.boxes[r][c] = player;
        this.scores[player - 1]++;
        filledBoxes.push({ row: r, col: c });
        return true;
      }
      return false;
    };

    if (isHorizontal) {
      // بررسی مربع بالا
      if (row > 0) checkBox(row - 1, col);
      // بررسی مربع پایین
      if (row < this.gridSize - 1) checkBox(row, col);
    } else {
      // بررسی مربع چپ
      if (col > 0) checkBox(row, col - 1);
      // بررسی مربع راست
      if (col < this.gridSize - 1) checkBox(row, col);
    }
    
    return filledBoxes;
  }

  checkGameOver() {
    // بررسی اینکه آیا همه مربع‌ها پر شده‌اند
    for (let r = 0; r < this.gridSize - 1; r++) {
      for (let c = 0; c < this.gridSize - 1; c++) {
        if (this.boxes[r][c] === 0) return false;
      }
    }
    return true;
  }

  getWinner() {
    if (!this.gameOver) return null;
    if (this.scores[0] > this.scores[1]) return 0;
    if (this.scores[1] > this.scores[0]) return 1;
    return -1;
  }

  // هوش مصنوعی
  getAIMove() {
    // اولویت با حرکت مربع‌ساز
    for (let r = 0; r < this.gridSize - 1; r++) {
      for (let c = 0; c < this.gridSize - 2; c++) {
        if (!this.horizontalLines[r][c]) {
          const filled = this.simulateMove(r, c, true);
          if (filled.length > 0) return { row: r, col: c, isHorizontal: true };
        }
      }
    }
    for (let r = 0; r < this.gridSize - 2; r++) {
      for (let c = 0; c < this.gridSize - 1; c++) {
        if (!this.verticalLines[r][c]) {
          const filled = this.simulateMove(r, c, false);
          if (filled.length > 0) return { row: r, col: c, isHorizontal: false };
        }
      }
    }

    // حرکت تصادفی
    let moves = [];
    for (let r = 0; r < this.gridSize - 1; r++) {
      for (let c = 0; c < this.gridSize - 2; c++) {
        if (!this.horizontalLines[r][c]) moves.push({ row: r, col: c, isHorizontal: true });
      }
    }
    for (let r = 0; r < this.gridSize - 2; r++) {
      for (let c = 0; c < this.gridSize - 1; c++) {
        if (!this.verticalLines[r][c]) moves.push({ row: r, col: c, isHorizontal: false });
      }
    }
    if (moves.length === 0) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  }

  simulateMove(row, col, isHorizontal) {
    const backupHorizontal = this.horizontalLines.map(row => [...row]);
    const backupVertical = this.verticalLines.map(row => [...row]);
    
    if (isHorizontal) {
      this.horizontalLines[row][col] = true;
    } else {
      this.verticalLines[row][col] = true;
    }
    
    const filled = [];
    const checkBox = (r, c) => {
      if (r < 0 || r >= this.gridSize - 1 || c < 0 || c >= this.gridSize - 1) return;
      if (this.boxes[r][c] !== 0) return;
      const top = this.horizontalLines[r][c];
      const bottom = r + 1 < this.gridSize - 1 ? this.horizontalLines[r + 1][c] : false;
      const left = this.verticalLines[r][c];
      const right = c + 1 < this.gridSize - 1 ? this.verticalLines[r][c + 1] : false;
      if (top && bottom && left && right) {
        filled.push({ row: r, col: c });
      }
    };
    
    if (isHorizontal) {
      if (row > 0) checkBox(row - 1, col);
      if (row < this.gridSize - 1) checkBox(row, col);
    } else {
      if (col > 0) checkBox(row, col - 1);
      if (col < this.gridSize - 1) checkBox(row, col);
    }
    
    // بازگرداندن وضعیت
    this.horizontalLines = backupHorizontal;
    this.verticalLines = backupVertical;
    
    return filled;
  }
}
