import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 pt-8">
      {/* Settings Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
          설정
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-2">
          계정 및 애플리케이션 설정을 관리하세요.
        </p>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            계정 설정
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                  프로필 정보 수정
                </h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  이름, 아바타, 소개 등을 수정할 수 있습니다
                </p>
              </div>
              <Button buttonVariant="outline" buttonSize="sm">
                수정
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                  비밀번호 변경
                </h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  계정 보안을 위해 정기적으로 비밀번호를 변경하세요
                </p>
              </div>
              <Button buttonVariant="outline" buttonSize="sm">
                변경
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            개인정보 설정
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                  이메일 알림
                </h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  중요한 업데이트 및 알림을 이메일로 받습니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                  푸시 알림
                </h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  브라우저 푸시 알림을 받습니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* App Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            애플리케이션 설정
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                  테마
                </h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  라이트 모드, 다크 모드, 시스템 설정 중 선택
                </p>
              </div>
              <select className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100">
                <option value="system">시스템 설정</option>
                <option value="light">라이트 모드</option>
                <option value="dark">다크 모드</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                  언어
                </h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  애플리케이션 언어를 선택하세요
                </p>
              </div>
              <select className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100">
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            위험 구역
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                  계정 삭제
                </h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  계정과 모든 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <Button buttonVariant="danger" buttonSize="sm">
                계정 삭제
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
