import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, Search, PlayCircle, Pause, Square, Eye, MoreVertical, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export default function TrainingJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const jobs = [
    {
      id: 'job-2024-001',
      name: 'BERT中文预训练',
      framework: 'PyTorch',
      status: 'running',
      progress: 65,
      gpu: 8,
      dataset: 'Chinese-Wikipedia-100G',
      model: 'BERT-Base',
      user: '张三',
      priority: 'high',
      startTime: '2024-11-10 14:30',
      estimatedTime: '还需4小时',
      currentEpoch: '13/20',
    },
    {
      id: 'job-2024-002',
      name: 'ResNet图像分类',
      framework: 'TensorFlow',
      status: 'completed',
      progress: 100,
      gpu: 4,
      dataset: 'ImageNet-1K',
      model: 'ResNet-50',
      user: '李四',
      priority: 'normal',
      startTime: '2024-11-10 10:00',
      estimatedTime: '已完成',
      currentEpoch: '100/100',
    },
    {
      id: 'job-2024-003',
      name: 'GPT对话模型',
      framework: 'PyTorch',
      status: 'pending',
      progress: 0,
      gpu: 16,
      dataset: 'Conversational-50G',
      model: 'GPT-3.5',
      user: '王五',
      priority: 'high',
      startTime: '等待中',
      estimatedTime: '预计12小时',
      currentEpoch: '0/30',
    },
    {
      id: 'job-2024-004',
      name: 'YOLO目标检测',
      framework: 'PyTorch',
      status: 'running',
      progress: 30,
      gpu: 2,
      dataset: 'COCO-2017',
      model: 'YOLOv8',
      user: '赵六',
      priority: 'normal',
      startTime: '2024-11-10 16:00',
      estimatedTime: '还需6小时',
      currentEpoch: '45/150',
    },
    {
      id: 'job-2024-005',
      name: 'Transformer翻译',
      framework: 'PyTorch',
      status: 'failed',
      progress: 12,
      gpu: 4,
      dataset: 'WMT-2014',
      model: 'Transformer',
      user: '钱七',
      priority: 'low',
      startTime: '2024-11-09 20:00',
      estimatedTime: '失败',
      currentEpoch: '3/25',
    },
  ];

  const getStatusBadge = (status: string) => {
    const configs = {
      running: { label: '运行中', className: 'bg-green-50 text-green-700 border-green-200' },
      completed: { label: '已完成', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      pending: { label: '等待中', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      failed: { label: '失败', className: 'bg-red-50 text-red-700 border-red-200' },
      paused: { label: '已暂停', className: 'bg-slate-50 text-slate-700 border-slate-200' },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const configs = {
      high: { label: '高', className: 'bg-red-50 text-red-700 border-red-200' },
      normal: { label: '中', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      low: { label: '低', className: 'bg-slate-50 text-slate-700 border-slate-200' },
    };
    const config = configs[priority as keyof typeof configs] || configs.normal;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    running: jobs.filter((j) => j.status === 'running').length,
    pending: jobs.filter((j) => j.status === 'pending').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">训练任务</h1>
          <p className="text-slate-600">批处理训练作业，用于大规模模型训练和实验管理</p>
        </div></div>

      {/* 使用说明 */}
      <Alert className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <Info className="w-5 h-5 text-green-600" />
        <AlertDescription className="text-sm">
          <strong className="text-green-900">⚡ 训练任务说明：</strong>
          <div className="mt-2 text-slate-700 space-y-1">
            <p>• <strong>适用场景</strong>：大规模模型训练、分布式训练、超参数调优、实验对比</p>
            <p>• <strong>特点</strong>：任务式管理、自动排队调度、实验追踪、断点续传、分布式支持</p>
            <p>• <strong>费用</strong>：按任务执行时间计费，完成后自动释放资源</p>
            <p className="text-green-700 mt-2">
              💻 <strong>提示</strong>：如需交互式开发请使用"开发环境"，如需部署API请使用"推理服务"
            </p>
          </div>
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center justify-between">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              创建训练任务
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建训练任务</DialogTitle>
              <DialogDescription>配置并提交新的训练任务</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="job-name">任务名称</Label>
                <Input id="job-name" placeholder="例如: BERT中文预训练" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="framework">训练框架</Label>
                <Select>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="选择框架" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pytorch">PyTorch</SelectItem>
                    <SelectItem value="tensorflow">TensorFlow</SelectItem>
                    <SelectItem value="paddlepaddle">PaddlePaddle</SelectItem>
                    <SelectItem value="mxnet">MXNet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataset">数据集</Label>
                <Select>
                  <SelectTrigger id="dataset">
                    <SelectValue placeholder="选择数据集" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ds1">Chinese-Wikipedia-100G</SelectItem>
                    <SelectItem value="ds2">ImageNet-1K</SelectItem>
                    <SelectItem value="ds3">COCO-2017</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">模型架构</Label>
                <Input id="model" placeholder="例如: BERT-Base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpu-count">GPU数量</Label>
                <Select>
                  <SelectTrigger id="gpu-count">
                    <SelectValue placeholder="选择GPU数量" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1卡</SelectItem>
                    <SelectItem value="2">2卡</SelectItem>
                    <SelectItem value="4">4卡</SelectItem>
                    <SelectItem value="8">8卡</SelectItem>
                    <SelectItem value="16">16卡</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Select>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="normal">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="params">训练参数（JSON格式）</Label>
                <Textarea
                  id="params"
                  placeholder='{"learning_rate": 0.001, "batch_size": 32, "epochs": 100}'
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>提交任务</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">总任务数</p>
            <p className="text-2xl">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">运行中</p>
            <p className="text-2xl text-green-600">{stats.running}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">等待中</p>
            <p className="text-2xl text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">已完成</p>
            <p className="text-2xl text-blue-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">失败</p>
            <p className="text-2xl text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>任务列表</CardTitle>
              <CardDescription>所有训练任务的详细信息</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                <TabsList>
                  <TabsTrigger value="all">全部</TabsTrigger>
                  <TabsTrigger value="running">运行中</TabsTrigger>
                  <TabsTrigger value="pending">等待中</TabsTrigger>
                  <TabsTrigger value="completed">已完成</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索任务..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务信息</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>资源</TableHead>
                <TableHead>数据集/模型</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{job.name}</p>
                        {getPriorityBadge(job.priority)}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-600">{job.id}</p>
                        <Badge variant="outline" className="text-xs">
                          {job.framework}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1 min-w-32">
                      <div className="flex items-center justify-between text-xs">
                        <span>{job.currentEpoch}</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-slate-600">{job.estimatedTime}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{job.gpu} × GPU</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600">数据集:</span>
                        <button className="text-blue-600 hover:underline">
                          {job.dataset}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600">模型:</span>
                        <button className="text-purple-600 hover:underline">
                          {job.model}
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{job.user}</TableCell>
                  <TableCell className="text-sm">{job.startTime}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        {job.status === 'running' && (
                          <DropdownMenuItem>
                            <Pause className="w-4 h-4 mr-2" />
                            暂停任务
                          </DropdownMenuItem>
                        )}
                        {job.status === 'paused' && (
                          <DropdownMenuItem>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            恢复任务
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Square className="w-4 h-4 mr-2" />
                          终止任务
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
