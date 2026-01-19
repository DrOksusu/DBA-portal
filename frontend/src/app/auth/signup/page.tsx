'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';

const signupSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || '회원가입에 실패했습니다');
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card">
        <div className="card-body space-y-6 text-center">
          <div className="text-green-600">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">회원가입 완료</h2>
          <p className="text-gray-600">
            관리자 승인 후 로그인이 가능합니다.
            <br />
            승인 완료 시 이메일로 안내드립니다.
          </p>
          <Link href="/auth/login" className="btn-primary inline-block">
            로그인 페이지로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-sm text-gray-600 mt-1">VIBE 치과 경영 분석 시스템</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="label">
              이름
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="input mt-1"
              placeholder="홍길동"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

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
              placeholder="8자 이상"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="input mt-1"
              placeholder="비밀번호 재입력"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">이미 계정이 있으신가요? </span>
          <Link href="/auth/login" className="text-primary-600 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
