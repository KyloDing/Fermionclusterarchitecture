import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { createStorageVolume, getStoragePools, StoragePool } from '../services/storageService';
import { toast } from 'sonner@2.0.3';

interface CreateStorageVolumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateStorageVolumeDialog({ open, onOpenChange, onSuccess }: CreateStorageVolumeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [pools, setPools] = useState<StoragePool[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    poolId: '',
    capacityGB: 100,
    accessMode: 'RWX' as 'RWO' | 'RWX' | 'ROX',
  });

  useEffect(() => {
    if (open) {
      loadPools();
    }
  }, [open]);

  const loadPools = async () => {
    try {
      const data = await getStoragePools();
      setPools(data);
      if (data.length > 0 && !formData.poolId) {
        setFormData(prev => ({ ...prev, poolId: data[0].id }));
      }
    } catch (error) {
      toast.error('加载存储池列表失败');
    }
  };

  const selectedPool = pools.find(p => p.id === formData.poolId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('请输入存储卷名称');
      return;
    }

    if (!formData.poolId) {
      toast.error('请选择存储池');
      return;
    }

    if (formData.capacityGB <= 0) {
      toast.error('请输入有效的容量');
      return;
    }

    setLoading(true);
    try {
      const pool = pools.find(p => p.id === formData.poolId);
      if (!pool) {
        toast.error('存储池不存在');
        return;
      }

      const result = await createStorageVolume({
        name: formData.name,
        description: formData.description,
        poolId: formData.poolId,
        poolName: pool.name,
        poolType: pool.type,
        capacityGB: formData.capacityGB,
        accessMode: formData.accessMode,
        storageClass: pool.backend,
        mountedTo: [],
        owner: {
          userId: 'user-001',
          userName: 'zhangsan',
          groupId: 'group-ai-team',
          groupName: 'AI算法团队',
        },
        permissions: [
          {
            userId: 'user-001',
            userName: 'zhangsan',
            permission: 'owner',
          },
        ],
        quota: {
          capacityGB: formData.capacityGB,
          warningThreshold: 80,
        },
      });

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        // 重置表单
        setFormData({
          name: '',
          description: '',
          poolId: pools[0]?.id || '',
          capacityGB: 100,
          accessMode: 'RWX',
        });
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('创建存储卷失败');
    } finally {
      setLoading(false);
    }
  };

  const monthlyPrepayment = selectedPool 
    ? (selectedPool.pricing.pricePerGBPerMonth * formData.capacityGB).toFixed(2)
    : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建存储卷</DialogTitle>
          <DialogDescription>
            从存储池中分配一个新的持久化存储卷，可挂载到容器使用
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">存储卷名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: my-dataset-storage"
                />
              </div>
              <div>
                <Label htmlFor="capacity">容量 (GB) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacityGB}
                  onChange={(e) => setFormData({ ...formData, capacityGB: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                />
                <p className="text-xs text-slate-500 mt-1">最大100GB，超出需申请</p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述存储卷的用途"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pool">存储池 *</Label>
                <Select
                  value={formData.poolId}
                  onValueChange={(value) => setFormData({ ...formData, poolId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择存储池" />
                  </SelectTrigger>
                  <SelectContent>
                    {pools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.name} ({pool.type === 'file' ? '文件' : '对象'}, {pool.storageClass.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPool && (
                  <p className="text-xs text-slate-500 mt-1">
                    可用容量: {selectedPool.availableCapacityGB.toFixed(0)} GB
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="accessMode">访问模式 *</Label>
                <Select
                  value={formData.accessMode}
                  onValueChange={(value) => setFormData({ ...formData, accessMode: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RWO">RWO - 单节点读写</SelectItem>
                    <SelectItem value="RWX">RWX - 多节点读写 (推荐)</SelectItem>
                    <SelectItem value="ROX">ROX - 多节点只读</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.accessMode === 'RWX' ? '支持多个Pod同时读写' : 
                   formData.accessMode === 'RWO' ? '仅单个Pod可挂载' : 
                   '多个Pod只读访问'}
                </p>
              </div>
            </div>

            {selectedPool && (
              <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">存储池类型:</span>
                  <span className="font-medium">{selectedPool.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">后端实现:</span>
                  <span className="font-medium">{selectedPool.backend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">单价:</span>
                  <span className="font-medium">¥{selectedPool.pricing.pricePerGBPerMonth}/GB/月</span>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 font-medium mb-2">预付费计费</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-blue-800">
                  <span>月费用:</span>
                  <span className="font-medium">¥{monthlyPrepayment}</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>建议预付费充值:</span>
                  <span className="font-medium">¥{(parseFloat(monthlyPrepayment) * 3).toFixed(2)} (3个月)</span>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                提示: 预付费余额不足时将暂停访问，请及时充值
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '创建中...' : '创建存储卷'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
