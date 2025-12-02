import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  KeySquare,
  Shield,
  Zap,
  Globe,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Sparkles,
  LayoutGrid,
  Server,
  Layers,
} from 'lucide-react';
import { initiateLogin, loginWithPassword, saveAuthTokens } from '../../services/authService';
import { toast } from 'sonner@2.0.3';

interface LoginPageProps {
  onLoginSuccess: (accessToken: string, user?: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // SSO登录
  const handleSSOLogin = async () => {
    setLoading(true);
    try {
      await initiateLogin();
    } catch (error) {
      toast.error('启动SSO登录失败');
      setLoading(false);
    }
  };

  // 用户名密码登录
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const { tokens, user } = await loginWithPassword(username, password);
      saveAuthTokens(tokens);
      toast.success(`欢迎回来，${user.name}！`, {
        description: `角色：${user.roles.join(', ')}`,
      });
      onLoginSuccess(tokens.accessToken, user);
    } catch (error: any) {
      toast.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 快速登录
  const handleQuickLogin = async (username: string, password: string) => {
    setLoading(true);
    try {
      const { tokens, user } = await loginWithPassword(username, password);
      saveAuthTokens(tokens);
      toast.success(`欢迎回来，${user.name}！`, {
        description: `角色：${user.roles.join(', ')}`,
      });
      onLoginSuccess(tokens.accessToken, user);
    } catch (error: any) {
      toast.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* 背景装饰 - 使用平台主题色 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 紫色渐变球 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl" />
        
        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航栏 */}
        <header className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-slate-900">费米集群</h1>
                <p className="text-xs text-slate-500">Fermi Cluster Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                <Sparkles className="w-3 h-3 mr-1" />
                企业版
              </Badge>
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧 - 信息展示 */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>下一代AI算力平台</span>
                </div>
                <h2 className="text-4xl lg:text-5xl text-slate-900 leading-tight">
                  高性能异构算力
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    智能调度平台
                  </span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                  基于Kubernetes构建的企业级AI算力管理平台，提供GPU资源池化、模型训练、推理服务等一站式解决方案
                </p>
              </div>

              {/* 核心特性网格 */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <FeatureCard
                  icon={<Zap className="w-5 h-5" />}
                  title="弹性调度"
                  description="多集群统一调度"
                  color="purple"
                />
                <FeatureCard
                  icon={<Shield className="w-5 h-5" />}
                  title="企业级安全"
                  description="统一身份认证"
                  color="blue"
                />
                <FeatureCard
                  icon={<Server className="w-5 h-5" />}
                  title="异构计算"
                  description="支持多种加速卡"
                  color="indigo"
                />
                <FeatureCard
                  icon={<Layers className="w-5 h-5" />}
                  title="分布式存储"
                  description="PB级存储容量"
                  color="violet"
                />
              </div>

              {/* 统计数据 */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl text-slate-900 mb-1">99.9%</div>
                  <div className="text-sm text-slate-600">服务可用性</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div>
                  <div className="text-3xl text-slate-900 mb-1">10k+</div>
                  <div className="text-sm text-slate-600">GPU核心</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div>
                  <div className="text-3xl text-slate-900 mb-1">7×24</div>
                  <div className="text-sm text-slate-600">技术支持</div>
                </div>
              </div>
            </div>

            {/* 右侧 - 登录表单 */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
                {/* 卡片头部装饰 */}
                <div className="h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600" />
                
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl text-slate-900 mb-2">登录到控制台</h3>
                    <p className="text-slate-600">
                      使用企业账号登录，开始使用算力资源
                    </p>
                  </div>

                  <Tabs defaultValue="sso" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100">
                      <TabsTrigger value="sso" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <KeySquare className="w-4 h-4 mr-2" />
                        SSO登录
                      </TabsTrigger>
                      <TabsTrigger value="password" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Lock className="w-4 h-4 mr-2" />
                        账号密码
                      </TabsTrigger>
                    </TabsList>

                    {/* SSO登录 */}
                    <TabsContent value="sso" className="space-y-4">
                      <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 mb-1">
                              费米集群身份认证中心
                            </h4>
                            <p className="text-sm text-slate-600">
                              企业统一身份认证系统（基于Keycloak）
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span>单点登录（SSO），一次登录全平台通行</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span>支持企业AD/LDAP集成</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span>符合等保三级安全要求</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30"
                        onClick={handleSSOLogin}
                        disabled={loading}
                      >
                        {loading ? (
                          '跳转中...'
                        ) : (
                          <>
                            <Globe className="w-5 h-5 mr-2" />
                            跳转到身份认证中心
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-slate-500">
                        点击后将跳转到费米集群身份认证中心完成登录
                      </p>
                    </TabsContent>

                    {/* 用户名密码登录 */}
                    <TabsContent value="password">
                      <form onSubmit={handlePasswordLogin} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-slate-700">用户名</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="username"
                              type="text"
                              placeholder="输入用户名"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="pl-10 h-11 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-slate-700">密码</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="password"
                              type="password"
                              placeholder="输入密码"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 h-11 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-800 mb-3">
                            <span className="font-medium">测试账号（点击快速登录）：</span>
                          </p>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                setUsername('admin');
                                setPassword('admin123');
                              }}
                              className="w-full px-3 py-2 text-left rounded-lg bg-white hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-medium text-slate-900">系统管理员</div>
                                  <div className="text-xs text-slate-600 mt-0.5">admin / admin123</div>
                                </div>
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                  完全权限
                                </Badge>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUsername('user');
                                setPassword('user123');
                              }}
                              className="w-full px-3 py-2 text-left rounded-lg bg-white hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-medium text-slate-900">普通用户</div>
                                  <div className="text-xs text-slate-600 mt-0.5">user / user123</div>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                  业务资源
                                </Badge>
                              </div>
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setUsername('developer');
                                  setPassword('dev123');
                                }}
                                className="px-2 py-1.5 text-left rounded-lg bg-white hover:bg-blue-100 border border-blue-200 transition-colors"
                              >
                                <div className="text-xs font-medium text-slate-900">开发者</div>
                                <div className="text-xs text-slate-600 mt-0.5 truncate">developer / dev123</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setUsername('operator');
                                  setPassword('ops123');
                                }}
                                className="px-2 py-1.5 text-left rounded-lg bg-white hover:bg-blue-100 border border-blue-200 transition-colors"
                              >
                                <div className="text-xs font-medium text-slate-900">运维人员</div>
                                <div className="text-xs text-slate-600 mt-0.5 truncate">operator / ops123</div>
                              </button>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 bg-slate-900 hover:bg-slate-800"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              登录中...
                            </div>
                          ) : (
                            '登录'
                          )}
                        </Button>

                        <div className="flex items-center justify-between text-sm pt-2">
                          <button
                            type="button"
                            className="text-purple-600 hover:text-purple-700 hover:underline"
                          >
                            忘记密码？
                          </button>
                          <button
                            type="button"
                            className="text-purple-600 hover:text-purple-700 hover:underline"
                          >
                            申请账号
                          </button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6">
                    <Separator className="my-4" />
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                      <Shield className="w-3.5 h-3.5" />
                      <span>通过多因素认证保护您的账号安全</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 底部链接 */}
              <div className="mt-6 text-center text-sm text-slate-600 space-y-2">
                <p>
                  使用即表示同意{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700 hover:underline">
                    服务条款
                  </a>
                  {' '}和{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700 hover:underline">
                    隐私政策
                  </a>
                </p>
                <p className="text-xs text-slate-500">
                  © 2024 费米科技. 保留所有权利.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// 特性卡片组件
function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'purple' | 'blue' | 'indigo' | 'violet';
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    violet: 'bg-violet-100 text-violet-600 border-violet-200',
  };

  const iconBgClasses = {
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30',
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30',
    violet: 'bg-gradient-to-br from-violet-500 to-violet-600 shadow-violet-500/30',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} bg-opacity-50 backdrop-blur-sm`}>
      <div className={`w-10 h-10 ${iconBgClasses[color]} rounded-lg flex items-center justify-center mb-3 shadow-lg`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
