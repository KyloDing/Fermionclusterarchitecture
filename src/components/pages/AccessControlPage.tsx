import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Users,
  Shield,
  Building,
  Key,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Lock,
  Menu,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UsersManagementPage from './UsersManagementPage';
import RolesManagementPage from './RolesManagementPage';
import UserGroupsPage from './UserGroupsPageWithHierarchy';
import MenuManagementPage from './MenuManagementPage';

export default function AccessControlPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  if (activeTab !== 'overview') {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('overview')}
            className="mb-4"
          >
            ← 返回权限管理总览
          </Button>
        </div>

        {activeTab === 'users' && <UsersManagementPage />}
        {activeTab === 'roles' && <RolesManagementPage />}
        {activeTab === 'groups' && <UserGroupsPage />}
        {activeTab === 'menu' && <MenuManagementPage />}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">用户与权限管理</h1>
        <p className="text-slate-600">
          统一管理用户账号、角色权限、用户组和访问控制策略
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总用户数</p>
                <p className="text-3xl">45</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  43 位活跃用户
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">角色数量</p>
                <p className="text-3xl">12</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  3 个系统角色
                </p>
              </div>
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">用户组数量</p>
                <p className="text-3xl">8</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  5 个部门
                </p>
              </div>
              <Building className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">权限总数</p>
                <p className="text-3xl">91</p>
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  6 个功能类别
                </p>
              </div>
              <Key className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 菜单管理 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('menu')}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
                <Menu className="w-6 h-6 text-indigo-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle>菜单管理</CardTitle>
            <CardDescription>配置系统菜单和权限标识</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">菜单项</span>
                <span className="font-medium">20</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">子菜单</span>
                <span className="font-medium">30</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">权限项</span>
                <span className="font-medium">24</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              管理菜单
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 角色管理 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('roles')}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle>角色管理</CardTitle>
            <CardDescription>配置角色权限和访问控制</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">系统角色</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">自定义角色</span>
                <span className="font-medium">9</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">权限项</span>
                <span className="font-medium">24</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              管理角色
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 用户组管理 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('groups')}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle>用户组管理</CardTitle>
            <CardDescription>管理部门、项目组和团队</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">部门</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">项目组</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">总成员</span>
                <span className="font-medium">98</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              管理用户组
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 用户管理 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('users')}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle>用户管理</CardTitle>
            <CardDescription>管理系统用户账号和基本信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">活跃用户</span>
                <span className="font-medium">43</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">待审核</span>
                <span className="font-medium text-orange-600">2</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">已禁用</span>
                <span className="font-medium text-gray-600">5</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              管理用户
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 安全策略 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            安全策略
          </CardTitle>
          <CardDescription>配置系统的安全和访问控制策略</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium mb-1">密码策略</h4>
                  <p className="text-sm text-slate-600">配置密码复杂度和过期时间</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">最小长度</span>
                  <span className="font-medium">8 位</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">密码过期</span>
                  <span className="font-medium">90 天</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium mb-1">登录保护</h4>
                  <p className="text-sm text-slate-600">防止暴力破解和异常登录</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">最大失败次数</span>
                  <span className="font-medium">5 次</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">锁定时间</span>
                  <span className="font-medium">30 分钟</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium mb-1">会话管理</h4>
                  <p className="text-sm text-slate-600">控制用户会话和超时设置</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">会话超时</span>
                  <span className="font-medium">2 小时</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">最大会话数</span>
                  <span className="font-medium">3 个</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium mb-1">双因素认证</h4>
                  <p className="text-sm text-slate-600">增强账号安全性</p>
                </div>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">启用状态</span>
                  <span className="font-medium text-orange-600">建议启用</span>
                </div>
                <Button size="sm" className="w-full mt-2" variant="outline">
                  配置 2FA
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              最近的用户操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: '创建用户', user: '系统管理员', target: 'zhangsan', time: '5分钟前' },
                { action: '修改角色', user: '系统管理员', target: 'lisi', time: '15分钟前' },
                { action: '添加用户组', user: '王五', target: 'AI研发部', time: '1小时前' },
                { action: '重置密码', user: '系统管理员', target: 'zhaoliu', time: '2小时前' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-slate-600">
                      {item.user} → {item.target}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">{item.time}</span>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4" onClick={() => navigate('/audit-logs')}>
              查看完整审计日志 →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              安全警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900">密码即将过期</p>
                    <p className="text-xs text-orange-700 mt-1">3 个用户的密码将在 7 天内过期</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">新用户待审核</p>
                    <p className="text-xs text-blue-700 mt-1">2 个用户注册申请等待审核</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">系统状态正常</p>
                    <p className="text-xs text-slate-600 mt-1">没有发现其他安全问题</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}