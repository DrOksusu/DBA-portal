'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/lib/store';
import {
  User,
  Building2,
  Bell,
  Lock,
  Palette,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'clinic' | 'notifications' | 'security' | 'appearance';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: '프로필', icon: User },
    { id: 'clinic' as SettingsTab, label: '병원 정보', icon: Building2 },
    { id: 'notifications' as SettingsTab, label: '알림 설정', icon: Bell },
    { id: 'security' as SettingsTab, label: '보안', icon: Lock },
    { id: 'appearance' as SettingsTab, label: '테마', icon: Palette },
  ];

  return (
    <>
      <Header title="설정" />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Tabs */}
            <div className="w-full md:w-48 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="card">
                <div className="card-body space-y-6">
                  {/* Profile Settings */}
                  {activeTab === 'profile' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">프로필 설정</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="label">이름</label>
                          <input
                            type="text"
                            defaultValue={user?.name}
                            className="input mt-1"
                          />
                        </div>
                        <div>
                          <label className="label">이메일</label>
                          <input
                            type="email"
                            defaultValue={user?.email}
                            className="input mt-1"
                          />
                        </div>
                        <div>
                          <label className="label">연락처</label>
                          <input
                            type="tel"
                            className="input mt-1"
                            placeholder="010-1234-5678"
                          />
                        </div>
                        <div>
                          <label className="label">직책</label>
                          <input
                            type="text"
                            defaultValue={user?.role === 'ADMIN' ? '관리자' : '직원'}
                            className="input mt-1"
                            disabled
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Clinic Settings */}
                  {activeTab === 'clinic' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">병원 정보</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="label">병원명</label>
                          <input
                            type="text"
                            defaultValue="VIBE 치과의원"
                            className="input mt-1"
                          />
                        </div>
                        <div>
                          <label className="label">사업자등록번호</label>
                          <input
                            type="text"
                            className="input mt-1"
                            placeholder="000-00-00000"
                          />
                        </div>
                        <div>
                          <label className="label">주소</label>
                          <input
                            type="text"
                            className="input mt-1"
                            placeholder="서울시 강남구..."
                          />
                        </div>
                        <div>
                          <label className="label">전화번호</label>
                          <input
                            type="tel"
                            className="input mt-1"
                            placeholder="02-1234-5678"
                          />
                        </div>
                        <div>
                          <label className="label">운영 시간</label>
                          <div className="grid grid-cols-2 gap-4 mt-1">
                            <input
                              type="time"
                              defaultValue="09:00"
                              className="input"
                            />
                            <input
                              type="time"
                              defaultValue="18:00"
                              className="input"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">알림 설정</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b">
                          <div>
                            <p className="font-medium text-gray-900">이메일 알림</p>
                            <p className="text-sm text-gray-500">
                              중요한 업데이트를 이메일로 받습니다
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b">
                          <div>
                            <p className="font-medium text-gray-900">재고 부족 알림</p>
                            <p className="text-sm text-gray-500">
                              재고가 최소 수량 이하일 때 알림을 받습니다
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b">
                          <div>
                            <p className="font-medium text-gray-900">급여 알림</p>
                            <p className="text-sm text-gray-500">
                              급여일 전에 알림을 받습니다
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900">마케팅 리포트</p>
                            <p className="text-sm text-gray-500">
                              주간/월간 마케팅 성과 리포트를 받습니다
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">보안 설정</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="label">현재 비밀번호</label>
                          <input
                            type="password"
                            className="input mt-1"
                            placeholder="현재 비밀번호를 입력하세요"
                          />
                        </div>
                        <div>
                          <label className="label">새 비밀번호</label>
                          <input
                            type="password"
                            className="input mt-1"
                            placeholder="새 비밀번호를 입력하세요"
                          />
                        </div>
                        <div>
                          <label className="label">비밀번호 확인</label>
                          <input
                            type="password"
                            className="input mt-1"
                            placeholder="새 비밀번호를 다시 입력하세요"
                          />
                        </div>
                        <div className="pt-4 border-t">
                          <h4 className="font-medium text-gray-900 mb-3">2단계 인증</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">
                                로그인 시 추가 인증을 요구합니다
                              </p>
                            </div>
                            <button className="btn-secondary text-sm">설정</button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Appearance Settings */}
                  {activeTab === 'appearance' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">테마 설정</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="label">테마</label>
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <button className="p-4 border-2 border-primary-500 rounded-lg bg-white">
                              <div className="h-8 bg-gray-100 rounded mb-2"></div>
                              <p className="text-sm font-medium">라이트</p>
                            </button>
                            <button className="p-4 border-2 border-gray-200 rounded-lg bg-white hover:border-gray-300">
                              <div className="h-8 bg-gray-800 rounded mb-2"></div>
                              <p className="text-sm font-medium">다크</p>
                            </button>
                            <button className="p-4 border-2 border-gray-200 rounded-lg bg-white hover:border-gray-300">
                              <div className="h-8 bg-gradient-to-r from-gray-100 to-gray-800 rounded mb-2"></div>
                              <p className="text-sm font-medium">시스템</p>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="label">메인 컬러</label>
                          <div className="flex space-x-3 mt-2">
                            {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'].map(
                              (color) => (
                                <button
                                  key={color}
                                  className={cn(
                                    'w-10 h-10 rounded-full border-2',
                                    color === '#3b82f6'
                                      ? 'border-gray-900'
                                      : 'border-transparent'
                                  )}
                                  style={{ backgroundColor: color }}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <button onClick={handleSave} className="btn-primary">
                      <Save className="h-4 w-4 mr-2" />
                      {saved ? '저장됨!' : '저장'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
