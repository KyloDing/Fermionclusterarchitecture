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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { getModels, Model } from '../../services/modelService';
import { DatasetVersion } from '../../services/datasetService';
import { toast } from 'sonner@2.0.3';
import { Loader2, Box, Rocket, Database } from 'lucide-react';

interface LaunchTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetVersion: DatasetVersion | null;
  datasetName: string;
}

export function LaunchTrainingDialog({
  open,
  onOpenChange,
  datasetVersion,
  datasetName
}: LaunchTrainingDialogProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadModels();
    }
  }, [open]);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await getModels();
      setModels(data);
    } catch (error) {
      toast.error('加载模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedModelId) {
      toast.error('请选择模型');
      return;
    }

    if (!datasetVersion) {
      toast.error('数据集版本信息缺失');
      return;
    }

    setSubmitting(true);
    try {
      // 模拟跳转到训练任务创建页面
      await new Promise(resolve => setTimeout(resolve, 500));

      const selectedModel = models.find(m => m.id === selectedModelId);
      
      toast.success('准备发起训练任务', {
        description: `模型：${selectedModel?.name}，数据集：${datasetName} (${datasetVersion.version})`
      });

      // TODO: 实际实现中应该跳转到训练任务创建页面
      // 并携带 modelId 和 datasetVersionId
      console.log('Launch training:', {
        modelId: selectedModelId,
        datasetVersionId: datasetVersion.id,
        datasetName,
        version: datasetVersion.version
      });

      handleClose();
    } catch (error) {
      toast.error('发起失败', {
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedModelId('');
    onOpenChange(false);
  };

  const selectedModel = models.find(m => m.id === selectedModelId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>发起训练任务</DialogTitle>
              <DialogDescription>
                选择模型开始训练
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 数据集信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">数据集</p>
                <p className="text-slate-900 mb-0.5">{datasetName}</p>
                <p className="text-sm text-slate-600">
                  版本: <span className="text-purple-600 font-mono">{datasetVersion?.version}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 选择模型 */}
          <div className="space-y-2">
            <Label htmlFor="model">
              选择模型 <span className="text-red-500">*</span>
            </Label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-8">
                <Box className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 text-sm mb-1">暂无可用模型</p>
                <p className="text-slate-500 text-xs">请先导入模型</p>
              </div>
            ) : (
              <>
                <Select
                  value={selectedModelId}
                  onValueChange={setSelectedModelId}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择训练模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem
                        key={model.id}
                        value={model.id}
                      >
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-purple-600" />
                          <span>{model.name}</span>
                          <span className="text-xs text-slate-500">
                            ({model.latestVersion})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 选中模型的详细信息 */}
                {selectedModel && (
                  <div className="bg-slate-50 border rounded-lg p-4 mt-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Box className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 mb-2">{selectedModel.name}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-slate-600">模型类型</p>
                            <p className="text-slate-900">
                              {selectedModel.type === 'text' ? '文本模型' :
                               selectedModel.type === 'image' ? '图像模型' : '通用文件'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600">最新版本</p>
                            <p className="text-purple-600 font-mono">{selectedModel.latestVersion}</p>
                          </div>
                        </div>
                        {selectedModel.remark && (
                          <p className="text-sm text-slate-600 mt-2">
                            {selectedModel.remark}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 发起训练后，系统将跳转到资源调度服务配置训练任务参数
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedModelId || loading}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                准备中...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                发起训练
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
