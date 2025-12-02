import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import {
  Plus,
  Search,
  Play,
  Pause,
  Square,
  MoreVertical,
  Cpu,
  HardDrive,
  Network,
  Clock,
  Container,
  Terminal,
  FileText,
  Trash2,
  Copy,
  RefreshCw,
  Info,
  Database,
  Server,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import CreateInstanceDialog from '../CreateInstanceDialog';

interface Instance {
  id: string;
  name: string;
  type: 'training' | 'inference' | 'notebook' | 'custom';
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  image: string;
  cluster: string;
  gpus: number;
  cpuCores: number;
  memory: number;
  storage: number;
  createdAt: string;
  uptime?: string;
  gpuUsage?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  cost?: number;
  ports?: string[];
  command?: string;
}

export function InstancesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInstanceDetailDialogOpen, setIsInstanceDetailDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);

  // 创建实例表单状态
  const [newInstance, setNewInstance] = useState({
    name: '',
    type: 'training',
    image: 'pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime',
    cluster: '',
    gpus: 1,
    cpuCores: 8,
    memory: 32,
    storage: 100,
    command: '',
    workdir: '/workspace',
    ports: '',
    env: '',
    autoRestart: false,
  });

  // 模拟实例数据
  const [instances] = useState<Instance[]>([
    {
      id: 'inst-001',
      name: 'llama2-finetuning',
      type: 'training',
      status: 'running',
      image: 'pytorch/pytorch:2.1.0-cuda12.1',
      cluster: '北京集群-A',
      gpus: 4,
      cpuCores: 32,
      memory: 256,
      storage: 500,
      createdAt: '2024-11-08 10:30:00',
      uptime: '2天3小时',
      gpuUsage: 95,
      cpuUsage: 78,
      memoryUsage: 85,
      cost: 48.5,
      ports: ['8888', '6006'],
      command: 'python train.py --model llama2-7b',
    },
    {
      id: 'inst-002',
      name: 'bert-inference-api',
      type: 'inference',
      status: 'running',
      image: 'nvidia/tritonserver:23.10-py3',
      cluster: '上海集群-B',
      gpus: 1,
      cpuCores: 8,
      memory: 64,
      storage: 100,
      createdAt: '2024-11-05 14:20:00',
      uptime: '5天6小时',
      gpuUsage: 45,
      cpuUsage: 30,
      memoryUsage: 55,
      cost: 12.3,
      ports: ['8000', '8001', '8002'],
      command: 'tritonserver --model-repository=/models',
    },
    {
      id: 'inst-003',
      name: 'jupyter-notebook-dev',
      type: 'notebook',
      status: 'running',
      image: 'jupyter/tensorflow-notebook:latest',
      cluster: '北京集群-A',
      gpus: 2,
      cpuCores: 16,
      memory: 128,
      storage: 200,
      createdAt: '2024-11-09 09:15:00',
      uptime: '1天5小时',
      gpuUsage: 25,
      cpuUsage: 15,
      memoryUsage: 40,
      cost: 15.8,
      ports: ['8888'],
      command: 'jupyter lab --allow-root',
    },
    {
      id: 'inst-004',
      name: 'data-preprocessing',
      type: 'custom',
      status: 'stopped',
      image: 'python:3.11-slim',
      cluster: '深圳集群-C',
      gpus: 0,
      cpuCores: 16,
      memory: 64,
      storage: 300,
      createdAt: '2024-11-07 16:45:00',
      cost: 0,
      command: 'python preprocess.py',
    },
    {
      id: 'inst-005',
      name: 'diffusion-model-train',
      type: 'training',
      status: 'starting',
      image: 'pytorch/pytorch:2.1.0-cuda12.1',
      cluster: '北京集群-A',
      gpus: 8,
      cpuCores: 64,
      memory: 512,
      storage: 1000,
      createdAt: '2024-11-10 14:00:00',
      cost: 0,
      command: 'accelerate launch train_diffusion.py',
    },
    {
      id: 'inst-006',
      name: 'llm-api-service',
      type: 'inference',
      status: 'error',
      image: 'vllm/vllm-openai:latest',
      cluster: '上海集群-B',
      gpus: 2,
      cpuCores: 16,
      memory: 128,
      storage: 200,
      createdAt: '2024-11-10 12:30:00',
      cost: 0,
      command: 'python -m vllm.entrypoints.openai.api_server',
    },
  ]);

  // 获取状态徽章
  const getStatusBadge = (status: Instance['status']) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-600">运行中</Badge>;
      case 'stopped':
        return <Badge variant="secondary">已停止</Badge>;
      case 'starting':
        return <Badge className="bg-blue-600">启动中</Badge>;
      case 'stopping':
        return <Badge className="bg-orange-600">停止中</Badge>;
      case 'error':
        return <Badge variant="destructive">错误</Badge>;
    }
  };

  // 获取类型徽章
  const getTypeBadge = (type: Instance['type']) => {
    switch (type) {
      case 'training':
        return <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">训练任务</Badge>;
      case 'inference':
        return <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">推理服务</Badge>;
      case 'notebook':
        return <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">开发环境</Badge>;
      case 'custom':
        return <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50">自定义</Badge>;
    }
  };

  // 筛选实例
  const filteredInstances = instances.filter((instance) => {
    const matchesSearch =
      instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || instance.type === filterType;
    const matchesStatus = filterStatus === 'all' || instance.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // 统计信息
  const stats = {
    total: instances.length,
    running: instances.filter((i) => i.status === 'running').length,
    stopped: instances.filter((i) => i.status === 'stopped').length,
    totalCost: instances.reduce((sum, i) => sum + (i.cost || 0), 0),
  };

  // 预设镜像
  const presetImages = [
    { value: 'pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime', label: 'PyTorch 2.1.0 + CUDA 12.1' },
    { value: 'tensorflow/tensorflow:2.14.0-gpu', label: 'TensorFlow 2.14.0 GPU' },
    { value: 'nvidia/cuda:12.2.0-cudnn8-runtime-ubuntu22.04', label: 'NVIDIA CUDA 12.2' },
    { value: 'jupyter/tensorflow-notebook:latest', label: 'Jupyter TensorFlow' },
    { value: 'nvidia/tritonserver:23.10-py3', label: 'Triton Inference Server' },
    { value: 'vllm/vllm-openai:latest', label: 'vLLM OpenAI API' },
    { value: 'custom', label: '自定义镜像...' },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">开发环境</h1>
        <p className="text-slate-600">交互式容器实例，用于代码开发、数据分析和实验调试</p>
      </div>

      {/* 使用说明 */}
      <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <Info className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-sm">
          <strong className="text-blue-900">💡 开发环境说明：</strong>
          <div className="mt-2 text-slate-700 space-y-1">
            <p>• <strong>适用场景</strong>：Jupyter开发、代码调试、数据探索、临时实验</p>
            <p>• <strong>特点</strong>：长期运行、可登录终端、灵活配置、手动管理生命周期</p>
            <p>• <strong>费用</strong>：按运行时间计费，停止后不计费</p>
            <p className="text-blue-700 mt-2">
              🚀 <strong>提示</strong>：如需批量训练请使用"训练任务"，如需生产部署请使用"推理服务"
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总实例数</p>
                <p className="text-3xl">{stats.total}</p>
              </div>
              <Container className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">运行中</p>
                <p className="text-3xl text-green-600">{stats.running}</p>
              </div>
              <Play className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已停止</p>
                <p className="text-3xl text-slate-600">{stats.stopped}</p>
              </div>
              <Square className="w-10 h-10 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">今日费用</p>
                <p className="text-3xl text-orange-600">¥{stats.totalCost.toFixed(1)}</p>
              </div>
              <Zap className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索实例名称或ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="training">训练任务</SelectItem>
              <SelectItem value="inference">推理服务</SelectItem>
              <SelectItem value="notebook">开发环境</SelectItem>
              <SelectItem value="custom">自定义</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="running">运行中</SelectItem>
              <SelectItem value="stopped">已停止</SelectItem>
              <SelectItem value="starting">启动中</SelectItem>
              <SelectItem value="error">错误</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          创建例
        </Button>
      </div>

      {/* 实例列表 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredInstances.map((instance) => (
          <Card key={instance.id} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{instance.name}</CardTitle>
                    {getStatusBadge(instance.status)}
                    {getTypeBadge(instance.type)}
                  </div>
                  <CardDescription className="font-mono text-xs">{instance.id}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {instance.status === 'running' && (
                      <>
                        <DropdownMenuItem>
                          <Terminal className="w-4 h-4 mr-2" />
                          打开终端
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          查看日志
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Pause className="w-4 h-4 mr-2" />
                          停止实例
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          重启实例
                        </DropdownMenuItem>
                      </>
                    )}
                    {instance.status === 'stopped' && (
                      <DropdownMenuItem>
                        <Play className="w-4 h-4 mr-2" />
                        启动实例
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedInstance(instance);
                        setIsInstanceDetailDialogOpen(true);
                      }}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      克隆实例
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除实例
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 镜像和集群信息 */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Container className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600">镜像:</span>
                  <span className="font-mono text-xs">{instance.image}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-green-600" />
                  <span className="text-slate-600">集群:</span>
                  <span>{instance.cluster}</span>
                </div>
              </div>

              {/* 资源配置 */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <Cpu className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs text-slate-600 mb-1">GPU</p>
                  <p className="font-medium">{instance.gpus} 卡</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <Server className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-slate-600 mb-1">CPU</p>
                  <p className="font-medium">{instance.cpuCores} 核</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <HardDrive className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-slate-600 mb-1">内存</p>
                  <p className="font-medium">{instance.memory}GB</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <Database className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <p className="text-xs text-slate-600 mb-1">存储</p>
                  <p className="font-medium">{instance.storage}GB</p>
                </div>
              </div>

              {/* 资源使用率 (仅运行中的实例) */}
              {instance.status === 'running' && instance.gpuUsage !== undefined && (
                <div className="space-y-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">GPU 使用率</span>
                      <span className="font-medium">{instance.gpuUsage}%</span>
                    </div>
                    <Progress value={instance.gpuUsage} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">CPU 使用率</span>
                      <span className="font-medium">{instance.cpuUsage}%</span>
                    </div>
                    <Progress value={instance.cpuUsage} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">内存使用率</span>
                      <span className="font-medium">{instance.memoryUsage}%</span>
                    </div>
                    <Progress value={instance.memoryUsage} className="h-1.5" />
                  </div>
                </div>
              )}

              {/* 底部信息 */}
              <div className="flex items-center justify-between pt-3 border-t text-sm">
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{instance.uptime || instance.createdAt}</span>
                  </div>
                  {instance.cost !== undefined && instance.cost > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-600 font-medium">¥{instance.cost}/天</span>
                    </div>
                  )}
                </div>
                {instance.ports && instance.ports.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-600" />
                    <div className="flex gap-1">
                      {instance.ports.map((port) => (
                        <Badge key={port} variant="outline" className="text-xs">
                          {port}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstances.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Container className="w-16 h-16 mx-auto text-slate-300" />
            <div>
              <h3 className="text-xl mb-2">没有找到实例</h3>
              <p className="text-slate-600 mb-6">调整筛选条件或创建新的算力实例</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建实例
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 创建实例对话框 - 使用新组件 */}
      <CreateInstanceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => {
          console.log('创建实例:', data);
          toast.success('实例创建成功');
          // TODO: 提交到后端API
        }}
      />

      {/* 实例详情对话框 */}
      <Dialog open={isInstanceDetailDialogOpen} onOpenChange={setIsInstanceDetailDialogOpen}>
        <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">实例详情</DialogTitle>
            <DialogDescription>
              {selectedInstance?.name} - {selectedInstance?.id}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 py-6">
            {selectedInstance && (
              <div className="space-y-6">
                {/* 状态和基本信息 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">实例ID</p>
                      <p className="font-mono text-sm">{selectedInstance.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">实例名称</p>
                      <p className="font-medium">{selectedInstance.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">运行状态</p>
                      {getStatusBadge(selectedInstance.status)}
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">实例类型</p>
                      {getTypeBadge(selectedInstance.type)}
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">创建时间</p>
                      <p>{selectedInstance.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">运行时长</p>
                      <p>{selectedInstance.uptime || '未运行'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 镜像和集群 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>部署配置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">容器镜像</p>
                      <p className="font-mono text-sm">{selectedInstance.image}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">部署集群</p>
                      <p>{selectedInstance.cluster}</p>
                    </div>
                    {selectedInstance.command && (
                      <div>
                        <p className="text-xs text-slate-600 mb-1">启动命令</p>
                        <code className="block p-3 bg-slate-900 text-green-400 rounded text-xs">
                          {selectedInstance.command}
                        </code>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 资源配置和使用 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>资源配置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <Cpu className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-xs text-slate-600 mb-1">GPU</p>
                        <p className="text-xl font-semibold">{selectedInstance.gpus}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <Server className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-xs text-slate-600 mb-1">CPU</p>
                        <p className="text-xl font-semibold">{selectedInstance.cpuCores}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <HardDrive className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-xs text-slate-600 mb-1">内存</p>
                        <p className="text-xl font-semibold">{selectedInstance.memory}</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg text-center">
                        <Database className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-xs text-slate-600 mb-1">存储</p>
                        <p className="text-xl font-semibold">{selectedInstance.storage}</p>
                      </div>
                    </div>

                    {selectedInstance.status === 'running' && selectedInstance.gpuUsage !== undefined && (
                      <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                        <h6 className="font-medium mb-3">实时使用率</h6>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>GPU 使用率</span>
                            <span className="font-medium">{selectedInstance.gpuUsage}%</span>
                          </div>
                          <Progress value={selectedInstance.gpuUsage} />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>CPU 使用率</span>
                            <span className="font-medium">{selectedInstance.cpuUsage}%</span>
                          </div>
                          <Progress value={selectedInstance.cpuUsage} />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>内存使用率</span>
                            <span className="font-medium">{selectedInstance.memoryUsage}%</span>
                          </div>
                          <Progress value={selectedInstance.memoryUsage} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 网络端口 */}
                {selectedInstance.ports && selectedInstance.ports.length > 0 && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>网络端口</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedInstance.ports.map((port) => (
                          <div
                            key={port}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Network className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium">端口 {port}</p>
                                <p className="text-xs text-slate-600">
                                  https://instance-{selectedInstance.id}.fermi.cloud:{port}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Copy className="w-4 h-4 mr-1.5" />
                              复制链接
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="pt-6 border-t">
            <Button variant="outline" onClick={() => setIsInstanceDetailDialogOpen(false)}>
              关闭
            </Button>
            {selectedInstance?.status === 'running' && (
              <Button>
                <Terminal className="w-4 h-4 mr-2" />
                打开终端
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}