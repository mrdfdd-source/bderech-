import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Auth() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(loginForm);
      const { token, user } = res.data;
      localStorage.setItem('baderech_token', token);
      localStorage.setItem('baderech_user', JSON.stringify(user));
      dispatch({ type: 'SET_AUTH', payload: { token, user } });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בכניסה');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (registerForm.password.length < 6) {
      setError('סיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(registerForm);
      const { token, user } = res.data;
      localStorage.setItem('baderech_token', token);
      localStorage.setItem('baderech_user', JSON.stringify(user));
      dispatch({ type: 'SET_AUTH', payload: { token, user } });
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-[#F5A623]">בדרך</h2>
        <div className="w-6" />
      </div>

      {/* Tab switcher */}
      <div className="px-5 mb-8">
        <div className="flex bg-[#1a1a1a] rounded-2xl p-1">
          {[
            { id: 'login', label: 'כניסה' },
            { id: 'register', label: 'הרשמה' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${
                tab === t.id
                  ? 'bg-[#F5A623] text-black shadow-md'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Forms */}
      <div className="flex-1 px-5">
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">אימייל</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="input-field"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">סיסמה</label>
              <input
                type="password"
                placeholder="••••••"
                className="input-field"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                dir="ltr"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'נכנס...' : 'כניסה'}
            </button>

            <p className="text-center text-gray-600 text-sm mt-2">
              אין לך חשבון?{' '}
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-[#F5A623] hover:underline"
              >
                הירשם כאן
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">שם מלא</label>
              <input
                type="text"
                placeholder="איך קוראים לך?"
                className="input-field"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">אימייל</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="input-field"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">סיסמה</label>
              <input
                type="password"
                placeholder="לפחות 6 תווים"
                className="input-field"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                dir="ltr"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'נרשם...' : 'בואו נתחיל'}
            </button>

            <p className="text-center text-gray-600 text-sm mt-2">
              כבר יש לך חשבון?{' '}
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-[#F5A623] hover:underline"
              >
                כנס כאן
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-gray-700 text-xs pb-8 px-5">
        בדרך — כל תנועה קטנה קדימה נחשבת
      </p>
    </div>
  );
}
