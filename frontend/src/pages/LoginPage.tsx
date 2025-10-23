import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useAtom } from 'jotai';
import { authLoadingAtom } from '../store/loadingAtom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useTestAccount, setUseTestAccount] = useState(false);
  
  const { login } = useAuth();
  const [isLoading] = useAtom(authLoadingAtom);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleTestAccountToggle = () => {
    const newUseTestAccount = !useTestAccount;
    setUseTestAccount(newUseTestAccount);
    
    if (newUseTestAccount) {
      setFormData({
        email: 'admin@chatzpt.com',
        password: 'Admin123!',
        rememberMe: formData.rememberMe,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        rememberMe: formData.rememberMe,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrors({
        general: result.error?.message || '로그인에 실패했습니다',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <span className="text-white font-bold text-2xl">C</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            로그인
          </h2>
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            ChatZPT에 오신 것을 환영합니다
          </p>
        </div>

        {/* Test Account Toggle */}
        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              테스트 계정 사용
            </span>
            <button
              type="button"
              onClick={handleTestAccountToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                useTestAccount ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useTestAccount ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Test Account Info */}
        <AnimatePresence>
          {useTestAccount && (
            <motion.div
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-600 dark:text-blue-400">🧪</span>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  테스트 계정 정보
                </span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <div><strong>이메일:</strong> admin@chatzpt.com</div>
                <div><strong>비밀번호:</strong> Admin123!</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {errors.general}
              </motion.div>
            )}

            <Input
              label="이메일"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="이메일을 입력하세요"
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              label="비밀번호"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="비밀번호를 입력하세요"
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300">
                  로그인 상태 유지
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </div>

            <Button
              buttonVariant="primary"
              buttonSize="md"
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>

            <div className="text-center">
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                계정이 없으신가요?{' '}
              </span>
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                회원가입
              </Link>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            © 2024 ChatZPT. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
