import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, SystemHealth } from '../types';
import { checkHealth, getUserProfile, getCurrentUser, logoutUser } from '../services/api';

interface AppContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  health: SystemHealth | null;
  isBackendOnline: boolean;
  login: (token: string, profile: UserProfile) => void;
  logout: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  updateXpAndLevel: (xp: number, level: number) => void;
  completeQuest: (auraEarned?: number, xpEarned?: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sadhana_token'));
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('sadhana_active_user');
    if (cached) {
      try { return JSON.parse(cached); } catch { return null; }
    }
    return null;
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  const refreshHealth = async () => {
    try {
      const data = await checkHealth();
      setHealth(data);
      setIsBackendOnline(data.status === 'ok');
    } catch {
      setIsBackendOnline(false);
      setHealth(null);
    }
  };

  // Check auth session on startup
  useEffect(() => {
    refreshHealth();

    const initAuth = async () => {
      const activeToken = localStorage.getItem('sadhana_token');
      if (activeToken) {
        try {
          const userProf = await getCurrentUser();
          setProfile(userProf);
          localStorage.setItem('sadhana_active_user', JSON.stringify(userProf));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          localStorage.removeItem('sadhana_token');
          localStorage.removeItem('sadhana_active_user');
          setToken(null);
          setProfile(null);
        }
      }
      setIsLoadingAuth(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newProfile: UserProfile) => {
    localStorage.setItem('sadhana_token', newToken);
    localStorage.setItem('sadhana_active_user', JSON.stringify(newProfile));
    setToken(newToken);
    setProfile(newProfile);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      localStorage.removeItem('sadhana_token');
      localStorage.removeItem('sadhana_active_user');
      setToken(null);
      setProfile(null);
    }
  };

  const updateXpAndLevel = (xp: number, level: number) => {
    if (profile) {
      const updated: UserProfile = {
        ...profile,
        current_xp: xp,
        xp: xp,
        current_level: level,
        level: level,
        aura_score: (profile.aura_score || 100) + 15,
        total_aura: (profile.total_aura || 4320) + 15,
      };
      setProfile(updated);
      localStorage.setItem('sadhana_active_user', JSON.stringify(updated));
    }
  };

  const completeQuest = async (auraEarned = 200, xpEarned = 200) => {
    // 1. Mark session today completed in storage
    sessionStorage.setItem('sadhana_today_quest_completed', 'true');
    localStorage.setItem('sadhana_today_quest_completed', 'true');
    const todayKey = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`sadhana_quest_completed_${todayKey}`, 'true');

    // 2. Mark cached active plan exercises as completed
    const cachedPlan = sessionStorage.getItem('sadhana_active_plan');
    if (cachedPlan) {
      try {
        const plan = JSON.parse(cachedPlan);
        if (plan?.exercises) {
          plan.exercises.forEach((ex: any) => {
            ex.completed = true;
            ex.is_completed = true;
          });
        }
        sessionStorage.setItem('sadhana_active_plan', JSON.stringify(plan));
        window.dispatchEvent(new CustomEvent('sadhana_plan_updated', { detail: plan }));
      } catch (e) {
        console.warn('Error marking exercises complete:', e);
      }
    }

    // 3. Update local profile state
    if (profile) {
      const prevStreak = profile.current_streak ?? profile.streak ?? 12;
      const prevCompleted = profile.workouts_completed_count ?? 1;
      const prevAura = profile.total_aura ?? profile.aura_score ?? 4320;
      const prevXp = profile.current_xp ?? profile.xp ?? 6240;

      const newXp = prevXp + xpEarned;
      const newAura = prevAura + auraEarned;
      const newLevel = Math.max(profile.current_level || 1, Math.floor(newXp / 500) + 1);
      const newStreak = prevStreak + 1;
      const newCompleted = prevCompleted + 1;

      const updated: UserProfile = {
        ...profile,
        current_xp: newXp,
        xp: newXp,
        current_level: newLevel,
        level: newLevel,
        aura_score: newAura,
        total_aura: newAura,
        current_streak: newStreak,
        streak: newStreak,
        workouts_completed_count: newCompleted,
      };

      setProfile(updated);
      localStorage.setItem('sadhana_active_user', JSON.stringify(updated));

      // 4. Dispatch event for UI components listening for quest completion
      window.dispatchEvent(new CustomEvent('sadhana_quest_completed', { detail: { profile: updated } }));

      // 5. Sync to backend
      try {
        const baseApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
        await fetch(`${baseApi}/users/add-xp/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            xp: xpEarned,
            username: profile.username || profile.name,
          }),
        });
      } catch (err) {
        console.warn('Backend add-xp sync skipped or offline:', err);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        token,
        isAuthenticated: Boolean(token && profile),
        isLoadingAuth,
        health,
        isBackendOnline,
        login,
        logout,
        refreshHealth,
        updateXpAndLevel,
        completeQuest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
