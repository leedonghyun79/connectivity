'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.')
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // 1. Zod 유효성 검사
      const validationResult = loginSchema.safeParse(formData);

      if (!validationResult.success) {
        const flattened = validationResult.error.flatten().fieldErrors;
        setErrors({
          username: flattened.username?.[0],
          password: flattened.password?.[0]
        });
        setIsLoading(false);
        return;
      }

      // 2. 로그인 시도
      const result = await signIn('credentials', {
        redirect: false,
        username: formData.username,
        password: formData.password,
      });

      if (result?.error) {
        toast.error('아이디 혹은 비밀번호가 일치하지 않습니다.');
      } else {
        toast.success('관리자 시스템에 접속되었습니다.');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast.error('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] p-12 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-white" size={28} />
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">
            시스템 권한 인증
          </div>
          <h1 className="text-4xl font-poppins font-black text-gray-900 tracking-tighter uppercase mb-2">
            ADMIN LOGIN
          </h1>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-black transition-colors block ml-1">
              아이디 (ID)
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="text"
                placeholder="아이디 입력"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-black/5 outline-none font-bold text-sm transition-all text-gray-900 placeholder:text-gray-400
                  ${errors.username ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-gray-200'}`}
              />
            </div>
            {errors.username && <p className="text-xs text-red-500 font-bold ml-1 mt-1">{errors.username}</p>}
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-black transition-colors block ml-1">
              비밀번호 (PASSWORD)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호 입력"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-black/5 outline-none font-bold text-sm transition-all text-gray-900 placeholder:text-gray-400
                  ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-gray-200'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 font-bold ml-1 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-black hover:bg-gray-900 text-white rounded-2xl py-5 font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Lock size={16} />
                로그인 및 인증 시작
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold text-gray-300">
          테스트 계정 : admin / admin123!
        </div>
      </div>
    </div>
  );
}
