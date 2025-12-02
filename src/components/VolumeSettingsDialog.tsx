import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import {
  Settings,
  AlertCircle,
  Save,
  Info,
  Shield,
  Trash2,
} from 'lucide-react';
import { StorageVolume } from '../services/storageService';
import { toast } from 'sonner@2.0.3';

interface VolumeSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volume: StorageVolume | null;
  onSuccess?: () => void;
  onDelete?: () => void;
}

export default function VolumeSettingsDialog({
  open,
  onOpenChange,
  volume,
  onSuccess,
  onDelete,
}: VolumeSettingsDialogProps) {
  const [name, setName] = useState(volume?.name || '');
  const [description, setDescription] = useState(volume?.description || '');
  const [accessMode, setAccessMode] = useState(volume?.accessMode || 'RWO');
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupRetentionDays, setBackupRetentionDays] = useState('30');
  const [quotaWarningThreshold, setQuotaWarningThreshold] = useState('80');
  const [allowPublicAccess, setAllowPublicAccess] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('请输入存储卷名称');
      return;
    }

    // 模拟保存
    toast.success('设置已保存');
    onSuccess?.();
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!volume) return;
    
    // 确认删除
    if (confirm(`确定要删除存储卷 "${volume.name}" 吗？\n\n警告：删除后数据将无法恢复！`)) {
      toast.success('存储卷删除任务已提交');
      onDelete?.();
      onOpenChange(false);
    }
  };

  if (!volume) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            存储卷设置 - {volume.name}
          </DialogTitle>
          <DialogDescription>
            配置存储卷的基本信息、访问模式和高级选项
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="py-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="backup">备份设置</TabsTrigger>
            <TabsTrigger value="advanced">高级选项</TabsTrigger>
          </TabsList>

          {/* 基本信息 */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="volume-name">存储卷名称 *</Label>
              <Input
                id="volume-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入存储卷名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume-description">描述</Label>
              <Textarea
                id="volume-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入存储卷描述信息"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-mode">访问模式</Label>
              <Select value={accessMode} onValueChange={setAccessMode}>
                <SelectTrigger id="access-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RWO">单节点读写 (RWO)</SelectItem>
                  <SelectItem value="RWX">多节点读写 (RWX)</SelectItem>
                  <SelectItem value="ROX">多节点只读 (ROX)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                访问模式决定了存储卷可以被多少个节点同时挂载
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-2">存储卷基本信息：</p>
                  <div className="space-y-1 text-xs">
                    <p>• 存储池: {volume.poolName}</p>
                    <p>• 容量: {volume.capacityGB} GB</p>
                    <p>• 类型: {volume.poolType === 'file' ? '文件存储' : '对象存储'}</p>
                    <p>• 创建时间: {new Date(volume.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 备份设置 */}
          <TabsContent value="backup" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="auto-backup">自动备份</Label>
                <p className="text-xs text-slate-500">
                  每天自动备份存储卷数据
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>

            {autoBackup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="backup-retention">备份保留天数</Label>
                  <Select
                    value={backupRetentionDays}
                    onValueChange={setBackupRetentionDays}
                  >
                    <SelectTrigger id="backup-retention">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 天</SelectItem>
                      <SelectItem value="14">14 天</SelectItem>
                      <SelectItem value="30">30 天</SelectItem>
                      <SelectItem value="60">60 天</SelectItem>
                      <SelectItem value="90">90 天</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    超过保留期的备份将自动删除
                  </p>
                </div>

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    <strong>备份说明：</strong>
                    备份采用增量备份策略，只备份变更的数据。备份数据将额外占用存储空间并产生费用。
                  </AlertDescription>
                </Alert>
              </>
            )}
          </TabsContent>

          {/* 高级选项 */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="quota-threshold">配额警告阈值 (%)</Label>
              <Select
                value={quotaWarningThreshold}
                onValueChange={setQuotaWarningThreshold}
              >
                <SelectTrigger id="quota-threshold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                当使用量超过此阈值时将发送警告通知
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="public-access" className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-600" />
                  允许公网访问
                </Label>
                <p className="text-xs text-slate-500">
                  启用后可通过公网URL访问文件（需谨慎使用）
                </p>
              </div>
              <Switch
                id="public-access"
                checked={allowPublicAccess}
                onCheckedChange={setAllowPublicAccess}
              />
            </div>

            {allowPublicAccess && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-orange-900 text-sm">
                  <strong>安全警告：</strong>
                  启用公网访问后，任何人都可以通过URL访问您的文件。请确保文件不包含敏感信息，或使用访问令牌进行保护。
                </AlertDescription>
              </Alert>
            )}

            {/* 危险区域 */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                危险操作
              </h4>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-900 mb-3">
                  删除存储卷将永久删除所有数据，此操作不可恢复！
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除存储卷
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
