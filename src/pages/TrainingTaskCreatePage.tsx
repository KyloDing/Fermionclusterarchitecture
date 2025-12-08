import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Container, Plus, Server, Zap, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
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

// 开发环境实例类型
interface DevEnvironment {
  id: string;
  name: string;
  type: 'notebook' | 'custom';
  status: 'running' | 'stopped';
  image: string;
  availabilityZone: string;
  gpuType: string;
  gpuCount: number;
  cpuCores: number;
  memory: number;
  uptime?: string;
  tags?: string[];
}

// 模拟可用的开发环境数据
const mockDevEnvironments: DevEnvironment[] = [
  {
    id: 'env-001',
    name: 'pytorch-dev-env',
    type: 'notebook',
    status: 'running',
    image: 'pytorch/pytorch:2.1.0-cuda12.1',
    availabilityZone: '北京可用区A',
    gpuType: 'A100',
    gpuCount: 2,
    cpuCores: 16,
    memory: 128,
    uptime: '5天3小时',
    tags: ['PyTorch', 'CUDA 12.1', 'Jupyter'],
  },
  {
    id: 'env-002',
    name: 'tensorflow-workspace',
    type: 'notebook',
    status: 'running',
    image: 'tensorflow/tensorflow:2.14.0-gpu',
    availabilityZone: '上海可用区B',
    gpuType: 'V100',
    gpuCount: 1,
    cpuCores: 8,
    memory: 64,
    uptime: '2天10小时',
    tags: ['TensorFlow', 'Keras', 'Jupyter'],
  },
  {
    id: 'env-003',
    name: 'llm-training-env',
    type: 'custom',
    status: 'running',
    image: 'huggingface/transformers:4.35-cuda12.1',
    availabilityZone: '深圳可用区C',
    gpuType: 'A100',
    gpuCount: 4,
    cpuCores: 32,
    memory: 256,
    uptime: '12小时',
    tags: ['Transformers', 'LLM', 'CUDA 12.1'],
  },
];

// 可用区数据
const availabilityZones = [
  { id: 'az-bj-a', name: '北京可用区A', region: '北京' },
  { id: 'az-bj-b', name: '北京可用区B', region: '北京' },
  { id: 'az-sh-a', name: '上海可用区A', region: '上海' },
  { id: 'az-sh-b', name: '上海可用区B', region: '上海' },
  { id: 'az-sz-a', name: '深圳可用区A', region: '深圳' },
  { id: 'az-sz-c', name: '深圳可用区C', region: '深圳' },
];

// GPU节点配置
const gpuConfigs = [
  { type: 'A100', memory: '80GB', performance: '高性能', recommended: true },
  { type: 'V100', memory: '32GB', performance: '标准性能', recommended: false },
  { type: 'T4', memory: '16GB', performance: '入门级', recommended: false },
  { type: 'RTX3090', memory: '24GB', performance: '性价比', recommended: false },
];

export default function TrainingTaskCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // 启动模式：'existing' 使用现有环境 | 'dynamic' 动态创建
  const [launchMode, setLaunchMode] = useState<'existing' | 'dynamic'>('existing');
  
  // 可用的开发环境
  const [availableEnvs, setAvailableEnvs] = useState<DevEnvironment[]>(mockDevEnvironments);
  const [selectedEnvId, setSelectedEnvId] = useState<string>('');

  const [formData, setFormData] = useState({
    taskName: '',
    datasetId: state?.datasetId || '',
    datasetVersionId: state?.datasetVersionId || '',
    modelId: state?.modelId || '',
    
    // 动态创建时的配置
    availabilityZone: '',
    gpuType: 'A100',
    gpuCount: '1',
    cpuCores: '8',
    memory: '32',
    image: 'pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime',
    
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // 过滤运行中的环境
  const runningEnvs = availableEnvs.filter(env => env.status === 'running');

  // 自动选择第一个环境
  useEffect(() => {
    if (runningEnvs.length > 0 && !selectedEnvId) {
      setSelectedEnvId(runningEnvs[0].id);
    }
  }, [runningEnvs, selectedEnvId]);

  // 如果没有可用环境，自动切换到动态创建模式
  useEffect(() => {
    if (runningEnvs.length === 0) {
      setLaunchMode('dynamic');
    }
  }, [runningEnvs]);

  const handleSubmit = async () => {
    if (!formData.taskName.trim()) {
      toast.error('请输入任务名称');
      return;
    }

    if (!formData.datasetId || !formData.datasetVersionId) {
      toast.error('请选择数据集');
      return;
    }

    if (launchMode === 'existing' && !selectedEnvId) {
      toast.error('请选择开发环境');
      return;
    }

    if (launchMode === 'dynamic' && !formData.availabilityZone) {
      toast.error('请选择可用区');
      return;
    }

    setSubmitting(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (launchMode === 'existing') {
        const env = availableEnvs.find(e => e.id === selectedEnvId);
        toast.success('训练任务创建成功', {
          description: `使用环境: ${env?.name}`,
        });
      } else {
        toast.success('训练任务创建成功', {
          description: `已在 ${availabilityZones.find(z => z.id === formData.availabilityZone)?.name} 动态创建资源`,
        });
      }
      
      navigate('/training-jobs');
    } catch (error) {
      console.error('创建训练任务失败:', error);
      toast.error('创建训练任务失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 获取选中的环境
  const selectedEnv = availableEnvs.find(env => env.id === selectedEnvId);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900">发起训练任务</h1>
            <p className="text-slate-600">
              选择使用现有开发环境或动态创建新资源
            </p>
          </div>
        </div>

        {/* 主表单 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：基本配置 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>配置训练任务的基本参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 任务名称 */}
                <div className="space-y-2">
                  <Label htmlFor="taskName">
                    任务名称 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="taskName"
                    value={formData.taskName}
                    onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                    placeholder="例如: llama2-sft-training-v1"
                  />
                </div>

                {/* 数据集信息 */}
                {state?.datasetName && (
                  <div className="space-y-2">
                    <Label>数据集</Label>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{state.datasetName}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            版本: {state.datasetVersion}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/datasets')}
                        >
                          更换
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 模型选择 */}
                <div className="space-y-2">
                  <Label>
                    模型 <span className="text-red-500">*</span>
                  </Label>
                  {state?.modelName ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{state.modelName}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            版本: {state.modelVersion}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/models')}
                        >
                          更换
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => navigate('/models')}
                      className="w-full"
                    >
                      选择模型
                    </Button>
                  )}
                </div>

                {/* 描述 */}
                <div className="space-y-2">
                  <Label htmlFor="description">任务描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="描述训练任务的目的和配置要点（可选）"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 资源配置 */}
            <Card>
              <CardHeader>
                <CardTitle>资源配置</CardTitle>
                <CardDescription>选择训练任务的运行资源</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 启动模式选择 */}
                <div className="space-y-4">
                  <Label>启动模式</Label>
                  <RadioGroup
                    value={launchMode}
                    onValueChange={(value) => setLaunchMode(value as 'existing' | 'dynamic')}
                    disabled={runningEnvs.length === 0}
                  >
                    <div className="space-y-3">
                      {/* 使用现有环境 */}
                      <div
                        className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all ${
                          launchMode === 'existing'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-200 hover:border-slate-300'
                        } ${runningEnvs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => runningEnvs.length > 0 && setLaunchMode('existing')}
                      >
                        <RadioGroupItem value="existing" id="mode-existing" disabled={runningEnvs.length === 0} />
                        <div className="flex-1">
                          <Label htmlFor="mode-existing" className="cursor-pointer flex items-center gap-2">
                            <Container className="w-4 h-4" />
                            使用现有开发环境
                            {runningEnvs.length > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                {runningEnvs.length} 个可用
                              </Badge>
                            )}
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">
                            {runningEnvs.length > 0
                              ? '复用已创建的开发环境，快速启动，无需等待资源分配'
                              : '暂无运行中的开发环境'}
                          </p>
                        </div>
                      </div>

                      {/* 动态创建 */}
                      <div
                        className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all ${
                          launchMode === 'dynamic'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        } cursor-pointer`}
                        onClick={() => setLaunchMode('dynamic')}
                      >
                        <RadioGroupItem value="dynamic" id="mode-dynamic" />
                        <div className="flex-1">
                          <Label htmlFor="mode-dynamic" className="cursor-pointer flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            动态创建资源
                            <Badge variant="outline" className="ml-2">
                              推荐
                            </Badge>
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">
                            根据需求选择可用区和节点配置，系统自动分配最优资源
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* 使用现有环境 - 环境列表 */}
                {launchMode === 'existing' && runningEnvs.length > 0 && (
                  <div className="space-y-3">
                    <Label>选择开发环境</Label>
                    <RadioGroup value={selectedEnvId} onValueChange={setSelectedEnvId}>
                      <div className="space-y-2">
                        {runningEnvs.map((env) => (
                          <div
                            key={env.id}
                            className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                              selectedEnvId === env.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => setSelectedEnvId(env.id)}
                          >
                            <RadioGroupItem value={env.id} id={`env-${env.id}`} className="mt-1" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Label htmlFor={`env-${env.id}`} className="cursor-pointer font-medium">
                                  {env.name}
                                </Label>
                                <Badge variant="outline" className="text-xs">
                                  {env.type === 'notebook' ? 'Jupyter' : '自定义'}
                                </Badge>
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  运行中
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                <div>📍 {env.availabilityZone}</div>
                                <div>💾 {env.image.split(':')[0].split('/').pop()}</div>
                                <div>🎮 {env.gpuCount}x {env.gpuType}</div>
                                <div>⏱️ {env.uptime}</div>
                              </div>
                              {env.tags && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {env.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* 动态创建 - 配置选项 */}
                {launchMode === 'dynamic' && (
                  <div className="space-y-4">
                    {/* 可用区选择 */}
                    <div className="space-y-2">
                      <Label>
                        可用区 <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.availabilityZone}
                        onValueChange={(value) => setFormData({ ...formData, availabilityZone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择可用区" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityZones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.name} ({zone.region})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* GPU配置 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>GPU类型</Label>
                        <Select
                          value={formData.gpuType}
                          onValueChange={(value) => setFormData({ ...formData, gpuType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {gpuConfigs.map((config) => (
                              <SelectItem key={config.type} value={config.type}>
                                <div className="flex items-center gap-2">
                                  {config.type}
                                  {config.recommended && (
                                    <Badge variant="secondary" className="text-xs">推荐</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {gpuConfigs.find(c => c.type === formData.gpuType) && (
                          <p className="text-xs text-slate-500">
                            {gpuConfigs.find(c => c.type === formData.gpuType)?.memory} · {gpuConfigs.find(c => c.type === formData.gpuType)?.performance}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>GPU数量</Label>
                        <Select
                          value={formData.gpuCount}
                          onValueChange={(value) => setFormData({ ...formData, gpuCount: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 卡</SelectItem>
                            <SelectItem value="2">2 卡</SelectItem>
                            <SelectItem value="4">4 卡</SelectItem>
                            <SelectItem value="8">8 卡</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* CPU和内存配置 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>CPU核心数</Label>
                        <Select
                          value={formData.cpuCores}
                          onValueChange={(value) => setFormData({ ...formData, cpuCores: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 核</SelectItem>
                            <SelectItem value="8">8 核</SelectItem>
                            <SelectItem value="16">16 核</SelectItem>
                            <SelectItem value="32">32 核</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>内存</Label>
                        <Select
                          value={formData.memory}
                          onValueChange={(value) => setFormData({ ...formData, memory: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16">16 GB</SelectItem>
                            <SelectItem value="32">32 GB</SelectItem>
                            <SelectItem value="64">64 GB</SelectItem>
                            <SelectItem value="128">128 GB</SelectItem>
                            <SelectItem value="256">256 GB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 镜像选择 */}
                    <div className="space-y-2">
                      <Label>训练镜像</Label>
                      <Select
                        value={formData.image}
                        onValueChange={(value) => setFormData({ ...formData, image: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime">
                            PyTorch 2.1.0 (CUDA 12.1)
                          </SelectItem>
                          <SelectItem value="tensorflow/tensorflow:2.14.0-gpu">
                            TensorFlow 2.14.0 (GPU)
                          </SelectItem>
                          <SelectItem value="huggingface/transformers:4.35-cuda12.1">
                            Transformers 4.35 (CUDA 12.1)
                          </SelectItem>
                          <SelectItem value="nvidia/pytorch:23.10-py3">
                            NVIDIA PyTorch 23.10
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：配置预览和提示 */}
          <div className="space-y-6">
            {/* 配置摘要 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">配置摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {launchMode === 'existing' && selectedEnv ? (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-slate-600">使用现有环境</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">环境名称</span>
                        <span className="font-medium">{selectedEnv.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">GPU</span>
                        <span className="font-medium">{selectedEnv.gpuCount}x {selectedEnv.gpuType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">CPU</span>
                        <span className="font-medium">{selectedEnv.cpuCores} 核</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">内存</span>
                        <span className="font-medium">{selectedEnv.memory} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">可用区</span>
                        <span className="font-medium text-xs">{selectedEnv.availabilityZone}</span>
                      </div>
                    </div>
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-900 text-sm">
                        快速启动，预计 10 秒内开始训练
                      </AlertDescription>
                    </Alert>
                  </>
                ) : launchMode === 'dynamic' ? (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-600">动态创建资源</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-sm">
                      {formData.availabilityZone && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">可用区</span>
                          <span className="font-medium text-xs">
                            {availabilityZones.find(z => z.id === formData.availabilityZone)?.name || '-'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">GPU</span>
                        <span className="font-medium">{formData.gpuCount}x {formData.gpuType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">CPU</span>
                        <span className="font-medium">{formData.cpuCores} 核</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">内存</span>
                        <span className="font-medium">{formData.memory} GB</span>
                      </div>
                    </div>
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <AlertDescription className="text-blue-900 text-sm">
                        预计 2-5 分钟完成资源分配
                      </AlertDescription>
                    </Alert>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* 操作提示 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💡 温馨提示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-2" />
                  <p>使用现有环境可以立即启动，节省资源分配时间</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-2" />
                  <p>动态创建会根据需求分配最优资源，适合长时间训练</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-2" />
                  <p>训练任务会自动挂载选择的数据集和模型</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-2" />
                  <p>可以随时在训练任务列表中查看进度和日志</p>
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={submitting || !formData.taskName.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                {submitting ? '创建中...' : '创建并启动训练'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="w-full"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
