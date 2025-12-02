import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { applyInvoice, getBillingSummary } from '../services/billingService';
import { toast } from 'sonner@2.0.3';

interface ApplyInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ApplyInvoiceDialog({
  open,
  onOpenChange,
  onSuccess,
}: ApplyInvoiceDialogProps) {
  const [invoiceType, setInvoiceType] = useState<'vat-normal' | 'vat-special'>('vat-normal');
  const [title, setTitle] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('');
  const [amount, setAmount] = useState(0);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableAmount, setAvailableAmount] = useState(0);

  useEffect(() => {
    if (open) {
      loadAvailableAmount();
      // 生成当前月份选项
      const now = new Date();
      setBillingPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    }
  }, [open]);

  const loadAvailableAmount = async () => {
    try {
      const summary = await getBillingSummary();
      setAvailableAmount(summary.currentMonthCost);
      setAmount(summary.currentMonthCost);
    } catch (error) {
      toast.error('获取可开票金额失败');
    }
  };

  const handleSubmit = async () => {
    // 验证
    if (!title.trim()) {
      toast.error('请输入发票抬头');
      return;
    }

    if (!taxNo.trim()) {
      toast.error('请输入纳税人识别号');
      return;
    }

    if (amount <= 0) {
      toast.error('请输入有效的开票金额');
      return;
    }

    if (amount > availableAmount) {
      toast.error('开票金额不能超过可开票金额');
      return;
    }

    if (invoiceType === 'vat-special') {
      if (!address.trim() || !phone.trim()) {
        toast.error('专用发票需要填写地址和电话');
        return;
      }
      if (!bankName.trim() || !bankAccount.trim()) {
        toast.error('专用发票需要填写开户行和账号');
        return;
      }
      if (!receiverName.trim() || !receiverPhone.trim() || !receiverAddress.trim()) {
        toast.error('专用发票需要填写收件信息');
        return;
      }
    }

    setLoading(true);
    try {
      await applyInvoice({
        type: invoiceType,
        title: title.trim(),
        taxNo: taxNo.trim(),
        amount,
        billingPeriod,
      });
      
      toast.success('发票申请已提交，预计3-5个工作日内开具');
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('发票申请失败');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setTaxNo('');
    setAmount(0);
    setAddress('');
    setPhone('');
    setBankName('');
    setBankAccount('');
    setReceiverName('');
    setReceiverPhone('');
    setReceiverAddress('');
  };

  const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 生成最近6个月选项
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      options.push({ value, label });
    }
    return options;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            申请发票
          </DialogTitle>
          <DialogDescription>
            请填写准确的开票信息，发票一经开具不可修改
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 发票类型 */}
          <div className="space-y-3">
            <Label>发票类型 *</Label>
            <RadioGroup value={invoiceType} onValueChange={(v) => setInvoiceType(v as any)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="vat-normal" id="vat-normal" />
                  <label htmlFor="vat-normal" className="flex-1 cursor-pointer">
                    <p className="font-medium">增值税普通发票</p>
                    <p className="text-sm text-slate-600">
                      适用于个人和企业，可用于报销
                    </p>
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="vat-special" id="vat-special" />
                  <label htmlFor="vat-special" className="flex-1 cursor-pointer">
                    <p className="font-medium">增值税专用发票</p>
                    <p className="text-sm text-slate-600">
                      适用于一般纳税人企业，可用于抵扣增值税
                    </p>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">发票抬头 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入发票抬头"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="taxNo">纳税人识别号 *</Label>
                <Input
                  id="taxNo"
                  value={taxNo}
                  onChange={(e) => setTaxNo(e.target.value)}
                  placeholder="请输入纳税人识别号"
                />
              </div>

              <div>
                <Label htmlFor="period">计费周期 *</Label>
                <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">开票金额 *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="请输入金额"
                />
                <p className="text-xs text-slate-500 mt-1">
                  可开票金额: {formatCurrency(availableAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* 专用发票附加信息 */}
          {invoiceType === 'vat-special' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">专用发票附加信息</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">企业地址 *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="请输入企业地址"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">企业电话 *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入企业电话"
                  />
                </div>

                <div>
                  <Label htmlFor="bankName">开户银行 *</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="请输入开户银行"
                  />
                </div>

                <div>
                  <Label htmlFor="bankAccount">银行账号 *</Label>
                  <Input
                    id="bankAccount"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="请输入银行账号"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-3">收件信息</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="receiverName">收件人 *</Label>
                      <Input
                        id="receiverName"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="请输入收件人姓名"
                      />
                    </div>

                    <div>
                      <Label htmlFor="receiverPhone">联系电话 *</Label>
                      <Input
                        id="receiverPhone"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="请输入联系电话"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="receiverAddress">收件地址 *</Label>
                    <Textarea
                      id="receiverAddress"
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      placeholder="请输入详细的收件地址"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <ul className="list-disc list-inside space-y-1">
                <li>发票抬头和纳税人识别号必须与营业执照一致</li>
                <li>增值税普通发票提供电子版，1-3个工作日开具</li>
                <li>增值税专用发票邮寄纸质版，3-5个工作日开具（运费到付）</li>
                <li>发票一经开具，不支持退换，请仔细核对信息</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                提交申请
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
