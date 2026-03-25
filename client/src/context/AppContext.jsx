import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = {
  token: null,
  user: null,
  currentPlan: null,
  onboarding: {
    goal: '',
    motivation: '',
    priorExperience: '',
    notificationTime: '08:00'
  },
  loading: false,
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user
      };

    case 'LOGOUT':
      localStorage.removeItem('baderech_token');
      localStorage.removeItem('baderech_user');
      return {
        ...initialState
      };

    case 'SET_CURRENT_PLAN':
      return {
        ...state,
        currentPlan: action.payload
      };

    case 'UPDATE_ONBOARDING':
      return {
        ...state,
        onboarding: {
          ...state.onboarding,
          ...action.payload
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'COMPLETE_TODAY': {
      if (!state.currentPlan) return state;
      const updatedMovements = state.currentPlan.movements.map((m) =>
        m.day === state.currentPlan.currentDay
          ? { ...m, completed: true, completedAt: new Date().toISOString() }
          : m
      );
      return {
        ...state,
        currentPlan: {
          ...state.currentPlan,
          movements: updatedMovements,
          currentDay: state.currentPlan.currentDay + 1
        }
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
