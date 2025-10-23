import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '../store/authAtom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import Header from '../components/Header';

const HomePage: React.FC = () => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800">
      <Header />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-secondary-900 dark:text-secondary-100 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            AI 캐릭터와
            <br />
            <span className="text-primary-600">대화하며 즐기세요</span>
          </motion.h1>
          
          <motion.p
            className="text-xl text-secondary-600 dark:text-secondary-400 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            ChatZPT는 다양한 AI 캐릭터와 자연스러운 대화를 나눌 수 있는 혁신적인 채팅 서비스입니다.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button buttonVariant="primary" buttonSize="lg">대시보드로 이동</Button>
              </Link>
            ) : (
              <Link to="/dashboard">
                <Button 
                  buttonVariant="primary"
                  buttonSize="lg"
                >지금 시작하기</Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            주요 기능
          </h2>
          <p className="text-lg text-secondary-600 dark:text-secondary-400">
            ChatZPT가 제공하는 다양한 기능들을 만나보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card hover className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                다양한 AI 캐릭터
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                각기 다른 성격과 전문성을 가진 AI 캐릭터들과 대화해보세요
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card hover className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                자연스러운 대화
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                최신 AI 기술로 구현된 자연스럽고 맥락적인 대화를 경험하세요
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card hover className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                개인화된 경험
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                사용자의 취향에 맞춰 커스터마이징된 대화 경험을 제공합니다
              </p>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm border-t border-secondary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-secondary-500 dark:text-secondary-400">
              © 2025 ChatZPT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
