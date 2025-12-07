import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import {
  AlertCircle,
  Wallet,
  TrendingDown,
  Clock,
  X,
} from 'lucide-react';

interface BalanceWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  dailyAverage: number;
  estimatedDays: number;
}

export default function BalanceWarningDialog({
  open,
  onOpenChange,
  currentBalance,
  dailyAverage,
  estimatedDays,
}: BalanceWarningDialogProps) {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  // 生成充值建议选项
  const rechargeOptions = [
    {
      amount: dailyAverage * 7,
      days: 7,
      description: '7天用量',
    },
    {
      amount: dailyAverage * 30,
      days: 30,
      description: '30天用量',
      recommended: true,
    },
    {
      amount: dailyAverage * 100,
      days: 100,
      description: '100天用量',
    },
  ];

  // 默认选择推荐选项
  useState(() => {
    const recommended = rechargeOptions.find((opt) => opt.recommended);
    if (recommended) {
      setSelectedAmount(recommended.amount);
    }
  });

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // 今日不再提示
  const handleDismiss = () => {
    const today = new Date().toDateString();
    localStorage.setItem('balanceWarningDate', today);
    onOpenChange(false);
  };

  // 立即充值
  const handleRecharge = () => {
    navigate('/account-balance', {
      state: {
        suggestedAmount: selectedAmount,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              ⚠️ 余额预警
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            您的账户余额即将不足，请及时充值
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 余额状态 */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">当前余额</span>
                <span className="text-lg font-semibold text-orange-900">
                  {formatCurrency(currentBalance)}
                </span>
              </div>
              <Separator className="bg-orange-200" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">日均消费</span>
                <span className="text-sm text-slate-900">
                  {formatCurrency(dailyAverage)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-slate-600">预计可用</span>
                </div>
                <span className="text-lg font-semibold text-orange-600">
                  约 {estimatedDays} 天
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 严重预警提示 */}
          {estimatedDays <= 3 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-sm text-red-800">
                ⚠️ 余额严重不足，可能在{estimatedDays}天内耗尽，请立即充值避免服务中断
              </AlertDescription>
            </Alert>
          )}

          {/* 充值建议 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">建议充值金额</Label>
            <RadioGroup
              value={selectedAmount.toString()}
              onValueChange={(value) => setSelectedAmount(parseFloat(value))}
              className="space-y-2"
            >
              {rechargeOptions.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                    selectedAmount === option.amount
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem 
                    value={option.amount.toString()} 
                    id={`option-${index}`}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(option.amount)}
                      </span>
                      <span className="text-sm text-slate-600">
                        （{option.description}）
                      </span>
                    </div>
                    {option.recommended && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        推荐
                      </Badge>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 充值后效果 */}
          {selectedAmount > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    充值后效果
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">充值后余额</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(currentBalance + selectedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">预计可用</span>
                    <span className="font-semibold text-green-700">
                      约 {Math.floor((currentBalance + selectedAmount) / dailyAverage)} 天
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 提示信息 */}
          <Alert>
            <TrendingDown className="w-4 h-4" />
            <AlertDescription className="text-sm">
              💡 为避免服务中断，建议保持账户余额能覆盖至少30天的使用量
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="text-slate-600"
          >
            今日不再提示
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              稍后充值
            </Button>
            <Button onClick={handleRecharge} className="bg-orange-600 hover:bg-orange-700">
              <Wallet className="w-4 h-4 mr-2" />
              立即充值
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
