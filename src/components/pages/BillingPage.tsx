import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  FileText,
  CreditCard,
  AlertCircle,
  Server,
  Database,
  Cpu,
  Network,
  Zap,
  Camera,
  ShoppingCart,
  Settings,
  Ticket,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getBillingSummary,
  getResourceCosts,
  getDailyCosts,
  BillingSummary,
  ResourceCost,
  DailyCost,
} from '../../services/billingService';
import { toast } from 'sonner@2.0.3';

interface BillingPageProps {
  onNavigateToDetails?: () => void;
  onNavigateToAccount?: () => void;
  onNavigateToInvoices?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToBillingConfig?: () => void;
  onNavigateToVouchers?: () => void;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function BillingPage({
  onNavigateToDetails,
  onNavigateToAccount,
  onNavigateToInvoices,
  onNavigateToOrders,
  onNavigateToBillingConfig,
  onNavigateToVouchers,
}: BillingPageProps) {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [resourceCosts, setResourceCosts] = useState<ResourceCost[]>([]);
  const [dailyCosts, setDailyCosts] = useState<DailyCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, resourceData, dailyData] = await Promise.all([
        getBillingSummary(),
        getResourceCosts(),
        getDailyCosts(selectedPeriod),
      ]);
      setSummary(summaryData);
      setResourceCosts(resourceData);
      setDailyCosts(dailyData);
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    const icons = {
      instance: Server,
      storage: Database,
      gpu: Cpu,
      network: Network,
      inference: Zap,
      snapshot: Camera,
    };
    const Icon = icons[type as keyof typeof icons] || Server;
    return <Icon className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const costChange = summary
    ? ((summary.currentMonthCost - summary.lastMonthCost) / summary.lastMonthCost) * 100
    : 0;

  // 准备饼图数据
  const pieChartData = resourceCosts.map((cost) => ({
    name: cost.resourceName,
    value: cost.cost,
  }));

  if (loading || !summary) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-900 mb-2">费用中心</h1>
            <p className="text-slate-600">查看和管理您的账单、充值和发票</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onNavigateToInvoices}>
              <FileText className="w-4 h-4 mr-2" />
              发票管理
            </Button>
            <Button onClick={onNavigateToAccount}>
              <CreditCard className="w-4 h-4 mr-2" />
              账户充值
            </Button>
          </div>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <Badge
                variant="outline"
                className={
                  costChange >= 0
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-green-50 text-green-700 border-green-200'
                }
              >
                {costChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(costChange).toFixed(1)}%
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mb-1">本月费用</p>
            <p className="text-2xl font-semibold text-slate-900">
              {formatCurrency(summary.currentMonthCost)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              上月: {formatCurrency(summary.lastMonthCost)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">账户余额</p>
            <p className="text-2xl font-semibold text-green-600">
              {formatCurrency(summary.accountBalance)}
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-xs mt-2"
              onClick={onNavigateToAccount}
            >
              立即充值 →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">预估本月总费用</p>
            <p className="text-2xl font-semibold text-orange-600">
              {formatCurrency(summary.estimatedCost)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              日均: {formatCurrency(summary.dailyAverage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">未支付账单</p>
            <p className="text-2xl font-semibold text-slate-900">
              {formatCurrency(summary.unpaidAmount)}
            </p>
            {summary.unpaidAmount > 0 && (
              <Button variant="link" className="p-0 h-auto text-xs text-red-600 mt-2">
                立即支付 →
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 余额预警 */}
      {summary.accountBalance < summary.estimatedCost && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-orange-900 mb-1">余额不足预警</p>
                <p className="text-sm text-orange-800">
                  您的账户余额 ({formatCurrency(summary.accountBalance)}) 
                  低于本月预估费用 ({formatCurrency(summary.estimatedCost)})，
                  请及时充值以避免服务中断。
                </p>
              </div>
              <Button size="sm" onClick={onNavigateToAccount}>
                立即充值
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 费用趋势和分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 费用趋势图 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>费用趋势</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={selectedPeriod === 7 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(7)}
                >
                  7天
                </Button>
                <Button
                  variant={selectedPeriod === 30 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(30)}
                >
                  30天
                </Button>
                <Button
                  variant={selectedPeriod === 90 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(90)}
                >
                  90天
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyCosts}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalCost"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="总费用"
                />
                <Line
                  type="monotone"
                  dataKey="gpuCost"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="GPU"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="instanceCost"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="实例"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 费用分布饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>费用分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 资源费用详情 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>资源费用明细</CardTitle>
            <Button variant="outline" size="sm" onClick={onNavigateToDetails}>
              查看全部明细 →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resourceCosts.map((cost, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                    >
                      <div style={{ color: COLORS[index % COLORS.length] }}>
                        {getResourceIcon(cost.resourceType)}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{cost.resourceName}</p>
                      <p className="text-sm text-slate-600">{cost.usage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(cost.cost)}</p>
                    <p className="text-sm text-slate-600">{cost.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <Progress
                  value={cost.percentage}
                  className="h-2"
                  style={
                    {
                      '--progress-background': COLORS[index % COLORS.length],
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <p className="font-semibold text-lg">本月总计</p>
            <p className="font-semibold text-xl text-purple-600">
              {formatCurrency(summary.currentMonthCost)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToOrders}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium mb-1">订单管理</p>
                <p className="text-sm text-slate-600">查看所有订单</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToDetails}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium mb-1">计费明细</p>
                <p className="text-sm text-slate-600">查看详细账单记录</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToAccount}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium mb-1">账户充值</p>
                <p className="text-sm text-slate-600">管理余额和充值</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToInvoices}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-medium mb-1">发票管理</p>
                <p className="text-sm text-slate-600">申请和下载发票</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToVouchers}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="font-medium mb-1">政府算力券</p>
                <p className="text-sm text-slate-600">申请和使用算力券</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToBillingConfig}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Settings className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium mb-1">计费配置</p>
                <p className="text-sm text-slate-600">定价和折扣设置</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}