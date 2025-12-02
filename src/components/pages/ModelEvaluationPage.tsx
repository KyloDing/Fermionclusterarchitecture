import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  XCircle,
  Trash2,
  Download,
  Eye,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  getEvaluationTasks,
  getStatusConfig,
  getTaskTypeLabel,
  formatDuration,
  cancelEvaluationTask,
  deleteEvaluationTask,
  type EvaluationTask,
  type EvaluationStatus,
} from '../../services/evaluationService';
import { toast } from 'sonner@2.0.3';
import CreateEvaluationDialog from '../dialogs/CreateEvaluationDialog';

export default function ModelEvaluationPage() {
  const [tasks, setTasks] = useState<EvaluationTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<EvaluationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<EvaluationStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<EvaluationTask | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, selectedStatus, selectedType]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getEvaluationTasks();
      setTasks(data);
    } catch (error) {
      toast.error('加载评测任务失败');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((task) => task.type === selectedType);
    }

    setFilteredTasks(filtered);
  };

  const handleCancel = async (task: EvaluationTask) => {
    try {
      await cancelEvaluationTask(task.id);
      toast.success('已取消评测任务');
      loadTasks();
    } catch (error) {
      toast.error('取消失败');
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      setDeleting(true);
      await deleteEvaluationTask(taskToDelete.id);
      toast.success('删除成功');
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      loadTasks();
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  // 统计数据
  const stats = {
    total: tasks.length,
    running: tasks.filter((t) => t.status === 'running').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-slate-900">模型评测</h1>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            新建评测
          </Button>
        </div>
        <p className="text-slate-600">对大语言模型进行全面的能力评估和性能测试</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">总任务</p>
                <p className="text-2xl">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-slate-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">运行中</p>
                <p className="text-2xl text-blue-600">{stats.running}</p>
              </div>
              <Loader2 className="w-8 h-8 text-blue-600 opacity-50 animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">已完成</p>
                <p className="text-2xl text-emerald-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">等待中</p>
                <p className="text-2xl text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">失败</p>
                <p className="text-2xl text-red-600">{stats.failed}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="mb-6">
        <TabsList>
          <TabsTrigger value="tasks">评测任务</TabsTrigger>
          <TabsTrigger value="templates">评测模板</TabsTrigger>
          <TabsTrigger value="leaderboard">排行榜</TabsTrigger>
          <TabsTrigger value="datasets">评测数据集</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          {/* 筛选和搜索 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="搜索任务名称、模型名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">等待中</SelectItem>
                    <SelectItem value="running">运行中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="benchmark">基准评测</SelectItem>
                    <SelectItem value="custom">自定义评测</SelectItem>
                    <SelectItem value="comparison">对比评测</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 任务列表 */}
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-3 animate-spin" />
                <p className="text-slate-600">加载中...</p>
              </CardContent>
            </Card>
          ) : filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">未找到符合条件的任务</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务名称</TableHead>
                    <TableHead>模型</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const statusConfig = getStatusConfig(task.status);
                    return (
                      <TableRow key={task.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">{task.name}</div>
                            {task.description && (
                              <div className="text-sm text-slate-500 truncate max-w-xs">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.modelName}</div>
                            <div className="text-sm text-slate-500">{task.modelVersion}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {getTaskTypeLabel(task.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig.color}>
                            {task.status === 'running' && (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            )}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.status === 'running' || task.status === 'completed' ? (
                            <div className="space-y-1 w-32">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600">{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-1.5" />
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.overallScore !== undefined ? (
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-amber-500" />
                              <span className="font-medium text-amber-600">{task.overallScore}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">
                            {new Date(task.createdAt).toLocaleDateString('zh-CN')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              {task.status === 'running' && (
                                <DropdownMenuItem onClick={() => handleCancel(task)}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  取消任务
                                </DropdownMenuItem>
                              )}
                              {task.reportUrl && (
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  下载报告
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setTaskToDelete(task);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">评测模板功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">排行榜功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">评测数据集功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 创建评测任务对话框 */}
      <CreateEvaluationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadTasks}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除评测任务 "{taskToDelete?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
