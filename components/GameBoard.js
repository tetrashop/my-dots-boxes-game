import { useEffect, useRef, useState, useCallback } from 'react';

const COLORS = {
  bg: '#0b1120',
  dot: '#94a3b8',
  dotActive: '#fbbf24',
  line: '#475569',
  tempValid: '#10b981',
  tempInvalid: '#ef4444',
};

export default function GameBoard({
  game,
  onMove,
  playerColors,
  gridSize,
  isMobile,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ cell: 50, pad: 30, total: 0 });
  const [dragging, setDragging] = useState(false);
  const [startDot, setStartDot] = useState(null);
  const [hoverDot, setHoverDot] = useState(null);

  // محاسبه ابعاد
  const calcDims = useCallback(() => {
    const cell = isMobile ? 40 : 55;
    const pad = isMobile ? 20 : 30;
    const total = (gridSize - 1) * cell + pad * 2;
    return { cell, pad, total };
  }, [gridSize, isMobile]);

  // رسم تخته
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !game) return;
    const ctx = canvas.getContext('2d');
    const d = calcDims();
    setDims(d);

    // اندازه نمایشی responsive
    const containerW = containerRef.current?.clientWidth || 500;
    const maxSize = Math.min(containerW - 10, 600);
    const scale = Math.min(1, maxSize / d.total);
    const displaySize = Math.floor(d.total * scale);

    canvas.width = d.total;
    canvas.height = d.total;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';

    draw(ctx, d);
  }, [game, playerColors, dragging, startDot, hoverDot, calcDims]);

  const draw = (ctx, d) => {
    const { cell, pad, total } = d;
    const dots = game.gridSize;
    const boxes = game.gridSize - 1;

    // پس‌زمینه
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, total, total);

    // نقاط
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < dots; c++) {
        const x = pad + c * cell;
        const y = pad + r * cell;
        const isStart = startDot && startDot.r === r && startDot.c === c;
        const isHover = hoverDot && hoverDot.r === r && hoverDot.c === c;

        if (isStart || isHover) {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, isStart ? 9 : 6, 0, 2 * Math.PI);
        ctx.fillStyle = isStart ? COLORS.dotActive : COLORS.dot;
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // خطوط افقی
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < boxes; c++) {
        if (game.horizontalLines[r][c]) {
          const x1 = pad + c * cell;
          const y1 = pad + r * cell;
          const x2 = pad + (c + 1) * cell;
          let color = '#64748b';
          if (r > 0 && game.boxes[r - 1] && game.boxes[r - 1][c]) {
            color = playerColors[game.boxes[r - 1][c] - 1];
          } else if (r < boxes && game.boxes[r] && game.boxes[r][c]) {
            color = playerColors[game.boxes[r][c] - 1];
          }
          drawLine(ctx, x1, y1, x2, y1, color, 4);
        }
      }
    }

    // خطوط عمودی
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < dots; c++) {
        if (game.verticalLines[r][c]) {
          const x1 = pad + c * cell;
          const y1 = pad + r * cell;
          const x2 = x1;
          const y2 = pad + (r + 1) * cell;
          let color = '#64748b';
          if (c > 0 && game.boxes[r] && game.boxes[r][c - 1]) {
            color = playerColors[game.boxes[r][c - 1] - 1];
          } else if (c < boxes && game.boxes[r] && game.boxes[r][c]) {
            color = playerColors[game.boxes[r][c] - 1];
          }
          drawLine(ctx, x1, y1, x2, y2, color, 4);
        }
      }
    }

    // خط پیش‌نمایش
    if (dragging && startDot && hoverDot) {
      const isAdj =
        (Math.abs(startDot.r - hoverDot.r) === 1 && startDot.c === hoverDot.c) ||
        (Math.abs(startDot.c - hoverDot.c) === 1 && startDot.r === hoverDot.r);
      if (isAdj) {
        const x1 = pad + startDot.c * cell;
        const y1 = pad + startDot.r * cell;
        const x2 = pad + hoverDot.c * cell;
        const y2 = pad + hoverDot.r * cell;
        const valid =
          isAdj &&
          game.isValidMove(
            Math.min(startDot.r, hoverDot.r),
            Math.min(startDot.c, hoverDot.c),
            startDot.r === hoverDot.r
          );
        drawLine(
          ctx,
          x1,
          y1,
          x2,
          y2,
          valid ? COLORS.tempValid : COLORS.tempInvalid,
          4,
          valid ? [] : [6, 6]
        );
      }
    }

    // مربع‌ها
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < boxes; c++) {
        if (game.boxes[r][c] !== 0) {
          const x = pad + c * cell;
          const y = pad + r * cell;
          const color = playerColors[game.boxes[r][c] - 1];
          ctx.fillStyle = color + '33';
          ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
        }
      }
    }
  };

  const drawLine = (ctx, x1, y1, x2, y2, color, width, dash = []) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // تبدیل مختصات
  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const findDot = (x, y) => {
    const { cell, pad } = dims;
    const dots = game.gridSize;
    const threshold = 25;
    let best = null;
    let min = threshold;
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < dots; c++) {
        const dx = pad + c * cell;
        const dy = pad + r * cell;
        const dist = Math.hypot(x - dx, y - dy);
        if (dist < min) {
          min = dist;
          best = { r, c };
        }
      }
    }
    return best;
  };

  // رویدادها
  const handleDown = (e) => {
    e.preventDefault();
    if (!game || game.gameOver || game.currentPlayer !== 0) return;
    const { x, y } = getCoords(e);
    const dot = findDot(x, y);
    if (dot) {
      setStartDot(dot);
      setHoverDot(dot);
      setDragging(true);
    }
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!game) return;
    const { x, y } = getCoords(e);
    const dot = findDot(x, y);
    setHoverDot(dot);
  };

  const handleUp = (e) => {
    e.preventDefault();
    if (!dragging || !startDot) {
      resetState();
      return;
    }
    const { x, y } = getCoords(e);
    const end = findDot(x, y);

    if (end && startDot) {
      const isAdj =
        (Math.abs(startDot.r - end.r) === 1 && startDot.c === end.c) ||
        (Math.abs(startDot.c - end.c) === 1 && startDot.r === end.r);

      if (isAdj) {
        const row = Math.min(startDot.r, end.r);
        const col = Math.min(startDot.c, end.c);
        const isH = startDot.r === end.r;
        if (game.isValidMove(row, col, isH)) {
          onMove(row, col, isH);
        }
      }
    }
    resetState();
  };

  const resetState = () => {
    setDragging(false);
    setStartDot(null);
    setHoverDot(null);
  };

  return (
    <div className="canvas-wrapper" ref={containerRef}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={resetState}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
      />
    </div>
  );
}
