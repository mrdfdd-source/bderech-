import React, { useState, useEffect, useRef, useCallback } from 'react';

const SEVEN_MINUTES = 7 * 60; // 420 seconds
const OVERTIME_MARK = 7 * 60 + 42; // 462 seconds

const STATES = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  OVERTIME: 'OVERTIME',
  DONE: 'DONE'
};

function formatTime(seconds) {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Timer({ onComplete, onReset }) {
  const [timerState, setTimerState] = useState(STATES.IDLE);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  const remaining = SEVEN_MINUTES - elapsed;
  const overtime = elapsed - SEVEN_MINUTES;
  const progress = Math.min(elapsed / SEVEN_MINUTES, 1);
  const circumference = 2 * Math.PI * 54; // r=54

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    if (elapsed >= OVERTIME_MARK && timerState === STATES.RUNNING) {
      setTimerState(STATES.OVERTIME);
    }
    if (elapsed > 0 && elapsed >= SEVEN_MINUTES && timerState === STATES.RUNNING) {
      // Transition to overtime but keep running
    }
  }, [elapsed, timerState]);

  const handleStart = () => {
    if (timerState === STATES.IDLE) {
      setTimerState(STATES.RUNNING);
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
  };

  const handleDone = () => {
    stop();
    setTimerState(STATES.DONE);
    onComplete?.();
  };

  const handleReset = () => {
    stop();
    setElapsed(0);
    setTimerState(STATES.IDLE);
    onReset?.();
  };

  const strokeDashoffset = circumference * (1 - progress);

  const ringColor =
    timerState === STATES.DONE
      ? '#4ade80'
      : timerState === STATES.OVERTIME
      ? '#FFD166'
      : timerState === STATES.RUNNING
      ? '#F5A623'
      : '#2a2a2a';

  const glowColor =
    timerState === STATES.DONE
      ? 'rgba(74, 222, 128, 0.4)'
      : timerState === STATES.OVERTIME
      ? 'rgba(255, 209, 102, 0.4)'
      : timerState === STATES.RUNNING
      ? 'rgba(245, 166, 35, 0.3)'
      : 'transparent';

  return (
    <div className="card flex flex-col items-center py-6">
      {/* SVG Ring Timer */}
      <div className="relative mb-5" style={{ filter: timerState !== STATES.IDLE ? `drop-shadow(0 0 20px ${glowColor})` : 'none' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Background ring */}
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 70 70)"
            style={{ transition: timerState !== STATES.IDLE ? 'stroke-dashoffset 1s linear, stroke 0.3s ease' : 'none' }}
          />
          {/* Full ring glow for done */}
          {timerState === STATES.DONE && (
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="#4ade80"
              strokeWidth="8"
              strokeOpacity="0.3"
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {timerState === STATES.IDLE && (
            <>
              <span className="text-3xl font-bold text-white">7:00</span>
              <span className="text-gray-600 text-xs mt-0.5">דקות</span>
            </>
          )}
          {timerState === STATES.RUNNING && remaining > 0 && (
            <>
              <span className="text-3xl font-bold text-[#F5A623]">{formatTime(remaining)}</span>
              <span className="text-gray-500 text-xs mt-0.5">נותרו</span>
            </>
          )}
          {(timerState === STATES.RUNNING && remaining <= 0) && (
            <>
              <span className="text-2xl font-bold text-[#FFD166]">+{formatTime(overtime)}</span>
              <span className="text-[#FFD166] text-xs mt-0.5 animate-pulse">זמן נוסף</span>
            </>
          )}
          {timerState === STATES.OVERTIME && (
            <>
              <span
                className="text-2xl font-bold"
                style={{
                  color: '#FFD166',
                  textShadow: '0 0 10px rgba(255,209,102,0.8), 0 0 20px rgba(255,209,102,0.4)'
                }}
              >
                +{formatTime(overtime)}s
              </span>
              <span className="text-[#FFD166] text-xs mt-0.5">אנרגיה לשמור</span>
            </>
          )}
          {timerState === STATES.DONE && (
            <>
              <span className="text-3xl">✓</span>
              <span className="text-green-400 font-bold text-sm mt-0.5">סיום!</span>
            </>
          )}
        </div>
      </div>

      {/* State messages */}
      {timerState === STATES.RUNNING && remaining > 0 && (
        <p className="text-gray-500 text-sm mb-4 text-center">
          הישאר עם זה עוד קצת ✨
        </p>
      )}
      {(timerState === STATES.RUNNING && remaining <= 0) || timerState === STATES.OVERTIME ? (
        <div className="mb-4 text-center">
          <p
            className="font-bold text-base"
            style={{
              color: '#FFD166',
              textShadow: '0 0 10px rgba(255,209,102,0.6)'
            }}
          >
            עצור כאן, שמור אנרגיה למחר
          </p>
          <p className="text-gray-600 text-xs mt-1">7 דקות — לא פחות, לא יותר</p>
        </div>
      ) : null}
      {timerState === STATES.DONE && (
        <div className="mb-4 text-center">
          <p className="text-green-400 font-bold text-base">עשית את זה! 🎉</p>
          <p className="text-gray-600 text-xs mt-1">תנועה {formatTime(elapsed)} נשמרה</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 w-full">
        {timerState === STATES.IDLE && (
          <button
            onClick={handleStart}
            className="flex-1 py-3.5 rounded-2xl bg-[#F5A623] text-black font-bold text-base active:scale-95 transition-all shadow-[0_4px_20px_rgba(245,166,35,0.3)]"
          >
            התחל ⏱
          </button>
        )}
        {(timerState === STATES.RUNNING || timerState === STATES.OVERTIME) && (
          <>
            <button
              onClick={handleDone}
              className="flex-1 py-3.5 rounded-2xl bg-green-500/20 text-green-400 border border-green-500/30 font-bold text-base active:scale-95 transition-all hover:bg-green-500/30"
            >
              סיים ✓
            </button>
            <button
              onClick={handleReset}
              className="w-14 py-3.5 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] text-gray-500 font-medium active:scale-95 transition-all hover:border-red-500/50 hover:text-red-400 text-sm"
            >
              ↺
            </button>
          </>
        )}
        {timerState === STATES.DONE && (
          <button
            onClick={handleReset}
            className="flex-1 py-3.5 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 font-medium text-base active:scale-95 transition-all hover:border-[#F5A623]/50"
          >
            אפס טיימר
          </button>
        )}
      </div>

      {/* Pulse indicator when running */}
      {timerState === STATES.RUNNING && (
        <div className="flex items-center gap-2 mt-4">
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#F5A623]"
            style={{ animation: 'pulse 1s ease-in-out infinite' }}
          />
          <span className="text-gray-600 text-xs">פועל</span>
        </div>
      )}
    </div>
  );
}
