import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { expandVolume, StorageVolume } from '../services/storageService';
import { toast } from 'sonner@2.0.3';

interface ExpandStorageVolumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volume: StorageVolume | null;
  onSuccess?: () => void;
}

export default function ExpandStorageVolumeDialog({
  open,
  onOpenChange,
  volume,
  onSuccess,
}: ExpandStorageVolumeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [newCapacity, setNewCapacity] = useState(0);

  useEffect(() => {
    if (volume && open) {
      // 默认扩容50GB
      setNewCapacity(volume.capacityGB + 50);
    }
  }, [volume, open]);

  if (!volume) return null;

  const currentCapacity = volume.capacityGB;
  const usedCapacity = volume.usedGB;
  const increaseAmount = newCapacity - currentCapacity;
  const usagePercent = (usedCapacity / newCapacity) * 100;
  
  // 假设从volume的关联存储池获取单价
  const pricePerGB = 0.35; // 这应该从存储池信息中获取
  const additionalMonthlyCost = increaseAmount * pricePerGB;
  const additionalPrepayment = additionalMonthlyCost * 3; // 建议预付3个月

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newCapacity <= currentCapacity) {
      toast.error('新容量必须大于当前容量');
      return;
    }

    if (newCapacity > 10000) {
      toast.error('单个存储卷容量不能超过 10TB，如需更大容量请联系管理员');
      return;
    }

    if (increaseAmount < 10) {
      toast.error('每次扩容至少增加 10GB');
      return;
    }

    setLoading(true);
    try {
      const result = await expandVolume(volume.id, newCapacity);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('扩容失败');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickIncrease = (amount: number) => {
    setNewCapacity(Math.min(currentCapacity + amount, 10000));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>扩容存储卷</DialogTitle>
          <DialogDescription>
            在线扩容，无需停机，扩容后容量立即生效
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 当前信息 */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-sm mb-3">当前存储卷信息</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">存储卷名称:</span>
                  <span className="font-medium">{volume.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">当前容量:</span>
                  <span className="font-medium">{currentCapacity} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">已使用:</span>
                  <span className="font-medium text-orange-600">{usedCapacity.toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">使用率:</span>
                  <span className="font-medium">
                    {((usedCapacity / currentCapacity) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <Progress value={(usedCapacity / currentCapacity) * 100} className="h-2" />
              </div>
            </div>

            {/* 扩容设置 */}
            <div>
              <Label htmlFor="newCapacity">新容量 (GB) *</Label>
              <Input
                id="newCapacity"
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(parseInt(e.target.value) || currentCapacity)}
                min={currentCapacity + 10}
                max={10000}
                step={10}
                className="mt-2"
              />
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-slate-500">快速选择增量:</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickIncrease(50)}
                >
                  +50GB
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickIncrease(100)}
                >
                  +100GB
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickIncrease(500)}
                >
                  +500GB
                </Button>
              </div>
            </div>

            {/* 扩容预览 */}
            {increaseAmount > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-2">扩容预览</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-blue-800">
                        <span>扩容增量:</span>
                        <span className="font-medium">+{increaseAmount} GB</span>
                      </div>
                      <div className="flex justify-between text-blue-800">
                        <span>扩容后容量:</span>
                        <span className="font-medium">{newCapacity} GB</span>
                      </div>
                      <div className="flex justify-between text-blue-800">
                        <span>扩容后使用率:</span>
                        <span className="font-medium">{usagePercent.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-blue-700 mb-1">
                        <span>扩容后使用情况</span>
                        <span>{usedCapacity.toFixed(1)} / {newCapacity} GB</span>
                      </div>
                      <Progress value={usagePercent} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 费用预估 */}
            {increaseAmount > 0 && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-3">费用变化</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-orange-800">
                    <span>存储单价:</span>
                    <span className="font-medium">¥{pricePerGB}/GB/月</span>
                  </div>
                  <div className="flex justify-between text-orange-800">
                    <span>增加容量:</span>
                    <span className="font-medium">+{increaseAmount} GB</span>
                  </div>
                  <div className="flex justify-between text-orange-800 pt-2 border-t border-orange-200">
                    <span>每月新增费用:</span>
                    <span className="font-medium text-base">
                      ¥{additionalMonthlyCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-orange-800">
                    <span>扩容后月费用:</span>
                    <span className="font-medium text-base">
                      ¥{(newCapacity * pricePerGB).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 预付费提醒 */}
            {increaseAmount > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="text-amber-900 font-medium mb-1">预付费充值提醒</p>
                    <p className="text-amber-800">
                      扩容后建议充值 
                      <span className="font-medium"> ¥{additionalPrepayment.toFixed(2)} </span>
                      (3个月费用) 到预付费账户，以确保服务不中断。
                    </p>
                    <p className="text-amber-700 text-xs mt-2">
                      当前预付费余额: ¥{volume.billing.prepaidBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 重要说明 */}
            <div className="p-4 bg-slate-50 rounded-lg text-sm space-y-1 text-slate-700">
              <p className="font-medium mb-2">重要说明:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>扩容操作在线完成，无需停机，不影响正在挂载的容器</li>
                <li>扩容后容量立即生效，文件系统会自动扩展</li>
                <li>存储卷不支持缩容，请谨慎评估所需容量</li>
                <li>扩容后的费用从下一个计费周期开始生效</li>
                <li>单个存储卷最大容量为 10TB，如需更大容量请联系管理员</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading || newCapacity <= currentCapacity}>
              {loading ? '扩容中...' : `确认扩容 (+${increaseAmount}GB)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
