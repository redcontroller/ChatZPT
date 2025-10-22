import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Card from '../components/Card';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { verifyEmail } = useAuth();

  useEffect(() => {
    if (token) {
      handleVerifyEmail();
    }
  }, [token]);

  const handleVerifyEmail = async () => {
    if (!token) {
      setError('유효하지 않은 인증 링크입니다');
      return;
    }

    setIsLoading(true);
    const result = await verifyEmail(token);
    
    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error?.message || '이메일 인증에 실패했습니다');
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
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
              className="mx-auto h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              이메일 인증 중...
            </h2>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
              잠시만 기다려주세요
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
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
              이메일이 인증되었습니다!
            </h2>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
              이제 ChatZPT의 모든 기능을 사용할 수 있습니다
            </p>
          </div>

          <Card>
            <div className="text-center space-y-4">
              <Link to="/dashboard">
                <Button className="w-full">
                  대시보드로 이동
                </Button>
              </Link>
              <Link to="/login">
                <Button buttonVariant="outline" buttonSize="md" className="w-full">
                  로그인하기
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
            className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            인증 실패
          </h2>
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            {error || '이메일 인증에 실패했습니다'}
          </p>
        </div>

        <Card>
          <div className="text-center space-y-4">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              인증 링크가 만료되었거나 유효하지 않습니다. 다시 시도해보세요.
            </p>
            <Button
              buttonVariant="outline"
              onClick={handleVerifyEmail}
              className="w-full"
            >
              다시 시도
            </Button>
            <Link to="/login">
              <Button buttonVariant="ghost" className="w-full">
                로그인으로 돌아가기
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
