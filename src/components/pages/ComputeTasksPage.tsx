import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import {
  Search,
  MoreVertical,
  Plus,
  RefreshCw,
  Play,
  Pause,
  Square,
  Terminal,
  FileText,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  HardDrive,
  Network,
  Eye,
  Trash2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Code,
  Zap,
  Brain,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router-dom';

type TaskType = 'development' | 'training' | 'inference' | 'fine-tuning';
type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
type QueuePriority = 'high' | 'medium' | 'low';

interface ComputeTask {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  priority: QueuePriority;
  queueName: string;
  preemptible: boolean;
  
  // 资源配置
  imageUrl: string;
  hasGPU: boolean;
  gpuCount: number;
  gpuModel: string;
  cpuCores: number;
  memoryGB: number;
  
  // 位置信息
  availabilityZone: string;
  resourcePool: string;
  nodeName?: string;
  
  // 实例配置（训练/推理/微调）
  instanceCount?: number;
  
  // 挂载卷
  volumes: string[];
  
  // 网络配置
  portMappings: { container: number; host: number; protocol: string }[];
  
  // 执行配置
  command: string;
  alwaysPullImage: boolean;
  enableVisualization?: boolean; // 训练任务可视化
  
  // 时间信息
  createdAt: string;
  enqueuedAt?: string;
  dequeuedAt?: string;
  completedAt?: string;
  
  // 计费
  hourlyRate: number;
  totalCost: number;
  
  // 创建者
  createdBy: string;
}

export default function ComputeTasksPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TaskType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<QueuePriority | 'all'>('all');
  const [tasks, setTasks] = useState<ComputeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ComputeTask | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockTasks: ComputeTask[] = [
        {
          id: 'task-dev-1',
          name: 'PyTorch开发环境',
          type: 'development',
          status: 'running',
          priority: 'high',
          queueName: '高优先级队列',
          preemptible: false,
          imageUrl: 'docker.io/pytorch/pytorch:2.1.0-cuda12.1',
          hasGPU: true,
          gpuCount: 1,
          gpuModel: 'NVIDIA A100',
          cpuCores: 8,
          memoryGB: 32,
          availabilityZone: '华北1区-A',
          resourcePool: 'GPU-Pool-A',
          nodeName: 'node-gpu-01',
          volumes: ['/data/projects', '/data/datasets'],
          portMappings: [
            { container: 8888, host: 30888, protocol: 'TCP' },
            { container: 6006, host: 30606, protocol: 'TCP' },
          ],
          command: 'jupyter lab --ip=0.0.0.0 --allow-root',
          alwaysPullImage: false,
          createdAt: '2024-11-25T08:00:00Z',
          enqueuedAt: '2024-11-25T08:00:05Z',
          dequeuedAt: '2024-11-25T08:00:30Z',
          hourlyRate: 15.5,
          totalCost: 46.5,
          createdBy: 'user@example.com',
        },
        {
          id: 'task-train-1',
          name: 'BERT模型训练',
          type: 'training',
          status: 'running',
          priority: 'high',
          queueName: '高优先级队列',
          preemptible: false,
          imageUrl: 'pytorch/pytorch:2.1.0-cuda12.1',
          hasGPU: true,
          gpuCount: 4,
          gpuModel: 'NVIDIA A100',
          cpuCores: 32,
          memoryGB: 128,
          availabilityZone: '华北1区-A',
          resourcePool: 'GPU-Pool-A',
          instanceCount: 2,
          volumes: ['/data/bert-dataset', '/data/checkpoints'],
          portMappings: [{ container: 6006, host: 31006, protocol: 'TCP' }],
          command: 'torchrun --nproc_per_node=4 train.py',
          alwaysPullImage: true,
          enableVisualization: true,
          createdAt: '2024-11-25T06:00:00Z',
          enqueuedAt: '2024-11-25T06:00:10Z',
          dequeuedAt: '2024-11-25T06:01:00Z',
          hourlyRate: 62.0,
          totalCost: 310.0,
          createdBy: 'ai-team@example.com',
        },
        {
          id: 'task-infer-1',
          name: 'Llama2-7B推理服务',
          type: 'inference',
          status: 'running',
          priority: 'medium',
          queueName: '中优先级队列',
          preemptible: true,
          imageUrl: 'vllm/vllm-openai:v0.2.1',
          hasGPU: true,
          gpuCount: 2,
          gpuModel: 'NVIDIA A100',
          cpuCores: 16,
          memoryGB: 64,
          availabilityZone: '华东1区-A',
          resourcePool: 'GPU-Pool-B',
          instanceCount: 1,
          volumes: ['/models/llama2-7b'],
          portMappings: [{ container: 8000, host: 32000, protocol: 'TCP' }],
          command: 'python -m vllm.entrypoints.openai.api_server --model /models/llama2-7b',
          alwaysPullImage: false,
          createdAt: '2024-11-25T07:00:00Z',
          enqueuedAt: '2024-11-25T07:00:15Z',
          dequeuedAt: '2024-11-25T07:02:00Z',
          hourlyRate: 31.0,
          totalCost: 124.0,
          createdBy: 'ml-team@example.com',
        },
        {
          id: 'task-tune-1',
          name: 'ChatGLM3微调任务',
          type: 'fine-tuning',
          status: 'pending',
          priority: 'medium',
          queueName: '中优先级队列',
          preemptible: true,
          imageUrl: 'hiyouga/llama-factory:latest',
          hasGPU: true,
          gpuCount: 2,
          gpuModel: 'NVIDIA A100',
          cpuCores: 16,
          memoryGB: 64,
          availabilityZone: '华北1区-A',
          resourcePool: 'GPU-Pool-A',
          instanceCount: 1,
          volumes: ['/models/chatglm3', '/data/fine-tune-data'],
          portMappings: [],
          command: 'llamafactory-cli train config.yaml',
          alwaysPullImage: true,
          createdAt: '2024-11-25T09:30:00Z',
          enqueuedAt: '2024-11-25T09:30:10Z',
          hourlyRate: 31.0,
          totalCost: 0,
          createdBy: 'ai-team@example.com',
        },
        {
          id: 'task-dev-2',
          name: 'TensorFlow开发',
          type: 'development',
          status: 'stopped',
          priority: 'low',
          queueName: '低优先级队列',
          preemptible: true,
          imageUrl: 'tensorflow/tensorflow:2.14.0-gpu',
          hasGPU: true,
          gpuCount: 1,
          gpuModel: 'NVIDIA V100',
          cpuCores: 4,
          memoryGB: 16,
          availabilityZone: '华北1区-B',
          resourcePool: 'GPU-Pool-A',
          volumes: ['/data/tf-projects'],
          portMappings: [{ container: 8888, host: 30889, protocol: 'TCP' }],
          command: 'jupyter notebook --ip=0.0.0.0',
          alwaysPullImage: false,
          createdAt: '2024-11-24T14:00:00Z',
          enqueuedAt: '2024-11-24T14:00:20Z',
          dequeuedAt: '2024-11-24T14:01:00Z',
          completedAt: '2024-11-25T02:00:00Z',
          hourlyRate: 8.5,
          totalCost: 102.0,
          createdBy: 'user@example.com',
        },
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取任务类型徽章
  const getTaskTypeBadge = (type: TaskType) => {
    switch (type) {
      case 'development':
        return (
          <Badge className="bg-blue-600">
            <Code className="w-3 h-3 mr-1" />
            开发环境
          </Badge>
        );
      case 'training':
        return (
          <Badge className="bg-purple-600">
            <Brain className="w-3 h-3 mr-1" />
            训练任务
          </Badge>
        );
      case 'inference':
        return (
          <Badge className="bg-green-600">
            <Zap className="w-3 h-3 mr-1" />
            推理服务
          </Badge>
        );
      case 'fine-tuning':
        return (
          <Badge className="bg-orange-600">
            <Settings className="w-3 h-3 mr-1" />
            微调任务
          </Badge>
        );
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            <Clock className="w-3 h-3 mr-1" />
            排队中
          </Badge>
        );
      case 'running':
        return (
          <Badge className="bg-green-600">
            <Activity className="w-3 h-3 mr-1" />
            运行中
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            已完成
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            失败
          </Badge>
        );
      case 'stopped':
        return (
          <Badge variant="outline">
            <Square className="w-3 h-3 mr-1" />
            已停止
          </Badge>
        );
    }
  };

  // 获取优先级徽章
  const getPriorityBadge = (priority: QueuePriority) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="border-red-300 text-red-700">
            <ArrowUp className="w-3 h-3 mr-1" />
            高优
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            <ArrowRight className="w-3 h-3 mr-1" />
            中优
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            <ArrowDown className="w-3 h-3 mr-1" />
            低优
          </Badge>
        );
    }
  };

  // 筛选任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || task.type === filterType;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  // 统计信息
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const handleStopTask = (task: ComputeTask) => {
    toast.success(`任务 ${task.name} 已停止`);
    loadTasks();
  };

  const handleDeleteTask = (task: ComputeTask) => {
    toast.success(`任务 ${task.name} 已删除`);
    loadTasks();
  };

  const handleViewLogs = (task: ComputeTask) => {
    setSelectedTask(task);
    setIsLogDialogOpen(true);
  };

  const handleViewMonitoring = (task: ComputeTask) => {
    // 跳转到任务监控页面
    navigate(`/task-monitoring/${task.id}`);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">计算任务管理</h1>
        <p className="text-slate-600">
          管理开发环境、训练任务、推理服务和微调任务
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总任务数</p>
                <p className="text-3xl">{stats.total}</p>
              </div>
              <Activity className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">排队中</p>
                <p className="text-3xl text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
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

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已完成</p>
                <p className="text-3xl text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索任务名称或ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="任务类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="development">开发环境</SelectItem>
            <SelectItem value="training">训练任务</SelectItem>
            <SelectItem value="inference">推理服务</SelectItem>
            <SelectItem value="fine-tuning">微调任务</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">排队中</SelectItem>
            <SelectItem value="running">运行中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="failed">失败</SelectItem>
            <SelectItem value="stopped">已停止</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={(v: any) => setFilterPriority(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="优先级" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部优先级</SelectItem>
            <SelectItem value="high">高优先级</SelectItem>
            <SelectItem value="medium">中优先级</SelectItem>
            <SelectItem value="low">低优先级</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={loadTasks}>
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 任务列表 */}
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl">{task.name}</h3>
                    {getTaskTypeBadge(task.type)}
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                    {task.preemptible && (
                      <Badge variant="outline" className="text-xs">可抢占</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">任务ID</p>
                      <p className="text-sm font-mono">{task.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">队列</p>
                      <p className="text-sm">{task.queueName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">资源池</p>
                      <p className="text-sm">{task.resourcePool}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">可用区</p>
                      <p className="text-sm">{task.availabilityZone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-slate-600">GPU</p>
                        <p className="text-sm">{task.gpuCount}x {task.gpuModel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-600">CPU/内存</p>
                        <p className="text-sm">{task.cpuCores}C / {task.memoryGB}GB</p>
                      </div>
                    </div>
                    {task.instanceCount && (
                      <div className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-slate-600">实例数</p>
                          <p className="text-sm">{task.instanceCount}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-slate-600">单价</p>
                        <p className="text-sm">¥{task.hourlyRate}/小时</p>
                      </div>
                    </div>
                  </div>

                  {task.nodeName && (
                    <div className="mt-3 text-xs text-slate-600">
                      运行节点: <span className="font-mono">{task.nodeName}</span>
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedTask(task);
                      setIsDetailDialogOpen(true);
                    }}>
                      <Eye className="w-4 h-4 mr-2" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewLogs(task)}>
                      <FileText className="w-4 h-4 mr-2" />
                      查看日志
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewMonitoring(task)}>
                      <Activity className="w-4 h-4 mr-2" />
                      运行监控
                    </DropdownMenuItem>
                    {task.status === 'running' && (
                      <>
                        <DropdownMenuItem>
                          <Terminal className="w-4 h-4 mr-2" />
                          Web Console
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStopTask(task)}>
                          <Square className="w-4 h-4 mr-2" />
                          停止任务
                        </DropdownMenuItem>
                      </>
                    )}
                    {(task.status === 'stopped' || task.status === 'failed') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteTask(task)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除任务
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 任务详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-[900px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">任务详情</DialogTitle>
            <DialogDescription>{selectedTask?.name}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[600px] pr-4">
            {selectedTask && (
              <div className="space-y-6">
                {/* 基本信息 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">任务名称</p>
                        <p>{selectedTask.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">任务ID</p>
                        <p className="font-mono text-sm">{selectedTask.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">任务类型</p>
                        {getTaskTypeBadge(selectedTask.type)}
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">状态</p>
                        {getStatusBadge(selectedTask.status)}
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">优先级</p>
                        {getPriorityBadge(selectedTask.priority)}
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">可抢占</p>
                        <p>{selectedTask.preemptible ? '是' : '否'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">创建者</p>
                        <p className="text-sm">{selectedTask.createdBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">队列</p>
                        <p className="text-sm">{selectedTask.queueName}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 资源配置 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>资源配置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">GPU型号</p>
                        <p>{selectedTask.gpuModel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">GPU数量</p>
                        <p>{selectedTask.gpuCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">CPU核心</p>
                        <p>{selectedTask.cpuCores} Cores</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">内存</p>
                        <p>{selectedTask.memoryGB} GB</p>
                      </div>
                      {selectedTask.instanceCount && (
                        <>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">实例数</p>
                            <p>{selectedTask.instanceCount}</p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-xs text-slate-600 mb-1">资源池</p>
                        <p>{selectedTask.resourcePool}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">可用区</p>
                        <p>{selectedTask.availabilityZone}</p>
                      </div>
                      {selectedTask.nodeName && (
                        <div>
                          <p className="text-xs text-slate-600 mb-1">运行节点</p>
                          <p className="font-mono text-sm">{selectedTask.nodeName}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 镜像和命令 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>镜像和命令</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-2">镜像地址</p>
                      <p className="font-mono text-sm p-3 bg-slate-900 text-green-400 rounded">
                        {selectedTask.imageUrl}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-2">启动命令</p>
                      <p className="font-mono text-sm p-3 bg-slate-900 text-green-400 rounded">
                        {selectedTask.command}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">总是拉取镜像:</p>
                      <Badge variant={selectedTask.alwaysPullImage ? 'default' : 'outline'}>
                        {selectedTask.alwaysPullImage ? '是' : '否'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* 挂载卷 */}
                {selectedTask.volumes.length > 0 && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>挂载卷</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedTask.volumes.map((vol, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded font-mono text-sm">
                            {vol}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 端口映射 */}
                {selectedTask.portMappings.length > 0 && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>端口映射</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedTask.portMappings.map((port, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded">
                            <span className="text-sm">容器端口: <strong>{port.container}</strong></span>
                            <span className="text-slate-400">→</span>
                            <span className="text-sm">主机端口: <strong>{port.host}</strong></span>
                            <Badge variant="outline" className="ml-auto">{port.protocol}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 时间信息 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>时间信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">创建时间</p>
                        <p className="text-sm">{new Date(selectedTask.createdAt).toLocaleString('zh-CN')}</p>
                      </div>
                      {selectedTask.enqueuedAt && (
                        <div>
                          <p className="text-xs text-slate-600 mb-1">入队时间</p>
                          <p className="text-sm">{new Date(selectedTask.enqueuedAt).toLocaleString('zh-CN')}</p>
                        </div>
                      )}
                      {selectedTask.dequeuedAt && (
                        <div>
                          <p className="text-xs text-slate-600 mb-1">出队时间</p>
                          <p className="text-sm">{new Date(selectedTask.dequeuedAt).toLocaleString('zh-CN')}</p>
                        </div>
                      )}
                      {selectedTask.completedAt && (
                        <div>
                          <p className="text-xs text-slate-600 mb-1">完成时间</p>
                          <p className="text-sm">{new Date(selectedTask.completedAt).toLocaleString('zh-CN')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 计费信息 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>计费信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">小时单价</p>
                        <p className="text-lg">¥{selectedTask.hourlyRate.toFixed(2)}/小时</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">累计费用</p>
                        <p className="text-lg text-orange-600">¥{selectedTask.totalCost.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 日志查看对话框 */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-[1000px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">任务日志</DialogTitle>
            <DialogDescription>{selectedTask?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge>实时日志</Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-3 h-3 mr-2" />
                刷新
              </Button>
            </div>

            <ScrollArea className="h-[500px] w-full">
              <div className="p-4 bg-slate-900 rounded font-mono text-xs text-green-400 space-y-1">
                <div>[2024-11-25 10:00:00] Starting task...</div>
                <div>[2024-11-25 10:00:05] Pulling image {selectedTask?.imageUrl}</div>
                <div>[2024-11-25 10:00:30] Image pulled successfully</div>
                <div>[2024-11-25 10:00:35] Creating container...</div>
                <div>[2024-11-25 10:00:40] Container created: container-xyz123</div>
                <div>[2024-11-25 10:00:45] Starting container...</div>
                <div>[2024-11-25 10:00:50] Container started successfully</div>
                <div>[2024-11-25 10:01:00] Task is running...</div>
                <div className="text-yellow-400">[2024-11-25 10:30:15] GPU Memory: 15.2GB / 40GB</div>
                <div className="text-yellow-400">[2024-11-25 10:30:15] GPU Utilization: 87%</div>
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
