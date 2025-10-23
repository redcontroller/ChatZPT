import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, setAuthAtom } from '../store/authAtom';
import { authService } from '../services/authService';
import { Button } from './Button';

const Header: React.FC = () => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, setAuth] = useAtom(setAuthAtom);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setAuth({ isAuthenticated: false, accessToken: null, refreshToken: null, expiresAt: null });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm border-b border-secondary-200 dark:border-secondary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
              ChatZPT
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button buttonVariant="outline" buttonSize="md">대시보드</Button>
                </Link>
                <Button 
                  buttonVariant="secondary" 
                  buttonSize="md"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button buttonVariant="outline" buttonSize="md">로그인</Button>
                </Link>
                <Link to="/register">
                  <Button buttonVariant="primary" buttonSize="md">회원가입</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
