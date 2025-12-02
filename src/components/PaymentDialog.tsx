import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
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
} from 'lucide-react';
import { Order } from '../services/orderService';
import {
  getAvailableVouchers,
  calculateVoucherDeduction,
  payWithVouchers,
  Voucher,
} from '../services/voucherService';
import { toast } from 'sonner@2.0.3';

interface PaymentDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: () => void;
}

export default function PaymentDialog({
  order,
  open,
  onOpenChange,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [autoSelectApplied, setAutoSelectApplied] = useState(false);

  // 加载可用算力券
  useEffect(() => {
    if (open) {
      loadAvailableVouchers();
    }
  }, [open, order.orderType]);

  const loadAvailableVouchers = async () => {
    setLoading(true);
    try {
      const vouchers = await getAvailableVouchers(order.orderType);
      setAvailableVouchers(vouchers);
      
      // 自动选择算力券进行智能抵扣
      if (vouchers.length > 0 && !autoSelectApplied) {
        autoSelectVouchers(vouchers);
        setAutoSelectApplied(true);
      }
    } catch (error) {
      toast.error('加载算力券失败');
    } finally {
      setLoading(false);
    }
  };

  // 智能自动选择算力券
  const autoSelectVouchers = (vouchers: Voucher[]) => {
    let remainingAmount = order.unpaidAmount;
    const selected = new Set<string>();

    for (const voucher of vouchers) {
      if (remainingAmount <= 0) break;
      
      if (voucher.remainingAmount > 0) {
        selected.add(voucher.id);
        remainingAmount -= voucher.remainingAmount;
      }
    }

    setSelectedVouchers(selected);
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

  // 计算抵扣金额
  const getDeductionInfo = () => {
    const selectedVoucherList = availableVouchers.filter((v) =>
      selectedVouchers.has(v.id)
    );
    return calculateVoucherDeduction(selectedVoucherList, order.unpaidAmount);
  };

  const deductionInfo = getDeductionInfo();

  // 确认支付
  const handlePayment = async () => {
    setPaying(true);
    try {
      // 构建算力券使用信息
      const voucherUsages = deductionInfo.voucherUsages;

      // 调用支付接口
      const result = await payWithVouchers(order.id, voucherUsages);

      if (result.success) {
        toast.success('支付成功！', {
          description: `已使用 ${selectedVouchers.size} 张算力券，抵扣 ¥${deductionInfo.totalDeduction.toFixed(2)}`,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            订单支付
          </DialogTitle>
          <DialogDescription>订单号: {order.orderNo}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 订单信息 */}
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

          {/* 算力券选择 */}
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
                {availableVouchers.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => autoSelectVouchers(availableVouchers)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    智能选择
                  </Button>
                )}
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
                      const isExpiringSoon = daysLeft <= 30;
                      const isSelected = selectedVouchers.has(voucher.id);

                      return (
                        <TableRow
                          key={voucher.id}
                          className={`cursor-pointer ${
                            isSelected ? 'bg-purple-50' : ''
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
                              {isExpiringSoon && (
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                                >
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  {daysLeft}天后到期
                                </Badge>
                              )}
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

          {/* 费用明细 */}
          {selectedVouchers.size > 0 && (
            <Alert className="border-purple-200 bg-purple-50">
              <TrendingDown className="w-4 h-4 text-purple-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">已选择 {selectedVouchers.size} 张算力券</span>
                    <span className="font-semibold text-purple-600">
                      优惠 {formatCurrency(deductionInfo.totalDeduction)}
                    </span>
                  </div>
                  {deductionInfo.voucherUsages.map((usage, index) => {
                    const voucher = availableVouchers.find((v) => v.id === usage.voucherId);
                    return (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          {voucher?.programName || '算力券'}
                        </span>
                        <span className="text-slate-700">
                          -{formatCurrency(usage.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 支付汇总 */}
          <div className="border rounded-lg p-6 bg-slate-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">订单金额</span>
                <span className="font-medium">{formatCurrency(order.unpaidAmount)}</span>
              </div>
              
              {deductionInfo.totalDeduction > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">算力券抵扣</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(deductionInfo.totalDeduction)}
                    </span>
                  </div>
                </>
              )}

              <Separator />
              
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold">实际支付</span>
                <div className="text-right">
                  {deductionInfo.totalDeduction > 0 && (
                    <p className="text-xs text-slate-500 line-through mb-1">
                      {formatCurrency(order.unpaidAmount)}
                    </p>
                  )}
                  <p className="text-3xl font-semibold text-purple-600">
                    {formatCurrency(deductionInfo.remainingAmount)}
                  </p>
                </div>
              </div>

              {deductionInfo.remainingAmount === 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    算力券已完全抵扣订单金额，无需额外支付
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={paying}>
            取消
          </Button>
          <Button onClick={handlePayment} disabled={paying} className="min-w-[120px]">
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                支付中...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                确认支付 {formatCurrency(deductionInfo.remainingAmount)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
