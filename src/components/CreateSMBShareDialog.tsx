import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { createSMBShare, getStorageVolumes, StorageVolume } from '../services/storageService';
import { toast } from 'sonner@2.0.3';
import { Copy, RefreshCw } from 'lucide-react';

interface CreateSMBShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateSMBShareDialog({ open, onOpenChange, onSuccess }: CreateSMBShareDialogProps) {
  const [loading, setLoading] = useState(false);
  const [volumes, setVolumes] = useState<StorageVolume[]>([]);
  const [formData, setFormData] = useState({
    volumeId: '',
    sharePath: '/',
    shareName: '',
    description: '',
    username: 'share-user',
    password: generateRandomPassword(),
    permissions: 'read-write' as 'read-only' | 'read-write',
  });

  useEffect(() => {
    if (open) {
      loadVolumes();
    }
  }, [open]);

  const loadVolumes = async () => {
    try {
      const data = await getStorageVolumes();
      // 只显示文件存储类型的存储卷
      const fileVolumes = data.filter(v => v.poolType === 'file');
      setVolumes(fileVolumes);
      if (fileVolumes.length > 0 && !formData.volumeId) {
        const firstVolume = fileVolumes[0];
        setFormData(prev => ({
          ...prev,
          volumeId: firstVolume.id,
          shareName: `${firstVolume.name}-share`,
          username: `${firstVolume.owner.userName}-smb`,
        }));
      }
    } catch (error) {
      toast.error('加载存储卷列表失败');
    }
  };

  const selectedVolume = volumes.find(v => v.id === formData.volumeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.volumeId) {
      toast.error('请选择存储卷');
      return;
    }

    if (!formData.shareName.trim()) {
      toast.error('请输入分享名称');
      return;
    }

    if (!formData.username.trim()) {
      toast.error('请输入用户名');
      return;
    }

    if (!formData.password.trim() || formData.password.length < 8) {
      toast.error('密码长度至少8位');
      return;
    }

    setLoading(true);
    try {
      const volume = volumes.find(v => v.id === formData.volumeId);
      if (!volume) {
        toast.error('存储卷不存在');
        return;
      }

      const result = await createSMBShare({
        volumeId: formData.volumeId,
        volumeName: volume.name,
        sharePath: formData.sharePath,
        shareName: formData.shareName,
        description: formData.description,
        username: formData.username,
        password: formData.password,
        permissions: formData.permissions,
        allowedUsers: [],
        allowedGroups: [
          {
            groupId: volume.owner.groupId || '',
            groupName: volume.owner.groupName || '',
          },
        ],
        createdBy: volume.owner.userName,
      });

      if (result.success) {
        toast.success(result.message);
        // 显示访问信息
        toast.success(`访问地址: ${result.accessUrl}`, { duration: 10000 });
        onOpenChange(false);
        // 重置表单
        setFormData({
          volumeId: volumes[0]?.id || '',
          sharePath: '/',
          shareName: '',
          description: '',
          username: 'share-user',
          password: generateRandomPassword(),
          permissions: 'read-write',
        });
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('创建SMB分享失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegeneratePassword = () => {
    setFormData({ ...formData, password: generateRandomPassword() });
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(formData.password);
    toast.success('密码已复制到剪贴板');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建SMB分享</DialogTitle>
          <DialogDescription>
            创建网络共享，支持Windows、macOS和Linux系统访问
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="volume">存储卷 *</Label>
                <Select
                  value={formData.volumeId}
                  onValueChange={(value) => {
                    const vol = volumes.find(v => v.id === value);
                    setFormData({
                      ...formData,
                      volumeId: value,
                      shareName: vol ? `${vol.name}-share` : '',
                      username: vol ? `${vol.owner.userName}-smb` : 'share-user',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择存储卷" />
                  </SelectTrigger>
                  <SelectContent>
                    {volumes.map((volume) => (
                      <SelectItem key={volume.id} value={volume.id}>
                        {volume.name} ({volume.poolName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {volumes.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    暂无可用的文件存储卷，请先创建
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="sharePath">共享路径</Label>
                <Input
                  id="sharePath"
                  value={formData.sharePath}
                  onChange={(e) => setFormData({ ...formData, sharePath: e.target.value })}
                  placeholder="/datasets"
                />
                <p className="text-xs text-slate-500 mt-1">指定要共享的目录，默认为根目录</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shareName">分享名称 *</Label>
                <Input
                  id="shareName"
                  value={formData.shareName}
                  onChange={(e) => setFormData({ ...formData, shareName: e.target.value })}
                  placeholder="my-dataset-share"
                />
                <p className="text-xs text-slate-500 mt-1">将显示在访问地址中</p>
              </div>

              <div>
                <Label>访问权限 *</Label>
                <RadioGroup
                  value={formData.permissions}
                  onValueChange={(value) => setFormData({ ...formData, permissions: value as any })}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="read-only" id="read-only" />
                    <Label htmlFor="read-only" className="font-normal cursor-pointer">只读</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="read-write" id="read-write" />
                    <Label htmlFor="read-write" className="font-normal cursor-pointer">读写</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述分享的用途和内容"
                rows={2}
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <h4 className="font-medium text-sm">访问凭据</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">用户名 *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="share-user"
                  />
                </div>

                <div>
                  <Label htmlFor="password">密码 *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="至少8位"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRegeneratePassword}
                      title="重新生成密码"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyPassword}
                      title="复制密码"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    建议使用随机生成的强密码
                  </p>
                </div>
              </div>
            </div>

            {selectedVolume && (
              <div className="p-4 bg-blue-50 rounded-lg text-sm space-y-2">
                <p className="text-blue-900 font-medium">预览访问信息</p>
                <div className="space-y-1 text-blue-800">
                  <div className="flex justify-between">
                    <span>存储卷:</span>
                    <span className="font-medium">{selectedVolume.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>访问地址:</span>
                    <span className="font-mono text-xs">smb://10.10.1.100:445/{formData.shareName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>用户名:</span>
                    <span className="font-medium">{formData.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>权限:</span>
                    <span className="font-medium">
                      {formData.permissions === 'read-write' ? '读写' : '只读'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-orange-50 rounded-lg text-sm text-orange-900">
              <p className="font-medium mb-1">计费说明</p>
              <p>SMB分享服务费用: ¥10/个/月，按实际使用天数计费</p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading || volumes.length === 0}>
              {loading ? '创建中...' : '创建分享'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 生成随机密码
function generateRandomPassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
