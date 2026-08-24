export class GameLogic {
  constructor(gridSize = 4, numPlayers = 2) {
    this.gridSize = gridSize;
    this.numPlayers = numPlayers;
    this.reset();
  }

  reset() {
    const size = this.gridSize - 1;
    this.horizontalLines = Array.from({ length: size }, () => Array(size).fill(false));
    this.verticalLines = Array.from({ length: size }, () => Array(size).fill(false));
    this.boxes = Array.from({ length: size }, () => Array(size).fill(0));
    this.scores = Array(this.numPlayers).fill(0);
    this.currentPlayer = 0;
    this.gameOver = false;
    this.moveHistory = [];
    this.totalMoves = 0;
  }

  makeMove(row, col, isHorizontal, player) {
    if (this.gameOver) return { success: false, reason: 'game_over' };
    if (player !== this.currentPlayer) return { success: false, reason: 'wrong_turn' };

    const size = this.gridSize - 1;
    if (isHorizontal) {
      if (row < 0 || row >= size || col < 0 || col >= size - 1) return { success: false, reason: 'invalid_position' };
      if (this.horizontalLines[row][col]) return { success: false, reason: 'already_drawn' };
      this.horizontalLines[row][col] = true;
    } else {
      if (row < 0 || row >= size - 1 || col < 0 || col >= size) return { success: false, reason: 'invalid_position' };
      if (this.verticalLines[row][col]) return { success: false, reason: 'already_drawn' };
      this.verticalLines[row][col] = true;
    }

    this.totalMoves++;
    this.moveHistory.push({ row, col, isHorizontal, player });
    const filledBoxes = this.checkAndFillBoxes(row, col, isHorizontal, player + 1);
    const filledCount = filledBoxes.length;
    this.currentPlayer = (this.currentPlayer + 1) % this.numPlayers;
    this.gameOver = this.checkGameOver();

    return { success: true, filled: filledCount, filledBoxes, gameOver: this.gameOver, scores: [...this.scores], currentPlayer: this.currentPlayer };
  }

  checkAndFillBoxes(row, col, isHorizontal, player) {
    const filledBoxes = [];
    const size = this.gridSize - 1;
    const checkBox = (r, c) => {
      if (r < 0 || r >= size || c < 0 || c >= size) return false;
      if (this.boxes[r][c] !== 0) return false;
      const top = this.horizontalLines[r]?.[c] || false;
      const bottom = (r + 1 < size) ? this.horizontalLines[r + 1]?.[c] || false : false;
      const left = this.verticalLines[r]?.[c] || false;
      const right = (c + 1 < size) ? this.verticalLines[r]?.[c + 1] || false : false;
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
      if (row < size) checkBox(row, col);
    } else {
      if (col > 0) checkBox(row, col - 1);
      if (col < size) checkBox(row, col);
    }
    return filledBoxes;
  }

  checkGameOver() {
    const size = this.gridSize - 1;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
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
    const size = this.gridSize - 1;
    let bestMoves = [], regularMoves = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size - 1; c++) {
        if (!this.horizontalLines[r][c]) {
          const filled = this.simulateMove(r, c, true, player + 1);
          if (filled.length > 0) bestMoves.push({ row: r, col: c, isHorizontal: true, priority: filled.length });
          else regularMoves.push({ row: r, col: c, isHorizontal: true });
        }
      }
    }
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size; c++) {
        if (!this.verticalLines[r][c]) {
          const filled = this.simulateMove(r, c, false, player + 1);
          if (filled.length > 0) bestMoves.push({ row: r, col: c, isHorizontal: false, priority: filled.length });
          else regularMoves.push({ row: r, col: c, isHorizontal: false });
        }
      }
    }
    if (bestMoves.length > 0) { bestMoves.sort((a, b) => b.priority - a.priority); return bestMoves[0]; }
    if (regularMoves.length === 0) return null;
    return regularMoves[Math.floor(Math.random() * regularMoves.length)];
  }

  simulateMove(row, col, isHorizontal, player) {
    const backupH = this.horizontalLines.map(row => [...row]);
    const backupV = this.verticalLines.map(row => [...row]);
    const backupB = this.boxes.map(row => [...row]);
    const backupS = [...this.scores];
    if (isHorizontal) this.horizontalLines[row][col] = true;
    else this.verticalLines[row][col] = true;
    const filled = [];
    const size = this.gridSize - 1;
    const checkBox = (r, c) => {
      if (r < 0 || r >= size || c < 0 || c >= size) return;
      if (this.boxes[r][c] !== 0) return;
      const top = this.horizontalLines[r]?.[c] || false;
      const bottom = (r + 1 < size) ? this.horizontalLines[r + 1]?.[c] || false : false;
      const left = this.verticalLines[r]?.[c] || false;
      const right = (c + 1 < size) ? this.verticalLines[r]?.[c + 1] || false : false;
      if (top && bottom && left && right) { this.boxes[r][c] = player; this.scores[player - 1]++; filled.push({ row: r, col: c }); }
    };
    if (isHorizontal) { if (row > 0) checkBox(row - 1, col); if (row < size) checkBox(row, col); }
    else { if (col > 0) checkBox(row, col - 1); if (col < size) checkBox(row, col); }
    this.horizontalLines = backupH;
    this.verticalLines = backupV;
    this.boxes = backupB;
    this.scores = backupS;
    return filled;
  }

  getRemainingMoves() {
    const size = this.gridSize - 1;
    let count = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size - 1; c++) {
        if (!this.horizontalLines[r][c]) count++;
      }
    }
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size; c++) {
        if (!this.verticalLines[r][c]) count++;
      }
    }
    return count;
  }
}
