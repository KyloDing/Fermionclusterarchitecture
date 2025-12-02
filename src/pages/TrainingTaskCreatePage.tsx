import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner@2.0.3';

interface LocationState {
  datasetId?: string;
  datasetVersionId?: string;
  datasetName?: string;
  datasetVersion?: string;
  modelId?: string;
  modelName?: string;
  modelVersion?: string;
}

export default function TrainingTaskCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [formData, setFormData] = useState({
    taskName: '',
    datasetId: state?.datasetId || '',
    datasetVersionId: state?.datasetVersionId || '',
    modelId: state?.modelId || '',
    gpuType: 'A100',
    gpuCount: '1',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.taskName.trim()) {
      toast.error('请输入任务名称');
      return;
    }

    if (!formData.datasetId || !formData.datasetVersionId) {
      toast.error('请选择数据集');
      return;
    }

    setSubmitting(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('训练任务创建成功');
      navigate('/training-jobs');
    } catch (error) {
      console.error('创建训练任务失败:', error);
      toast.error('创建训练任务失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        {/* 页面头部 */}
        <div>
          <h1 className="text-3xl mb-2 text-slate-900">发起训练任务</h1>
          <p className="text-slate-600">
            配置训练任务参数并启动训练
          </p>
        </div>

        {/* 表单 */}
        <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm space-y-6">
          {/* 任务名称 */}
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-sm text-slate-700">
              任务名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="taskName"
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              placeholder="请输入任务名称"
              className="bg-white border-slate-300"
            />
          </div>

          {/* 数据集信息 */}
          {state?.datasetName && (
            <div className="space-y-2">
              <Label className="text-sm text-slate-700">数据集</Label>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-900">{state.datasetName}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      版本: {state.datasetVersion}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/datasets')}
                    className="border-slate-300"
                  >
                    更换数据集
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 模型选择（预留） */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-700">
              模型 <span className="text-red-500">*</span>
            </Label>
            {state?.modelName ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-900">{state.modelName}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      版本: {state.modelVersion}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/models')}
                    className="border-slate-300"
                  >
                    更换模型
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/models')}
                className="w-full border-slate-300"
              >
                选择模型
              </Button>
            )}
          </div>

          {/* GPU配置 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-slate-700">GPU类型</Label>
              <Select
                value={formData.gpuType}
                onValueChange={(value) => setFormData({ ...formData, gpuType: value })}
              >
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="A100">A100</SelectItem>
                  <SelectItem value="V100">V100</SelectItem>
                  <SelectItem value="T4">T4</SelectItem>
                  <SelectItem value="RTX3090">RTX 3090</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-700">GPU数量</Label>
              <Select
                value={formData.gpuCount}
                onValueChange={(value) => setFormData({ ...formData, gpuCount: value })}
              >
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-slate-700">
              描述
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入任务描述（选填）"
              className="bg-white border-slate-300 min-h-[100px]"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="border-slate-300"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formData.taskName.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {submitting ? '创建中...' : '创建任务'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}