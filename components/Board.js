import { useEffect, useRef, useState } from 'react';

export default function Board({ game, onMove, player1Color, player2Color }) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [selectedDot, setSelectedDot] = useState(null); // نقطه انتخاب‌شده
  const [hoverDot, setHoverDot] = useState(null); // نقطه زیر ماوس
  const [dimensions, setDimensions] = useState({ cellSize: 0, offset: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    setCtx(context);
    drawBoard(context, canvas);
  }, [game, player1Color, player2Color, selectedDot, hoverDot]);

  const drawBoard = (context, canvas) => {
    const size = canvas.width;
    const gridSize = game.gridSize;
    const cellSize = size / (gridSize - 1);
    const offset = cellSize;

    setDimensions({ cellSize, offset });

    // پاک کردن صفحه
    context.clearRect(0, 0, size, size);

    // رسم نقاط
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = offset + c * cellSize;
        const y = offset + r * cellSize;
        
        // نقطه انتخاب‌شده با هایلایت
        const isSelected = selectedDot && selectedDot.row === r && selectedDot.col === c;
        const isHover = hoverDot && hoverDot.row === r && hoverDot.col === c;
        
        context.beginPath();
        context.arc(x, y, isSelected ? 10 : 6, 0, 2 * Math.PI);
        context.fillStyle = isSelected ? '#fbbf24' : '#2d3748';
        context.fill();
        if (isSelected || isHover) {
          context.shadowColor = 'rgba(251, 191, 36, 0.5)';
          context.shadowBlur = 15;
          context.fill();
          context.shadowBlur = 0;
        }
        context.strokeStyle = '#1a202c';
        context.lineWidth = 1.5;
        context.stroke();
      }
    }

    // رسم خطوط افقی (بازیکن ۱)
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.horizontalLines[r][c]) {
          const x1 = offset + c * cellSize;
          const y1 = offset + r * cellSize;
          const x2 = offset + (c + 1) * cellSize;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y1);
          context.strokeStyle = player1Color;
          context.lineWidth = 4;
          context.shadowColor = player1Color + '40';
          context.shadowBlur = 8;
          context.stroke();
          context.shadowBlur = 0;
        }
      }
    }

    // رسم خطوط عمودی (بازیکن ۲)
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
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
          context.shadowColor = player2Color + '40';
          context.shadowBlur = 8;
          context.stroke();
          context.shadowBlur = 0;
        }
      }
    }

    // رسم خط پیش‌نمایش (درگ)
    if (selectedDot && hoverDot && isDragging) {
      const x1 = offset + selectedDot.col * cellSize;
      const y1 = offset + selectedDot.row * cellSize;
      const x2 = offset + hoverDot.col * cellSize;
      const y2 = offset + hoverDot.row * cellSize;
      
      // فقط در صورت افقی یا عمودی بودن
      if (selectedDot.row === hoverDot.row || selectedDot.col === hoverDot.col) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = game.currentPlayer === 0 ? player1Color : player2Color;
        context.lineWidth = 3;
        context.setLineDash([6, 4]);
        context.stroke();
        context.setLineDash([]);
      }
    }

    // رسم مربع‌های پر شده
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (game.boxes[r][c] !== 0) {
          const x = offset + c * cellSize;
          const y = offset + r * cellSize;
          const color = game.boxes[r][c] === 1 ? player1Color : player2Color;
          context.fillStyle = color + '30';
          context.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          context.strokeStyle = color;
          context.lineWidth = 2.5;
          context.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          
          // نمایش عدد امتیاز داخل مربع
          context.fillStyle = color;
          context.font = 'bold 16px sans-serif';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText('✓', x + cellSize/2, y + cellSize/2);
        }
      }
    }
  };

  // پیدا کردن نقطه نزدیک به کلیک
  const findNearestDot = (x, y) => {
    const { cellSize, offset } = dimensions;
    const gridSize = game.gridSize;
    let minDist = 30;
    let nearest = null;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const dotX = offset + c * cellSize;
        const dotY = offset + r * cellSize;
        const dist = Math.hypot(x - dotX, y - dotY);
        if (dist < minDist) {
          minDist = dist;
          nearest = { row: r, col: c };
        }
      }
    }
    return nearest;
  };

  // پیدا کردن خط بین دو نقطه
  const findLineBetweenDots = (dot1, dot2) => {
    if (!dot1 || !dot2) return null;
    
    const dr = Math.abs(dot1.row - dot2.row);
    const dc = Math.abs(dot1.col - dot2.col);
    
    // فقط مجاور (فاصله ۱)
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
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const dot = findNearestDot(mouseX, mouseY);
    if (dot) {
      setSelectedDot(dot);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // به‌روزرسانی نقطه زیر ماوس
    const dot = findNearestDot(mouseX, mouseY);
    setHoverDot(dot);
    
    // اگر در حال درگ هستیم، خط پیش‌نمایش رسم شود
    if (isDragging && selectedDot && dot) {
      drawBoard(ctx, canvasRef.current);
    }
  };

  const handleMouseUp = (e) => {
    if (!isDragging || !selectedDot) {
      setIsDragging(false);
      setSelectedDot(null);
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const endDot = findNearestDot(mouseX, mouseY);
    
    if (endDot && selectedDot) {
      // پیدا کردن خط بین دو نقطه
      const line = findLineBetweenDots(selectedDot, endDot);
      if (line) {
        // بررسی اینکه خط قبلاً رسم نشده باشد
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

  const handleMouseLeave = () => {
    setIsDragging(false);
    setSelectedDot(null);
    setHoverDot(null);
  };

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
          });
          canvasRef.current.dispatchEvent(mouseEvent);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
          });
          canvasRef.current.dispatchEvent(mouseEvent);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          const mouseEvent = new MouseEvent('mouseup', {});
          canvasRef.current.dispatchEvent(mouseEvent);
        }}
      />
      
      {/* راهنمای بازی */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '10px',
        fontSize: '0.9rem',
        color: '#4a5568',
        background: '#f7fafc',
        padding: '8px',
        borderRadius: '8px'
      }}>
        💡 روی یک نقطه کلیک کنید، سپس به نقطه مجاور بکشید تا خط رسم شود
      </div>
    </div>
  );
}
