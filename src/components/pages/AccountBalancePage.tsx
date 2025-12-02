import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Gift,
  Shield,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  getAccountInfo,
  getRechargeRecords,
  AccountInfo,
  RechargeRecord,
} from '../../services/billingService';
import { toast } from 'sonner@2.0.3';
import RechargeDialog from '../RechargeDialog';

export default function AccountBalancePage() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [rechargeRecords, setRechargeRecords] = useState<RechargeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [account, records] = await Promise.all([
        getAccountInfo(),
        getRechargeRecords(),
      ]);
      setAccountInfo(account);
      setRechargeRecords(records);
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      alipay: '支付宝',
      wechat: '微信支付',
      bank: '银行转账',
      creditcard: '信用卡',
      invoice: '发票充值',
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        label: '处理中',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Clock,
      },
      success: {
        label: '成功',
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle,
      },
      failed: {
        label: '失败',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
      },
      refunded: {
        label: '已退款',
        color: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: AlertCircle,
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getLevelConfig = (level: string) => {
    const configs = {
      bronze: { label: '青铜会员', color: 'bg-amber-700 text-white', icon: '🥉' },
      silver: { label: '白银会员', color: 'bg-slate-400 text-white', icon: '🥈' },
      gold: { label: '黄金会员', color: 'bg-yellow-500 text-white', icon: '🥇' },
      platinum: { label: '铂金会员', color: 'bg-purple-600 text-white', icon: '💎' },
    };
    return configs[level as keyof typeof configs] || configs.bronze;
  };

  if (loading || !accountInfo) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  const levelConfig = getLevelConfig(accountInfo.level);
  const balanceUsagePercent = (accountInfo.balance / accountInfo.totalRecharge) * 100;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-900 mb-2">账户余额</h1>
            <p className="text-slate-600">管理您的账户余额和充值记录</p>
          </div>
          <Button onClick={() => setRechargeDialogOpen(true)} size="lg">
            <CreditCard className="w-5 h-5 mr-2" />
            立即充值
          </Button>
        </div>
      </div>

      {/* 账户概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 余额卡片 */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">账户余额</p>
                <p className="text-4xl font-semibold text-purple-600 mb-2">
                  {formatCurrency(accountInfo.balance)}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600">信用额度:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(accountInfo.creditLimit)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600">可用余额:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(accountInfo.availableBalance)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={levelConfig.color}>
                  <span className="mr-1">{levelConfig.icon}</span>
                  {levelConfig.label}
                </Badge>
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  升级会员
                </Button>
              </div>
            </div>

            {/* 余额使用进度 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">余额使用情况</span>
                <span className="text-slate-900">
                  已使用 {formatCurrency(accountInfo.totalConsumption)}
                </span>
              </div>
              <Progress value={balanceUsagePercent} className="h-3" />
              <div className="flex justify-between text-xs text-slate-500">
                <span>累计充值: {formatCurrency(accountInfo.totalRecharge)}</span>
                <span>剩余: {formatCurrency(accountInfo.balance)}</span>
              </div>
            </div>

            {accountInfo.frozenAmount > 0 && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 text-sm text-orange-900">
                  <AlertCircle className="w-4 h-4" />
                  <span>冻结金额: {formatCurrency(accountInfo.frozenAmount)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 账户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">用户ID</p>
              <p className="font-medium">{accountInfo.userId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">用户名</p>
              <p className="font-medium">{accountInfo.userName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">邮箱</p>
              <p className="font-medium">{accountInfo.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">手机号</p>
              <p className="font-medium">{accountInfo.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">账户类型</p>
              <Badge variant="outline">
                {accountInfo.accountType === 'personal' ? '个人账户' : '企业账户'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">创建时间</p>
              <p className="text-sm">{formatDateTime(accountInfo.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-1">累计充值</p>
            <p className="text-xl font-semibold text-green-600">
              {formatCurrency(accountInfo.totalRecharge)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-1">累计消费</p>
            <p className="text-xl font-semibold text-orange-600">
              {formatCurrency(accountInfo.totalConsumption)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-1">当前余额</p>
            <p className="text-xl font-semibold text-blue-600">
              {formatCurrency(accountInfo.balance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-1">信用额度</p>
            <p className="text-xl font-semibold text-purple-600">
              {formatCurrency(accountInfo.creditLimit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 充值记录 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>充值记录</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              导出记录
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rechargeRecords.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-2">暂无充值记录</p>
              <Button onClick={() => setRechargeDialogOpen(true)}>
                立即充值
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>充值金额</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>完成时间</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>备注</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rechargeRecords.map((record) => {
                    const statusConfig = getStatusConfig(record.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-mono text-sm">
                          {record.orderId}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(record.amount)}
                        </TableCell>
                        <TableCell>
                          {getPaymentMethodLabel(record.paymentMethod)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDateTime(record.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {record.completedAt
                            ? formatDateTime(record.completedAt)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {record.remark || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 会员权益说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>会员等级权益</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🥉</span>
                <h3 className="font-semibold">青铜会员</h3>
              </div>
              <ul className="text-sm space-y-2 text-slate-600">
                <li>• 累计充值 ¥0</li>
                <li>• 标准价格</li>
                <li>• 基础技术支持</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🥈</span>
                <h3 className="font-semibold">白银会员</h3>
              </div>
              <ul className="text-sm space-y-2 text-slate-600">
                <li>• 累计充值 ¥10,000</li>
                <li>• 95折优惠</li>
                <li>• 优先技术支持</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🥇</span>
                <h3 className="font-semibold">黄金会员</h3>
                <Badge className="bg-yellow-500">当前</Badge>
              </div>
              <ul className="text-sm space-y-2 text-slate-600">
                <li>• 累计充值 ¥50,000</li>
                <li>• 9折优惠</li>
                <li>• 专属客户经理</li>
                <li>• ¥10,000 信用额度</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💎</span>
                <h3 className="font-semibold">铂金会员</h3>
              </div>
              <ul className="text-sm space-y-2 text-slate-600">
                <li>• 累计充值 ¥200,000</li>
                <li>• 85折优惠</li>
                <li>• VIP技术支持</li>
                <li>• ¥50,000 信用额度</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <RechargeDialog
        open={rechargeDialogOpen}
        onOpenChange={setRechargeDialogOpen}
        onSuccess={loadData}
      />
    </div>
  );
}
