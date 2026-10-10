import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderHud } from './components/HeaderHud';
import { AiCoachDrawer } from './components/AiCoachDrawer';
import { HomeView } from './views/HomeView';
import { HomeDashboardView } from './views/HomeDashboardView';
import { OnboardingView } from './views/OnboardingView';
import { ClassRevealView } from './views/ClassRevealView';
import { TodayWorkoutView } from './views/TodayWorkoutView';
import { WorkoutPlayerView } from './views/WorkoutPlayerView';
import { ProgressView } from './views/ProgressView';
import { ProfileView } from './views/ProfileView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { CommunityView } from './views/CommunityView';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useApp();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isPlayerView = location.pathname === '/player';
  const isGameHubView =
    location.pathname === '/home' ||
    location.pathname === '/quest' ||
    location.pathname === '/today' ||
    location.pathname === '/progress' ||
    location.pathname === '/profile' ||
    location.pathname === '/player' ||
    location.pathname === '/community';

  const isHomeLanding = location.pathname === '/';
  const hideMarketingHeader = isAuthPage || isGameHubView || isHomeLanding;
  const hideMarketingShell = isAuthPage || isGameHubView;

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isGameHubView ? 'bg-[#24170f] text-[#fff0cf]' : 'bg-[#FFFBF2] text-[#352419]'
      } selection:bg-[#F3E8CF] selection:text-[#6D291C]`}
    >
      {/* Marketing Header (removed on home landing to prevent duplicate header) */}
      {!hideMarketingHeader && <HeaderHud />}

      {/* Main View Router */}
      <main className="flex-1">
        <Routes>
          {/* Landing / Marketing route */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <HomeView />}
          />

          {/* Dedicated Game & Warrior Pages */}
          <Route path="/home" element={<HomeDashboardView />} />
          <Route path="/quest" element={<TodayWorkoutView />} />
          <Route path="/today" element={<TodayWorkoutView />} />
          <Route path="/progress" element={<ProgressView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/player" element={<WorkoutPlayerView />} />
          <Route path="/community" element={<CommunityView />} />

          {/* Auth & Onboarding */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/onboarding" element={<OnboardingView />} />
          <Route path="/reveal" element={<ClassRevealView />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Bottom-Right sAI Companion (available across all views including active exercise player) */}
      {!isAuthPage && <AiCoachDrawer />}

      {/* Global Marketing Site Footer */}
      {!hideMarketingShell && (
        <footer className="site-footer">
          <div className="wrap footer-inner">
            <a className="footer-brand" href="#home">
              <img alt="Sādhanā mascot" src="/assets/sai_logo.png" />
              <span>SĀDHANĀ</span>
            </a>
            <span>Adapt to the person. Challenge the person. Develop the person.</span>
            <div className="footer-links">
              <a href="#why">Why Sādhanā</a>
              <a href="#classes">Classes</a>
              <a href="#home">Back to top ↑</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
