import { useEffect, useRef, useState, useCallback } from 'react';

const COLORS = {
  bg: '#0b1120',
  dot: '#94a3b8',
  dotActive: '#fbbf24',
  tempValid: '#10b981',
  tempInvalid: '#ef4444',
};

export default function GameBoard({
  game,
  version,          // شمارنده‌ی نسخه - هر تغییر بازی +1
  onMove,
  playerColors,
  isMobile,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [startDot, setStartDot] = useState(null);
  const [hoverDot, setHoverDot] = useState(null);

  // نگه‌داشتن آخرین state برای event handler ها (بدون rebind)
  const stateRef = useRef({});
  stateRef.current = { dragging, startDot, hoverDot, game, onMove };

  // محاسبه ابعاد بر اساس عرض ظرف
  const computeDims = useCallback(() => {
    const containerW = containerRef.current?.clientWidth || 320;
    const dots = game.gridSize;
    const maxAvail = Math.min(containerW - 24, 560);
    const cell = Math.max(
      28,
      Math.min(72, Math.floor((maxAvail - 40) / (dots - 1)))
    );
    const pad = Math.max(16, Math.round(cell * 0.55));
    const total = (dots - 1) * cell + pad * 2;
    return { cell, pad, total };
  }, [game.gridSize]);

  // رسم
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { cell, pad, total } = computeDims();
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    canvas.width = Math.round(total * dpr);
    canvas.height = Math.round(total * dpr);
    canvas.style.width = total + 'px';
    canvas.style.height = total + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const dots = game.gridSize;
    const boxes = game.gridSize - 1;

    // پس‌زمینه
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, total, total);

    // مربع‌های فتح‌شده (زیر خطوط)
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < boxes; c++) {
        if (game.boxes[r][c] !== 0) {
          const x = pad + c * cell;
          const y = pad + r * cell;
          const color = playerColors[game.boxes[r][c] - 1] || '#6366f1';
          ctx.fillStyle = color + '44';
          ctx.fillRect(x + 3, y + 3, cell - 6, cell - 6);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 3, y + 3, cell - 6, cell - 6);
        }
      }
    }

    const lineWidth = Math.max(3, Math.round(cell * 0.1));
    const drawLine = (x1, y1, x2, y2, color, w, dash = []) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.setLineDash(dash);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // خطوط افقی
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < boxes; c++) {
        if (game.horizontalLines[r][c]) {
          const x1 = pad + c * cell;
          const y1 = pad + r * cell;
          const x2 = pad + (c + 1) * cell;
          let color = '#64748b';
          if (r > 0 && game.boxes[r - 1] && game.boxes[r - 1][c])
            color = playerColors[game.boxes[r - 1][c] - 1];
          else if (r < boxes && game.boxes[r] && game.boxes[r][c])
            color = playerColors[game.boxes[r][c] - 1];
          drawLine(x1, y1, x2, y1, color, lineWidth);
        }
      }
    }

    // خطوط عمودی
    for (let r = 0; r < boxes; r++) {
      for (let c = 0; c < dots; c++) {
        if (game.verticalLines[r][c]) {
          const x = pad + c * cell;
          const y1 = pad + r * cell;
          const y2 = pad + (r + 1) * cell;
          let color = '#64748b';
          if (c > 0 && game.boxes[r] && game.boxes[r][c - 1])
            color = playerColors[game.boxes[r][c - 1] - 1];
          else if (c < boxes && game.boxes[r] && game.boxes[r][c])
            color = playerColors[game.boxes[r][c] - 1];
          drawLine(x, y1, x, y2, color, lineWidth);
        }
      }
    }

    // نقاط (روی خطوط تا کلیک‌پذیرتر باشن)
    const dotR = Math.max(4, cell * 0.11);
    const activeR = Math.max(7, cell * 0.16);
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < dots; c++) {
        const x = pad + c * cell;
        const y = pad + r * cell;
        const isStart = startDot && startDot.r === r && startDot.c === c;

        if (isStart) {
          ctx.beginPath();
          ctx.arc(x, y, activeR * 1.9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, isStart ? activeR : dotR, 0, Math.PI * 2);
        ctx.fillStyle = isStart ? COLORS.dotActive : COLORS.dot;
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // پیش‌نمایش خط
    if (dragging && startDot && hoverDot) {
      const isAdj =
        (Math.abs(startDot.r - hoverDot.r) === 1 &&
          startDot.c === hoverDot.c) ||
        (Math.abs(startDot.c - hoverDot.c) === 1 &&
          startDot.r === hoverDot.r);
      if (isAdj) {
        const x1 = pad + startDot.c * cell;
        const y1 = pad + startDot.r * cell;
        const x2 = pad + hoverDot.c * cell;
        const y2 = pad + hoverDot.r * cell;
        const row = Math.min(startDot.r, hoverDot.r);
        const col = Math.min(startDot.c, hoverDot.c);
        const isH = startDot.r === hoverDot.r;
        const valid = game.isValidMove(row, col, isH);
        drawLine(
          x1,
          y1,
          x2,
          y2,
          valid ? COLORS.tempValid : COLORS.tempInvalid,
          lineWidth,
          valid ? [] : [7, 7]
        );
      }
    }
  }, [game, version, playerColors, dragging, startDot, hoverDot, computeDims]);

  useEffect(() => {
    draw();
  }, [draw]);

  // رسم مجدد در تغییر اندازه
  useEffect(() => {
    let raf;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [draw]);

  // تبدیل مختصات لمس/موس به مختصات منطقی canvas
  const clientToLogical = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { total } = computeDims();
    return {
      x: ((clientX - rect.left) / rect.width) * total,
      y: ((clientY - rect.top) / rect.height) * total,
    };
  };

  const findDot = (x, y) => {
    const { cell, pad } = computeDims();
    const dots = game.gridSize;
    const threshold = Math.max(22, cell * 0.55);
    let best = null;
    let min = threshold;
    for (let r = 0; r < dots; r++) {
      for (let c = 0; c < dots; c++) {
        const dx = pad + c * cell;
        const dy = pad + r * cell;
        const d = Math.hypot(x - dx, y - dy);
        if (d < min) {
          min = d;
          best = { r, c };
        }
      }
    }
    return best;
  };

  // شروع کشیدن
  const beginDrag = (clientX, clientY) => {
    const g = stateRef.current.game;
    if (!g || g.gameOver) return false;
    if (g.currentPlayer !== 0) return false; // فقط نوبت انسان
    const pos = clientToLogical(clientX, clientY);
    if (!pos) return false;
    const dot = findDot(pos.x, pos.y);
    if (!dot) return false;
    setStartDot(dot);
    setHoverDot(dot);
    setDragging(true);
    return true;
  };

  const updateDrag = (clientX, clientY) => {
    if (!stateRef.current.dragging) return;
    const pos = clientToLogical(clientX, clientY);
    if (!pos) return;
    const dot = findDot(pos.x, pos.y);
    if (dot) setHoverDot(dot);
  };

  const endDrag = (clientX, clientY) => {
    const { dragging: isDragging, startDot: sDot, game: g, onMove: cb } =
      stateRef.current;
    setDragging(false);
    setStartDot(null);
    setHoverDot(null);

    if (!isDragging || !sDot || !g) return;
    const pos = clientToLogical(clientX, clientY);
    if (!pos) return;
    const end = findDot(pos.x, pos.y);
    if (!end) return;

    const isAdj =
      (Math.abs(sDot.r - end.r) === 1 && sDot.c === end.c) ||
      (Math.abs(sDot.c - end.c) === 1 && sDot.r === end.r);
    if (!isAdj) return;

    const row = Math.min(sDot.r, end.r);
    const col = Math.min(sDot.c, end.c);
    const isH = sDot.r === end.r;
    if (g.isValidMove(row, col, isH)) {
      cb(row, col, isH);
    }
  };

  // ============ رویدادها ============
  // موس
  const onMouseDown = (e) => {
    if (e.button !== 0 && e.buttons !== 1) return;
    e.preventDefault();
    beginDrag(e.clientX, e.clientY);
  };

  // لمسی - با addEventListener غیر passive برای preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      beginDrag(t.clientX, t.clientY);
    };
    const onTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      updateDrag(t.clientX, t.clientY);
    };
    const onTouchEnd = (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      if (t) endDrag(t.clientX, t.clientY);
      else endDrag(0, 0);
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // رویداد موس روی document برای کشیدن نرم‌تر
  useEffect(() => {
    const onMove = (e) => {
      if (!stateRef.current.dragging) return;
      e.preventDefault();
      updateDrag(e.clientX, e.clientY);
    };
    const onUp = (e) => {
      if (!stateRef.current.dragging) return;
      endDrag(e.clientX, e.clientY);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="canvas-wrapper"
      ref={containerRef}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
