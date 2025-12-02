import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
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
import { ScrollArea } from './ui/scroll-area';
import { Users, Plus, X, Shield, AlertCircle } from 'lucide-react';
import { StorageVolume } from '../services/storageService';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';

interface VolumePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volume: StorageVolume | null;
  onSuccess?: () => void;
}

interface PermissionEntry {
  id: string;
  type: 'user' | 'group';
  name: string;
  permission: 'read' | 'write' | 'admin';
}

export default function VolumePermissionsDialog({
  open,
  onOpenChange,
  volume,
  onSuccess,
}: VolumePermissionsDialogProps) {
  const [permissions, setPermissions] = useState<PermissionEntry[]>([
    { id: '1', type: 'user', name: 'zhangsan', permission: 'write' },
    { id: '2', type: 'group', name: 'ml-team', permission: 'read' },
  ]);
  const [newUserName, setNewUserName] = useState('');
  const [newPermission, setNewPermission] = useState<'read' | 'write' | 'admin'>('read');
  const [newType, setNewType] = useState<'user' | 'group'>('user');

  const handleAddPermission = () => {
    if (!newUserName.trim()) {
      toast.error('请输入用户名或组名');
      return;
    }

    const newEntry: PermissionEntry = {
      id: Date.now().toString(),
      type: newType,
      name: newUserName.trim(),
      permission: newPermission,
    };

    setPermissions([...permissions, newEntry]);
    setNewUserName('');
    toast.success(`已添加 ${newType === 'user' ? '用户' : '用户组'} ${newUserName} 的权限`);
  };

  const handleRemovePermission = (id: string) => {
    setPermissions(permissions.filter((p) => p.id !== id));
    toast.success('已移除权限');
  };

  const handleUpdatePermission = (id: string, permission: 'read' | 'write' | 'admin') => {
    setPermissions(
      permissions.map((p) => (p.id === id ? { ...p, permission } : p))
    );
  };

  const handleSave = () => {
    // 模拟保存
    toast.success('权限配置已保存');
    onSuccess?.();
    onOpenChange(false);
  };

  const getPermissionLabel = (permission: string) => {
    const labels = {
      read: '只读',
      write: '读写',
      admin: '管理员',
    };
    return labels[permission as keyof typeof labels];
  };

  const getPermissionColor = (permission: string) => {
    const colors = {
      read: 'bg-blue-50 text-blue-700 border-blue-200',
      write: 'bg-green-50 text-green-700 border-green-200',
      admin: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return colors[permission as keyof typeof colors];
  };

  if (!volume) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            管理权限 - {volume.name}
          </DialogTitle>
          <DialogDescription>
            配置用户和用户组对存储卷的访问权限
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 所有者信息 */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-900">所有者</span>
            </div>
            <div className="text-sm text-purple-800">
              <p>用户: {volume.owner.userName}</p>
              {volume.owner.groupName && <p>用户组: {volume.owner.groupName}</p>}
            </div>
          </div>

          {/* 添加权限 */}
          <div className="space-y-3">
            <Label>添加新权限</Label>
            <div className="flex gap-2">
              <Select value={newType} onValueChange={(v) => setNewType(v as 'user' | 'group')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">用户</SelectItem>
                  <SelectItem value="group">用户组</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="输入用户名或组名"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="flex-1"
              />
              <Select
                value={newPermission}
                onValueChange={(v) => setNewPermission(v as 'read' | 'write' | 'admin')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">只读</SelectItem>
                  <SelectItem value="write">读写</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddPermission} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 权限列表 */}
          <div className="space-y-2">
            <Label>当前权限配置</Label>
            <ScrollArea className="h-[300px] rounded-lg border">
              <div className="p-4 space-y-2">
                {permissions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">暂无共享权限</p>
                  </div>
                ) : (
                  permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{perm.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {perm.type === 'user' ? '用户' : '用户组'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={perm.permission}
                          onValueChange={(v) =>
                            handleUpdatePermission(perm.id, v as 'read' | 'write' | 'admin')
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read">只读</SelectItem>
                            <SelectItem value="write">读写</SelectItem>
                            <SelectItem value="admin">管理员</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePermission(perm.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 权限说明 */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>权限级别说明：</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>只读：</strong>可以浏览和下载文件，但不能修改或删除</li>
                <li><strong>读写：</strong>可以上传、修改和删除文件</li>
                <li><strong>管理员：</strong>拥有完全控制权，包括管理权限和删除存储卷</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            <Shield className="w-4 h-4 mr-2" />
            保存权限配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
