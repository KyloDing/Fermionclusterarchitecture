import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  DollarSign,
  Tag,
  Settings,
  ArrowRight,
  Zap,
  TrendingUp,
  Package,
  Percent,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import PricingManagementPage from './PricingManagementPage';
import DiscountManagementPage from './DiscountManagementPage';
import BillingRulesPage from './BillingRulesPage';

// 计费配置中心 - 统一管理定价、折扣和计费规则
export default function BillingConfigPage() {
  const [activeTab, setActiveTab] = useState('overview');

  if (activeTab !== 'overview') {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('overview')}
            className="mb-4"
          >
            ← 返回计费配置总览
          </Button>
        </div>

        {activeTab === 'pricing' && <PricingManagementPage />}
        {activeTab === 'discount' && <DiscountManagementPage />}
        {activeTab === 'rules' && <BillingRulesPage />}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">计费配置中心</h1>
        <p className="text-slate-600">
          统一管理资源定价、折扣活动和计费规则
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">定价项目</p>
                <p className="text-3xl">9</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  全部已启用
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">折扣活动</p>
                <p className="text-3xl">6</p>
                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  5个进行中
                </p>
              </div>
              <Tag className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">计费规则</p>
                <p className="text-3xl">5</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  3种计费模式
                </p>
              </div>
              <Settings className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">月度收入</p>
                <p className="text-3xl text-orange-600">¥328K</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  较上月 +15.3%
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 资源定价 */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab('pricing')}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle>资源定价管理</CardTitle>
            <CardDescription>配置GPU、CPU、存储等资源价格</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">GPU定价</span>
                <span className="font-medium">4 项</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">存储定价</span>
                <span className="font-medium">2 项</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">其他资源</span>
                <span className="font-medium">3 项</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              管理定价
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 折扣活动 */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab('discount')}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle>折扣活动管理</CardTitle>
            <CardDescription>管理优惠券、时段折扣和促销活动</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">进行中活动</span>
                <span className="font-medium text-green-600">5 个</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">优惠券</span>
                <span className="font-medium">2 个</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">总使用次数</span>
                <span className="font-medium">3,514</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              管理折扣
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 计费规则 */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab('rules')}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle>计费规则配置</CardTitle>
            <CardDescription>设置计费模式、精度和扣费规则</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">已启用规则</span>
                <span className="font-medium text-green-600">5 个</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">预付费模式</span>
                <span className="font-medium">3 个</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">后付费模式</span>
                <span className="font-medium">2 个</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              管理规则
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 定价概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            当前定价概览
          </CardTitle>
          <CardDescription>主要资源的当前定价信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">A100 (40GB)</p>
                  <p className="text-xs text-slate-600">高性能训练GPU</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">¥25</p>
                  <p className="text-xs text-slate-600">每卡·小时</p>
                </div>
                <Badge className="bg-green-600">已启用</Badge>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">A100 (80GB)</p>
                  <p className="text-xs text-slate-600">大显存训练GPU</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">¥35</p>
                  <p className="text-xs text-slate-600">每卡·小时</p>
                </div>
                <Badge className="bg-green-600">已启用</Badge>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">SSD存储</p>
                  <p className="text-xs text-slate-600">高速固态存储</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">¥0.002</p>
                  <p className="text-xs text-slate-600">每GB·天</p>
                </div>
                <Badge className="bg-green-600">已启用</Badge>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">公网流量</p>
                  <p className="text-xs text-slate-600">对外数据传输</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">¥0.8</p>
                  <p className="text-xs text-slate-600">每GB</p>
                </div>
                <Badge className="bg-green-600">已启用</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 活跃折扣活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              活跃折扣活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: '新用户首单优惠', discount: '20% OFF', users: 156 },
                { name: '夜间时段优惠', discount: '30% OFF', users: 2345 },
                { name: 'VIP会员专享', discount: '10% OFF', users: 567 },
                { name: '批量使用折扣', discount: '15% OFF', users: 89 },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-xs text-slate-600">已使用 {activity.users} 次</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-600">{activity.discount}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              计费策略状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">计费系统运行正常</p>
                    <p className="text-sm text-green-700 mt-1">
                      所有计费规则正常工作，无异常记录
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">自动账单生成已启用</p>
                    <p className="text-sm text-blue-700 mt-1">
                      下次生成时间: 2024-12-01 00:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900">3个用户余额不足</p>
                    <p className="text-sm text-orange-700 mt-1">
                      建议发送充值提醒通知
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">最小计费单位: 1分钟</p>
                    <p className="text-sm text-slate-600 mt-1">
                      计费精度: 2位小数
                    </p>
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