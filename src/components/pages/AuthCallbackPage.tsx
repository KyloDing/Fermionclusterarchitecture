import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Loader2, AlertCircle, CheckCircle2, Cpu } from 'lucide-react';
import { Button } from '../ui/button';
import { handleCallback, saveAuthTokens } from '../../services/authService';

interface AuthCallbackPageProps {
  onSuccess: (accessToken: string, user?: any) => void;
  onError: () => void;
}

export default function AuthCallbackPage({ onSuccess, onError }: AuthCallbackPageProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    processCallback();
  }, []);

  const processCallback = async () => {
    try {
      // 从URL获取授权码和state
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      // 检查错误
      if (error) {
        throw new Error(errorDescription || error);
      }

      if (!code) {
        throw new Error('未收到授权码');
      }

      if (!state) {
        throw new Error('缺少state参数');
      }

      // 交换授权码获取令牌
      const tokens = await handleCallback(code, state);
      saveAuthTokens(tokens);

      setStatus('success');

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        onSuccess(tokens.accessToken);
      }, 1500);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setErrorMessage(error.message || '认证失败');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Logo */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl text-slate-900">费米集群</h1>
            <p className="text-xs text-slate-500">Fermi Cluster Platform</p>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600" />
          
          <CardContent className="p-12">
            {status === 'processing' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl animate-pulse opacity-20" />
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin relative z-10" />
                </div>
                <h2 className="text-2xl text-slate-900 mb-3">正在处理认证</h2>
                <p className="text-slate-600 leading-relaxed">
                  正在与身份认证中心建立安全连接
                  <br />
                  <span className="text-sm text-slate-500">请稍候...</span>
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl text-slate-900 mb-3">认证成功</h2>
                <p className="text-slate-600 leading-relaxed">
                  欢迎回来！正在跳转到控制台
                  <br />
                  <span className="text-sm text-slate-500">请稍候...</span>
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl text-slate-900 mb-3">认证失败</h2>
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-6">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
                <Button 
                  onClick={onError} 
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800"
                >
                  返回登录页
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
