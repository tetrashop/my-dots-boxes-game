/**
 * GameLogic - منطق کامل بازی مربع‌سازی
 * قوانین:
 * - با gridSize نقطه، تعداد مربع‌ها (gridSize-1)² است
 * - خطوط افقی: gridSize ردیف × (gridSize-1) ستون
 * - خطوط عمودی: (gridSize-1) ردیف × gridSize ستون
 * - اگر بازیکنی مربع بسازد، دوباره حرکت می‌کند
 * - حرکت فقط بین دو نقطه مجاور بدون یال مجاز است
 */
export class GameLogic {
  constructor(gridSize = 4, numPlayers = 2) {
    this.gridSize = Math.max(3, Math.min(8, gridSize));
    this.numPlayers = Math.max(2, Math.min(4, numPlayers));
    this.reset();
  }

  reset() {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;

    // خطوط افقی: dots ردیف × boxes ستون
    this.horizontalLines = Array.from({ length: dots }, () =>
      Array(boxes).fill(false)
    );
    // خطوط عمودی: boxes ردیف × dots ستون
    this.verticalLines = Array.from({ length: boxes }, () =>
      Array(dots).fill(false)
    );
    // مربع‌ها: boxes × boxes
    this.boxes = Array.from({ length: boxes }, () =>
      Array(boxes).fill(0)
    );

    this.scores = Array(this.numPlayers).fill(0);
    this.currentPlayer = 0;
    this.gameOver = false;
    this.totalMoves = 0;
    this.lastFilled = [];
  }

  /**
   * اعتبارسنجی حرکت
   */
  isValidMove(row, col, isHorizontal) {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;

    if (isHorizontal) {
      if (row < 0 || row >= dots) return false;
      if (col < 0 || col >= boxes) return false;
      return !this.horizontalLines[row][col];
    } else {
      if (row < 0 || row >= boxes) return false;
      if (col < 0 || col >= dots) return false;
      return !this.verticalLines[row][col];
    }
  }

  /**
   * اجرای حرکت
   */
  makeMove(row, col, isHorizontal, player) {
    if (this.gameOver) return { success: false, reason: 'game_over' };
    if (player !== this.currentPlayer) return { success: false, reason: 'wrong_turn' };
    if (!this.isValidMove(row, col, isHorizontal)) {
      return { success: false, reason: 'invalid_move' };
    }

    // ثبت خط
    if (isHorizontal) {
      this.horizontalLines[row][col] = true;
    } else {
      this.verticalLines[row][col] = true;
    }

    this.totalMoves++;

    // بررسی مربع‌های جدید
    const filled = this.checkNewBoxes(row, col, isHorizontal, player + 1);
    this.lastFilled = filled;

    // اگر مربعی ساخته نشد، نوبت عوض می‌شود
    if (filled.length === 0) {
      this.currentPlayer = (this.currentPlayer + 1) % this.numPlayers;
    }

    // بررسی پایان بازی
    if (this.checkGameOver()) {
      this.gameOver = true;
    }

    return {
      success: true,
      filled: filled.length,
      filledBoxes: filled,
      gameOver: this.gameOver,
      scores: [...this.scores],
      currentPlayer: this.currentPlayer,
    };
  }

  /**
   * بررسی مربع‌های جدید (بعد از یک حرکت)
   */
  checkNewBoxes(row, col, isHorizontal, player) {
    const boxes = this.gridSize - 1;
    const filled = [];

    const checkBox = (r, c) => {
      if (r < 0 || r >= boxes || c < 0 || c >= boxes) return;
      if (this.boxes[r][c] !== 0) return;

      const top = this.horizontalLines[r][c];
      const bottom = this.horizontalLines[r + 1][c];
      const left = this.verticalLines[r][c];
      const right = this.verticalLines[r][c + 1];

      if (top && bottom && left && right) {
        this.boxes[r][c] = player;
        this.scores[player - 1]++;
        filled.push({ row: r, col: c });
      }
    };

    if (isHorizontal) {
      // خط افقی: بررسی مربع بالا و پایین
      checkBox(row - 1, col); // بالا
      checkBox(row, col);     // پایین
    } else {
      // خط عمودی: بررسی مربع چپ و راست
      checkBox(row, col - 1); // چپ
      checkBox(row, col);     // راست
    }

    return filled;
  }

  /**
   * بررسی پایان بازی
   */
  checkGameOver() {
    const boxes = this.gridSize - 1;
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < boxes; c++) {
        if (this.boxes[r][c] === 0) return false;
      }
    }
    return true;
  }

  /**
   * برنده بازی
   */
  getWinner() {
    if (!this.gameOver) return null;
    const max = Math.max(...this.scores);
    const winners = [];
    for (let i = 0; i < this.scores.length; i++) {
      if (this.scores[i] === max) winners.push(i);
    }
    return winners.length === 1 ? winners[0] : -1;
  }

  /**
   * تعداد حرکات باقیمانده
   */
  getRemainingMoves() {
    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    let count = 0;
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < boxes; c++) {
        if (!this.horizontalLines[r][c]) count++;
      }
    }
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < dots; c++) {
        if (!this.verticalLines[r][c]) count++;
      }
    }
    return count;
  }

  /**
   * هوش مصنوعی: با اولویت مربع‌سازی و اجتناب از دادن فرصت به حریف
   */
  getAIMove(player) {
    if (this.currentPlayer !== player) return null;
    if (this.gameOver) return null;

    const dots = this.gridSize;
    const boxes = this.gridSize - 1;
    const moves = [];

    // جمع‌آوری تمام حرکات مجاز
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < boxes; c++) {
        if (!this.horizontalLines[r][c]) {
          moves.push({ row: r, col: c, isHorizontal: true });
        }
      }
    }
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < dots; c++) {
        if (!this.verticalLines[r][c]) {
          moves.push({ row: r, col: c, isHorizontal: false });
        }
      }
    }

    if (moves.length === 0) return null;

    // رتبه‌بندی حرکات
    const ranked = moves.map((move) => {
      // شبیه‌سازی حرکت
      const fills = this.simulateMove(move.row, move.col, move.isHorizontal, player + 1);
      return { ...move, myScore: fills.length };
    });

    // اولویت: حرکاتی که بیشترین مربع را می‌سازند
    ranked.sort((a, b) => b.myScore - a.myScore);

    // بین حرکات با امتیاز بالا، تصادفی انتخاب کن
    const topScore = ranked[0].myScore;
    const best = ranked.filter((m) => m.myScore === topScore);

    return best[Math.floor(Math.random() * best.length)];
  }

  /**
   * شبیه‌سازی حرکت (بدون تغییر حالت)
   */
  simulateMove(row, col, isHorizontal, player) {
    const backupH = this.horizontalLines.map((r) => [...r]);
    const backupV = this.verticalLines.map((r) => [...r]);
    const backupB = this.boxes.map((r) => [...r]);

    if (isHorizontal) {
      this.horizontalLines[row][col] = true;
    } else {
      this.verticalLines[row][col] = true;
    }

    const filled = this.checkNewBoxes(row, col, isHorizontal, player);

    // بازگرداندن
    this.horizontalLines = backupH;
    this.verticalLines = backupV;
    this.boxes = backupB;

    return filled;
  }
}
