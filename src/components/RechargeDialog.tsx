import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Gift,
  AlertCircle,
  CheckCircle2,
  QrCode,
} from 'lucide-react';
import { createRechargeOrder } from '../services/billingService';
import { toast } from 'sonner@2.0.3';

interface RechargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000, 50000];

export default function RechargeDialog({
  open,
  onOpenChange,
  onSuccess,
}: RechargeDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'bank'>('alipay');
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const handleQuickSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleRecharge = async () => {
    const rechargeAmount = parseFloat(amount);
    
    if (!amount || rechargeAmount <= 0) {
      toast.error('请输入有效的充值金额');
      return;
    }

    if (rechargeAmount < 10) {
      toast.error('最低充值金额为 ¥10');
      return;
    }

    if (rechargeAmount > 1000000) {
      toast.error('单次充值金额不能超过 ¥1,000,000');
      return;
    }

    setLoading(true);
    try {
      const result = await createRechargeOrder(rechargeAmount, paymentMethod);
      
      if (paymentMethod === 'bank') {
        toast.success('充值订单已创建，请按照以下信息完成转账');
        onSuccess?.();
        onOpenChange(false);
      } else {
        // 支付宝或微信支付，显示二维码
        setPaymentUrl(result.paymentUrl || '');
        setShowQRCode(true);
        toast.info('请使用手机扫码完成支付');
      }
    } catch (error) {
      toast.error('创建充值订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    toast.success('充值成功！');
    onSuccess?.();
    onOpenChange(false);
    setShowQRCode(false);
    setAmount('');
  };

  const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString('zh-CN')}`;
  };

  const getBonus = (amount: number) => {
    if (amount >= 50000) return amount * 0.10; // 10%
    if (amount >= 10000) return amount * 0.05; // 5%
    if (amount >= 5000) return amount * 0.03; // 3%
    if (amount >= 1000) return amount * 0.01; // 1%
    return 0;
  };

  const currentAmount = parseFloat(amount) || 0;
  const bonus = getBonus(currentAmount);
  const totalAmount = currentAmount + bonus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            账户充值
          </DialogTitle>
          <DialogDescription>
            选择充值金额和支付方式，完成充值后资金将立即到账
          </DialogDescription>
        </DialogHeader>

        {!showQRCode ? (
          <div className="space-y-6 py-4">
            {/* 充值金额 */}
            <div className="space-y-3">
              <Label>充值金额（元）</Label>
              <Input
                type="number"
                placeholder="请输入充值金额"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                step="10"
              />
              
              {/* 快捷金额 */}
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(value)}
                    className={amount === value.toString() ? 'border-purple-500 bg-purple-50' : ''}
                  >
                    {formatCurrency(value)}
                  </Button>
                ))}
              </div>
            </div>

            {/* 充值优惠 */}
            {currentAmount > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-purple-900 mb-2">充值优惠</p>
                    <div className="space-y-1 text-sm">
                      {bonus > 0 ? (
                        <>
                          <p className="text-purple-800">
                            充值 {formatCurrency(currentAmount)}，
                            额外赠送 {formatCurrency(bonus)}
                          </p>
                          <p className="text-purple-900 font-semibold">
                            实际到账: {formatCurrency(totalAmount)}
                          </p>
                        </>
                      ) : (
                        <div className="text-purple-800 space-y-1">
                          <p>• 充值 ≥¥1,000，赠送 1% 奖励金</p>
                          <p>• 充值 ≥¥5,000，赠送 3% 奖励金</p>
                          <p>• 充值 ≥¥10,000，赠送 5% 奖励金</p>
                          <p>• 充值 ≥¥50,000，赠送 10% 奖励金</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 支付方式 */}
            <div className="space-y-3">
              <Label>支付方式</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                    <RadioGroupItem value="alipay" id="alipay" />
                    <label
                      htmlFor="alipay"
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">支付宝</p>
                        <p className="text-sm text-slate-600">扫码支付，即时到账</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        推荐
                      </Badge>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                    <RadioGroupItem value="wechat" id="wechat" />
                    <label
                      htmlFor="wechat"
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">微信支付</p>
                        <p className="text-sm text-slate-600">扫码支付，即时到账</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                    <RadioGroupItem value="bank" id="bank" />
                    <label
                      htmlFor="bank"
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">对公转账</p>
                        <p className="text-sm text-slate-600">适用于企业客户，1-3个工作日到账</p>
                      </div>
                    </label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* 银行转账信息 */}
            {paymentMethod === 'bank' && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  <strong>转账信息：</strong>
                  <div className="mt-2 space-y-1">
                    <p>收款单位：费米集群科技（北京）有限公司</p>
                    <p>开户银行：中国工商银行北京分行</p>
                    <p>银行账号：0200 1234 5678 9012 345</p>
                    <p className="text-orange-600 mt-2">
                      请在转账备注中填写您的用户ID，以便我们及时为您充值
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 注意事项 */}
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>最低充值金额为 ¥10，单次充值不超过 ¥1,000,000</li>
                  <li>支付宝/微信支付即时到账，对公转账1-3个工作日到账</li>
                  <li>充值金额不支持退款，请确认后再充值</li>
                  <li>如有疑问，请联系客服：support@fermicluster.com</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          // 二维码支付界面
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm text-slate-600">
                    {paymentMethod === 'alipay' ? '支付宝' : '微信'}扫码支付
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-semibold text-purple-600">
                  {formatCurrency(totalAmount)}
                </p>
                <p className="text-sm text-slate-600">
                  请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫描二维码完成支付
                </p>
              </div>

              <Alert className="mt-6 text-left">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  支付完成后，请点击下方"我已完成支付"按钮。如果长时间未到账，请联系客服。
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        <DialogFooter>
          {!showQRCode ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleRecharge} disabled={loading || !amount}>
                {loading ? '处理中...' : '确认充值'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowQRCode(false)}>
                返回
              </Button>
              <Button onClick={handlePaymentComplete}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                我已完成支付
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
