import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  GitBranch, 
  Eye,
  Database,
  Globe,
  Lock,
  Users,
  Server,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Image,
  Music,
  Video,
  Layers,
  FolderOpen
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { CreateDatasetDialog } from '../components/dialogs/CreateDatasetDialog';
import { CreateDatasetFromVolumeDialog } from '../components/dialogs/CreateDatasetFromVolumeDialog';
import { AddDatasetVersionDialog } from '../components/dialogs/AddDatasetVersionDialog';
import { 
  getDatasets, 
  deleteDataset,
  getDataTypeLabel,
  getAvailabilityZoneLabel,
  getVisibilityLabel,
  getSyncStatusLabel,
  formatDateTime,
  formatFileSize,
  filterByAvailabilityZone,
  filterByVisibility,
  type Dataset,
  type AvailabilityZone,
  type DatasetVisibility
} from '../services/datasetService';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router-dom';

export default function DatasetListPage() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<AvailabilityZone | 'all'>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<DatasetVisibility | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFromVolumeDialogOpen, setCreateFromVolumeDialogOpen] = useState(false);
  const [addVersionDialogOpen, setAddVersionDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    let result = datasets;

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(dataset =>
        dataset.name.toLowerCase().includes(query) ||
        getDataTypeLabel(dataset.dataType).toLowerCase().includes(query) ||
        dataset.description?.toLowerCase().includes(query) ||
        dataset.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 可用区过滤
    result = filterByAvailabilityZone(result, selectedZone);

    // 可见性过滤
    result = filterByVisibility(result, selectedVisibility);

    // 数据类型过滤
    if (selectedType !== 'all') {
      result = result.filter(d => d.type === selectedType);
    }

    setFilteredDatasets(result);
  }, [searchQuery, datasets, selectedZone, selectedVisibility, selectedType]);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const data = await getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error('加载数据集失败:', error);
      toast.error('加载数据集失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!datasetToDelete) return;

    try {
      setDeleting(true);
      await deleteDataset(datasetToDelete.id);
      toast.success('数据集删除成功');
      setDeleteDialogOpen(false);
      setDatasetToDelete(null);
      loadDatasets();
    } catch (error) {
      console.error('删除数据集失败:', error);
      toast.error('删除数据集失败');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (dataset: Dataset) => {
    setDatasetToDelete(dataset);
    setDeleteDialogOpen(true);
  };

  const openAddVersionDialog = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setAddVersionDialogOpen(true);
  };

  const handleViewDetails = (dataset: Dataset) => {
    navigate(`/datasets/${dataset.id}`);
  };

  const getDataTypeIcon = (type: string) => {
    const icons = {
      text: FileText,
      image: Image,
      audio: Music,
      video: Video,
      mixed: Layers,
    };
    return icons[type as keyof typeof icons] || Database;
  };

  const getSyncStatusBadge = (status: Dataset['syncStatus']) => {
    if (!status) return null;
    
    const configs = {
      synced: { icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
      syncing: { icon: RefreshCw, className: 'bg-blue-50 text-blue-700 border-blue-200' },
      'not-synced': { icon: AlertCircle, className: 'bg-slate-50 text-slate-600 border-slate-200' },
      failed: { icon: AlertCircle, className: 'bg-red-50 text-red-700 border-red-200' },
    };
    
    const config = configs[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className={`w-3 h-3 ${status === 'syncing' ? 'animate-spin' : ''}`} />
        {getSyncStatusLabel(status)}
      </Badge>
    );
  };

  const getVisibilityIcon = (visibility: DatasetVisibility) => {
    const icons = {
      private: Lock,
      public: Globe,
      team: Users,
    };
    return icons[visibility];
  };

  // 统计数据
  const stats = {
    total: datasets.length,
    byZone: {
      'cn-north-1a': datasets.filter(d => d.availabilityZone === 'cn-north-1a').length,
      'cn-north-1b': datasets.filter(d => d.availabilityZone === 'cn-north-1b').length,
      'cn-east-1a': datasets.filter(d => d.availabilityZone === 'cn-east-1a').length,
      'cn-east-1b': datasets.filter(d => d.availabilityZone === 'cn-east-1b').length,
      'cn-south-1a': datasets.filter(d => d.availabilityZone === 'cn-south-1a').length,
    },
    byVisibility: {
      private: datasets.filter(d => d.visibility === 'private').length,
      public: datasets.filter(d => d.visibility === 'public').length,
      team: datasets.filter(d => d.visibility === 'team').length,
    },
    totalSize: datasets.reduce((sum, d) => sum + d.size, 0),
    ready: datasets.filter(d => d.status === 'ready').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="w-full space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 text-slate-900">数据集管理</h1>
            <p className="text-slate-600">
              管理训练数据集，支持可用区隔离、版本控制和跨区同步
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setCreateFromVolumeDialogOpen(true)}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              从存储卷创建
            </Button>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              上传新数据集
            </Button>
          </div>
        </div>

        {/* 使用说明 */}
        <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <Server className="w-5 h-5 text-purple-600" />
          <AlertDescription className="text-sm">
            <strong className="text-purple-900">📊 数据集管理说明：</strong>
            <div className="mt-2 text-slate-700 space-y-1">
              <p>• <strong>上传新数据集</strong>：直接上传本地文件，系统自动管理版本和存储</p>
              <p>• <strong>从存储卷创建</strong>：将存储卷中已有的数据目录注册为平台数据集，支持浏览选择目录</p>
              <p>• <strong>可用区隔离</strong>：数据集按可用区隔离存储，确保数据本地化和高性能访问</p>
              <p>• <strong>开发环境集成</strong>：可在创建实例时挂载数据集（只读）和存储卷（读写），支持数据扩增后保存到存储卷</p>
              <p className="text-purple-700 mt-2">
                💡 <strong>工作流示例</strong>：挂载平台数据集 → 开发环境中扩增处理 → 保存到存储卷 → 从存储卷创建新数据集
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">全部数据集</p>
                  <p className="text-2xl text-slate-900">{stats.total}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.ready} 个就绪
                  </p>
                </div>
                <Database className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">总存储量</p>
                  <p className="text-2xl text-blue-600">{formatFileSize(stats.totalSize)}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    跨 {Object.values(stats.byZone).filter(v => v > 0).length} 个可用区
                  </p>
                </div>
                <Server className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">可见性分布</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-600" />
                      <span className="text-sm text-slate-900">{stats.byVisibility.private}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="text-sm text-slate-900">{stats.byVisibility.team}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-green-600" />
                      <span className="text-sm text-slate-900">{stats.byVisibility.public}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    私有 / 团队 / 公开
                  </p>
                </div>
                <Globe className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">当前可用区</p>
                  <p className="text-lg text-slate-900">
                    {selectedZone === 'all' ? '全部' : getAvailabilityZoneLabel(selectedZone)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedZone === 'all' ? stats.total : stats.byZone[selectedZone]} 个数据集
                  </p>
                </div>
                <Server className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选和搜索栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索数据集名称、类型、标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-200"
                />
              </div>
              
              <Select value={selectedZone} onValueChange={(v) => setSelectedZone(v as AvailabilityZone | 'all')}>
                <SelectTrigger className="w-full md:w-[180px] bg-white border-slate-200">
                  <SelectValue placeholder="可用区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部可用区</SelectItem>
                  <SelectItem value="cn-north-1a">{getAvailabilityZoneLabel('cn-north-1a')}</SelectItem>
                  <SelectItem value="cn-north-1b">{getAvailabilityZoneLabel('cn-north-1b')}</SelectItem>
                  <SelectItem value="cn-east-1a">{getAvailabilityZoneLabel('cn-east-1a')}</SelectItem>
                  <SelectItem value="cn-east-1b">{getAvailabilityZoneLabel('cn-east-1b')}</SelectItem>
                  <SelectItem value="cn-south-1a">{getAvailabilityZoneLabel('cn-south-1a')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedVisibility} onValueChange={(v) => setSelectedVisibility(v as DatasetVisibility | 'all')}>
                <SelectTrigger className="w-full md:w-[140px] bg-white border-slate-200">
                  <SelectValue placeholder="可见性" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>私有</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="team">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>团队</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>公开</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-[140px] bg-white border-slate-200">
                  <SelectValue placeholder="数据类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>文本</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      <span>图像</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span>音频</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>视频</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mixed">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>混合</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 数据集表格 */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : filteredDatasets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Database className="w-12 h-12 text-slate-400 mb-4" />
                <div className="text-slate-500 mb-4">
                  {searchQuery || selectedZone !== 'all' || selectedVisibility !== 'all' || selectedType !== 'all'
                    ? '未找到匹配的数据集'
                    : '暂无数据集'}
                </div>
                {!searchQuery && selectedZone === 'all' && selectedVisibility === 'all' && selectedType === 'all' && (
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    variant="outline"
                    className="border-slate-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    创建第一个数据集
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="text-slate-600">数据集名称</TableHead>
                    <TableHead className="text-slate-600">数据类型</TableHead>
                    <TableHead className="text-slate-600">可用区</TableHead>
                    <TableHead className="text-slate-600">同步状态</TableHead>
                    <TableHead className="text-slate-600">可见性</TableHead>
                    <TableHead className="text-slate-600">大小</TableHead>
                    <TableHead className="text-slate-600">版本</TableHead>
                    <TableHead className="text-slate-600">创建时间</TableHead>
                    <TableHead className="text-slate-600 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDatasets.map((dataset) => {
                    const TypeIcon = getDataTypeIcon(dataset.type);
                    const VisibilityIcon = getVisibilityIcon(dataset.visibility);
                    
                    return (
                      <TableRow key={dataset.id} className="border-slate-200 group hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <TypeIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <button
                                onClick={() => handleViewDetails(dataset)}
                                className="text-purple-600 hover:text-purple-700 hover:underline text-left font-medium"
                              >
                                {dataset.name}
                              </button>
                              {dataset.description && (
                                <p className="text-xs text-slate-500 mt-1 max-w-xs truncate">
                                  {dataset.description}
                                </p>
                              )}
                              {dataset.tags && dataset.tags.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {dataset.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {dataset.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                                      +{dataset.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {getDataTypeLabel(dataset.dataType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <Server className="w-3 h-3 mr-1" />
                            {getAvailabilityZoneLabel(dataset.availabilityZone)}
                          </Badge>
                          {dataset.syncedZones && dataset.syncedZones.length > 1 && (
                            <p className="text-xs text-slate-500 mt-1">
                              已同步 {dataset.syncedZones.length} 个区
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {getSyncStatusBadge(dataset.syncStatus)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <VisibilityIcon className="w-4 h-4 text-slate-600" />
                            <span className="text-sm text-slate-700">
                              {getVisibilityLabel(dataset.visibility)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatFileSize(dataset.size)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-purple-600 border-purple-200 bg-purple-50">
                            {dataset.latestVersion}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {formatDateTime(dataset.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-200">
                              <DropdownMenuItem 
                                onClick={() => handleViewDetails(dataset)}
                                className="cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openAddVersionDialog(dataset)}
                                className="cursor-pointer"
                              >
                                <GitBranch className="w-4 h-4 mr-2" />
                                新增版本
                              </DropdownMenuItem>
                              {dataset.syncStatus !== 'syncing' && dataset.syncedZones && dataset.syncedZones.length === 1 && (
                                <DropdownMenuItem className="cursor-pointer">
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  跨区同步
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(dataset)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除数据集
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 创建数据集对话框 */}
      <CreateDatasetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadDatasets}
      />

      {/* 从存储卷创建数据集对话框 */}
      <CreateDatasetFromVolumeDialog
        open={createFromVolumeDialogOpen}
        onOpenChange={setCreateFromVolumeDialogOpen}
        onSuccess={loadDatasets}
      />

      {/* 新增版本对话框 */}
      <AddDatasetVersionDialog
        open={addVersionDialogOpen}
        onOpenChange={setAddVersionDialogOpen}
        dataset={selectedDataset}
        onSuccess={loadDatasets}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">确认删除数据集</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              确定要删除数据集 <span className="text-slate-900 font-medium">"{datasetToDelete?.name}"</span> 吗？
              <br /><br />
              此操作将：
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>删除该数据集的所有版本</li>
                <li>删除所有可用区的同步副本</li>
                <li>此操作<strong>无法恢复</strong></li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300" disabled={deleting}>
              取消
            </AlertDialogCancel>
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
