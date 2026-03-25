import React, { useMemo, useEffect, useRef } from 'react';

const SHAPES = {
  shoe: [
    // Shoe outline path points (sole, heel, toe)
    [0.15, 0.75], [0.22, 0.80], [0.32, 0.82], [0.42, 0.80], [0.52, 0.78],
    [0.62, 0.76], [0.72, 0.72], [0.80, 0.65], [0.85, 0.55], [0.82, 0.45],
    [0.75, 0.38], [0.65, 0.35], [0.55, 0.38], [0.48, 0.44], [0.40, 0.42],
    [0.32, 0.40], [0.24, 0.44], [0.18, 0.52], [0.14, 0.62], [0.13, 0.70]
  ],
  book: [
    // Open book
    [0.20, 0.25], [0.25, 0.20], [0.35, 0.18], [0.45, 0.20], [0.50, 0.25],
    [0.50, 0.35], [0.50, 0.45], [0.50, 0.55], [0.50, 0.65], [0.50, 0.75],
    [0.45, 0.80], [0.35, 0.82], [0.25, 0.80], [0.20, 0.75], [0.20, 0.65],
    [0.20, 0.55], [0.20, 0.45], [0.20, 0.35], [0.20, 0.25], [0.30, 0.22]
  ],
  harmonica: [
    // Elongated rectangle with holes
    [0.12, 0.40], [0.20, 0.35], [0.30, 0.33], [0.40, 0.33], [0.50, 0.33],
    [0.60, 0.33], [0.70, 0.33], [0.80, 0.35], [0.88, 0.40], [0.88, 0.50],
    [0.88, 0.60], [0.80, 0.65], [0.70, 0.67], [0.60, 0.67], [0.50, 0.67],
    [0.40, 0.67], [0.30, 0.67], [0.20, 0.65], [0.12, 0.60], [0.12, 0.50]
  ],
  star: [
    // 5-pointed star
    [0.50, 0.15], [0.58, 0.35], [0.78, 0.38], [0.64, 0.52], [0.68, 0.72],
    [0.50, 0.62], [0.32, 0.72], [0.36, 0.52], [0.22, 0.38], [0.42, 0.35],
    [0.50, 0.15], [0.50, 0.25], [0.42, 0.45], [0.30, 0.48], [0.38, 0.58],
    [0.35, 0.68], [0.50, 0.60], [0.65, 0.68], [0.62, 0.58], [0.70, 0.48]
  ],
  heart: [
    [0.50, 0.75], [0.40, 0.65], [0.25, 0.52], [0.18, 0.42], [0.18, 0.32],
    [0.22, 0.25], [0.30, 0.20], [0.38, 0.20], [0.44, 0.24], [0.50, 0.32],
    [0.56, 0.24], [0.62, 0.20], [0.70, 0.20], [0.78, 0.25], [0.82, 0.32],
    [0.82, 0.42], [0.75, 0.52], [0.60, 0.65], [0.50, 0.75], [0.50, 0.78]
  ],
  rocket: [
    [0.50, 0.10], [0.56, 0.18], [0.62, 0.28], [0.66, 0.38], [0.68, 0.50],
    [0.66, 0.62], [0.62, 0.70], [0.58, 0.75], [0.65, 0.82], [0.65, 0.88],
    [0.58, 0.85], [0.50, 0.80], [0.42, 0.85], [0.35, 0.88], [0.35, 0.82],
    [0.42, 0.75], [0.38, 0.70], [0.34, 0.62], [0.32, 0.50], [0.34, 0.38]
  ]
};

function generateScatteredPositions(count, width, height) {
  const positions = [];
  const padding = 30;
  const attempts = 50;

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let a = 0; a < attempts; a++) {
      const x = padding + Math.random() * (width - padding * 2);
      const y = padding + Math.random() * (height - padding * 2);

      // Check minimum distance from existing points
      const minDist = Math.min(width, height) * 0.08;
      const tooClose = positions.some((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) < minDist;
      });

      if (!tooClose) {
        positions.push({ x, y });
        placed = true;
        break;
      }
    }
    if (!placed) {
      // Just place it with less constraint
      positions.push({
        x: padding + Math.random() * (width - padding * 2),
        y: padding + Math.random() * (height - padding * 2)
      });
    }
  }
  return positions;
}

export default function LightMap({ movements, shape, showShapeOutline, completionPercent, onDaySelect, selectedDay }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = React.useState({ width: 380, height: 500 });
  const [hoveredDay, setHoveredDay] = React.useState(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const { positions, shapePoints } = useMemo(() => {
    const { width, height } = dimensions;
    const positions = generateScatteredPositions(movements.length, width, height);

    // Shape outline points scaled to container
    const shapeTemplate = SHAPES[shape] || SHAPES.star;
    const shapePoints = shapeTemplate.map((p) => ({
      x: p[0] * width,
      y: p[1] * height
    }));

    return { positions, shapePoints };
  }, [movements.length, dimensions, shape]);

  const getMovementAtIndex = (index) => movements[index];

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #0d0d0d 0%, #050505 100%)' }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      >
        <defs>
          {/* Glow filter for completed lights */}
          <filter id="glow-completed" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong glow for today */}
          <filter id="glow-today" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shape glow */}
          <filter id="glow-shape" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial gradient for light bulb */}
          <radialGradient id="bulb-completed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD166" stopOpacity="1" />
            <stop offset="60%" stopColor="#F5A623" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#C47D0E" stopOpacity="0.6" />
          </radialGradient>

          <radialGradient id="bulb-today" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#FFD166" stopOpacity="1" />
            <stop offset="100%" stopColor="#F5A623" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* Background subtle stars */}
        {Array.from({ length: 60 }, (_, i) => {
          const x = (((i * 137.5) % 1) * dimensions.width);
          const y = (((i * 97.3) % 1) * dimensions.height);
          const r = 0.5 + (i % 3) * 0.3;
          const opacity = 0.05 + (i % 4) * 0.04;
          return (
            <circle key={`star-${i}`} cx={x} cy={y} r={r} fill="white" opacity={opacity} />
          );
        })}

        {/* Shape outline (appears at 80%) */}
        {showShapeOutline && shapePoints.length > 0 && (
          <g filter="url(#glow-shape)">
            <polyline
              points={shapePoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#F5A623"
              strokeWidth="1.5"
              strokeOpacity={Math.min((completionPercent - 80) / 20, 1) * 0.6}
              strokeDasharray="6,4"
              style={{ transition: 'stroke-opacity 1s ease' }}
            />
          </g>
        )}

        {/* Connection lines between completed days */}
        {positions.slice(0, movements.length).map((pos, i) => {
          if (i === 0) return null;
          const prev = positions[i - 1];
          const movement = getMovementAtIndex(i);
          const prevMovement = getMovementAtIndex(i - 1);
          if (!movement?.completed && !movement?.isToday) return null;
          if (!prevMovement?.completed) return null;

          return (
            <line
              key={`line-${i}`}
              x1={prev.x}
              y1={prev.y}
              x2={pos.x}
              y2={pos.y}
              stroke="#F5A623"
              strokeWidth="0.75"
              strokeOpacity="0.2"
              strokeDasharray="3,4"
            />
          );
        })}

        {/* Light nodes */}
        {positions.slice(0, movements.length).map((pos, i) => {
          const movement = getMovementAtIndex(i);
          if (!movement) return null;

          const isSelected = selectedDay?.day === movement.day;
          const isHovered = hoveredDay === movement.day;

          if (movement.completed) {
            return (
              <g
                key={`light-${i}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ cursor: 'pointer' }}
                filter="url(#glow-completed)"
                onClick={() => onDaySelect(isSelected ? null : movement)}
                onMouseEnter={() => setHoveredDay(movement.day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Outer glow ring */}
                <circle
                  r={isSelected || isHovered ? 14 : 10}
                  fill="none"
                  stroke="#F5A623"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  style={{ transition: 'r 0.2s ease' }}
                />
                {/* Main bulb */}
                <circle
                  r={isSelected || isHovered ? 8 : 6}
                  fill="url(#bulb-completed)"
                  style={{ transition: 'r 0.2s ease' }}
                />
                {/* Day number */}
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fill="#0a0a0a"
                  fontSize="6"
                  fontWeight="bold"
                  fontFamily="Assistant, sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {movement.day}
                </text>
              </g>
            );
          }

          if (movement.isToday) {
            return (
              <g
                key={`light-${i}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ cursor: 'pointer' }}
                filter="url(#glow-today)"
                onClick={() => onDaySelect(isSelected ? null : movement)}
              >
                {/* Pulsing rings */}
                <circle r="20" fill="none" stroke="#FFD166" strokeWidth="1" strokeOpacity="0.1">
                  <animate attributeName="r" values="12;22;12" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle r="14" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeOpacity="0.2">
                  <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Main bulb */}
                <circle r="9" fill="url(#bulb-today)" />
                {/* Sparkle */}
                <circle r="3" fill="white" opacity="0.8" />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fill="#0a0a0a"
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="Assistant, sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {movement.day}
                </text>
              </g>
            );
          }

          // Future - dark dots (clickable)
          return (
            <g
              key={`dot-${i}`}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: 'pointer' }}
              opacity={isSelected ? 0.6 : isHovered ? 0.4 : 0.2}
              onClick={() => onDaySelect(isSelected ? null : movement)}
              onMouseEnter={() => setHoveredDay(movement.day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <circle r={isSelected || isHovered ? 6 : 4} fill="#3a3a3a" style={{ transition: 'r 0.15s ease' }} />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F5A623]" style={{ boxShadow: '0 0 6px #F5A623' }} />
          <span className="text-gray-500 text-xs">הושלם</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white" style={{ boxShadow: '0 0 8px #FFD166' }} />
          <span className="text-gray-500 text-xs">היום</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2a2a2a]" />
          <span className="text-gray-500 text-xs">עתיד</span>
        </div>
      </div>
    </div>
  );
}
