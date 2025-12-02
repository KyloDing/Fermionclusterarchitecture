import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Zap, TrendingUp, GitCompare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import {
  createEvaluationTask,
  getEvaluationMetrics,
  getEvaluationDatasets,
  type EvaluationTask,
  type EvaluationMetric,
  type EvaluationDataset,
  type EvaluationTaskType,
  type ModelType,
} from '../../services/evaluationService';
import { toast } from 'sonner@2.0.3';

interface CreateEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// 模拟模型列表（实际应从 modelService 获取）
const MOCK_MODELS = [
  { id: 'model-qwen2-7b', name: 'Qwen2-7B-Instruct', version: 'v1.0', type: 'llm' as ModelType },
  { id: 'model-glm4-9b', name: 'GLM-4-9B', version: 'v1.0', type: 'llm' as ModelType },
  { id: 'model-llama3-8b', name: 'Llama-3-8B-Instruct', version: 'v1.0', type: 'llm' as ModelType },
  { id: 'model-chatglm3-6b', name: 'ChatGLM3-6B', version: 'v2.0', type: 'llm' as ModelType },
  { id: 'model-baichuan2-13b', name: 'Baichuan2-13B-Chat', version: 'v1.0', type: 'llm' as ModelType },
];

const GPU_TYPES = ['NVIDIA A100', 'NVIDIA A800', 'NVIDIA H100', 'NVIDIA V100'];

export default function CreateEvaluationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateEvaluationDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<EvaluationMetric[]>([]);
  const [datasets, setDatasets] = useState<EvaluationDataset[]>([]);

  // 表单数据
  const [formData, setFormData] = useState({
    // 步骤1: 基本信息
    type: 'benchmark' as EvaluationTaskType,
    name: '',
    description: '',

    // 步骤2: 模型选择
    modelId: '',
    modelName: '',
    modelVersion: '',
    modelType: 'llm' as ModelType,
    comparisonModels: [] as { modelId: string; modelName: string; modelVersion: string }[],

    // 步骤3: 数据集和指标
    selectedDatasets: [] as string[],
    selectedMetrics: [] as string[],

    // 步骤4: 评测配置
    batchSize: 8,
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    topK: 50,

    // 步骤5: 计算资源
    gpuType: 'NVIDIA A100',
    gpuCount: 1,
    memoryGB: 40,
    storageGB: 100,

    // 其他
    tags: [] as string[],
  });

  useEffect(() => {
    if (open) {
      loadData();
    } else {
      // 重置表单
      setCurrentStep(1);
      setFormData({
        type: 'benchmark',
        name: '',
        description: '',
        modelId: '',
        modelName: '',
        modelVersion: '',
        modelType: 'llm',
        comparisonModels: [],
        selectedDatasets: [],
        selectedMetrics: [],
        batchSize: 8,
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        topK: 50,
        gpuType: 'NVIDIA A100',
        gpuCount: 1,
        memoryGB: 40,
        storageGB: 100,
        tags: [],
      });
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [metricsData, datasetsData] = await Promise.all([
        getEvaluationMetrics(),
        getEvaluationDatasets(),
      ]);
      setMetrics(metricsData);
      setDatasets(datasetsData);
    } catch (error) {
      toast.error('加载数据失败');
    }
  };

  const handleNext = () => {
    // 验证当前步骤
    if (!validateStep(currentStep)) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('请输入任务名称');
          return false;
        }
        return true;
      case 2:
        if (!formData.modelId) {
          toast.error('请选择模型');
          return false;
        }
        if (formData.type === 'comparison' && formData.comparisonModels.length === 0) {
          toast.error('对比评测需要至少选择一个对比模型');
          return false;
        }
        return true;
      case 3:
        if (formData.selectedDatasets.length === 0) {
          toast.error('请至少选择一个数据集');
          return false;
        }
        if (formData.selectedMetrics.length === 0) {
          toast.error('请至少选择一个评测指标');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      return;
    }

    try {
      setLoading(true);
      const task = await createEvaluationTask({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        modelId: formData.modelId,
        modelName: formData.modelName,
        modelVersion: formData.modelVersion,
        modelType: formData.modelType,
        comparisonModels: formData.comparisonModels,
        datasets: formData.selectedDatasets,
        metrics: formData.selectedMetrics,
        config: {
          batchSize: formData.batchSize,
          temperature: formData.temperature,
          maxTokens: formData.maxTokens,
          topP: formData.topP,
          topK: formData.topK,
        },
        computeConfig: {
          gpuType: formData.gpuType,
          gpuCount: formData.gpuCount,
          memoryGB: formData.memoryGB,
          storageGB: formData.storageGB,
        },
        tags: formData.tags,
      });

      toast.success('评测任务创建成功');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (modelId: string) => {
    const model = MOCK_MODELS.find((m) => m.id === modelId);
    if (model) {
      setFormData({
        ...formData,
        modelId: model.id,
        modelName: model.name,
        modelVersion: model.version,
        modelType: model.type,
      });
    }
  };

  const handleAddComparisonModel = (modelId: string) => {
    const model = MOCK_MODELS.find((m) => m.id === modelId);
    if (model && !formData.comparisonModels.find((m) => m.modelId === modelId)) {
      setFormData({
        ...formData,
        comparisonModels: [
          ...formData.comparisonModels,
          { modelId: model.id, modelName: model.name, modelVersion: model.version },
        ],
      });
    }
  };

  const handleRemoveComparisonModel = (modelId: string) => {
    setFormData({
      ...formData,
      comparisonModels: formData.comparisonModels.filter((m) => m.modelId !== modelId),
    });
  };

  const toggleDataset = (datasetId: string) => {
    setFormData({
      ...formData,
      selectedDatasets: formData.selectedDatasets.includes(datasetId)
        ? formData.selectedDatasets.filter((id) => id !== datasetId)
        : [...formData.selectedDatasets, datasetId],
    });
  };

  const toggleMetric = (metricId: string) => {
    setFormData({
      ...formData,
      selectedMetrics: formData.selectedMetrics.includes(metricId)
        ? formData.selectedMetrics.filter((id) => id !== metricId)
        : [...formData.selectedMetrics, metricId],
    });
  };

  const steps = [
    { number: 1, title: '评测类型', description: '选择评测类型和基本信息' },
    { number: 2, title: '模型选择', description: '选择要评测的模型' },
    { number: 3, title: '数据集与指标', description: '选择评测数据集和指标' },
    { number: 4, title: '评测配置', description: '配置评测参数' },
    { number: 5, title: '计算资源', description: '配置计算资源' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">创建评测任务</DialogTitle>
        </DialogHeader>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    currentStep === step.number
                      ? 'bg-purple-600 text-white'
                      : currentStep > step.number
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <div className="hidden md:block">
                  <div className={`text-sm font-medium ${currentStep === step.number ? 'text-purple-600' : 'text-slate-700'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* 步骤 1: 评测类型 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">选择评测类型</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.type === 'benchmark'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200'
                    }`}
                    onClick={() => setFormData({ ...formData, type: 'benchmark' })}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="font-medium">基准评测</div>
                        <div className="text-xs text-slate-600">
                          使用标准数据集进行能力测试
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.type === 'custom'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200'
                    }`}
                    onClick={() => setFormData({ ...formData, type: 'custom' })}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="font-medium">自定义评测</div>
                        <div className="text-xs text-slate-600">
                          自定义数据集和评测指标
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.type === 'comparison'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200'
                    }`}
                    onClick={() => setFormData({ ...formData, type: 'comparison' })}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <GitCompare className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="font-medium">对比评测</div>
                        <div className="text-xs text-slate-600">
                          多模型横向对比测试
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">任务名称 *</Label>
                  <Input
                    id="name"
                    placeholder="例如：Qwen2-7B 综合能力评测"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">任务描述</Label>
                  <Textarea
                    id="description"
                    placeholder="简要描述评测目的和范围..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 步骤 2: 模型选择 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">选择主模型 *</Label>
                <Select value={formData.modelId} onValueChange={handleModelSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择要评测的模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {model.version}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.modelId && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm">
                      <span className="text-slate-600">已选择：</span>
                      <span className="font-medium text-purple-600 ml-2">
                        {formData.modelName} {formData.modelVersion}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {formData.type === 'comparison' && (
                <div>
                  <Label className="text-base mb-3 block">添加对比模型</Label>
                  <Select onValueChange={handleAddComparisonModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择对比模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_MODELS.filter((m) => m.id !== formData.modelId).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {model.version}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.comparisonModels.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.comparisonModels.map((model) => (
                        <div
                          key={model.modelId}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.modelName}</span>
                            <Badge variant="outline" className="text-xs">
                              {model.modelVersion}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveComparisonModel(model.modelId)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 步骤 3: 数据集与指标 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">选择评测数据集 *</Label>
                <div className="grid grid-cols-1 gap-3">
                  {datasets.map((dataset) => (
                    <Card
                      key={dataset.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.selectedDatasets.includes(dataset.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200'
                      }`}
                      onClick={() => toggleDataset(dataset.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={formData.selectedDatasets.includes(dataset.id)}
                            onCheckedChange={() => toggleDataset(dataset.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{dataset.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {dataset.sampleCount.toLocaleString()} 样本
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {dataset.size}MB
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{dataset.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {dataset.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base mb-3 block">选择评测指标 *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {metrics.map((metric) => (
                    <Card
                      key={metric.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.selectedMetrics.includes(metric.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200'
                      }`}
                      onClick={() => toggleMetric(metric.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={formData.selectedMetrics.includes(metric.id)}
                            onCheckedChange={() => toggleMetric(metric.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{metric.displayName}</div>
                            <p className="text-xs text-slate-600 mt-1">{metric.description}</p>
                            <Badge
                              variant="outline"
                              className="text-xs mt-2"
                            >
                              {metric.category === 'quality' && '质量'}
                              {metric.category === 'performance' && '性能'}
                              {metric.category === 'efficiency' && '效率'}
                              {metric.category === 'safety' && '安全'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 步骤 4: 评测配置 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="batchSize">批处理大小</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="batchSize"
                    min={1}
                    max={32}
                    step={1}
                    value={[formData.batchSize]}
                    onValueChange={(value) => setFormData({ ...formData, batchSize: value[0] })}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">{formData.batchSize}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="temperature"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[formData.temperature]}
                    onValueChange={(value) => setFormData({ ...formData, temperature: value[0] })}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">{formData.temperature.toFixed(1)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">控制输出的随机性，值越大越随机</p>
              </div>

              <div>
                <Label htmlFor="maxTokens">最大 Token 数</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min={128}
                  max={8192}
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="topP">Top-P</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="topP"
                      min={0}
                      max={1}
                      step={0.05}
                      value={[formData.topP]}
                      onValueChange={(value) => setFormData({ ...formData, topP: value[0] })}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-medium">{formData.topP.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="topK">Top-K</Label>
                  <Input
                    id="topK"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.topK}
                    onChange={(e) => setFormData({ ...formData, topK: parseInt(e.target.value) })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 步骤 5: 计算资源 */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="gpuType">GPU 型号</Label>
                <Select
                  value={formData.gpuType}
                  onValueChange={(value) => setFormData({ ...formData, gpuType: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GPU_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gpuCount">GPU 数量</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="gpuCount"
                    min={1}
                    max={8}
                    step={1}
                    value={[formData.gpuCount]}
                    onValueChange={(value) => setFormData({ ...formData, gpuCount: value[0] })}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">{formData.gpuCount} 张</span>
                </div>
              </div>

              <div>
                <Label htmlFor="memoryGB">内存 (GB)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="memoryGB"
                    min={16}
                    max={256}
                    step={8}
                    value={[formData.memoryGB]}
                    onValueChange={(value) => setFormData({ ...formData, memoryGB: value[0] })}
                    className="flex-1"
                  />
                  <span className="w-16 text-right font-medium">{formData.memoryGB} GB</span>
                </div>
              </div>

              <div>
                <Label htmlFor="storageGB">存储 (GB)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="storageGB"
                    min={50}
                    max={500}
                    step={10}
                    value={[formData.storageGB]}
                    onValueChange={(value) => setFormData({ ...formData, storageGB: value[0] })}
                    className="flex-1"
                  />
                  <span className="w-16 text-right font-medium">{formData.storageGB} GB</span>
                </div>
              </div>

              {/* 资源预览 */}
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <div className="text-sm font-medium mb-3">资源配置预览</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">GPU:</span>
                      <span className="font-medium">
                        {formData.gpuCount}x {formData.gpuType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">内存:</span>
                      <span className="font-medium">{formData.memoryGB} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">存储:</span>
                      <span className="font-medium">{formData.storageGB} GB</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-slate-600">预估成本:</span>
                      <span className="font-medium text-purple-600">
                        ¥{(formData.gpuCount * 15 + formData.memoryGB * 0.5).toFixed(2)}/小时
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            {currentStep < 5 ? (
              <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
                下一步
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? '创建中...' : '创建任务'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
