'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data.email, data.password);

      if (response.success && response.data) {
        setUser(response.data.user);
        router.push('/dashboard');
      } else {
        setError(response.error || '로그인에 실패했습니다');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">VIBE</h1>
          <p className="text-sm text-gray-600 mt-1">치과 경영 분석 시스템</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              이메일
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="input mt-1"
              placeholder="example@clinic.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="label">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="input mt-1"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">계정이 없으신가요? </span>
          <Link href="/auth/signup" className="text-primary-600 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
