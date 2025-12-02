import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Rocket, Database, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ModelVersion } from '../../services/modelService';
import { getDatasets, Dataset, formatFileSize } from '../../services/datasetService';
import { toast } from 'sonner@2.0.3';

interface StartTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelVersion: ModelVersion | null;
  modelName: string;
  onSuccess: () => void;
}

export function StartTrainingDialog({
  open,
  onOpenChange,
  modelVersion,
  modelName,
  onSuccess
}: StartTrainingDialogProps) {
  const [jobName, setJobName] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadDatasets();
      // 自动生成任务名称
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      setJobName(`${modelName}-${modelVersion?.versionNumber}-${timestamp}`);
    }
  }, [open, modelName, modelVersion]);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const data = await getDatasets();
      // 只显示状态为 ready 的数据集
      setDatasets(data.filter(d => d.status === 'ready'));
    } catch (error) {
      toast.error('加载数据集失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!jobName.trim()) {
      toast.error('请输入任务名称');
      return;
    }

    if (!selectedDataset) {
      toast.error('请选择数据集');
      return;
    }

    setSubmitting(true);

    try {
      // 模拟创建训练任务
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('训练任务创建成功', {
        description: '任务已提交到调度队列，请在训练任务页面查看进度'
      });

      // 重置表单
      setJobName('');
      setSelectedDataset('');
      setSubmitting(false);

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('创建训练任务失败', {
        description: error instanceof Error ? error.message : '未知错误'
      });
      setSubmitting(false);
    }
  };

  const selectedDatasetInfo = datasets.find(d => d.id === selectedDataset);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>发起训练任务</DialogTitle>
          <DialogDescription>
            使用选定的模型版本和数据集创建微调训练任务
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 模型信息卡片 */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 mb-1">基础模型</p>
                <p className="mb-1 text-slate-900">{modelName}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>版本: {modelVersion?.versionNumber}</span>
                  <span>•</span>
                  <span>大小: {modelVersion ? formatFileSize(modelVersion.fileSize) : '-'}</span>
                </div>
                {modelVersion?.remark && (
                  <p className="text-sm text-slate-600 mt-2">{modelVersion.remark}</p>
                )}
              </div>
            </div>
          </div>

          {/* 任务名称 */}
          <div className="space-y-2">
            <Label htmlFor="job-name">
              任务名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="job-name"
              placeholder="例如: llama-3-finetune-20251114"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              disabled={submitting}
            />
            <p className="text-xs text-slate-600">
              建议使用有意义的名称，便于后续管理和追溯
            </p>
          </div>

          {/* 数据集选择 */}
          <div className="space-y-2">
            <Label htmlFor="dataset">
              训练数据集 <span className="text-red-500">*</span>
            </Label>
            {loading ? (
              <div className="flex items-center justify-center p-8 border border-dashed rounded-lg">
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                <span className="ml-2 text-slate-600">加载数据集列表...</span>
              </div>
            ) : (
              <>
                <Select
                  value={selectedDataset}
                  onValueChange={setSelectedDataset}
                  disabled={submitting}
                >
                  <SelectTrigger id="dataset">
                    <SelectValue placeholder="选择一个数据集" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-purple-600" />
                          <span>{dataset.name}</span>
                          <span className="text-xs text-slate-500">
                            ({formatFileSize(dataset.size)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 显示选中数据集的详细信息 */}
                {selectedDatasetInfo && (
                  <div className="mt-3 p-3 bg-slate-50 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm mb-1">
                          <span className="text-slate-900">{selectedDatasetInfo.name}</span>
                        </p>
                        <p className="text-xs text-slate-600 mb-2">
                          {selectedDatasetInfo.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span>类型: {selectedDatasetInfo.type}</span>
                          <span>•</span>
                          <span>记录数: {selectedDatasetInfo.recordCount.toLocaleString()}</span>
                          <span>•</span>
                          <span>大小: {formatFileSize(selectedDatasetInfo.size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="mb-1">训练任务将在资源调度服务中执行，具体包括：</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>自动分配GPU资源</li>
                <li>加载基础模型和训练数据集</li>
                <li>执行微调训练流程</li>
                <li>保存训练结果和模型checkpoint</li>
              </ul>
              <p className="mt-2">您可以在"训练任务"页面实时查看训练进度和日志。</p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !jobName.trim() || !selectedDataset}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                创建中...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                创建训练任务
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
