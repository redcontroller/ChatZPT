import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await forgotPassword(email);
    
    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error?.message || '이메일 전송에 실패했습니다');
    }
    
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              이메일을 확인하세요
            </h2>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
              비밀번호 재설정 링크가 {email}로 전송되었습니다
            </p>
          </div>

          <Card>
            <div className="text-center space-y-4">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                이메일을 받지 못하셨나요? 스팸 폴더를 확인하거나 다시 시도해보세요.
              </p>
              <Button
                buttonVariant="outline"
                buttonSize="sm"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="w-full"
              >
                다시 시도
              </Button>
              <Link to="/login">
                <Button buttonVariant="ghost" buttonSize="sm" className="w-full">
                  로그인으로 돌아가기
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

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
            비밀번호 재설정
          </h2>
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            비밀번호를 재설정할 이메일 주소를 입력하세요
          </p>
        </div>

        {/* Form */}
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.div>
            )}

            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Button
              buttonVariant="primary"
              buttonSize="sm"
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? '전송 중...' : '재설정 링크 전송'}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
