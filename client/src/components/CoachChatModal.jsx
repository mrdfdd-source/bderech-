import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api.js';

export default function CoachChatModal({ isOpen, onClose, goal, movement }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: movement
          ? `שלום! אני כאן לעזור עם התנועה של היום: "${movement.action}". מה לא ברור?`
          : 'שלום! אני כאן לכל שאלה. מה תרצה לדעת?'
      }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const res = await chatAPI.movementHelp({
        question,
        goal,
        movementAction: movement?.action || '',
        movementInstruction: movement?.instruction || ''
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'סליחה, נסה שוב.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleClose = () => {
    setMessages([]);
    setInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 pb-0 px-0"
      onClick={handleClose}
    >
      <div
        className="bg-[#111] border border-[#2a2a2a] rounded-t-3xl w-full max-w-lg slide-up flex flex-col"
        style={{ maxHeight: '75vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F5A623] to-[#C47D0E] flex items-center justify-center text-base shadow-[0_0_15px_rgba(245,166,35,0.3)]">
              🤖
            </div>
            <div>
              <p className="text-white font-semibold text-sm">המאמן שלך</p>
              <p className="text-[#F5A623] text-xs">שאל כל שאלה על התנועה</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Movement context */}
        {movement && (
          <div className="mx-4 mt-3 bg-[#F5A623]/8 border border-[#F5A623]/15 rounded-2xl px-4 py-2.5">
            <p className="text-[#F5A623] text-xs font-medium mb-0.5">התנועה של היום</p>
            <p className="text-gray-300 text-sm">{movement.action}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#F5A623] text-black font-medium rounded-br-sm'
                    : 'bg-[#1e1e1e] text-gray-300 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1e1e1e] rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-6 pt-3 border-t border-[#1e1e1e]">
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3 focus-within:border-[#F5A623] transition-colors">
              <textarea
                ref={inputRef}
                className="w-full bg-transparent text-white placeholder-gray-600 text-sm resize-none focus:outline-none leading-relaxed"
                placeholder="שאל את המאמן..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                style={{ maxHeight: '80px' }}
              />
            </div>
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-2xl bg-[#F5A623] flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
