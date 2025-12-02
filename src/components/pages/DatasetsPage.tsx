import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
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
  Plus,
  Search,
  Eye,
  Trash2,
  Database,
  Loader2,
  Rocket,
  FolderOpen,
  Calendar,
  Info,
  FileText,
  Image,
  Music,
  Video,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
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
import { 
  getDatasets, 
  getDatasetVersions,
  deleteDataset, 
  Dataset,
  DatasetVersion,
  formatFileSize 
} from '../../services/datasetService';
import { toast } from 'sonner@2.0.3';
import { CreateDatasetDialog } from '../dialogs/CreateDatasetDialog';
import { CreateDatasetFromVolumeDialog } from '../dialogs/CreateDatasetFromVolumeDialog';
import { LaunchTrainingDialog } from '../dialogs/LaunchTrainingDialog';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateFromVolumeDialog, setShowCreateFromVolumeDialog] = useState(false);
  const [deleteDatasetId, setDeleteDatasetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<DatasetVersion | null>(null);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const data = await getDatasets();
      setDatasets(data);
    } catch (error) {
      toast.error('加载数据集列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDatasetId) return;

    setDeleting(true);
    try {
      await deleteDataset(deleteDatasetId);
      toast.success('数据集删除成功');
      setDeleteDatasetId(null);
      loadDatasets();
    } catch (error) {
      toast.error('删除失败', {
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleLaunchTraining = async (dataset: Dataset) => {
    setLoadingVersions(true);
    setSelectedDataset(dataset);
    
    try {
      // 获取数据集的版本列表
      const versions = await getDatasetVersions(dataset.id);
      
      if (versions.length === 0) {
        toast.error('该数据集暂无可用版本');
        setLoadingVersions(false);
        return;
      }
      
      // 默认选择最新版本（第一个）
      setSelectedVersion(versions[0]);
      setShowTrainingDialog(true);
    } catch (error) {
      toast.error('加载数据集版本失败');
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleViewDetails = (dataset: Dataset) => {
    // TODO: 导航到数据集详情页
    toast.info('数据集详情页面', {
      description: `查看 ${dataset.name} 的详细信息`
    });
  };

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dataset.description && dataset.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || dataset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || dataset.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      ready: { label: '就绪', className: 'bg-green-50 text-green-700 border-green-200' },
      processing: { label: '处理中', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      error: { label: '错误', className: 'bg-red-50 text-red-700 border-red-200' },
    };
    const config = configs[status as keyof typeof configs] || configs.ready;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: '文本数据',
      image: '图像数据',
      audio: '音频数据',
      video: '视频数据',
      mixed: '混合数据'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      text: FileText,
      image: Image,
      audio: Music,
      video: Video,
      mixed: Layers,
    };
    const IconComponent = icons[type as keyof typeof icons] || Database;
    return IconComponent;
  };

  // 统计信息
  const stats = {
    total: datasets.length,
    ready: datasets.filter(d => d.status === 'ready').length,
    processing: datasets.filter(d => d.status === 'processing').length,
    totalSize: datasets.reduce((sum, d) => sum + d.size, 0),
  };

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">数据集管理</h1>
          <p className="text-slate-600">上传、管理和版本控制训练数据集</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateFromVolumeDialog(true)}>
            <FolderOpen className="w-4 h-4 mr-2" />
            从存储卷创建
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            上传新数据集
          </Button>
        </div>
      </div>

      {/* 使用说明 */}
      <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <Info className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-sm">
          <strong className="text-purple-900">📊 数据集管理说明：</strong>
          <div className="mt-2 text-slate-700 space-y-1">
            <p>• <strong>上传新数据集</strong>：直接上传本地文件，系统自动管理版本和存储</p>
            <p>• <strong>从存储卷创建</strong>：将存储卷中已有的数据目录注册为平台数据集，支持浏览选择目录</p>
            <p>• <strong>版本控制</strong>：每个数据集支持多版本管理，便于迭代优化</p>
            <p>• <strong>开发环境集成</strong>：可在创建实例时挂载数据集（只读）和存储卷（读写），支持数据扩增后保存到存储卷</p>
            <p className="text-purple-700 mt-2">
              💡 <strong>工作流示例</strong>：挂载平台数据集 → 开发环境中扩增处理 → 保存到存储卷 → 从存储卷创建新数据集
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">全部数据集</p>
                <p className="text-2xl text-slate-900">{stats.total}</p>
              </div>
              <Database className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">就绪</p>
                <p className="text-2xl text-green-600">{stats.ready}</p>
              </div>
              <FolderOpen className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">处理中</p>
                <p className="text-2xl text-blue-600">{stats.processing}</p>
              </div>
              <Loader2 className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总存储量</p>
                <p className="text-2xl text-purple-600">{formatFileSize(stats.totalSize)}</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 工具栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索数据集名称、类型或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="数据类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>文本数据</span>
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    <span>图像数据</span>
                  </div>
                </SelectItem>
                <SelectItem value="audio">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>音频数据</span>
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span>视频数据</span>
                  </div>
                </SelectItem>
                <SelectItem value="mixed">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>混合数据</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="ready">就绪</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="error">错误</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 数据集列表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : filteredDatasets.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-1">
                {searchQuery ? '未找到匹配的数据集' : '暂无数据集'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {searchQuery ? '尝试调整搜索条件' : '点击"新建数据集"开始添加'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新建数据集
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>数据集名称</TableHead>
                  <TableHead>数据类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>记录数</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDatasets.map((dataset) => {
                  const TypeIcon = getTypeIcon(dataset.type);
                  return (
                    <TableRow key={dataset.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-900 mb-0.5 truncate">{dataset.name}</p>
                            {dataset.description && (
                              <p className="text-xs text-slate-500 truncate max-w-sm">
                                {dataset.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {getTypeLabel(dataset.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(dataset.status)}</TableCell>
                      <TableCell>
                        {dataset.latestVersion && (
                          <Badge variant="outline" className="font-mono text-purple-600 border-purple-200 bg-purple-50">
                            {dataset.latestVersion}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {dataset.recordCount > 0 ? dataset.recordCount.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {formatFileSize(dataset.size)}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                        {dataset.createTime}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(dataset)}
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLaunchTraining(dataset)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="发起训练"
                            disabled={dataset.status !== 'ready' || loadingVersions}
                          >
                            {loadingVersions && selectedDataset?.id === dataset.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Rocket className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDatasetId(dataset.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="删除数据集"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 新建数据集对话框 */}
      <CreateDatasetDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadDatasets}
      />

      {/* 从存储卷创建数据集对话框 */}
      <CreateDatasetFromVolumeDialog
        open={showCreateFromVolumeDialog}
        onOpenChange={setShowCreateFromVolumeDialog}
        onSuccess={loadDatasets}
      />

      {/* 发起训练对话框 */}
      <LaunchTrainingDialog
        open={showTrainingDialog}
        onOpenChange={setShowTrainingDialog}
        datasetVersion={selectedVersion}
        datasetName={selectedDataset?.name || ''}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteDatasetId} onOpenChange={() => setDeleteDatasetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除数据集？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该数据集及其所有版本，无法恢复。请确认是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                '确认删除'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
