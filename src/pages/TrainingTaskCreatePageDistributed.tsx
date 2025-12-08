import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Container, Sparkles, CheckCircle2, AlertCircle, Zap, Search, Filter, SortAsc, X, Network, Layers } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
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
  {
    id: 'env-004',
    name: 'cv-experiment-env',
    type: 'notebook',
    status: 'running',
    image: 'pytorch/pytorch:2.0.1-cuda11.8',
    availabilityZone: '北京可用区B',
    gpuType: 'V100',
    gpuCount: 2,
    cpuCores: 16,
    memory: 128,
    uptime: '1天5小时',
    tags: ['PyTorch', 'OpenCV', 'Computer Vision'],
  },
  {
    id: 'env-005',
    name: 'nlp-research-lab',
    type: 'custom',
    status: 'running',
    image: 'huggingface/transformers:4.30',
    availabilityZone: '上海可用区A',
    gpuType: 'A100',
    gpuCount: 8,
    cpuCores: 64,
    memory: 512,
    uptime: '3天8小时',
    tags: ['Transformers', 'NLP', 'BERT'],
  },
  {
    id: 'env-006',
    name: 'quick-test-env',
    type: 'notebook',
    status: 'running',
    image: 'python:3.11-slim',
    availabilityZone: '北京可用区A',
    gpuType: 'T4',
    gpuCount: 1,
    cpuCores: 4,
    memory: 16,
    uptime: '6小时',
    tags: ['Python', 'Testing', 'Jupyter'],
  },
  {
    id: 'env-007',
    name: 'gaming-ai-env',
    type: 'custom',
    status: 'running',
    image: 'nvidia/cuda:12.1.0-runtime',
    availabilityZone: '深圳可用区A',
    gpuType: 'RTX3090',
    gpuCount: 2,
    cpuCores: 16,
    memory: 64,
    uptime: '18小时',
    tags: ['CUDA', 'RL', 'Gaming'],
  },
  {
    id: 'env-008',
    name: 'data-science-hub',
    type: 'notebook',
    status: 'running',
    image: 'jupyter/datascience-notebook:latest',
    availabilityZone: '上海可用区B',
    gpuType: 'T4',
    gpuCount: 1,
    cpuCores: 8,
    memory: 32,
    uptime: '4天12小时',
    tags: ['Jupyter', 'Pandas', 'NumPy'],
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

// 分布式训练框架
const distributedFrameworks = [
  { value: 'pytorch-ddp', label: 'PyTorch DDP', description: '数据并行' },
  { value: 'pytorch-fsdp', label: 'PyTorch FSDP', description: '全切片数据并行' },
  { value: 'deepspeed', label: 'DeepSpeed', description: '微软分布式训练' },
  { value: 'horovod', label: 'Horovod', description: 'Uber分布式框架' },
  { value: 'megatron', label: 'Megatron-LM', description: 'NVIDIA大模型训练' },
];

export default function TrainingTaskCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // 启动模式：'existing' 使用现有环境 | 'dynamic' 动态创建
  const [launchMode, setLaunchMode] = useState<'existing' | 'dynamic'>('existing');
  
  // 可用的开发环境
  const [availableEnvs, setAvailableEnvs] = useState<DevEnvironment[]>(mockDevEnvironments);
  
  // 多选环境ID（支持分布式训练）
  const [selectedEnvIds, setSelectedEnvIds] = useState<string[]>([]);

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
    
    // 分布式训练配置
    distributedFramework: 'pytorch-ddp',
    masterNode: '', // 主节点ID
    
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // 筛选和排序状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGpuType, setFilterGpuType] = useState<string[]>([]);
  const [filterZone, setFilterZone] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'gpuCount' | 'uptime' | 'none'>('none');

  // 过滤运行中的环境
  const runningEnvs = availableEnvs.filter(env => env.status === 'running');

  // 应用筛选和排序的环境列表
  const filteredAndSortedEnvs = useMemo(() => {
    let result = [...runningEnvs];
    
    // 1. 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(env => 
        env.name.toLowerCase().includes(query) ||
        env.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // 2. GPU类型筛选
    if (filterGpuType.length > 0) {
      result = result.filter(env => filterGpuType.includes(env.gpuType));
    }
    
    // 3. 可用区筛选
    if (filterZone.length > 0) {
      result = result.filter(env => filterZone.includes(env.availabilityZone));
    }
    
    // 4. 环境类型筛选
    if (filterType.length > 0) {
      result = result.filter(env => filterType.includes(env.type));
    }
    
    // 5. 排序
    if (sortBy !== 'none') {
      result.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'gpuCount':
            return b.gpuCount - a.gpuCount;
          case 'uptime':
            const parseUptime = (uptime?: string) => {
              if (!uptime) return 0;
              if (uptime.includes('天')) {
                const days = parseInt(uptime);
                return days * 24;
              }
              if (uptime.includes('小时')) {
                return parseInt(uptime);
              }
              return 0;
            };
            return parseUptime(b.uptime) - parseUptime(a.uptime);
          default:
            return 0;
        }
      });
    }
    
    return result;
  }, [runningEnvs, searchQuery, filterGpuType, filterZone, filterType, sortBy]);

  // 计算活跃的筛选数量
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filterGpuType.length > 0) count++;
    if (filterZone.length > 0) count++;
    if (filterType.length > 0) count++;
    return count;
  }, [searchQuery, filterGpuType, filterZone, filterType]);

  // 清除所有筛选
  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterGpuType([]);
    setFilterZone([]);
    setFilterType([]);
    setSortBy('none');
  };

  // 获取唯一的可用区列表
  const uniqueZones = useMemo(() => {
    return Array.from(new Set(runningEnvs.map(env => env.availabilityZone)));
  }, [runningEnvs]);

  // 获取选中的环境列表
  const selectedEnvs = useMemo(() => {
    return availableEnvs.filter(env => selectedEnvIds.includes(env.id));
  }, [availableEnvs, selectedEnvIds]);

  // 计算聚合信息
  const aggregateInfo = useMemo(() => {
    if (selectedEnvs.length === 0) return null;
    
    const totalGpus = selectedEnvs.reduce((sum, env) => sum + env.gpuCount, 0);
    const totalCpus = selectedEnvs.reduce((sum, env) => sum + env.cpuCores, 0);
    const totalMemory = selectedEnvs.reduce((sum, env) => sum + env.memory, 0);
    const gpuTypes = Array.from(new Set(selectedEnvs.map(env => env.gpuType)));
    const zones = Array.from(new Set(selectedEnvs.map(env => env.availabilityZone)));
    
    return {
      nodeCount: selectedEnvs.length,
      totalGpus,
      totalCpus,
      totalMemory,
      gpuTypes,
      zones,
      isDistributed: selectedEnvs.length > 1,
    };
  }, [selectedEnvs]);

  // 自动选择第一个环境作为默认
  useEffect(() => {
    if (runningEnvs.length > 0 && selectedEnvIds.length === 0) {
      setSelectedEnvIds([runningEnvs[0].id]);
    }
  }, [runningEnvs, selectedEnvIds.length]);

  // 如果没有可用环境，自动切换到动态创建模式
  useEffect(() => {
    if (runningEnvs.length === 0) {
      setLaunchMode('dynamic');
    }
  }, [runningEnvs]);

  // 自动设置主节点为第一个选中的环境
  useEffect(() => {
    if (selectedEnvIds.length > 0 && !formData.masterNode) {
      setFormData({ ...formData, masterNode: selectedEnvIds[0] });
    }
  }, [selectedEnvIds, formData.masterNode]);

  // 处理环境选择
  const handleEnvToggle = (envId: string) => {
    setSelectedEnvIds(prev => {
      if (prev.includes(envId)) {
        const newIds = prev.filter(id => id !== envId);
        // 如果取消选择的是主节点，自动设置新的主节点
        if (envId === formData.masterNode && newIds.length > 0) {
          setFormData({ ...formData, masterNode: newIds[0] });
        }
        return newIds;
      } else {
        return [...prev, envId];
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.taskName.trim()) {
      toast.error('请输入任务名称');
      return;
    }

    if (!formData.datasetId || !formData.datasetVersionId) {
      toast.error('请选择数据集');
      return;
    }

    if (launchMode === 'existing' && selectedEnvIds.length === 0) {
      toast.error('请至少选择一个开发环境');
      return;
    }

    if (launchMode === 'dynamic' && !formData.availabilityZone) {
      toast.error('请选择可用区');
      return;
    }

    setSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (launchMode === 'existing') {
        const isDistributed = selectedEnvIds.length > 1;
        toast.success('训练任务创建成功', {
          description: isDistributed 
            ? `分布式训练 · ${selectedEnvIds.length}个节点 · 总计${aggregateInfo?.totalGpus}个GPU`
            : `使用环境: ${selectedEnvs[0]?.name}`,
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
              支持单机训练和分布式训练 · 可选择多个开发环境
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
                              ? '支持单机或分布式训练，可选择多个环境作为训练节点'
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
                    <div className="flex items-center justify-between">
                      <Label>选择开发环境（支持多选）</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                          {filteredAndSortedEnvs.length} / {runningEnvs.length} 个环境
                        </span>
                        {selectedEnvIds.length > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            已选 {selectedEnvIds.length}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 筛选和排序控制栏 */}
                    <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      {/* 搜索框 */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="搜索环境名称或标签..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white"
                        />
                        {searchQuery && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => setSearchQuery('')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* 筛选和排序按钮行 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* GPU类型筛选 */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <Filter className="w-3 h-3 mr-2" />
                              GPU类型
                              {filterGpuType.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                  {filterGpuType.length}
                                </Badge>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel>选择GPU类型</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {['A100', 'V100', 'T4', 'RTX3090'].map((gpu) => (
                              <DropdownMenuCheckboxItem
                                key={gpu}
                                checked={filterGpuType.includes(gpu)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilterGpuType([...filterGpuType, gpu]);
                                  } else {
                                    setFilterGpuType(filterGpuType.filter(g => g !== gpu));
                                  }
                                }}
                              >
                                {gpu}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* 可用区筛选 */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <Filter className="w-3 h-3 mr-2" />
                              可用区
                              {filterZone.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                  {filterZone.length}
                                </Badge>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel>选择可用区</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {uniqueZones.map((zone) => (
                              <DropdownMenuCheckboxItem
                                key={zone}
                                checked={filterZone.includes(zone)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilterZone([...filterZone, zone]);
                                  } else {
                                    setFilterZone(filterZone.filter(z => z !== zone));
                                  }
                                }}
                              >
                                {zone}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* 环境类型筛选 */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <Filter className="w-3 h-3 mr-2" />
                              类型
                              {filterType.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                  {filterType.length}
                                </Badge>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel>选择环境类型</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                              checked={filterType.includes('notebook')}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilterType([...filterType, 'notebook']);
                                } else {
                                  setFilterType(filterType.filter(t => t !== 'notebook'));
                                }
                              }}
                            >
                              Jupyter Notebook
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={filterType.includes('custom')}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilterType([...filterType, 'custom']);
                                } else {
                                  setFilterType(filterType.filter(t => t !== 'custom'));
                                }
                              }}
                            >
                              自定义环境
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* 排序 */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <SortAsc className="w-3 h-3 mr-2" />
                              排序
                              {sortBy !== 'none' && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5">1</Badge>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel>排序方式</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                              <DropdownMenuRadioItem value="none">
                                默认排序
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="name">
                                按名称排序
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="gpuCount">
                                按GPU数量（多→少）
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="uptime">
                                按运行时长（长→短）
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* 清除筛选 */}
                        {activeFiltersCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-slate-600"
                            onClick={clearAllFilters}
                          >
                            <X className="w-3 h-3 mr-2" />
                            清除筛选 ({activeFiltersCount})
                          </Button>
                        )}
                      </div>

                      {/* 活跃的筛选标签 */}
                      {(filterGpuType.length > 0 || filterZone.length > 0 || filterType.length > 0 || sortBy !== 'none') && (
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200">
                          {filterGpuType.map((gpu) => (
                            <Badge key={gpu} variant="secondary" className="gap-1">
                              GPU: {gpu}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-red-600"
                                onClick={() => setFilterGpuType(filterGpuType.filter(g => g !== gpu))}
                              />
                            </Badge>
                          ))}
                          {filterZone.map((zone) => (
                            <Badge key={zone} variant="secondary" className="gap-1">
                              {zone}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-red-600"
                                onClick={() => setFilterZone(filterZone.filter(z => z !== zone))}
                              />
                            </Badge>
                          ))}
                          {filterType.map((type) => (
                            <Badge key={type} variant="secondary" className="gap-1">
                              {type === 'notebook' ? 'Jupyter' : '自定义'}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-red-600"
                                onClick={() => setFilterType(filterType.filter(t => t !== type))}
                              />
                            </Badge>
                          ))}
                          {sortBy !== 'none' && (
                            <Badge variant="secondary" className="gap-1">
                              排序: {sortBy === 'name' ? '名称' : sortBy === 'gpuCount' ? 'GPU数量' : '运行时长'}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-red-600"
                                onClick={() => setSortBy('none')}
                              />
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 环境列表 - 多选复选框 */}
                    {filteredAndSortedEnvs.length > 0 ? (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {filteredAndSortedEnvs.map((env) => {
                          const isSelected = selectedEnvIds.includes(env.id);
                          const isMaster = formData.masterNode === env.id;
                          
                          return (
                            <div
                              key={env.id}
                              className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              onClick={() => handleEnvToggle(env.id)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleEnvToggle(env.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Label className="cursor-pointer font-medium">
                                    {env.name}
                                  </Label>
                                  <Badge variant="outline" className="text-xs">
                                    {env.type === 'notebook' ? 'Jupyter' : '自定义'}
                                  </Badge>
                                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                    运行中
                                  </Badge>
                                  {isMaster && selectedEnvIds.length > 1 && (
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                      主节点
                                    </Badge>
                                  )}
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
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                        <Filter className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="font-medium">没有找到匹配的环境</p>
                        <p className="text-sm mt-1">请尝试调整筛选条件</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2"
                          onClick={clearAllFilters}
                        >
                          清除所有筛选
                        </Button>
                      </div>
                    )}

                    {/* 分布式训练配置（选择多个环境时显示） */}
                    {selectedEnvIds.length > 1 && (
                      <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-4">
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-orange-600" />
                          <Label className="text-orange-900">分布式训练配置</Label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* 主节点选择 */}
                          <div className="space-y-2">
                            <Label className="text-sm text-orange-900">主节点</Label>
                            <Select
                              value={formData.masterNode}
                              onValueChange={(value) => setFormData({ ...formData, masterNode: value })}
                            >
                              <SelectTrigger className="bg-white border-orange-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedEnvs.map((env) => (
                                  <SelectItem key={env.id} value={env.id}>
                                    {env.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* 分布式框架 */}
                          <div className="space-y-2">
                            <Label className="text-sm text-orange-900">分布式框架</Label>
                            <Select
                              value={formData.distributedFramework}
                              onValueChange={(value) => setFormData({ ...formData, distributedFramework: value })}
                            >
                              <SelectTrigger className="bg-white border-orange-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {distributedFrameworks.map((fw) => (
                                  <SelectItem key={fw.value} value={fw.value}>
                                    {fw.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-orange-700">
                              {distributedFrameworks.find(f => f.value === formData.distributedFramework)?.description}
                            </p>
                          </div>
                        </div>

                        <Alert className="bg-orange-100 border-orange-300">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <AlertDescription className="text-orange-900 text-sm">
                            分布式训练将在多个节点上并行执行，确保所有节点网络互通
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
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
                {launchMode === 'existing' && aggregateInfo ? (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      {aggregateInfo.isDistributed ? (
                        <>
                          <Network className="w-4 h-4 text-purple-600" />
                          <span className="text-slate-600">分布式训练</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-slate-600">单机训练</span>
                        </>
                      )}
                    </div>
                    
                    <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-sm">
                      {aggregateInfo.isDistributed && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">训练节点</span>
                          <span className="font-medium">{aggregateInfo.nodeCount} 个</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">总GPU</span>
                        <span className="font-medium">
                          {aggregateInfo.totalGpus} 个 ({aggregateInfo.gpuTypes.join(', ')})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">总CPU</span>
                        <span className="font-medium">{aggregateInfo.totalCpus} 核</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">总内存</span>
                        <span className="font-medium">{aggregateInfo.totalMemory} GB</span>
                      </div>
                      {aggregateInfo.zones.length > 1 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">跨可用区</span>
                          <span className="font-medium text-xs">{aggregateInfo.zones.length} 个</span>
                        </div>
                      )}
                    </div>

                    {aggregateInfo.isDistributed ? (
                      <Alert className="bg-purple-50 border-purple-200">
                        <Network className="w-4 h-4 text-purple-600" />
                        <AlertDescription className="text-purple-900 text-sm">
                          分布式训练 · 使用 {distributedFrameworks.find(f => f.value === formData.distributedFramework)?.label}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <AlertDescription className="text-green-900 text-sm">
                          快速启动，预计 10 秒内开始训练
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* 选中环境列表 */}
                    {selectedEnvs.length > 0 && (
                      <div className="pt-3 border-t border-slate-200">
                        <Label className="text-xs text-slate-600 mb-2 block">选中的环境</Label>
                        <div className="space-y-1">
                          {selectedEnvs.map((env) => (
                            <div key={env.id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-700">{env.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {env.gpuCount}x{env.gpuType}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  <p>支持多选环境进行分布式训练，提升训练速度</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-2" />
                  <p>分布式训练时会自动配置节点间通信</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-2" />
                  <p>使用筛选功能快速找到合适的GPU环境</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-2" />
                  <p>跨可用区训练可能会有网络延迟</p>
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
