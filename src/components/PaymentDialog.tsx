import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent } from './ui/card';
import {
  CreditCard,
  Ticket,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingDown,
  Loader2,
  Sparkles,
  RefreshCw,
  Zap,
  Wallet,
  Clock,
  XCircle,
} from 'lucide-react';
import { Order } from '../services/orderService';
import {
  getAvailableVouchers,
  calculateVoucherDeduction,
  payWithVouchers,
  Voucher,
} from '../services/voucherService';
import { getAccountInfo, AccountInfo } from '../services/billingService';
import { toast } from 'sonner@2.0.3';

interface PaymentDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: () => void;
}

interface MixedPaymentPlan {
  voucherDeduction: number;
  balanceDeduction: number;
  thirdPartyAmount: number;
  canFullDeduct: boolean;
  selectedVouchers: Voucher[];
}

export default function PaymentDialog({
  order,
  open,
  onOpenChange,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(new Set());
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<MixedPaymentPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [autoSelectApplied, setAutoSelectApplied] = useState(false);

  // 加载数据
  useEffect(() => {
    if (open) {
      loadData();
    } else {
      // 关闭时重置状态
      setAutoSelectApplied(false);
      setSelectedVouchers(new Set());
    }
  }, [open, order.orderType]);

  // 当选中券变化时，重新计算混合支付方案
  useEffect(() => {
    if (accountInfo) {
      calculateMixedPayment();
    }
  }, [selectedVouchers, accountInfo]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vouchers, account] = await Promise.all([
        getAvailableVouchers(order.orderType),
        getAccountInfo(),
      ]);

      // 按优化4要求：快到期券置顶并高亮
      const sortedVouchers = sortVouchersByPriority(vouchers);
      setAvailableVouchers(sortedVouchers);
      setAccountInfo(account);

      // 优化1：自动智能推荐并选择
      if (sortedVouchers.length > 0 && !autoSelectApplied) {
        autoSelectVouchers(sortedVouchers);
        setAutoSelectApplied(true);
      }
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 优化4：按优先级排序券
   * 规则：7天内到期 > 30天内到期 > 其他，同类型按余额从小到大
   */
  const sortVouchersByPriority = (vouchers: Voucher[]): Voucher[] => {
    return vouchers.sort((a, b) => {
      const daysA = getDaysUntilExpiry(a.endDate);
      const daysB = getDaysUntilExpiry(b.endDate);

      // 7天内到期的最优先
      if (daysA <= 7 && daysB > 7) return -1;
      if (daysA > 7 && daysB <= 7) return 1;

      // 30天内到期的次优先
      if (daysA <= 30 && daysB > 30) return -1;
      if (daysA > 30 && daysB <= 30) return 1;

      // 同样到期范围内，按余额从小到大（优先用完小额券）
      return a.remainingAmount - b.remainingAmount;
    });
  };

  /**
   * 优化1：智能自动选择算力券
   * 优先选择即将到期的券，尽量实现全额抵扣
   */
  const autoSelectVouchers = (vouchers: Voucher[]) => {
    let remainingAmount = order.unpaidAmount;
    const selected = new Set<string>();

    for (const voucher of vouchers) {
      if (remainingAmount <= 0) break;

      if (voucher.remainingAmount > 0) {
        selected.add(voucher.id);
        remainingAmount -= Math.min(voucher.remainingAmount, remainingAmount);
      }
    }

    setSelectedVouchers(selected);

    // 提示智能推荐结果
    const totalDeduction = Array.from(selected)
      .reduce((sum, id) => {
        const v = vouchers.find((voucher) => voucher.id === id);
        return sum + (v ? Math.min(v.remainingAmount, order.unpaidAmount) : 0);
      }, 0);

    toast.success('智能推荐已应用', {
      description: `已选择 ${selected.size} 张券，预计抵扣 ¥${totalDeduction.toFixed(2)}`,
    });
  };

  /**
   * 优化1：一键全额抵扣
   */
  const handleOneClickFullDeduct = () => {
    setLoading(true);
    try {
      let remainingAmount = order.unpaidAmount;
      const selected = new Set<string>();

      // 按优先级顺序选择券，直到覆盖订单金额或券用尽
      for (const voucher of availableVouchers) {
        if (remainingAmount <= 0) break;

        const useAmount = Math.min(voucher.remainingAmount, remainingAmount);
        if (useAmount > 0) {
          selected.add(voucher.id);
          remainingAmount -= useAmount;
        }
      }

      setSelectedVouchers(selected);

      if (remainingAmount === 0) {
        toast.success('已实现全额抵扣！', {
          description: `使用 ${selected.size} 张券，实付 ¥0`,
        });
      } else {
        toast.warning('券余额不足', {
          description: `最多可抵扣 ¥${(order.unpaidAmount - remainingAmount).toFixed(2)}，还需支付 ¥${remainingAmount.toFixed(2)}`,
        });
      }
    } catch (error) {
      toast.error('计算失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 优化1：一键重新智能推荐
   */
  const handleReRecommend = async () => {
    setLoading(true);
    try {
      // 清空当前选择
      setSelectedVouchers(new Set());

      // 重新获取券列表（可能有新券或状态变化）
      const vouchers = await getAvailableVouchers(order.orderType);
      const sortedVouchers = sortVouchersByPriority(vouchers);
      setAvailableVouchers(sortedVouchers);

      // 重新推荐
      setTimeout(() => {
        autoSelectVouchers(sortedVouchers);
      }, 100);

      toast.success('已重新推荐');
    } catch (error) {
      toast.error('推荐失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 优化3：计算混合支付方案（券 + 余额 + 第三方）
   */
  const calculateMixedPayment = () => {
    if (!accountInfo) return;

    const selectedVoucherList = availableVouchers.filter((v) =>
      selectedVouchers.has(v.id)
    );
    const deductionInfo = calculateVoucherDeduction(
      selectedVoucherList,
      order.unpaidAmount
    );

    // 1. 券抵扣
    const voucherDeduction = deductionInfo.totalDeduction;

    // 2. 余额抵扣
    const remainingAfterVoucher = order.unpaidAmount - voucherDeduction;
    const balanceDeduction = Math.min(
      accountInfo.availableBalance,
      Math.max(0, remainingAfterVoucher)
    );

    // 3. 第三方支付
    const thirdPartyAmount = Math.max(
      0,
      order.unpaidAmount - voucherDeduction - balanceDeduction
    );

    setPaymentPlan({
      voucherDeduction,
      balanceDeduction,
      thirdPartyAmount,
      canFullDeduct: thirdPartyAmount === 0,
      selectedVouchers: selectedVoucherList,
    });
  };

  // 切换算力券选择
  const toggleVoucher = (voucherId: string) => {
    const newSelected = new Set(selectedVouchers);
    if (newSelected.has(voucherId)) {
      newSelected.delete(voucherId);
    } else {
      newSelected.add(voucherId);
    }
    setSelectedVouchers(newSelected);
  };

  // 确认支付
  const handlePayment = async () => {
    if (!paymentPlan) return;

    // 如果需要第三方支付但未选择支付方式
    if (!paymentPlan.canFullDeduct && !selectedPaymentMethod) {
      toast.error('请选择支付方式');
      return;
    }

    setPaying(true);
    try {
      const deductionInfo = calculateVoucherDeduction(
        paymentPlan.selectedVouchers,
        order.unpaidAmount
      );

      // 调用支付接口
      const result = await payWithVouchers(order.id, deductionInfo.voucherUsages);

      if (result.success) {
        toast.success('支付成功！', {
          description: paymentPlan.canFullDeduct
            ? `已使用券和余额完全抵扣`
            : `已抵扣 ¥${(paymentPlan.voucherDeduction + paymentPlan.balanceDeduction).toFixed(2)}`,
        });

        onOpenChange(false);
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        toast.error('支付失败', {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error('支付失败', {
        description: '请稍后重试',
      });
    } finally {
      setPaying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  /**
   * 优化4：获取券的预警级别
   */
  const getWarningLevel = (days: number): 'none' | 'warning' | 'urgent' | 'expired' => {
    if (days < 0) return 'expired';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'warning';
    return 'none';
  };

  /**
   * 优化4：获取预警标签
   */
  const getWarningBadge = (voucher: Voucher) => {
    const daysLeft = getDaysUntilExpiry(voucher.endDate);
    const level = getWarningLevel(daysLeft);

    if (level === 'expired') {
      return (
        <Badge className="bg-slate-100 text-slate-700">
          <XCircle className="w-3 h-3 mr-1" />
          已过期
        </Badge>
      );
    }

    if (level === 'urgent') {
      return (
        <Badge className="bg-red-100 text-red-700 animate-pulse">
          <AlertCircle className="w-3 h-3 mr-1" />
          紧急到期（剩{daysLeft}天）
        </Badge>
      );
    }

    if (level === 'warning') {
      return (
        <Badge className="bg-orange-100 text-orange-700">
          <Clock className="w-3 h-3 mr-1" />
          即将到期（剩{daysLeft}天）
        </Badge>
      );
    }

    return null;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      national: '国家级',
      provincial: '省级',
      municipal: '市级',
      special: '专项',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      national: 'bg-red-50 text-red-700 border-red-200',
      provincial: 'bg-blue-50 text-blue-700 border-blue-200',
      municipal: 'bg-green-50 text-green-700 border-green-200',
      special: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return colors[category as keyof typeof colors] || '';
  };

  // 统计即将到期券
  const expiringVouchers = availableVouchers.filter((v) => {
    const days = getDaysUntilExpiry(v.endDate);
    return days <= 7 && days >= 0;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            确认支付
          </DialogTitle>
          <DialogDescription>订单号: {order.orderNo}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 订单金额 */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">订单名称</p>
                <p className="font-semibold text-lg">{order.orderName}</p>
                <p className="text-sm text-slate-600 mt-1">{order.resourceName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-1">订单金额</p>
                <p className="text-3xl font-semibold text-purple-600">
                  {formatCurrency(order.totalCost)}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  待支付: {formatCurrency(order.unpaidAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* 优化1: 智能推荐提示和一键操作按钮 */}
          {selectedVouchers.size > 0 && paymentPlan && (
            <Alert className="bg-purple-50 border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <AlertDescription>
                <strong className="text-purple-900">
                  🎯 智能推荐已抵扣 {formatCurrency(paymentPlan.voucherDeduction + paymentPlan.balanceDeduction)}
                </strong>
                <p className="text-sm text-slate-700 mt-1">
                  已自动选择 {selectedVouchers.size} 张券
                  {expiringVouchers.length > 0 && `，优先使用${expiringVouchers.length}张快到期的券`}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* 优化4: 即将到期提醒 */}
          {expiringVouchers.length > 0 && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <AlertDescription>
                <strong className="text-orange-900">
                  💡 您有 {expiringVouchers.length} 张券即将到期
                </strong>
                <div className="mt-2 space-y-1">
                  {expiringVouchers.slice(0, 2).map((v) => (
                    <p key={v.id} className="text-sm text-slate-700">
                      • {v.voucherCode}（剩余{getDaysUntilExpiry(v.endDate)}天，{formatCurrency(v.remainingAmount)}）
                    </p>
                  ))}
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  系统已优先使用这些券进行抵扣
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* 优化1: 一键操作按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReRecommend}
              disabled={loading}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              一键重新推荐
            </Button>
            <Button
              onClick={handleOneClickFullDeduct}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              一键全额抵扣
            </Button>
          </div>

          {/* 算力券列表 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">可用算力券</h3>
                  <Badge variant="outline" className="bg-purple-50">
                    {availableVouchers.length} 张
                  </Badge>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-sm text-slate-600">加载算力券...</p>
              </div>
            ) : availableVouchers.length === 0 ? (
              <div className="p-12 text-center">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-2">暂无可用算力券</p>
                <p className="text-sm text-slate-500">
                  您可以前往"费用中心 - 政府算力券"申请算力券
                </p>
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>算力券信息</TableHead>
                      <TableHead>发放单位</TableHead>
                      <TableHead className="text-right">余额</TableHead>
                      <TableHead className="text-right">有效期</TableHead>
                      <TableHead className="text-center">状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableVouchers.map((voucher) => {
                      const daysLeft = getDaysUntilExpiry(voucher.endDate);
                      const warningLevel = getWarningLevel(daysLeft);
                      const isSelected = selectedVouchers.has(voucher.id);

                      return (
                        <TableRow
                          key={voucher.id}
                          className={`cursor-pointer ${
                            isSelected ? 'bg-purple-50' : ''
                          } ${
                            warningLevel === 'urgent' ? 'bg-red-50/50' : 
                            warningLevel === 'warning' ? 'bg-orange-50/50' : ''
                          }`}
                          onClick={() => toggleVoucher(voucher.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleVoucher(voucher.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{voucher.programName}</p>
                                <Badge
                                  variant="outline"
                                  className={getCategoryColor(voucher.category)}
                                >
                                  {getCategoryLabel(voucher.category)}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 font-mono">
                                {voucher.voucherCode}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{voucher.issuer}</TableCell>
                          <TableCell className="text-right">
                            <div>
                              <p className="font-semibold text-purple-600">
                                {formatCurrency(voucher.remainingAmount)}
                              </p>
                              <p className="text-xs text-slate-500">
                                / {formatCurrency(voucher.totalAmount)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <p className="text-sm">{formatDate(voucher.endDate)}</p>
                              {getWarningBadge(voucher)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              可用
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* 优化3: 混合支付明细 */}
          {paymentPlan && (
            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">
                    智能混合支付（推荐）
                  </span>
                </div>

                <div className="space-y-4">
                  {/* 券抵扣明细 */}
                  {paymentPlan.voucherDeduction > 0 && (
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      <p className="text-sm text-slate-700 font-medium">
                        算力券抵扣
                      </p>
                      {paymentPlan.selectedVouchers.map((v) => (
                        <div key={v.id} className="flex justify-between text-sm">
                          <span className="text-slate-600">{v.voucherCode}</span>
                          <span className="text-purple-600">
                            {formatCurrency(Math.min(v.remainingAmount, order.unpaidAmount))}
                          </span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>小计</span>
                        <span className="text-purple-600">
                          {formatCurrency(paymentPlan.voucherDeduction)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 余额抵扣明细 */}
                  {paymentPlan.balanceDeduction > 0 && (
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      <p className="text-sm text-slate-700 font-medium">
                        账户余额抵扣
                      </p>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600">当前余额</span>
                          <span className="text-blue-600">
                            {formatCurrency(accountInfo?.availableBalance || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">本次使用</span>
                          <span className="text-blue-600">
                            {formatCurrency(paymentPlan.balanceDeduction)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>使用后余额</span>
                          <span>
                            {formatCurrency((accountInfo?.availableBalance || 0) - paymentPlan.balanceDeduction)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 合计抵扣 */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">合计抵扣</span>
                      <span className="text-xl font-semibold text-green-600">
                        {formatCurrency(paymentPlan.voucherDeduction + paymentPlan.balanceDeduction)}
                      </span>
                    </div>
                    {paymentPlan.canFullDeduct && (
                      <p className="text-sm text-green-700 mt-2">
                        ✓ 已完全抵扣，无需额外支付
                      </p>
                    )}
                  </div>

                  {/* 第三方支付 */}
                  {!paymentPlan.canFullDeduct && (
                    <div className="bg-orange-50 rounded-lg p-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-orange-900">
                          ⚠️ 还需支付
                        </span>
                        <span className="text-xl font-semibold text-orange-600">
                          {formatCurrency(paymentPlan.thirdPartyAmount)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">请选择补充支付方式：</Label>
                        <RadioGroup
                          value={selectedPaymentMethod}
                          onValueChange={setSelectedPaymentMethod}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="alipay" id="alipay" />
                            <Label htmlFor="alipay" className="flex items-center gap-2 cursor-pointer">
                              支付宝
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="wechat" id="wechat" />
                            <Label htmlFor="wechat" className="flex items-center gap-2 cursor-pointer">
                              微信支付
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bank" id="bank" />
                            <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer">
                              银行卡
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 实付金额 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg">实付金额</span>
              <span
                className={`text-2xl font-semibold ${
                  paymentPlan?.canFullDeduct ? 'text-green-600' : 'text-slate-900'
                }`}
              >
                {formatCurrency(paymentPlan?.thirdPartyAmount || order.unpaidAmount)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={paying}>
            取消
          </Button>
          <Button
            onClick={handlePayment}
            disabled={paying || (!paymentPlan?.canFullDeduct && !selectedPaymentMethod)}
            className="min-w-[120px]"
          >
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                支付中...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                确认支付
                {paymentPlan && !paymentPlan.canFullDeduct &&
                  ` ${formatCurrency(paymentPlan.thirdPartyAmount)}`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
