import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { setAuthAtom } from '../store/authAtom';
import { authService } from '../services/authService';
import { Button } from './Button';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [, setAuth] = useAtom(setAuthAtom);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: '🏠' },
    { name: '프로필', href: '/profile', icon: '👤' },
    { name: '설정', href: '/settings', icon: '⚙️' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setAuth({ isAuthenticated: false, accessToken: null, refreshToken: null, expiresAt: null });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Track lg breakpoint to keep sidebar open and disable animation on lg
  const [isLg, setIsLg] = useState<boolean>(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setIsLg(e.matches);
    setIsLg(mq.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } else {
      // @ts-ignore - Safari fallback
      mq.addListener(onChange);
      return () => {
        // @ts-ignore
        mq.removeListener(onChange);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {!isLg && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        isLg={isLg}
        onToggle={toggleSidebar}
      />

      {/* Main content */}
      <div className="lg:pl-64 flex-1">
        {/* Top bar with sidebar toggle and page title - Fixed */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                {navigation.find(item => item.href === location.pathname)?.name || '대화'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                buttonVariant="outline"
                buttonSize="sm"
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

