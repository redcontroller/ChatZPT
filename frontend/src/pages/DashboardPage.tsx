import React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../store/userAtom';
import Card from '../components/Card';

const DashboardPage: React.FC = () => {
  const [user] = useAtom(currentUserAtom);

  return (
    <div className="space-y-8 w-full">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
          안녕하세요, {user?.name || user?.email}님! 👋
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-2">
          ChatZPT에 오신 것을 환영합니다. AI 캐릭터와 대화를 시작해보세요.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card hover>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  총 대화 수
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  0
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card hover>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  사용 가능한 캐릭터
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  5
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card hover>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  즐겨찾기 캐릭터
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  0
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            빠른 시작
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎭</span>
                </div>
                <div>
                  <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
                    새로운 대화 시작
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    AI 캐릭터와 대화를 시작하세요
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
                    캐릭터 탐색
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    다양한 AI 캐릭터를 만나보세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            최근 활동
          </h2>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400">
              아직 활동이 없습니다. 첫 대화를 시작해보세요!
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
