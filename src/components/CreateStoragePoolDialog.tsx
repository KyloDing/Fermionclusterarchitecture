import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, HardDrive, Database, Cloud } from 'lucide-react';
import { createStoragePool } from '../services/storageService';
import { 
  getStorageBackends, 
  StorageBackendConfig,
  getStorageBackendTypeMeta 
} from '../services/storageBackendService';
import { toast } from 'sonner@2.0.3';

interface CreateStoragePoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateStoragePoolDialog({ open, onOpenChange, onSuccess }: CreateStoragePoolDialogProps) {
  const [loading, setLoading] = useState(false);
  const [backends, setBackends] = useState<StorageBackendConfig[]>([]);
  const [loadingBackends, setLoadingBackends] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'file' as 'file' | 'object' | 'block',
    storageClass: 'ssd' as 'ssd' | 'hdd' | 'hybrid',
    backendId: '',
    clusterId: 'cluster-bj-a-001',
    totalCapacityGB: 1000,
  });

  // 加载可用的存储后端
  useEffect(() => {
    if (open) {
      loadBackends();
    }
  }, [open]);

  const loadBackends = async () => {
    setLoadingBackends(true);
    try {
      const allBackends = await getStorageBackends();
      // 只显示已启用且已连接的后端
      const availableBackends = allBackends.filter(
        (b) => b.enabled && b.status === 'connected'
      );
      setBackends(availableBackends);

      // 自动选择第一个可用的后端
      if (availableBackends.length > 0 && !formData.backendId) {
        const firstBackend = availableBackends[0];
        const meta = getStorageBackendTypeMeta(firstBackend.type);
        const defaultType = meta?.supportedVolumeTypes[0] || 'file';
        
        setFormData((prev) => ({
          ...prev,
          backendId: firstBackend.id,
          type: defaultType,
        }));
      }
    } catch (error) {
      toast.error('加载存储后端失败');
    } finally {
      setLoadingBackends(false);
    }
  };

  // 获取当前选中后端支持的卷类型
  const getSupportedVolumeTypes = () => {
    if (!formData.backendId) return [];
    const backend = backends.find((b) => b.id === formData.backendId);
    if (!backend) return [];
    const meta = getStorageBackendTypeMeta(backend.type);
    return meta?.supportedVolumeTypes || [];
  };

  // 根据卷类型筛选可用的后端
  const getBackendsByVolumeType = (volumeType: 'file' | 'object' | 'block') => {
    return backends.filter((backend) => {
      const meta = getStorageBackendTypeMeta(backend.type);
      return meta?.supportedVolumeTypes.includes(volumeType);
    });
  };

  const handleVolumeTypeChange = (type: 'file' | 'object' | 'block') => {
    const availableBackends = getBackendsByVolumeType(type);
    const newBackendId = availableBackends.length > 0 ? availableBackends[0].id : '';
    
    setFormData({
      ...formData,
      type,
      backendId: newBackendId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('请输入存储池名称');
      return;
    }

    if (formData.totalCapacityGB <= 0) {
      toast.error('请输入有效的容量');
      return;
    }

    setLoading(true);
    try {
      const result = await createStoragePool({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        storageClass: formData.storageClass,
        backend: formData.backendId,
        clusterId: formData.clusterId,
        clusterName: '北京可用区A',
        totalCapacityGB: formData.totalCapacityGB,
        performance: {
          iops: formData.storageClass === 'ssd' ? 50000 : 5000,
          throughputMBps: formData.storageClass === 'ssd' ? 2000 : 500,
          latencyMs: formData.storageClass === 'ssd' ? 1.2 : 5.8,
        },
        pricing: {
          pricePerGBPerMonth: formData.storageClass === 'ssd' ? 0.35 : 0.15,
        },
        status: 'active',
        createdBy: 'admin',
      });

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        // 重置表单
        setFormData({
          name: '',
          description: '',
          type: 'file',
          storageClass: 'ssd',
          backendId: '',
          clusterId: 'cluster-bj-a-001',
          totalCapacityGB: 1000,
        });
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('创建存储池失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建存储池</DialogTitle>
          <DialogDescription>
            基于Kubernetes StorageClass创建新的分布式存储池
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">存储池名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: 高性能SSD存储池"
                />
              </div>
              <div>
                <Label htmlFor="capacity">总容量 (GB) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.totalCapacityGB}
                  onChange={(e) => setFormData({ ...formData, totalCapacityGB: parseInt(e.target.value) || 0 })}
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述存储池的用途和特点"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">存储类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleVolumeTypeChange(value as 'file' | 'object' | 'block')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">文件存储 (CephFS)</SelectItem>
                    <SelectItem value="object">对象存储 (MinIO)</SelectItem>
                    <SelectItem value="block">块存储 (LVM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="storageClass">存储级别 *</Label>
                <Select
                  value={formData.storageClass}
                  onValueChange={(value) => setFormData({ ...formData, storageClass: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ssd">SSD (高性能 ¥0.35/GB/月)</SelectItem>
                    <SelectItem value="hdd">HDD (标准 ¥0.15/GB/月)</SelectItem>
                    <SelectItem value="hybrid">混合存储</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backend">存储后端 *</Label>
                {loadingBackends ? (
                  <div className="text-sm text-slate-500 p-2">加载中...</div>
                ) : backends.length === 0 ? (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      没有可用的存储后端，请先在存储后端管理中配置
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select
                    value={formData.backendId}
                    onValueChange={(value) => setFormData({ ...formData, backendId: value })}
                  >
                    <SelectTrigger id="backend">
                      <SelectValue placeholder="选择存储后端" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBackendsByVolumeType(formData.type).map((backend) => {
                        const meta = getStorageBackendTypeMeta(backend.type);
                        const Icon = meta?.icon === 'Database' ? Database :
                                     meta?.icon === 'Cloud' ? Cloud : HardDrive;
                        return (
                          <SelectItem key={backend.id} value={backend.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{backend.name}</span>
                              <span className="text-xs text-slate-500">
                                ({backend.type.toUpperCase()})
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
                {formData.type && getBackendsByVolumeType(formData.type).length === 0 && !loadingBackends && (
                  <p className="text-xs text-amber-600 mt-1">
                    暂无支持 {formData.type} 类型的存储后端
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cluster">目标集群</Label>
                <Select
                  value={formData.clusterId}
                  onValueChange={(value) => setFormData({ ...formData, clusterId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cluster-bj-a-001">北京可用区A</SelectItem>
                    <SelectItem value="cluster-sh-a-002">上海可用区A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 无可用后端提示 */}
            {!loadingBackends && backends.length === 0 && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  当前没有可用的存储后端。请先前往{' '}
                  <a href="/storage/backends" className="font-medium underline">
                    存储后端管理
                  </a>{' '}
                  页面配置存储后端服务。
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-blue-50 rounded-lg text-sm">
              <p className="text-blue-900 font-medium mb-2">预估成本</p>
              <p className="text-blue-800">
                月费用: ¥{((formData.storageClass === 'ssd' ? 0.35 : 0.15) * formData.totalCapacityGB).toFixed(2)}
                {' '}(按实际使用量计费)
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '创建中...' : '创建存储池'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}