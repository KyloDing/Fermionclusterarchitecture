import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Model } from '../../services/modelService';
import { toast } from 'sonner@2.0.3';
import { Loader2, Rocket, Box, AlertCircle } from 'lucide-react';

interface DeployInferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: Model | null;
}

export function DeployInferenceDialog({
  open,
  onOpenChange,
  model
}: DeployInferenceDialogProps) {
  const [serviceName, setServiceName] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [replicas, setReplicas] = useState('2');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && model) {
      // 自动生成服务名称
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      setServiceName(`${model.name}-inference-${timestamp}`);
      // 默认选择最新版本
      if (model.versions.length > 0) {
        setSelectedVersion(model.versions[0].id);
      }
    }
  }, [open, model]);

  const handleSubmit = async () => {
    if (!serviceName.trim()) {
      toast.error('请输入服务名称');
      return;
    }

    if (!selectedVersion) {
      toast.error('请选择模型版本');
      return;
    }

    setSubmitting(true);

    try {
      // 模拟部署推理服务
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('推理服务部署成功', {
        description: '服务已提交部署，请在推理服务页面查看状态'
      });

      // 重置表单
      setServiceName('');
      setSelectedVersion('');
      setReplicas('2');
      setSubmitting(false);

      onOpenChange(false);
    } catch (error) {
      toast.error('部署失败', {
        description: error instanceof Error ? error.message : '未知错误'
      });
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setServiceName('');
    setSelectedVersion('');
    setReplicas('2');
    onOpenChange(false);
  };

  const selectedVersionInfo = model?.versions.find(v => v.id === selectedVersion);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>部署推理服务</DialogTitle>
          <DialogDescription>
            将选定的模型版本部署为在线推理API服务
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 模型信息卡片 */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 mb-1">模型</p>
                <p className="mb-1 text-slate-900">{model?.name}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>
                    类型: {model?.type === 'text' ? '文本模型' :
                           model?.type === 'image' ? '图像模型' : '通用文件'}
                  </span>
                  <span>•</span>
                  <span>版本数: {model?.versions.length}</span>
                </div>
                {model?.remark && (
                  <p className="text-sm text-slate-600 mt-2">{model.remark}</p>
                )}
              </div>
            </div>
          </div>

          {/* 服务名称 */}
          <div className="space-y-2">
            <Label htmlFor="service-name">
              服务名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="service-name"
              placeholder="例如: llama-3-inference-20251114"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              disabled={submitting}
            />
            <p className="text-xs text-slate-600">
              服务名称将作为API端点的标识，建议使用有意义的名称
            </p>
          </div>

          {/* 模型版本选择 */}
          <div className="space-y-2">
            <Label htmlFor="version">
              模型版本 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedVersion}
              onValueChange={setSelectedVersion}
              disabled={submitting}
            >
              <SelectTrigger id="version">
                <SelectValue placeholder="选择模型版本" />
              </SelectTrigger>
              <SelectContent>
                {model?.versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{version.versionNumber}</span>
                      {version.remark && (
                        <span className="text-xs text-slate-500">- {version.remark}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 显示选中版本的详细信息 */}
            {selectedVersionInfo && (
              <div className="mt-3 p-3 bg-slate-50 border rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">版本号</p>
                    <p className="text-slate-900 font-mono">{selectedVersionInfo.versionNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">文件大小</p>
                    <p className="text-slate-900">
                      {(selectedVersionInfo.fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB
                    </p>
                  </div>
                </div>
                {selectedVersionInfo.remark && (
                  <p className="text-xs text-slate-600 mt-2">
                    {selectedVersionInfo.remark}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 副本数 */}
          <div className="space-y-2">
            <Label htmlFor="replicas">
              副本数 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={replicas}
              onValueChange={setReplicas}
              disabled={submitting}
            >
              <SelectTrigger id="replicas">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 副本（开发测试）</SelectItem>
                <SelectItem value="2">2 副本（推荐）</SelectItem>
                <SelectItem value="3">3 副本（高可用）</SelectItem>
                <SelectItem value="4">4 副本</SelectItem>
                <SelectItem value="5">5 副本</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-600">
              更多副本可以提高服务可用性和并发处理能力
            </p>
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="mb-1">推理服务部署后将自动配置：</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>自动分配GPU资源和负载均衡</li>
                <li>提供RESTful API接口</li>
                <li>支持自动扩缩容</li>
                <li>实时监控和日志查看</li>
              </ul>
              <p className="mt-2">您可以在"推理服务"页面查看服务状态和API文档。</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !serviceName.trim() || !selectedVersion}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                部署中...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                部署服务
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
