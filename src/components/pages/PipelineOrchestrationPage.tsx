import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Copy,
  Download,
  Eye,
  Edit,
  GitBranch,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Zap,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
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
  getPipelines,
  getPipelineRuns,
  getPipelineTemplates,
  runPipeline,
  deletePipeline,
  getStatusConfig,
  formatDuration,
  type Pipeline,
  type PipelineRun,
  type PipelineTemplate,
  type PipelineStatus,
} from '../../services/pipelineService';
import { toast } from 'sonner@2.0.3';

export default function PipelineOrchestrationPage() {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [templates, setTemplates] = useState<PipelineTemplate[]>([]);
  const [filteredPipelines, setFilteredPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PipelineStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPipelines();
  }, [pipelines, searchQuery, selectedStatus, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pipelinesData, runsData, templatesData] = await Promise.all([
        getPipelines(),
        getPipelineRuns(),
        getPipelineTemplates(),
      ]);
      setPipelines(pipelinesData);
      setRuns(runsData);
      setTemplates(templatesData);
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const filterPipelines = () => {
    let filtered = pipelines;

    if (searchQuery) {
      filtered = filtered.filter(
        (pipeline) =>
          pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pipeline.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((pipeline) => pipeline.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((pipeline) => pipeline.category === selectedCategory);
    }

    setFilteredPipelines(filtered);
  };

  const handleRun = async (pipeline: Pipeline) => {
    try {
      await runPipeline(pipeline.id);
      toast.success('流水线已开始运行');
      loadData();
    } catch (error) {
      toast.error('启动失败');
    }
  };

  const handleDelete = async () => {
    if (!pipelineToDelete) return;
    
    try {
      setDeleting(true);
      await deletePipeline(pipelineToDelete.id);
      toast.success('删除成功');
      setDeleteDialogOpen(false);
      setPipelineToDelete(null);
      loadData();
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  // 统计数据
  const stats = {
    total: pipelines.length,
    running: pipelines.filter((p) => p.status === 'running').length,
    completed: pipelines.filter((p) => p.status === 'completed').length,
    failed: pipelines.filter((p) => p.status === 'failed').length,
    draft: pipelines.filter((p) => p.status === 'draft').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-slate-900">Pipeline 编排</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              从模板创建
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/pipeline-editor')}
            >
              <Plus className="w-4 h-4 mr-2" />
              新建 Pipeline
            </Button>
          </div>
        </div>
        <p className="text-slate-600">
          基于 Kubeflow 实现从数据预处理到模型部署的完整流程编排
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">总流水线</p>
                <p className="text-2xl">{stats.total}</p>
              </div>
              <GitBranch className="w-8 h-8 text-slate-400 opacity-50" />
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

        <Card className="border-l-4 border-l-slate-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">草稿</p>
                <p className="text-2xl text-slate-600">{stats.draft}</p>
              </div>
              <FileText className="w-8 h-8 text-slate-400 opacity-50" />
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
      <Tabs defaultValue="pipelines" className="mb-6">
        <TabsList>
          <TabsTrigger value="pipelines">流水线</TabsTrigger>
          <TabsTrigger value="runs">运行历史</TabsTrigger>
          <TabsTrigger value="templates">模板库</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="mt-6">
          {/* 筛选和搜索 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="搜索流水线名称、描述..."
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
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="running">运行中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                    <SelectItem value="paused">已暂停</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
                    <SelectItem value="training">模型训练</SelectItem>
                    <SelectItem value="inference">模型推理</SelectItem>
                    <SelectItem value="data-processing">数据处理</SelectItem>
                    <SelectItem value="end-to-end">端到端</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 流水线列表 */}
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-3 animate-spin" />
                <p className="text-slate-600">加载中...</p>
              </CardContent>
            </Card>
          ) : filteredPipelines.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">未找到符合条件的流水线</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>流水线名称</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>步骤</TableHead>
                    <TableHead>运行统计</TableHead>
                    <TableHead>最后运行</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPipelines.map((pipeline) => {
                    const statusConfig = getStatusConfig(pipeline.status);
                    const successRate =
                      pipeline.runCount > 0
                        ? ((pipeline.successCount / pipeline.runCount) * 100).toFixed(0)
                        : '-';

                    return (
                      <TableRow key={pipeline.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">{pipeline.name}</div>
                            {pipeline.description && (
                              <div className="text-sm text-slate-500 truncate max-w-md">
                                {pipeline.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-mono text-xs">
                            {pipeline.version}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {pipeline.category === 'training' && '模型训练'}
                            {pipeline.category === 'inference' && '模型推理'}
                            {pipeline.category === 'data-processing' && '数据处理'}
                            {pipeline.category === 'end-to-end' && '端到端'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig.color}>
                            {pipeline.status === 'running' && (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            )}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{pipeline.steps.length} 步</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600">
                                {pipeline.runCount} 次运行
                              </span>
                              {pipeline.runCount > 0 && (
                                <Badge
                                  variant="outline"
                                  className={
                                    Number(successRate) >= 80
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : Number(successRate) >= 50
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }
                                >
                                  {successRate}% 成功
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pipeline.lastRunAt ? (
                            <div className="text-sm text-slate-600">
                              {new Date(pipeline.lastRunAt).toLocaleDateString('zh-CN')}
                            </div>
                          ) : (
                            <span className="text-slate-400">从未运行</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRun(pipeline)}>
                                <Play className="w-4 h-4 mr-2" />
                                运行
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/pipeline-editor?id=${pipeline.id}`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                复制
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                导出
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setPipelineToDelete(pipeline);
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

        <TabsContent value="runs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>运行历史</CardTitle>
            </CardHeader>
            <CardContent>
              {runs.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">暂无运行记录</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>运行ID</TableHead>
                      <TableHead>流水线</TableHead>
                      <TableHead>触发方式</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>开始时间</TableHead>
                      <TableHead>耗时</TableHead>
                      <TableHead>成本</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((run) => {
                      const statusConfig = getStatusConfig(run.status);
                      return (
                        <TableRow key={run.id}>
                          <TableCell>
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {run.id}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{run.pipelineName}</div>
                            <div className="text-sm text-slate-500">{run.version}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-slate-50">
                              {run.trigger === 'manual' && '手动'}
                              {run.trigger === 'scheduled' && '定时'}
                              {run.trigger === 'api' && 'API'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(run.startTime).toLocaleString('zh-CN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDuration(run.duration)}</div>
                          </TableCell>
                          <TableCell>
                            {run.cost !== undefined ? (
                              <span className="text-sm">¥{run.cost.toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-2">{template.icon}</div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {template.category === 'training' && '训练'}
                      {template.category === 'inference' && '推理'}
                      {template.category === 'data-processing' && '数据'}
                      {template.category === 'end-to-end' && '端到端'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {template.usageCount}
                      </div>
                      <div className="flex items-center gap-1">
                        ⭐ {template.rating}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    使用模板
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除流水线 "{pipelineToDelete?.name}" 吗？此操作无法撤销。
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
