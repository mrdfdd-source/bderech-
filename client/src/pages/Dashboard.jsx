import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansAPI } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import Timer from '../components/Timer.jsx';
import MovementCard from '../components/MovementCard.jsx';
import CoachChatModal from '../components/CoachChatModal.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [todayDone, setTodayDone] = useState(false);
  const [missedMessage, setMissedMessage] = useState(null);
  const [error, setError] = useState('');
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [showCoachChat, setShowCoachChat] = useState(false);
  const [showStopRitual, setShowStopRitual] = useState(false);

  const loadPlan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await plansAPI.getCurrent();
      setPlanData(res.data);
      setTodayDone(res.data.todayCompleted);
      setMissedMessage(res.data.missedDaysMessage);
      dispatch({ type: 'SET_CURRENT_PLAN', payload: res.data.plan });
    } catch (err) {
      if (err.response?.status === 404) {
        // No active plan — go to onboarding
        navigate('/onboarding');
      } else {
        setError('שגיאה בטעינת התוכנית');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, dispatch]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleCompleteToday = async () => {
    if (!planData?.plan?._id) return;
    setCompleting(true);
    try {
      const res = await plansAPI.completeToday(planData.plan._id);
      dispatch({ type: 'SET_CURRENT_PLAN', payload: res.data.plan });
      setPlanData((prev) => ({
        ...prev,
        plan: res.data.plan,
        todayCompleted: true,
        completedDays: res.data.completedDays
      }));
      setShowStopRitual(true);
      setTimeout(() => { setShowStopRitual(false); setTodayDone(true); }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בסימון התנועה');
      setTimeout(() => setError(''), 3000);
    } finally {
      setCompleting(false);
    }
  };

  const handleAbandon = async () => {
    if (!planData?.plan?._id) return;
    try {
      await plansAPI.abandon(planData.plan._id);
      dispatch({ type: 'SET_CURRENT_PLAN', payload: null });
      navigate('/onboarding');
    } catch (err) {
      setError('שגיאה בהפסקת התוכנית');
    }
    setShowAbandonModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F5A623] to-[#C47D0E] flex items-center justify-center text-2xl mx-auto mb-4 shadow-[0_0_30px_rgba(245,166,35,0.4)] animate-pulse">
            🚶
          </div>
          <p className="text-gray-500">טוען...</p>
        </div>
      </div>
    );
  }

  if (!planData?.plan) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-6">🗺️</div>
          <h2 className="text-2xl font-bold text-white mb-3">עדיין אין תוכנית</h2>
          <p className="text-gray-500 mb-8">בואו נבנה לך תוכנית ראשונה!</p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary max-w-xs">
            בואו נתחיל
          </button>
        </div>
      </div>
    );
  }

  const plan = planData.plan;
  const currentDayMovement = plan.movements?.find((m) => m.day === plan.currentDay);
  const completedDays = planData.completedDays || plan.movements?.filter((m) => m.completed).length || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">
            יום {plan.currentDay} בדרך
          </p>
          <h1 className="text-white font-bold text-xl leading-tight mt-0.5 max-w-[240px] truncate">
            {plan.goal}
          </h1>
        </div>
        <button
          onClick={() => navigate('/map')}
          className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-lg hover:border-[#F5A623] transition-colors"
        >
          🗺️
        </button>
      </div>


      {/* Missed day message */}
      {missedMessage && !todayDone && (
        <div className="mx-5 mb-4 bg-[#1a1a1a] border border-[#F5A623]/20 rounded-2xl px-4 py-3 slide-up">
          <p className="text-[#F5A623] text-sm font-medium mb-0.5">💛 ברוך הבא חזרה</p>
          <p className="text-gray-400 text-sm">{missedMessage}</p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 px-5 flex flex-col gap-4">

        {/* Stop ritual overlay */}
        {showStopRitual && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 slide-up">
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-[#F5A623]/30 flex items-center justify-center mb-6"
              style={{ boxShadow: '0 0 40px rgba(245,166,35,0.15)' }}>
              <span className="text-4xl">🫁</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">עצור.</h2>
            <p className="text-gray-400 text-lg leading-relaxed">נשום. עשית את זה.</p>
            <p className="text-gray-600 text-sm mt-4">7 דקות שלך, שמורות.</p>
          </div>
        )}

        {!showStopRitual && todayDone ? (
          /* Completed state */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 slide-up">
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#F5A623] to-[#C47D0E] flex items-center justify-center text-5xl shadow-[0_0_60px_rgba(245,166,35,0.5)]">
                🌟
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[#F5A623] animate-ping opacity-20" />
            </div>

            {plan.currentDay - 1 === 7 ? (
              <div className="mb-4 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-2xl px-5 py-3 max-w-xs">
                <p className="text-[#F5A623] font-bold text-base">שבוע שלם. 🔥</p>
                <p className="text-gray-400 text-sm mt-1">רוב האנשים כבר ויתרו — אתה עדיין כאן.</p>
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-white mb-2">כל הכבוד.</h2>
            )}

            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {completedDays * 7} דקות השקעת בדרך שלך
            </p>

            <button onClick={() => navigate('/map')} className="btn-ghost mt-6 max-w-xs">
              ראה את המפה שלך
            </button>
          </div>
        ) : !showStopRitual ? (
          /* Active state */
          <>
            {currentDayMovement ? (
              <MovementCard
                movement={currentDayMovement}
                day={plan.currentDay}
                totalDays={plan.totalDays}
                goal={plan.goal}
              />
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-500">לא נמצאה תנועה להיום</p>
              </div>
            )}

            {/* Timer */}
            <Timer
              onComplete={() => setTimerCompleted(true)}
              onReset={() => setTimerCompleted(false)}
            />

            {/* Complete button */}
            <button
              onClick={handleCompleteToday}
              disabled={completing}
              className={`btn-primary mt-2 transition-all duration-300 ${
                timerCompleted
                  ? 'shadow-[0_4px_40px_rgba(245,166,35,0.6)] scale-[1.02]'
                  : ''
              }`}
            >
              {completing ? 'שומר...' : 'סיימתי את התנועה! ✓'}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Bottom nav */}
      <div className="px-5 pb-8 pt-4 border-t border-[#1a1a1a] mt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAbandonModal(true)}
            className="text-gray-600 text-xs hover:text-[#F5A623] transition-colors py-2"
          >
            החלף יעד
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/map')}
              className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-[#F5A623] transition-colors py-2 px-3"
            >
              <span>🗺️</span> מפה
            </button>
          </div>
        </div>
      </div>


      {/* Abandon / change goal modal */}
      {showAbandonModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 pb-8 px-5">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 w-full max-w-sm slide-up">
            <h3 className="text-white font-bold text-xl mb-2 text-center">רגע לפני...</h3>
            <p className="text-gray-400 text-center text-sm mb-6 leading-relaxed">
              עשית {completedDays} תנועות עד עכשיו.
              <br />
              <span className="text-[#F5A623] text-xs mt-1 block">
                אם תחליף יעד — התוכנית הנוכחית תיסגר.
              </span>
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAbandon}
                className="py-3 rounded-2xl bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30 font-medium hover:bg-[#F5A623]/20 transition-colors"
              >
                בא לי להחליף יעד
              </button>
              <button
                onClick={handleAbandon}
                className="py-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 font-medium hover:bg-red-500/20 transition-colors text-sm"
              >
                עזוב תוכנית (ללא יעד חדש)
              </button>
              <button
                onClick={() => setShowAbandonModal(false)}
                className="py-3 rounded-2xl bg-[#2a2a2a] text-white font-bold mt-1"
              >
                המשך בדרך
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coach chat modal */}
      <CoachChatModal
        isOpen={showCoachChat}
        onClose={() => setShowCoachChat(false)}
        goal={plan?.goal}
        movement={currentDayMovement}
      />
    </div>
  );
}
