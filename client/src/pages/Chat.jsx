import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, plansAPI } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import ChatBubble from '../components/ChatBubble.jsx';

const SESSION_ID = `session_${Date.now()}`;

export default function Chat() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [buildingPlan, setBuildingPlan] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [dotsCount, setDotsCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const goal = state.onboarding?.goal || '';

  useEffect(() => {
    if (!goal) return;
    // Send the goal as the first user message automatically, get AI's first real question
    setMessages([{ role: 'user', content: goal }]);
    setLoading(true);
    chatAPI.sendMessage({ message: goal, sessionId: SESSION_ID, goal })
      .then((res) => {
        const { message: aiMessage, isReady: ready } = res.data;
        setMessages([
          { role: 'user', content: goal },
          { role: 'assistant', content: aiMessage }
        ]);
        if (ready) {
          setIsReady(true);
          setTimeout(() => { setBuildingPlan(true); generatePlan(); }, 1500);
        }
      })
      .catch(() => {
        setMessages([
          { role: 'user', content: goal },
          { role: 'assistant', content: 'יש לך כבר את מה שצריך כדי להתחיל, או שצריך להשיג משהו קודם?' }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, buildingPlan]);

  // Dots animation for building plan
  useEffect(() => {
    if (!buildingPlan) return;
    const interval = setInterval(() => {
      setDotsCount((c) => (c + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, [buildingPlan]);

  const sendMessage = async () => {
    if (!input.trim() || loading || buildingPlan) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage({
        message: userMessage,
        sessionId: SESSION_ID,
        goal
      });

      const { message: aiMessage, isReady: ready, questionCount: qCount } = res.data;

      setQuestionCount(qCount || questionCount + 1);

      if (ready) {
        setIsReady(true);
        setMessages((prev) => [...prev, { role: 'assistant', content: aiMessage }]);
        setLoading(false);

        // Start building plan
        setTimeout(() => {
          setBuildingPlan(true);
          generatePlan();
        }, 1500);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: aiMessage }]);
        setLoading(false);
        inputRef.current?.focus();
      }
    } catch (err) {
      console.error('Chat error:', err);
      setLoading(false);
      // Mock fallback
      if (questionCount >= 2) {
        setIsReady(true);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'בניתי לך תוכנית' }
        ]);
        setTimeout(() => {
          setBuildingPlan(true);
          generatePlan();
        }, 1500);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'ספר לי עוד — מה המצב הנוכחי שלך עם זה?' }
        ]);
        setQuestionCount((q) => q + 1);
      }
    }
  };

  const generatePlan = async () => {
    try {
      const { goal, motivation, priorExperience, notificationTime } = state.onboarding;
      const chatHistory = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

      const res = await plansAPI.create({
        goal,
        motivation,
        priorExperience,
        notificationTime,
        chatHistory
      });

      dispatch({ type: 'SET_CURRENT_PLAN', payload: res.data.plan });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Plan generation error:', err);
      // Navigate anyway — dashboard will handle
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const dots = '.'.repeat(dotsCount);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-[#1a1a1a]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5A623] to-[#C47D0E] flex items-center justify-center text-lg shadow-[0_0_20px_rgba(245,166,35,0.3)]">
          🤖
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">המאמן שלך</h3>
          <p className="text-[#F5A623] text-xs">בדרך</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg.content} isUser={msg.role === 'user'} />
        ))}

        {/* Typing indicator */}
        {loading && !buildingPlan && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Building plan overlay */}
        {buildingPlan && (
          <div className="flex flex-col items-center py-8 gap-4 slide-up">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F5A623] to-[#C47D0E] flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(245,166,35,0.5)]">
                🗺️
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[#F5A623] animate-ping opacity-30" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-xl mb-1">
                בדרך בונה לך תוכנית{dots}
              </p>
              <p className="text-gray-500 text-sm">מכין את המפה האישית שלך</p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#F5A623]"
                  style={{
                    animation: `pulse 1s ease-in-out ${i * 0.1}s infinite alternate`,
                    opacity: i <= dotsCount ? 1 : 0.2
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!buildingPlan && !isReady && (
        <div className="px-4 pb-8 pt-3 border-t border-[#1a1a1a]">
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3 focus-within:border-[#F5A623] transition-colors">
              <textarea
                ref={inputRef}
                className="w-full bg-transparent text-white placeholder-gray-600 text-base resize-none focus:outline-none leading-relaxed"
                placeholder="כתוב כאן..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-2xl bg-[#F5A623] flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all flex-shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
