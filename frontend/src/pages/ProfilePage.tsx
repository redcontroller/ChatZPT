import React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../store/userAtom';
import Card from '../components/Card';

const ProfilePage: React.FC = () => {
  const [user] = useAtom(currentUserAtom);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
          프로필
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-2">
          계정 정보를 확인하고 관리하세요.
        </p>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">
                {user?.name || '사용자'}
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400">
                {user?.email}
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.emailVerified 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {user?.emailVerified ? '이메일 인증됨' : '이메일 미인증'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  활성 계정
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Account Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            계정 정보
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  이름
                </label>
                <p className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {user?.name || '설정되지 않음'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  이메일
                </label>
                <p className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {user?.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  가입일
                </label>
                <p className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '알 수 없음'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  마지막 로그인
                </label>
                <p className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ko-KR') : '알 수 없음'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            환경 설정
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  테마
                </label>
                <p className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {user?.preferences?.theme === 'light' ? '라이트 모드' : 
                   user?.preferences?.theme === 'dark' ? '다크 모드' : '시스템 설정'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  언어
                </label>
                <p className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {user?.preferences?.language === 'ko' ? '한국어' : 'English'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  이메일 알림
                </label>
                <p className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {user?.preferences?.notifications?.email ? '활성화' : '비활성화'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  푸시 알림
                </label>
                <p className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {user?.preferences?.notifications?.push ? '활성화' : '비활성화'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
