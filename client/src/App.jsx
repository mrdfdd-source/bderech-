import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext.jsx';
import Auth from './pages/Auth.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Chat from './pages/Chat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Map from './pages/Map.jsx';
import Welcome from './pages/Welcome.jsx';
import CoachChatModal from './components/CoachChatModal.jsx';

function ProtectedRoute({ children }) {
  const { state } = useApp();
  if (!state.token) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { state } = useApp();
  if (state.token) return <Navigate to="/dashboard" replace />;
  return children;
}

function GlobalCoachButton() {
  const { state } = useApp();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const hiddenPaths = ['/auth', '/chat', '/'];
  if (hiddenPaths.includes(location.pathname)) return null;
  if (!state.token || !state.currentPlan) return null;

  const plan = state.currentPlan;
  const todayMovement = plan.movements?.find((m) => m.day === plan.currentDay);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-5 w-14 h-14 rounded-full bg-gradient-to-br from-[#F5A623] to-[#C47D0E] flex items-center justify-center shadow-[0_4px_20px_rgba(245,166,35,0.4)] active:scale-95 transition-all z-40"
        title="שוחח עם המאמן"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      <CoachChatModal
        isOpen={open}
        onClose={() => setOpen(false)}
        goal={plan.goal}
        movement={todayMovement}
      />
    </>
  );
}

export default function App() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const token = localStorage.getItem('baderech_token');
    const user = localStorage.getItem('baderech_user');
    if (token && user) {
      try {
        dispatch({ type: 'SET_AUTH', payload: { token, user: JSON.parse(user) } });
      } catch (e) {
        localStorage.removeItem('baderech_token');
        localStorage.removeItem('baderech_user');
      }
    }
  }, []);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/welcome" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalCoachButton />
    </div>
  );
}
