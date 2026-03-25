import React from 'react';

export default function ChatBubble({ message, isUser }) {
  // Parse newlines to break text
  const lines = message.split('\n');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} slide-up`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F5A623] to-[#C47D0E] flex items-center justify-center text-sm flex-shrink-0 mt-1 ml-2 shadow-[0_0_12px_rgba(245,166,35,0.3)]">
          🤖
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-[#F5A623] text-black font-medium rounded-bl-md'
            : 'bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded-br-md'
        }`}
        style={{ wordBreak: 'break-word' }}
      >
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
