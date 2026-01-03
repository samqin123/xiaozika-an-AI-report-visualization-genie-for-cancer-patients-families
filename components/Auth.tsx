
import React, { useState } from 'react';
// Corrected import to use the central services index which exports supabase
import { supabase } from '../services';
import { Heart, Mail, Lock, LogIn, UserPlus, Chrome, Zap, ChevronRight, Loader2 } from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('验证邮件已发送，请检查邮箱');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@xiaoyibao.com.cn',
        password: '123456'
      });
      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setError('快速登录失败，请检查网络或账号状态');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] flex flex-col items-center justify-center p-6">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
        {/* Logo 部分 */}
        <div className="text-center space-y-4">
          <div className="inline-flex w-24 h-24 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-[2.5rem] items-center justify-center shadow-2xl shadow-purple-200 rotate-6 hover:rotate-0 transition-transform duration-500">
            <Heart className="text-white fill-white" size={48} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-purple-900 tracking-tighter">小紫卡</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">智慧病情管理与可视化助手</p>
          </div>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border border-purple-50 shadow-2xl shadow-purple-50/50 space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">电子邮箱</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-gray-50/50 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 ring-purple-400 transition-all font-medium text-gray-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">安全密码</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50/50 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 ring-purple-400 transition-all font-medium text-gray-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold text-center animate-bounce">{error}</p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-purple-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-purple-700"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isLogin ? (
                <><LogIn size={20} /> 立即登录</>
              ) : (
                <><UserPlus size={20} /> 注册账号</>
              )}
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300 bg-transparent px-4">或通过以下方式</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-4 bg-white border border-gray-100 rounded-2xl text-gray-600 font-bold text-xs hover:bg-gray-50 transition active:scale-95 shadow-sm"
            >
              <Chrome size={18} className="text-red-400" /> Google
            </button>
            <button
              onClick={handleQuickLogin}
              className="flex items-center justify-center gap-2 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition active:scale-95 shadow-sm"
            >
              <Zap size={18} className="fill-indigo-600" /> 一键登录
            </button>
          </div>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-xs font-bold text-gray-400 hover:text-purple-600 transition"
          >
            {isLogin ? "还没有账号？点击注册新用户" : "已有账号？返回登录界面"}
          </button>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase flex items-center justify-center gap-2">
            <Heart size={10} /> 极致安全的数据加密技术支持
          </p>
        </div>
      </div>
    </div>
  );
};
