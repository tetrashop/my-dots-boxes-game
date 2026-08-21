import { useEffect, useRef, useState, useCallback } from 'react';

const COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#eab308',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export default function Board({ 
  game, 
  onMove, 
  playerColors,
  gridSize,
  onZoomChange 
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [selectedDot, setSelectedDot] = useState(null);
  const [hoverDot, setHoverDot] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const CELL_SIZE = 60;
  const DOT_RADIUS = 6;
  const LINE_WIDTH = 3.5;
  const PADDING = 50;

  // تشخیص دستگاه لمسی
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const getCanvasSize = useCallback(() => {
    const size = gridSize;
    return (size - 1) * CELL_SIZE + PADDING * 2;
  }, [gridSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    setCtx(context);
    
    // تنظیم اندازه مناسب برای دستگاه
    const containerWidth = containerRef.current?.clientWidth || 500;
    const baseSize = getCanvasSize();
    const maxSize = Math.min(containerWidth - 20, 800);
    const scale = Math.min(1, maxSize / baseSize);
    const displaySize = baseSize * scale;
    
    setCanvasSize(displaySize);
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    
    drawBoard(context, canvas);
  }, [game, playerColors, selectedDot, hoverDot, zoom, offset, getCanvasSize]);

  const drawBoard = (context, canvas) => {
    const size = getCanvasSize();
    const scaledSize = size * zoom;
    canvas.width = scaledSize;
    canvas.height = scaledSize;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(offset.x * zoom, offset.y * zoom);
    context.scale(zoom, zoom);

    const gridSize = game.gridSize;
    const cellSize = CELL_SIZE;
    const startX = PADDING;
    const startY = PADDING;

    // رسم نقاط
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;
        
        const isSelected = selectedDot && selectedDot.row === r && selectedDot.col === c;
        const isHover = hoverDot && hoverDot.row === r && hoverDot.col === c;
        
        context.beginPath();
        context.arc(x, y, isSelected ? DOT_RADIUS * 2 : DOT_RADIUS, 0, 2 * Math.PI);
        context.fillStyle = isSelected ? '#fbbf24' : '#2d3748';
        context.fill();
        if (isSelected || isHover) {
          context.shadowColor = 'rgba(251, 191, 36, 0.5)';
          context.shadowBlur = 20;
          context.fill();
          context.shadowBlur = 0;
        }
        context.strokeStyle = '#1a202c';
        context.lineWidth = 1.5;
        context.stroke();
      }
    }

    // رسم خطوط افقی
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.horizontalLines[r][c]) {
          const x1 = startX + c * cellSize;
          const y1 = startY + r * cellSize;
          const x2 = startX + (c + 1) * cellSize;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y1);
          const player = game.boxes[r]?.[c] || game.boxes[r + 1]?.[c];
          context.strokeStyle = player ? playerColors[player - 1] : '#94a3b8';
          context.lineWidth = LINE_WIDTH;
          context.shadowColor = 'rgba(0,0,0,0.1)';
          context.shadowBlur = 4;
          context.stroke();
          context.shadowBlur = 0;
        }
      }
    }

    // رسم خطوط عمودی
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.verticalLines[r][c]) {
          const x1 = startX + c * cellSize;
          const y1 = startY + r * cellSize;
          const x2 = x1;
          const y2 = startY + (r + 1) * cellSize;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          const player = game.boxes[r]?.[c] || game.boxes[r]?.[c + 1];
          context.strokeStyle = player ? playerColors[player - 1] : '#94a3b8';
          context.lineWidth = LINE_WIDTH;
          context.shadowColor = 'rgba(0,0,0,0.1)';
          context.shadowBlur = 4;
          context.stroke();
          context.shadowBlur = 0;
        }
      }
    }

    // رسم خط پیش‌نمایش
    if (selectedDot && hoverDot && isDragging) {
      const x1 = startX + selectedDot.col * cellSize;
      const y1 = startY + selectedDot.row * cellSize;
      const x2 = startX + hoverDot.col * cellSize;
      const y2 = startY + hoverDot.row * cellSize;
      
      if (selectedDot.row === hoverDot.row || selectedDot.col === hoverDot.col) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = playerColors[game.currentPlayer] || '#000';
        context.lineWidth = 3;
        context.setLineDash([8, 6]);
        context.stroke();
        context.setLineDash([]);
      }
    }

    // رسم مربع‌های پر شده
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.boxes[r][c] !== 0) {
          const x = startX + c * cellSize;
          const y = startY + r * cellSize;
          const color = playerColors[game.boxes[r][c] - 1];
          context.fillStyle = color + '30';
          context.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          context.strokeStyle = color;
          context.lineWidth = 2.5;
          context.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          
          context.fillStyle = color;
          context.font = `bold ${cellSize * 0.35}px sans-serif`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText('✓', x + cellSize/2, y + cellSize/2);
        }
      }
    }

    context.restore();
  };

  const getCanvasCoords = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX / zoom - offset.x * zoom,
      y: (clientY - rect.top) * scaleY / zoom - offset.y * zoom
    };
  };

  const findNearestDot = (x, y) => {
    const gridSize = game.gridSize;
    const cellSize = CELL_SIZE;
    const startX = PADDING;
    const startY = PADDING;
    let minDist = 30;
    let nearest = null;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const dotX = startX + c * cellSize;
        const dotY = startY + r * cellSize;
        const dist = Math.hypot(x - dotX, y - dotY);
        if (dist < minDist) {
          minDist = dist;
          nearest = { row: r, col: c };
        }
      }
    }
    return nearest;
  };

  const findLineBetweenDots = (dot1, dot2) => {
    if (!dot1 || !dot2) return null;
    const dr = Math.abs(dot1.row - dot2.row);
    const dc = Math.abs(dot1.col - dot2.col);
    if ((dr === 0 && dc === 1) || (dr === 1 && dc === 0)) {
      const row = Math.min(dot1.row, dot2.row);
      const col = Math.min(dot1.col, dot2.col);
      const isHorizontal = (dr === 0 && dc === 1);
      return { row, col, isHorizontal };
    }
    return null;
  };

  // رویدادهای ماوس
  const handleMouseDown = (e) => {
    if (game.gameOver || game.currentPlayer !== 0) return;
    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const dot = findNearestDot(coords.x, coords.y);
    if (dot) {
      setSelectedDot(dot);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const dot = findNearestDot(coords.x, coords.y);
    setHoverDot(dot);
    
    if (isDragging && selectedDot && dot) {
      drawBoard(ctx, canvasRef.current);
    }
  };

  const handleMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    
    if (!isDragging || !selectedDot) {
      setIsDragging(false);
      setSelectedDot(null);
      return;
    }
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const endDot = findNearestDot(coords.x, coords.y);
    
    if (endDot && selectedDot) {
      const line = findLineBetweenDots(selectedDot, endDot);
      if (line) {
        let alreadyDrawn = false;
        if (line.isHorizontal) {
          alreadyDrawn = game.horizontalLines[line.row][line.col];
        } else {
          alreadyDrawn = game.verticalLines[line.row][line.col];
        }
        if (!alreadyDrawn) {
          onMove(line.row, line.col, line.isHorizontal);
        }
      }
    }
    
    setIsDragging(false);
    setSelectedDot(null);
    setHoverDot(null);
  };

  // رویدادهای لمسی
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

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.3, Math.min(3, zoom + delta));
    setZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        background: '#f8fafc',
        minHeight: '350px',
        maxHeight: '80vh',
        touchAction: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          margin: '0 auto',
          cursor: game.gameOver || game.currentPlayer !== 0 ? 'default' : 'pointer',
          touchAction: 'none',
          maxWidth: '100%',
          height: 'auto'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* کنترل‌های زوم */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        display: 'flex',
        gap: '6px',
        background: 'rgba(255,255,255,0.95)',
        padding: '6px',
        borderRadius: '10px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}>
        <button 
          onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
          style={{
            padding: '4px 10px',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            minWidth: '30px'
          }}
          aria-label="Zoom out"
        >
          −
        </button>
        <span style={{ 
          minWidth: '44px', 
          textAlign: 'center', 
          fontSize: '13px',
          fontWeight: '600',
          color: '#2d3748',
          alignSelf: 'center'
        }}>
          {Math.round(zoom * 100)}%
        </span>
        <button 
          onClick={() => setZoom(z => Math.min(3, z + 0.2))}
          style={{
            padding: '4px 10px',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            minWidth: '30px'
          }}
          aria-label="Zoom in"
        >
          +
        </button>
        <button 
          onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
          style={{
            padding: '4px 10px',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            background: '#e2e8f0',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          aria-label="Reset zoom"
        >
          ↺
        </button>
      </div>
      
      {/* راهنما */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        fontSize: '11px',
        color: '#64748b',
        background: 'rgba(255,255,255,0.9)',
        padding: '4px 10px',
        borderRadius: '6px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        maxWidth: '60%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {isTouchDevice ? '👆 لمس و کشیدن' : '🖱 کلیک + درگ | 🔄 اسکرول زوم | ⇧+درگ جابجایی'}
      </div>
    </div>
  );
}
