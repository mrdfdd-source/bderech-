import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansAPI } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import LightMap from '../components/LightMap.jsx';
import CoachChatModal from '../components/CoachChatModal.jsx';

export default function Map() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [error, setError] = useState('');
  const [showCoachChat, setShowCoachChat] = useState(false);
  const [chatMovement, setChatMovement] = useState(null);

  const planId = state.currentPlan?._id || state.currentPlan?.id;

  const loadMap = useCallback(async () => {
    if (!planId) {
      navigate('/dashboard');
      return;
    }
    try {
      setLoading(true);
      const res = await plansAPI.getMap(planId);
      setMapData(res.data);
    } catch (err) {
      setError('שגיאה בטעינת המפה');
    } finally {
      setLoading(false);
    }
  }, [planId, navigate]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🗺️</div>
          <p className="text-gray-600">טוען את המפה שלך...</p>
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'שגיאה בטעינת המפה'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary max-w-xs">
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 relative z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-xl bg-[#1a1a1a]/80 backdrop-blur border border-[#2a2a2a] flex items-center justify-center hover:border-[#F5A623] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-white font-bold text-lg">המפה שלך</h2>
          <p className="text-[#F5A623] text-xs">{mapData.plan.goal}</p>
        </div>

        <div className="w-10" />
      </div>

      {/* Countdown — only at 85%+, no total */}
      {mapData.showCountdown && (
        <div className="px-5 mb-2 relative z-10">
          <p className="text-center text-[#F5A623] text-sm font-medium">
            נשארו לך עוד כמה תנועות — אתה כמעט שם ✨
          </p>
        </div>
      )}

      {/* Light Map */}
      <div className="flex-1 relative">
        <LightMap
          movements={mapData.mapData}
          shape={mapData.plan.shape}
          showShapeOutline={mapData.showShapeOutline}
          completionPercent={mapData.completionPercent}
          onDaySelect={setSelectedDay}
          selectedDay={selectedDay}
        />
      </div>

      {/* Day detail popup */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 pb-6 px-5" onClick={() => setSelectedDay(null)}>
          <div
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-5 w-full max-w-sm slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedDay.completed ? '💡' : selectedDay.isToday ? '⚡' : '○'}</span>
                <h3 className="text-white font-bold text-lg">יום {selectedDay.day}</h3>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-gray-600 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="bg-[#F5A623]/10 rounded-2xl p-3 mb-3 border border-[#F5A623]/20">
              <p className="text-[#F5A623] font-semibold text-base mb-1">{selectedDay.action}</p>
              {selectedDay.completed ? (
                <p className="text-gray-400 text-sm leading-relaxed">{selectedDay.instruction}</p>
              ) : selectedDay.isToday ? (
                <p className="text-gray-400 text-sm leading-relaxed">{selectedDay.instruction}</p>
              ) : (
                <p className="text-gray-600 text-sm italic">עדיין בחושך... הגיע אליו ותגלה</p>
              )}
            </div>

            {selectedDay.completed && selectedDay.completedAt && (
              <p className="text-gray-600 text-xs text-center">
                הושלם ב-{new Date(selectedDay.completedAt).toLocaleDateString('he-IL')}
              </p>
            )}

            {selectedDay.isToday && !selectedDay.completed && (
              <button
                onClick={() => { setSelectedDay(null); navigate('/dashboard'); }}
                className="btn-primary mt-2 py-3 text-base"
              >
                לך לעשות את התנועה!
              </button>
            )}

            {(selectedDay.completed || selectedDay.isToday) && (
              <button
                onClick={() => {
                  setChatMovement(selectedDay);
                  setSelectedDay(null);
                  setShowCoachChat(true);
                }}
                className="mt-2 w-full py-2.5 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                שאל את המאמן על התנועה הזו
              </button>
            )}
          </div>
        </div>
      )}

      <CoachChatModal
        isOpen={showCoachChat}
        onClose={() => setShowCoachChat(false)}
        goal={mapData?.plan?.goal}
        movement={chatMovement}
      />
    </div>
  );
}
