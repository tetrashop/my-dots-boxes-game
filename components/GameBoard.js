import { useEffect, useRef, useState, useCallback } from 'react';

export default function GameBoard({ 
  game, 
  onMove, 
  playerColors,
  gridSize,
  isMobile = false
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [dimensions, setDimensions] = useState({ cellSize: 50, padding: 40, totalSize: 0 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [startDot, setStartDot] = useState(null);
  const [currentDot, setCurrentDot] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  const getSizes = useCallback(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const baseCell = isMobile ? 38 : 50;
    const basePadding = isMobile ? 28 : 40;
    const dotRadius = isMobile ? 5 : 7;
    return { cellSize: baseCell, padding: basePadding, dotRadius };
  }, [isMobile]);

  const calculateDimensions = useCallback(() => {
    const { cellSize, padding } = getSizes();
    const totalSize = (gridSize - 1) * cellSize + padding * 2;
    return { cellSize, padding, totalSize };
  }, [gridSize, getSizes]);

  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [game]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    setCtx(context);
    
    const dims = calculateDimensions();
    setDimensions(dims);
    
    const containerWidth = containerRef.current?.clientWidth || 500;
    const maxSize = Math.min(containerWidth - 20, 600);
    const scale = Math.min(1, maxSize / dims.totalSize);
    const displaySize = dims.totalSize * scale;
    
    canvas.width = dims.totalSize;
    canvas.height = dims.totalSize;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    
    drawBoard(context, dims);
  }, [game, playerColors, renderKey, calculateDimensions]);

  const drawBoard = (context, dims) => {
    if (!game) return;
    
    const { cellSize, padding, totalSize } = dims;
    const { dotRadius } = getSizes();
    const gridSize = game.gridSize;
    
    context.clearRect(0, 0, totalSize, totalSize);
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, totalSize, totalSize);
    
    // 1. نقاط
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        
        const isStart = startDot && startDot.row === r && startDot.col === c;
        const isHover = currentDot && currentDot.row === r && currentDot.col === c;
        const isValidTarget = isStart && isHover && startDot && currentDot && 
                             (Math.abs(startDot.row - currentDot.row) + Math.abs(startDot.col - currentDot.col) === 1);
        
        if (isStart || isHover) {
          context.beginPath();
          context.arc(x, y, dotRadius * 2.8, 0, 2 * Math.PI);
          context.fillStyle = isStart ? 'rgba(251, 191, 36, 0.4)' : 
                             (isValidTarget ? 'rgba(72, 187, 120, 0.4)' : 'rgba(66, 153, 225, 0.2)');
          context.fill();
        }
        
        context.beginPath();
        context.arc(x, y, isStart ? dotRadius * 1.8 : dotRadius, 0, 2 * Math.PI);
        context.fillStyle = isStart ? '#fbbf24' : '#2d3748';
        context.fill();
        context.strokeStyle = '#1a202c';
        context.lineWidth = 1.5;
        context.stroke();
      }
    }

    // 2. خطوط رسم‌شده (افقی)
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.horizontalLines[r]?.[c]) {
          const x1 = padding + c * cellSize;
          const y1 = padding + r * cellSize;
          const x2 = padding + (c + 1) * cellSize;
          let player = game.boxes[r]?.[c] || game.boxes[r+1]?.[c] || 0;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y1);
          context.strokeStyle = player ? playerColors[player - 1] : '#94a3b8';
          context.lineWidth = 4;
          context.shadowColor = 'rgba(0,0,0,0.08)';
          context.shadowBlur = 4;
          context.stroke();
          context.shadowBlur = 0;
        }
      }
    }

    // 3. خطوط رسم‌شده (عمودی)
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.verticalLines[r]?.[c]) {
          const x1 = padding + c * cellSize;
          const y1 = padding + r * cellSize;
          const x2 = x1;
          const y2 = padding + (r + 1) * cellSize;
          let player = game.boxes[r]?.[c] || game.boxes[r]?.[c+1] || 0;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.strokeStyle = player ? playerColors[player - 1] : '#94a3b8';
          context.lineWidth = 4;
          context.shadowColor = 'rgba(0,0,0,0.08)';
          context.shadowBlur = 4;
          context.stroke();
          context.shadowBlur = 0;
        }
      }
    }

    // 4. خط موقت (در حال کشیدن)
    if (isDragging && startDot && currentDot) {
      const x1 = padding + startDot.col * cellSize;
      const y1 = padding + startDot.row * cellSize;
      const x2 = padding + currentDot.col * cellSize;
      const y2 = padding + currentDot.row * cellSize;
      
      const isAdjacent = (Math.abs(startDot.row - currentDot.row) + Math.abs(startDot.col - currentDot.col) === 1);
      const isValid = isAdjacent && (startDot.row === currentDot.row || startDot.col === currentDot.col);
      
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      if (isValid) {
        context.strokeStyle = '#48bb78';
        context.lineWidth = 4;
        context.shadowColor = 'rgba(72, 187, 120, 0.5)';
        context.shadowBlur = 12;
      } else {
        context.strokeStyle = '#fc8181';
        context.lineWidth = 2;
        context.setLineDash([6, 6]);
      }
      context.stroke();
      context.setLineDash([]);
      context.shadowBlur = 0;
    }

    // 5. مربع‌های پر شده
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.boxes[r]?.[c] && game.boxes[r][c] !== 0) {
          const x = padding + c * cellSize;
          const y = padding + r * cellSize;
          const color = playerColors[game.boxes[r][c] - 1];
          context.fillStyle = color + '30';
          context.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          context.strokeStyle = color;
          context.lineWidth = 2.5;
          context.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          context.fillStyle = color;
          context.font = `bold ${cellSize * 0.4}px sans-serif`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText('✓', x + cellSize/2, y + cellSize/2);
        }
      }
    }
  };

  const getCanvasCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const findNearestDot = (x, y) => {
    const { cellSize, padding } = dimensions;
    const gridSize = game.gridSize;
    const threshold = 25;
    let minDist = threshold;
    let nearest = null;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const dotX = padding + c * cellSize;
        const dotY = padding + r * cellSize;
        const dist = Math.hypot(x - dotX, y - dotY);
        if (dist < minDist) {
          minDist = dist;
          nearest = { row: r, col: c };
        }
      }
    }
    return nearest;
  };

  const isValidLine = (dot1, dot2) => {
    if (!dot1 || !dot2) return false;
    const dr = Math.abs(dot1.row - dot2.row);
    const dc = Math.abs(dot1.col - dot2.col);
    return (dr === 0 && dc === 1) || (dr === 1 && dc === 0);
  };

  const getLineData = (dot1, dot2) => {
    if (!isValidLine(dot1, dot2)) return null;
    const row = Math.min(dot1.row, dot2.row);
    const col = Math.min(dot1.col, dot2.col);
    const isHorizontal = (dot1.row === dot2.row);
    return { row, col, isHorizontal };
  };

  const isLineDrawn = (line) => {
    if (!line) return true;
    if (line.isHorizontal) {
      return game.horizontalLines[line.row]?.[line.col] || false;
    } else {
      return game.verticalLines[line.row]?.[line.col] || false;
    }
  };

  // ---- رویدادهای Pointer (ماوس + لمس) ----
  const handlePointerDown = (e) => {
    e.preventDefault();
    if (game.gameOver || game.currentPlayer !== 0) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const dot = findNearestDot(coords.x, coords.y);
    if (dot) {
      setStartDot(dot);
      setCurrentDot(dot);
      setIsDragging(true);
    }
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const dot = findNearestDot(coords.x, coords.y);
    setCurrentDot(dot);
    if (isDragging && ctx) {
      const dims = calculateDimensions();
      drawBoard(ctx, dims);
    }
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    if (!isDragging || !startDot) {
      resetDragState();
      return;
    }
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const endDot = findNearestDot(coords.x, coords.y);
    if (endDot && startDot) {
      const line = getLineData(startDot, endDot);
      // شرط اصلی: فقط بررسی می‌کنیم که این خط قبلاً رسم نشده باشد
      if (line && !isLineDrawn(line)) {
        onMove(line.row, line.col, line.isHorizontal);
      }
    }
    resetDragState();
  };

  const handlePointerLeave = () => {
    if (isDragging) resetDragState();
  };

  const resetDragState = () => {
    setIsDragging(false);
    setStartDot(null);
    setCurrentDot(null);
    if (ctx) {
      const dims = calculateDimensions();
      drawBoard(ctx, dims);
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '8px',
        touchAction: 'none',
        minHeight: '280px',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          cursor: (game.gameOver || game.currentPlayer !== 0) ? 'default' : 'pointer',
          touchAction: 'none',
          borderRadius: '8px',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
      />
      
      {isDragging && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10
        }}>
          {startDot && currentDot && isValidLine(startDot, currentDot) 
            ? '✅ رها کنید تا خط رسم شود (در صورت عدم تکرار)' 
            : '📍 به نقطه مجاور بروید (هیچ محدودیتی برای نقطه شروع نیست)'}
        </div>
      )}
      
      {game.gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '16px',
          fontSize: isMobile ? '1.1rem' : '1.4rem',
          fontWeight: 'bold',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          🎯 بازی تمام شد!
          <div style={{ fontSize: '0.8rem', marginTop: '6px', opacity: 0.8 }}>
            {game.getWinner() !== null && game.getWinner() !== -1 
              ? `🏆 بازیکن ${game.getWinner() + 1} برنده شد!` 
              : game.getWinner() === -1 ? '🤝 مساوی!' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
