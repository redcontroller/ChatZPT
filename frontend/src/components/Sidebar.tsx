import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../store/userAtom';
import { isDarkModeAtom, setThemeAtom } from '../store/themeAtom';
import { Button } from './Button';

interface SidebarProps {
  isOpen: boolean;
  isLg: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isLg, onToggle }) => {
  const [user] = useAtom(currentUserAtom);
  const [isDarkMode] = useAtom(isDarkModeAtom);
  const [, setTheme] = useAtom(setThemeAtom);
  const location = useLocation();

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: '🏠' },
    { name: '캐릭터 선택', href: '/characters', icon: '💬' },
    { name: '프로필', href: '/profile', icon: '👤' },
    { name: '설정', href: '/settings', icon: '⚙️' },
  ];

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <motion.div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      initial={false}
      animate={{ x: isLg ? 0 : (isOpen ? 0 : -256) }}
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
            onClick={onToggle}
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
                onClick={() => { if (!isLg) onToggle(); }}
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
  );
};

export default Sidebar;
