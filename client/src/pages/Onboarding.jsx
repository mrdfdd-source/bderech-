import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Onboarding() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [goal, setGoal] = useState('');

  const handleSubmit = () => {
    if (!goal.trim()) return;
    dispatch({ type: 'UPDATE_ONBOARDING', payload: { goal: goal.trim() } });
    navigate('/chat');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center px-6">
      <div className="slide-up">
        <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
          לאן תרצה להגיע?
        </h2>
        <p className="text-gray-500 text-base mb-8">
          תאר בחופשיות — מה המטרה שלך?
        </p>

        <textarea
          className="input-field min-h-[120px] resize-none leading-relaxed"
          placeholder="ללמוד AI, לרוץ מרתון, להקים עסק, לכתוב ספר..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={!goal.trim()}
          className="btn-primary"
        >
          המשך
        </button>
      </div>
    </div>
  );
}
