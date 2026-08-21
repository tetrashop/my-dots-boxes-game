import { useEffect, useRef, useState } from 'react';

export default function Board({ game, onMove, player1Color, player2Color }) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [dimensions, setDimensions] = useState({ size: 500, cellSize: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    setCtx(context);
    drawBoard(context, canvas);
  }, [game, player1Color, player2Color]);

  const drawBoard = (context, canvas) => {
    const size = canvas.width;
    const cellSize = size / (game.gridSize - 1);
    const offset = cellSize;

    context.clearRect(0, 0, size, size);

    // رسم نقاط
    for (let r = 0; r < game.gridSize; r++) {
      for (let c = 0; c < game.gridSize; c++) {
        context.beginPath();
        context.arc(offset + c * cellSize, offset + r * cellSize, 6, 0, 2 * Math.PI);
        context.fillStyle = '#2d3748';
        context.fill();
        context.shadowColor = 'rgba(0,0,0,0.1)';
        context.shadowBlur = 4;
        context.fill();
        context.shadowBlur = 0;
      }
    }

    // رسم خطوط افقی
    for (let r = 0; r < game.gridSize - 1; r++) {
      for (let c = 0; c < game.gridSize - 1; c++) {
        if (game.horizontalLines[r][c]) {
          const x1 = offset + c * cellSize;
          const y1 = offset + r * cellSize;
          const x2 = offset + (c + 1) * cellSize;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y1);
          context.strokeStyle = player1Color;
          context.lineWidth = 4;
          context.stroke();
        }
      }
    }

    // رسم خطوط عمودی
    for (let r = 0; r < game.gridSize - 1; r++) {
      for (let c = 0; c < game.gridSize - 1; c++) {
        if (game.verticalLines[r][c]) {
          const x1 = offset + c * cellSize;
          const y1 = offset + r * cellSize;
          const x2 = x1;
          const y2 = offset + (r + 1) * cellSize;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.strokeStyle = player2Color;
          context.lineWidth = 4;
          context.stroke();
        }
      }
    }

    // رسم مربع‌های پر شده
    for (let r = 0; r < game.gridSize - 1; r++) {
      for (let c = 0; c < game.gridSize - 1; c++) {
        if (game.boxes[r][c] !== 0) {
          const x = offset + c * cellSize;
          const y = offset + r * cellSize;
          const color = game.boxes[r][c] === 1 ? player1Color : player2Color;
          context.fillStyle = color + '40';
          context.fillRect(x, y, cellSize, cellSize);
          context.strokeStyle = color;
          context.lineWidth = 2;
          context.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }

    setDimensions({ size, cellSize, offset });
  };

  const handleCanvasClick = (e) => {
    if (game.gameOver || game.currentPlayer !== 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const { cellSize, offset } = dimensions;
    const threshold = 15;

    // پیدا کردن نزدیک‌ترین خط
    let best = null;
    let bestDist = Infinity;

    // خطوط افقی
    for (let r = 0; r < game.gridSize - 1; r++) {
      for (let c = 0; c < game.gridSize - 2; c++) {
        if (game.horizontalLines[r][c]) continue;
        const x1 = offset + c * cellSize;
        const y1 = offset + r * cellSize;
        const x2 = offset + (c + 1) * cellSize;
        const midX = (x1 + x2) / 2;
        const midY = y1;
        const dist = Math.hypot(mouseX - midX, mouseY - midY);
        if (dist < threshold && dist < bestDist) {
          bestDist = dist;
          best = { row: r, col: c, isHorizontal: true };
        }
      }
    }

    // خطوط عمودی
    for (let r = 0; r < game.gridSize - 2; r++) {
      for (let c = 0; c < game.gridSize - 1; c++) {
        if (game.verticalLines[r][c]) continue;
        const x1 = offset + c * cellSize;
        const y1 = offset + r * cellSize;
        const x2 = x1;
        const y2 = offset + (r + 1) * cellSize;
        const midX = x1;
        const midY = (y1 + y2) / 2;
        const dist = Math.hypot(mouseX - midX, mouseY - midY);
        if (dist < threshold && dist < bestDist) {
          bestDist = dist;
          best = { row: r, col: c, isHorizontal: false };
        }
      }
    }

    if (best) {
      onMove(best.row, best.col, best.isHorizontal);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && ctx) {
      drawBoard(ctx, canvas);
    }
  }, [game, player1Color, player2Color]);

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        onClick={handleCanvasClick}
      />
    </div>
  );
}
