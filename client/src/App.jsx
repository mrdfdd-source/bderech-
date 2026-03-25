import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext.jsx';
import Auth from './pages/Auth.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Chat from './pages/Chat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Map from './pages/Map.jsx';

function ProtectedRoute({ children }) {
  const { state } = useApp();
  if (!state.token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { state } = useApp();
  if (state.token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Restore token from localStorage on mount
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
        <Route
          path="/"
          element={<Navigate to="/auth" replace />}
        />
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
