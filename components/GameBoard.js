import { useEffect, useRef, useState, useCallback } from 'react';

export default function GameBoard({ 
  game, 
  onMove, 
  playerColors,
  gridSize,
  isMobile = false
}) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [dimensions, setDimensions] = useState({ cellSize: 50, padding: 40, totalSize: 0 });
  
  // وضعیت Drag & Drop
  const [isDragging, setIsDragging] = useState(false);
  const [startDot, setStartDot] = useState(null);      // نقطه شروع
  const [currentDot, setCurrentDot] = useState(null);  // نقطه فعلی زیر ماوس
  const [tempLine, setTempLine] = useState(null);      // خط موقت برای نمایش
  
  const [renderKey, setRenderKey] = useState(0);

  const CELL_SIZE = isMobile ? 40 : 50;
  const PADDING = isMobile ? 30 : 40;
  const DOT_RADIUS = isMobile ? 5 : 7;
  const SNAP_DISTANCE = 25;

  const calculateDimensions = useCallback(() => {
    const totalSize = (gridSize - 1) * CELL_SIZE + PADDING * 2;
    return { cellSize: CELL_SIZE, padding: PADDING, totalSize };
  }, [gridSize, CELL_SIZE, PADDING]);

  // رندر مجدد هنگام تغییر game
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [game]);

  // مقداردهی canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    setCtx(context);
    
    const dims = calculateDimensions();
    setDimensions(dims);
    
    const containerWidth = canvas.parentElement?.clientWidth || 500;
    const maxSize = Math.min(containerWidth - 20, 600);
    const scale = Math.min(1, maxSize / dims.totalSize);
    const displaySize = dims.totalSize * scale;
    
    canvas.width = dims.totalSize;
    canvas.height = dims.totalSize;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    
    drawBoard(context, dims);
  }, [game, playerColors, renderKey, calculateDimensions]);

  // تابع رسم اصلی
  const drawBoard = (context, dims) => {
    if (!game) return;
    
    const { cellSize, padding, totalSize } = dims;
    const gridSize = game.gridSize;
    
    context.clearRect(0, 0, totalSize, totalSize);
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, totalSize, totalSize);
    
    // ---- 1. رسم نقاط ----
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        
        // تشخیص نقطه هایلایت
        const isStart = startDot && startDot.row === r && startDot.col === c;
        const isHover = currentDot && currentDot.row === r && currentDot.col === c;
        const isValidTarget = isStart && isHover && startDot && currentDot && 
                             (Math.abs(startDot.row - currentDot.row) + Math.abs(startDot.col - currentDot.col) === 1);
        
        // هاله برای نقطه شروع و هدف
        if (isStart || isHover) {
          context.beginPath();
          context.arc(x, y, DOT_RADIUS * 2.5, 0, 2 * Math.PI);
          context.fillStyle = isStart ? 'rgba(251, 191, 36, 0.4)' : 
                             (isValidTarget ? 'rgba(72, 187, 120, 0.4)' : 'rgba(66, 153, 225, 0.2)');
          context.fill();
        }
        
        // نقطه اصلی
        context.beginPath();
        context.arc(x, y, isStart ? DOT_RADIUS * 1.8 : DOT_RADIUS, 0, 2 * Math.PI);
        context.fillStyle = isStart ? '#fbbf24' : '#2d3748';
        context.fill();
        context.strokeStyle = '#1a202c';
        context.lineWidth = 1.5;
        context.stroke();
        
        // شماره نقطه (برای دیباگ)
        if (gridSize <= 5) {
          context.fillStyle = '#94a3b8';
          context.font = '10px sans-serif';
          context.textAlign = 'center';
          context.textBaseline = 'bottom';
          context.fillText(`(${r},${c})`, x, y - DOT_RADIUS - 4);
        }
      }
    }

    // ---- 2. رسم خطوط رسم‌شده ----
    // خطوط افقی
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.horizontalLines[r]?.[c]) {
          const x1 = padding + c * cellSize;
          const y1 = padding + r * cellSize;
          const x2 = padding + (c + 1) * cellSize;
          
          let player = 0;
          if (game.boxes[r]?.[c]) player = game.boxes[r][c];
          else if (game.boxes[r+1]?.[c]) player = game.boxes[r+1][c];
          
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y1);
          context.strokeStyle = player ? playerColors[player - 1] : '#94a3b8';
          context.lineWidth = 4;
          context.shadowColor = 'rgba(0,0,0,0.1)';
          context.shadowBlur = 4;
          context.stroke();
          context.shadowBlur = 0;
        }
      }
    }

    // خطوط عمودی
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.verticalLines[r]?.[c]) {
          const x1 = padding + c * cellSize;
          const y1 = padding + r * cellSize;
          const x2 = x1;
          const y2 = padding + (r + 1) * cellSize;
          
          let player = 0;
          if (game.boxes[r]?.[c]) player = game.boxes[r][c];
          else if (game.boxes[r]?.[c+1]) player = game.boxes[r][c+1];
          
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.strokeStyle = player ? playerColors[player - 1] : '#94a3b8';
          context.lineWidth = 4;
          context.shadowColor = 'rgba(0,0,0,0.1)';
          context.shadowBlur = 4;
          context.stroke();
          context.shadowBlur = 0;
        }
      }
    }

    // ---- 3. رسم خط موقت (در حال کشیدن) ----
    if (isDragging && startDot && currentDot) {
      const x1 = padding + startDot.col * cellSize;
      const y1 = padding + startDot.row * cellSize;
      const x2 = padding + currentDot.col * cellSize;
      const y2 = padding + currentDot.row * cellSize;
      
      // بررسی مجاورت (فقط افقی یا عمودی)
      const isAdjacent = (Math.abs(startDot.row - currentDot.row) + Math.abs(startDot.col - currentDot.col) === 1);
      const isHorizontal = (startDot.row === currentDot.row);
      const isValid = isAdjacent && (isHorizontal || startDot.col === currentDot.col);
      
      if (isValid) {
        // خط سبز برای مجاورت صحیح
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = '#48bb78';
        context.lineWidth = 4;
        context.shadowColor = 'rgba(72, 187, 120, 0.5)';
        context.shadowBlur = 12;
        context.stroke();
        context.shadowBlur = 0;
        
        // نمایش دایره سبز روی نقطه هدف
        context.beginPath();
        context.arc(x2, y2, DOT_RADIUS * 2, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(72, 187, 120, 0.3)';
        context.fill();
        context.strokeStyle = '#48bb78';
        context.lineWidth = 2;
        context.stroke();
      } else {
        // خط قرمز برای مجاورت نامعتبر
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = '#fc8181';
        context.lineWidth = 2;
        context.setLineDash([6, 6]);
        context.stroke();
        context.setLineDash([]);
      }
    }

    // ---- 4. رسم مربع‌های پر شده ----
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.boxes[r]?.[c] !== 0 && game.boxes[r]?.[c] !== undefined) {
          const x = padding + c * cellSize;
          const y = padding + r * cellSize;
          const color = playerColors[game.boxes[r][c] - 1];
          
          context.fillStyle = color + '30';
          context.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          
          context.strokeStyle = color;
          context.lineWidth = 2.5;
          context.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          
          context.fillStyle = color;
          context.font = 'bold ' + (cellSize * 0.4) + 'px sans-serif';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText('✓', x + cellSize/2, y + cellSize/2);
        }
      }
    }

    // ---- 5. راهنمای نوبت روی صفحه ----
    if (!game.gameOver) {
      context.fillStyle = 'rgba(0,0,0,0.05)';
      context.fillRect(0, totalSize - 30, totalSize, 30);
      context.fillStyle = '#4a5568';
      context.font = '12px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const turnText = game.currentPlayer === 0 ? '👤 نوبت شما' : '🤖 نوبت هوش مصنوعی';
      context.fillText(turnText + ' | برای کشیدن خط روی نقطه کلیک کنید', totalSize/2, totalSize - 15);
    }
  };

  // ---- توابع کمکی ----
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
    let minDist = SNAP_DISTANCE;
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
    // فقط مجاور (فاصله ۱) و افقی یا عمودی
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

  // ---- رویدادهای ماوس ----
  const handleMouseDown = (e) => {
    if (game.gameOver || game.currentPlayer !== 0) return;
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const dot = findNearestDot(coords.x, coords.y);
    
    if (dot) {
      setStartDot(dot);
      setCurrentDot(dot);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const dot = findNearestDot(coords.x, coords.y);
    
    setCurrentDot(dot);
    
    // رندر مجدد برای نمایش خط موقت
    if (isDragging && ctx) {
      const dims = calculateDimensions();
      drawBoard(ctx, dims);
    }
  };

  const handleMouseUp = (e) => {
    if (!isDragging || !startDot) {
      resetDragState();
      return;
    }
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const endDot = findNearestDot(coords.x, coords.y);
    
    // بررسی اینکه آیا خط معتبر است
    if (endDot && startDot) {
      const line = getLineData(startDot, endDot);
      if (line && !isLineDrawn(line)) {
        // رسم خط
        onMove(line.row, line.col, line.isHorizontal);
      }
    }
    
    resetDragState();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      resetDragState();
    }
  };

  // ---- رویدادهای لمسی ----
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0
      });
      canvasRef.current.dispatchEvent(mouseEvent);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvasRef.current.dispatchEvent(mouseEvent);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const resetDragState = () => {
    setIsDragging(false);
    setStartDot(null);
    setCurrentDot(null);
    setTempLine(null);
    // رندر مجدد برای پاک کردن خط موقت
    if (ctx) {
      const dims = calculateDimensions();
      drawBoard(ctx, dims);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '10px',
      touchAction: 'none',
      minHeight: '300px',
      userSelect: 'none',
      WebkitUserSelect: 'none'
    }}>
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* وضعیت Drag & Drop */}
      {isDragging && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>
          {startDot && currentDot && isValidLine(startDot, currentDot) 
            ? '✅ به نقطه مجاور بروید تا خط رسم شود' 
            : '📍 به نقطه مجاور بروید'}
        </div>
      )}
      
      {/* پیام پایان بازی */}
      {game.gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px 30px',
          borderRadius: '16px',
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none'
        }}>
          🎯 بازی تمام شد!
          <div style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.8 }}>
            {game.getWinner() !== null && game.getWinner() !== -1 
              ? `🏆 بازیکن ${game.getWinner() + 1} برنده شد!` 
              : game.getWinner() === -1 ? '🤝 مساوی!' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
