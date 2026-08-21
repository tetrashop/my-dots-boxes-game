import { useEffect, useRef, useState, useCallback } from 'react';

export default function GameBoard({ 
  game, 
  onMove, 
  playerColors,
  gridSize,
  isMobile = false
}) {
  const canvasRef = useRef(null);
  const [selectedDot, setSelectedDot] = useState(null);
  const [hoverDot, setHoverDot] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [dimensions, setDimensions] = useState({ cellSize: 50, padding: 40, totalSize: 0 });
  const [renderKey, setRenderKey] = useState(0);

  const CELL_SIZE = isMobile ? 40 : 50;
  const PADDING = isMobile ? 30 : 40;
  const DOT_RADIUS = isMobile ? 5 : 7;

  const calculateDimensions = useCallback(() => {
    const totalSize = (gridSize - 1) * CELL_SIZE + PADDING * 2;
    return { cellSize: CELL_SIZE, padding: PADDING, totalSize };
  }, [gridSize, CELL_SIZE, PADDING]);

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
    
    const containerWidth = canvas.parentElement?.clientWidth || 500;
    const maxSize = Math.min(containerWidth - 20, 600);
    const scale = Math.min(1, maxSize / dims.totalSize);
    const displaySize = dims.totalSize * scale;
    
    canvas.width = dims.totalSize;
    canvas.height = dims.totalSize;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    
    drawBoard(context, dims);
  }, [game, playerColors, selectedDot, hoverDot, isDragging, renderKey, calculateDimensions]);

  const drawBoard = (context, dims) => {
    if (!game) return;
    
    const { cellSize, padding, totalSize } = dims;
    const gridSize = game.gridSize;
    
    context.clearRect(0, 0, totalSize, totalSize);
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, totalSize, totalSize);
    
    // رسم نقاط
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        
        const isSelected = selectedDot && selectedDot.row === r && selectedDot.col === c;
        const isHover = hoverDot && hoverDot.row === r && hoverDot.col === c;
        
        if (isSelected || isHover) {
          context.beginPath();
          context.arc(x, y, DOT_RADIUS * 2.5, 0, 2 * Math.PI);
          context.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.3)' : 'rgba(66, 153, 225, 0.2)';
          context.fill();
        }
        
        context.beginPath();
        context.arc(x, y, isSelected ? DOT_RADIUS * 1.5 : DOT_RADIUS, 0, 2 * Math.PI);
        context.fillStyle = isSelected ? '#fbbf24' : '#2d3748';
        context.fill();
        context.strokeStyle = '#1a202c';
        context.lineWidth = 1.5;
        context.stroke();
      }
    }

    // رسم خطوط افقی
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.horizontalLines && game.horizontalLines[r] && game.horizontalLines[r][c]) {
          const x1 = padding + c * cellSize;
          const y1 = padding + r * cellSize;
          const x2 = padding + (c + 1) * cellSize;
          
          let player = 0;
          if (game.boxes[r] && game.boxes[r][c]) player = game.boxes[r][c];
          else if (game.boxes[r+1] && game.boxes[r+1][c]) player = game.boxes[r+1][c];
          
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

    // رسم خطوط عمودی
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.verticalLines && game.verticalLines[r] && game.verticalLines[r][c]) {
          const x1 = padding + c * cellSize;
          const y1 = padding + r * cellSize;
          const x2 = x1;
          const y2 = padding + (r + 1) * cellSize;
          
          let player = 0;
          if (game.boxes[r] && game.boxes[r][c]) player = game.boxes[r][c];
          else if (game.boxes[r] && game.boxes[r][c+1]) player = game.boxes[r][c+1];
          
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

    // رسم خط پیش‌نمایش
    if (selectedDot && hoverDot && isDragging) {
      const x1 = padding + selectedDot.col * cellSize;
      const y1 = padding + selectedDot.row * cellSize;
      const x2 = padding + hoverDot.col * cellSize;
      const y2 = padding + hoverDot.row * cellSize;
      
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
        if (game.boxes && game.boxes[r] && game.boxes[r][c] !== 0) {
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
    let minDist = 25;
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

  const handleMouseDown = (e) => {
    if (game.gameOver || game.currentPlayer !== 0) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const dot = findNearestDot(coords.x, coords.y);
    if (dot) {
      setSelectedDot(dot);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const dot = findNearestDot(coords.x, coords.y);
    setHoverDot(dot);
    
    if (isDragging && selectedDot && ctx) {
      const dims = calculateDimensions();
      drawBoard(ctx, dims);
    }
  };

  const handleMouseUp = (e) => {
    if (!isDragging || !selectedDot) {
      setIsDragging(false);
      setSelectedDot(null);
      setHoverDot(null);
      return;
    }
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const endDot = findNearestDot(coords.x, coords.y);
    
    if (endDot && selectedDot) {
      const line = findLineBetweenDots(selectedDot, endDot);
      if (line) {
        let alreadyDrawn = false;
        if (line.isHorizontal) {
          alreadyDrawn = game.horizontalLines[line.row]?.[line.col] || false;
        } else {
          alreadyDrawn = game.verticalLines[line.row]?.[line.col] || false;
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
      minHeight: '300px'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          cursor: game.gameOver || game.currentPlayer !== 0 ? 'default' : 'pointer',
          touchAction: 'none',
          borderRadius: '8px',
          background: 'white'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {game.gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.7)',
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
        </div>
      )}
    </div>
  );
}
