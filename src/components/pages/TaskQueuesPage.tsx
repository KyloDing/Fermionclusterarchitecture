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
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import {
  Search,
  MoreVertical,
  Plus,
  RefreshCw,
  List,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings,
  Info,
  Activity,
  Play,
  Pause,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type QueuePriority = 'high' | 'medium' | 'low';
type QueueType = 'default' | 'volcano';
type ScheduleStrategy = 'FIFO' | 'DRF' | 'Backfill';

interface TaskQueue {
  id: string;
  name: string;
  type: QueueType;
  priority: QueuePriority;
  resourcePool: string;
  resourcePoolId: string;
  availabilityZone: string;
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  scheduleStrategy: ScheduleStrategy;
  status: 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export default function TaskQueuesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPool, setFilterPool] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<QueuePriority | 'all'>('all');
  const [queues, setQueues] = useState<TaskQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<TaskQueue | null>(null);

  // 创建/编辑表单
  const [queueForm, setQueueForm] = useState({
    name: '',
    type: 'default' as QueueType,
    priority: 'medium' as QueuePriority,
    resourcePool: '',
    scheduleStrategy: 'FIFO' as ScheduleStrategy,
  });

  useEffect(() => {
    loadQueues();
  }, []);

  const loadQueues = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockQueues: TaskQueue[] = [
        {
          id: 'queue-1',
          name: '高优先级队列',
          type: 'default',
          priority: 'high',
          resourcePool: 'GPU-Pool-A',
          resourcePoolId: 'pool-1',
          availabilityZone: '华北1区-A',
          pendingTasks: 5,
          runningTasks: 3,
          completedTasks: 128,
          scheduleStrategy: 'FIFO',
          status: 'active',
          createdAt: '2024-11-01T08:00:00Z',
          updatedAt: '2024-11-25T10:30:00Z',
        },
        {
          id: 'queue-2',
          name: '中优先级队列',
          type: 'default',
          priority: 'medium',
          resourcePool: 'GPU-Pool-A',
          resourcePoolId: 'pool-1',
          availabilityZone: '华北1区-A',
          pendingTasks: 12,
          runningTasks: 5,
          completedTasks: 256,
          scheduleStrategy: 'DRF',
          status: 'active',
          createdAt: '2024-11-01T08:00:00Z',
          updatedAt: '2024-11-25T10:30:00Z',
        },
        {
          id: 'queue-3',
          name: '低优先级队列',
          type: 'default',
          priority: 'low',
          resourcePool: 'GPU-Pool-A',
          resourcePoolId: 'pool-1',
          availabilityZone: '华北1区-A',
          pendingTasks: 28,
          runningTasks: 2,
          completedTasks: 512,
          scheduleStrategy: 'Backfill',
          status: 'active',
          createdAt: '2024-11-01T08:00:00Z',
          updatedAt: '2024-11-25T10:30:00Z',
        },
        {
          id: 'queue-4',
          name: 'Volcano-训练队列',
          type: 'volcano',
          priority: 'high',
          resourcePool: 'GPU-Pool-B',
          resourcePoolId: 'pool-2',
          availabilityZone: '华东1区-A',
          pendingTasks: 8,
          runningTasks: 6,
          completedTasks: 89,
          scheduleStrategy: 'DRF',
          status: 'active',
          createdAt: '2024-11-10T10:00:00Z',
          updatedAt: '2024-11-25T11:00:00Z',
        },
      ];
      setQueues(mockQueues);
    } catch (error) {
      console.error('Failed to load queues:', error);
      toast.error('加载任务队列失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取优先级徽章
  const getPriorityBadge = (priority: QueuePriority) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className="bg-red-600">
            <ArrowUp className="w-3 h-3 mr-1" />
            高优先级
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-orange-600">
            <ArrowRight className="w-3 h-3 mr-1" />
            中优先级
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-blue-600">
            <ArrowDown className="w-3 h-3 mr-1" />
            低优先级
          </Badge>
        );
    }
  };

  // 筛选队列
  const filteredQueues = queues.filter(queue => {
    const matchesSearch = 
      queue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      queue.resourcePool.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPool = filterPool === 'all' || queue.resourcePool === filterPool;
    const matchesPriority = filterPriority === 'all' || queue.priority === filterPriority;
    return matchesSearch && matchesPool && matchesPriority;
  });

  // 统计信息
  const stats = {
    totalQueues: queues.length,
    activeQueues: queues.filter(q => q.status === 'active').length,
    totalPending: queues.reduce((sum, q) => sum + q.pendingTasks, 0),
    totalRunning: queues.reduce((sum, q) => sum + q.runningTasks, 0),
  };

  const handleCreateQueue = () => {
    if (!queueForm.name || !queueForm.resourcePool) {
      toast.error('请填写必填字段');
      return;
    }
    toast.success('任务队列创建成功');
    setIsCreateDialogOpen(false);
    setQueueForm({
      name: '',
      type: 'default',
      priority: 'medium',
      resourcePool: '',
      scheduleStrategy: 'FIFO',
    });
    loadQueues();
  };

  const handleEditQueue = () => {
    if (!selectedQueue) return;
    toast.success('任务队列配置已更新');
    setIsEditDialogOpen(false);
    setSelectedQueue(null);
    loadQueues();
  };

  const handleToggleQueueStatus = (queue: TaskQueue) => {
    const newStatus = queue.status === 'active' ? 'paused' : 'active';
    toast.success(`队列已${newStatus === 'active' ? '启用' : '暂停'}`);
    loadQueues();
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
        <h1 className="text-3xl mb-2">任务队列管理</h1>
        <p className="text-slate-600">
          管理资源池下的任务队列，配置调度策略和优先级
        </p>
      </div>

      {/* 使用说明 */}
      <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <Info className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-sm">
          <strong className="text-purple-900">📋 任务队列调度规则：</strong>
          <div className="mt-2 text-slate-700 space-y-1">
            <p>• <strong>高优先级</strong>：优先调度，满足资源需求直到任务结束</p>
            <p>• <strong>中优先级</strong>：需设置预期时长，超时后被高优任务抢占，重新排队时长减半</p>
            <p>• <strong>低优先级</strong>：资源充足时运行，发生竞争时暂停并回队</p>
            <p>• <strong>调度策略</strong>：支持FIFO（先进先出）、DRF（主资源公平）、Backfill（回填）</p>
          </div>
        </AlertDescription>
      </Alert>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总队列数</p>
                <p className="text-3xl">{stats.totalQueues}</p>
                <p className="text-xs text-slate-500 mt-1">活跃: {stats.activeQueues}</p>
              </div>
              <List className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">排队任务</p>
                <p className="text-3xl text-orange-600">{stats.totalPending}</p>
                <p className="text-xs text-slate-500 mt-1">等待调度</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">运行任务</p>
                <p className="text-3xl text-green-600">{stats.totalRunning}</p>
                <p className="text-xs text-slate-500 mt-1">正在执行</p>
              </div>
              <Activity className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">队列类型</p>
                <p className="text-3xl text-blue-600">2</p>
                <p className="text-xs text-slate-500 mt-1">Default & Volcano</p>
              </div>
              <Layers className="w-10 h-10 text-blue-600" />
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
              placeholder="搜索队列名称或资源池..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterPool} onValueChange={setFilterPool}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="资源池" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部资源池</SelectItem>
              <SelectItem value="GPU-Pool-A">GPU-Pool-A</SelectItem>
              <SelectItem value="GPU-Pool-B">GPU-Pool-B</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={(v: any) => setFilterPriority(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部优先级</SelectItem>
              <SelectItem value="high">高优先级</SelectItem>
              <SelectItem value="medium">中优先级</SelectItem>
              <SelectItem value="low">低优先级</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadQueues} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            创建队列
          </Button>
        </div>
      </div>

      {/* 队列列表 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredQueues.map(queue => (
          <Card key={queue.id} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{queue.name}</CardTitle>
                    {queue.status === 'active' ? (
                      <Badge className="bg-green-600">
                        <Play className="w-3 h-3 mr-1" />
                        活跃
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Pause className="w-3 h-3 mr-1" />
                        暂停
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPriorityBadge(queue.priority)}
                    <Badge variant="outline">
                      {queue.type === 'default' ? '默认队列' : 'Volcano'}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-xs">
                      {queue.scheduleStrategy}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedQueue(queue);
                      setQueueForm({
                        name: queue.name,
                        type: queue.type,
                        priority: queue.priority,
                        resourcePool: queue.resourcePool,
                        scheduleStrategy: queue.scheduleStrategy,
                      });
                      setIsEditDialogOpen(true);
                    }}>
                      <Settings className="w-4 h-4 mr-2" />
                      编辑配置
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleQueueStatus(queue)}>
                      {queue.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          暂停队列
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          启用队列
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>
                资源池: {queue.resourcePool} · {queue.availabilityZone}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 任务统计 */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-600 mb-1">排队中</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-lg text-orange-600">{queue.pendingTasks}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">运行中</p>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-lg text-green-600">{queue.runningTasks}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">已完成</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="text-lg text-blue-600">{queue.completedTasks}</span>
                  </div>
                </div>
              </div>

              {/* 调度策略说明 */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>调度策略：</strong>
                  {queue.scheduleStrategy === 'FIFO' && '先进先出，按任务提交顺序调度'}
                  {queue.scheduleStrategy === 'DRF' && '主资源公平，均衡分配CPU和GPU资源'}
                  {queue.scheduleStrategy === 'Backfill' && '回填策略，利用碎片资源调度小任务'}
                </p>
              </div>

              {/* 优先级规则提示 */}
              {queue.priority === 'medium' && (
                <Alert className="bg-orange-50 border-orange-200">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-xs text-orange-900">
                    中优先级任务需设置预期时长，超时后可能被高优任务抢占
                  </AlertDescription>
                </Alert>
              )}
              {queue.priority === 'low' && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-900">
                    低优先级任务在资源竞争时会自动暂停并重新排队
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 创建队列对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">创建任务队列</DialogTitle>
            <DialogDescription>配置新的任务队列，设置优先级和调度策略</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="queue-name">队列名称 *</Label>
              <Input
                id="queue-name"
                placeholder="例如: 训练任务高优队列"
                value={queueForm.name}
                onChange={(e) => setQueueForm({ ...queueForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="queue-type">队列类型 *</Label>
                <Select
                  value={queueForm.type}
                  onValueChange={(v: QueueType) => setQueueForm({ ...queueForm, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">默认队列</SelectItem>
                    <SelectItem value="volcano">Volcano队列</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="queue-priority">优先级 *</Label>
                <Select
                  value={queueForm.priority}
                  onValueChange={(v: QueuePriority) => setQueueForm({ ...queueForm, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高优先级</SelectItem>
                    <SelectItem value="medium">中优先级</SelectItem>
                    <SelectItem value="low">低优先级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resource-pool">资源池 *</Label>
                <Select
                  value={queueForm.resourcePool}
                  onValueChange={(v) => setQueueForm({ ...queueForm, resourcePool: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择资源池" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPU-Pool-A">GPU-Pool-A</SelectItem>
                    <SelectItem value="GPU-Pool-B">GPU-Pool-B</SelectItem>
                    <SelectItem value="CPU-Pool-A">CPU-Pool-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule-strategy">调度策略 *</Label>
                <Select
                  value={queueForm.scheduleStrategy}
                  onValueChange={(v: ScheduleStrategy) => setQueueForm({ ...queueForm, scheduleStrategy: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO">FIFO（先进先出）</SelectItem>
                    <SelectItem value="DRF">DRF（主资源公平）</SelectItem>
                    <SelectItem value="Backfill">Backfill（回填）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateQueue}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              创建队列
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑队列对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">编辑队列配置</DialogTitle>
            <DialogDescription>修改任务队列的调度策略和配置</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-schedule-strategy">调度策略</Label>
              <Select
                value={queueForm.scheduleStrategy}
                onValueChange={(v: ScheduleStrategy) => setQueueForm({ ...queueForm, scheduleStrategy: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIFO">FIFO（先进先出）</SelectItem>
                  <SelectItem value="DRF">DRF（主资源公平）</SelectItem>
                  <SelectItem value="Backfill">Backfill（回填）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                <strong>调度策略说明：</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• <strong>FIFO</strong>：按任务提交时间先后顺序调度</li>
                  <li>• <strong>DRF</strong>：根据CPU、GPU等资源使用情况公平分配</li>
                  <li>• <strong>Backfill</strong>：在不影响排队任务的前提下，优先调度小任务填充碎片资源</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditQueue}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
