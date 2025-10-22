import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../store/userAtom';
import { isDarkModeAtom, setThemeAtom } from '../store/themeAtom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user] = useAtom(currentUserAtom);
  const [isDarkMode] = useAtom(isDarkModeAtom);
  const [, setTheme] = useAtom(setThemeAtom);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: '🏠' },
    { name: '프로필', href: '/profile', icon: '👤' },
    { name: '설정', href: '/settings', icon: '⚙️' },
  ];

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
        animate={{ x: isLg ? 0 : (sidebarOpen ? 0 : -256) }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                ChatZPT
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800'
                  }`}
                  onClick={() => { if (!isLg) setSidebarOpen(false); }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and theme toggle */}
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
                  {user?.name || '사용자'}
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              buttonVariant="outline"
              buttonSize="sm"
              onClick={toggleTheme}
              className="w-full"
            >
              {isDarkMode ? '☀️ 라이트 모드' : '🌙 다크 모드'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64 flex-1">
        {/* Top bar */}
        <header className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                {navigation.find(item => item.href === location.pathname)?.name || 'ChatZPT'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
            <Button
              buttonVariant="outline"
              buttonSize="sm"
              onClick={logout}
            >
              로그아웃
            </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
