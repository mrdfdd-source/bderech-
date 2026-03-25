import React, { useState } from 'react';

const SHAPE_ICONS = {
  shoe: '👟',
  book: '📖',
  harmonica: '🎵',
  star: '⭐',
  heart: '❤️',
  rocket: '🚀'
};

export default function MovementCard({ movement, day, totalDays, goal }) {
  const [expanded, setExpanded] = useState(false);

  if (!movement) return null;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-[#2a2a2a] bg-[#1a1a1a] cursor-pointer slide-up"
      onClick={() => setExpanded(!expanded)}
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
      }}
    >
      {/* Top golden accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F5A623] to-transparent opacity-60" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{SHAPE_ICONS.star}</span>
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">התנועה שלך היום</p>
              <p className="text-[#F5A623] text-xs mt-0.5">יום {day} מתוך {totalDays}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-xl px-2.5 py-1">
            <span className="text-[#F5A623] text-xs font-bold">7 דקות</span>
          </div>
        </div>

        {/* Action title */}
        <h3 className="text-white font-bold text-xl mb-2 leading-snug">
          {movement.action}
        </h3>

        {/* Goal connection */}
        {goal && (
          <p className="text-[#F5A623]/60 text-xs mb-3 flex items-center gap-1">
            <span>←</span>
            <span>לכיוון: {goal.length > 35 ? goal.slice(0, 35) + '...' : goal}</span>
          </p>
        )}

        {/* Instruction */}
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-20'}`}>
          <p className="text-gray-400 text-sm leading-relaxed">
            {movement.instruction}
          </p>
        </div>

        {/* Expand toggle */}
        {movement.instruction?.length > 120 && (
          <button
            className="flex items-center gap-1 text-[#F5A623] text-xs mt-3 font-medium hover:gap-2 transition-all"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? (
              <>הסתר <span>↑</span></>
            ) : (
              <>קרא הוראות מלאות <span>↓</span></>
            )}
          </button>
        )}
      </div>

      {/* Bottom subtle gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
        style={{
          background: !expanded
            ? 'linear-gradient(to top, #141414 0%, transparent 100%)'
            : 'none'
        }}
      />
    </div>
  );
}
