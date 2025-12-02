import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Plus, X, Tag } from 'lucide-react';
import { updateNodeLabels } from '../services/mockDataService';
import { toast } from 'sonner@2.0.3';

interface EditNodeLabelsDialogProps {
  nodeId: string | null;
  nodeName: string | null;
  currentLabels: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditNodeLabelsDialog({
  nodeId,
  nodeName,
  currentLabels,
  open,
  onOpenChange,
  onSuccess,
}: EditNodeLabelsDialogProps) {
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);

  // 系统标签不可编辑
  const systemLabelPrefixes = ['kubernetes.io/', 'node.kubernetes.io/', 'gpu.nvidia.com/', 'topology.kubernetes.io/'];

  useEffect(() => {
    if (open) {
      setLabels({ ...currentLabels });
      setNewKey('');
      setNewValue('');
    }
  }, [open, currentLabels]);

  const isSystemLabel = (key: string) => {
    return systemLabelPrefixes.some((prefix) => key.startsWith(prefix));
  };

  const handleAddLabel = () => {
    if (!newKey || !newValue) {
      toast.error('请输入标签键和值');
      return;
    }

    if (isSystemLabel(newKey)) {
      toast.error('不能添加系统标签前缀');
      return;
    }

    if (labels[newKey]) {
      toast.error('标签键已存在');
      return;
    }

    // 验证标签键格式
    const keyRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
    const simpleKeyRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
    
    if (!keyRegex.test(newKey) && !simpleKeyRegex.test(newKey)) {
      toast.error('标签键格式不正确，请使用小写字母、数字、连字符和点');
      return;
    }

    setLabels({ ...labels, [newKey]: newValue });
    setNewKey('');
    setNewValue('');
    toast.success('标签已添加');
  };

  const handleRemoveLabel = (key: string) => {
    if (isSystemLabel(key)) {
      toast.error('不能删除系统标签');
      return;
    }

    const newLabels = { ...labels };
    delete newLabels[key];
    setLabels(newLabels);
    toast.success('标签已移除');
  };

  const handleUpdateLabel = (key: string, value: string) => {
    setLabels({ ...labels, [key]: value });
  };

  const handleSave = async () => {
    if (!nodeId) return;

    setSaving(true);
    try {
      const result = await updateNodeLabels(nodeId, labels);
      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error('更新标签失败');
      }
    } catch (error) {
      toast.error('更新标签失败');
    } finally {
      setSaving(false);
    }
  };

  const userLabels = Object.entries(labels).filter(([key]) => !isSystemLabel(key));
  const systemLabels = Object.entries(labels).filter(([key]) => isSystemLabel(key));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            编辑节点标签
          </DialogTitle>
          <DialogDescription>
            {nodeName ? `编辑 ${nodeName} 的标签` : '编辑节点标签'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* 添加新标签 */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-lg border">
              <h3 className="font-medium text-sm">添加新标签</h3>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="label-key" className="text-xs">
                    标签键
                  </Label>
                  <Input
                    id="label-key"
                    placeholder="例如: fermion.ai/env"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toLowerCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                  />
                  <p className="text-xs text-slate-500 mt-1">使用小写字母、数字、连字符</p>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="label-value" className="text-xs">
                    标签值
                  </Label>
                  <Input
                    id="label-value"
                    placeholder="例如: production"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddLabel} className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    添加
                  </Button>
                </div>
              </div>
            </div>

            {/* 用户标签 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">自定义标签</h3>
                <Badge variant="secondary">{userLabels.length} 个</Badge>
              </div>
              {userLabels.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">暂无自定义标签</div>
              ) : (
                <div className="space-y-2">
                  {userLabels.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-600 mb-1">键</Label>
                          <div className="px-2 py-1.5 bg-slate-50 rounded border text-sm font-mono">
                            {key}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600 mb-1">值</Label>
                          <Input
                            value={value}
                            onChange={(e) => handleUpdateLabel(key, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLabel(key)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 系统标签（只读） */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">系统标签（只读）</h3>
                <Badge variant="secondary">{systemLabels.length} 个</Badge>
              </div>
              <div className="space-y-2">
                {systemLabels.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-600 mb-1">键</Label>
                        <div className="px-2 py-1.5 bg-white rounded border text-sm font-mono text-slate-600">
                          {key}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 mb-1">值</Label>
                        <div className="px-2 py-1.5 bg-white rounded border text-sm text-slate-600">
                          {value}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 标签使用说明 */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              <p className="font-medium mb-1">标签使用说明：</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                <li>标签键应使用域名前缀，如 fermion.ai/role</li>
                <li>系统标签（kubernetes.io、node.kubernetes.io等）不可编辑</li>
                <li>标签可用于资源调度、节点选择等场景</li>
                <li>建议使用有意义的标签名称，便于管理和查询</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存更改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
