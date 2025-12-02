import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
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
  Box,
  Loader2,
  Rocket,
  Tag,
  Layers,
  Calendar,
  Server,
  Globe,
  Lock,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  GitBranch
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  getModels,
  deleteModel,
  filterByAvailabilityZone,
  filterByVisibility,
  getAvailabilityZoneLabel,
  getVisibilityLabel,
  getSyncStatusLabel,
  Model,
  AvailabilityZone,
  ModelVisibility,
} from '../../services/modelService';
import { toast } from 'sonner@2.0.3';
import { ImportModelDialog } from '../dialogs/ImportModelDialog';
import { ModelDetailDialog } from '../dialogs/ModelDetailDialog';
import { AddModelVersionDialog } from '../dialogs/AddModelVersionDialog';
import { DeployInferenceDialog } from '../dialogs/DeployInferenceDialog';
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

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<AvailabilityZone | 'all'>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<ModelVisibility | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAddVersionDialog, setShowAddVersionDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [deleteModelId, setDeleteModelId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await getModels();
      setModels(data);
    } catch (error) {
      toast.error('加载模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModelId) return;

    setDeleting(true);
    try {
      await deleteModel(deleteModelId);
      toast.success('模型删除成功');
      setDeleteModelId(null);
      loadModels();
    } catch (error) {
      toast.error('删除失败', {
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetail = (model: Model) => {
    setSelectedModel(model);
    setShowDetailDialog(true);
  };

  const handleAddVersion = (model: Model) => {
    setSelectedModel(model);
    setShowAddVersionDialog(true);
  };

  const handleDeploy = (model: Model) => {
    setSelectedModel(model);
    setShowDeployDialog(true);
  };

  // 综合筛选
  const filteredModels = models.filter(model => {
    // 搜索过滤
    const matchesSearch = searchQuery.trim() === '' || 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.remark?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 可用区过滤
    const matchesZone = selectedZone === 'all' || model.availabilityZone === selectedZone;
    
    // 可见性过滤
    const matchesVisibility = selectedVisibility === 'all' || model.visibility === selectedVisibility;
    
    // 类型过滤
    const matchesType = selectedType === 'all' || model.type === selectedType;
    
    return matchesSearch && matchesZone && matchesVisibility && matchesType;
  });

  const getModelTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: '文本模型',
      image: '图像模型',
      general: '通用文件'
    };
    return labels[type] || type;
  };

  const getModelTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: 'bg-purple-50 text-purple-700 border-purple-200',
      image: 'bg-blue-50 text-blue-700 border-blue-200',
      general: 'bg-slate-50 text-slate-700 border-slate-200'
    };
    return colors[type] || colors.general;
  };

  const getSyncStatusBadge = (status: Model['syncStatus']) => {
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
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className={`w-3 h-3 ${status === 'syncing' ? 'animate-spin' : ''}`} />
        {getSyncStatusLabel(status)}
      </Badge>
    );
  };

  const getVisibilityIcon = (visibility: ModelVisibility) => {
    const icons = {
      private: Lock,
      public: Globe,
      team: Users,
    };
    return icons[visibility];
  };

  // 统计信息
  const stats = {
    total: models.length,
    text: models.filter(m => m.type === 'text').length,
    image: models.filter(m => m.type === 'image').length,
    general: models.filter(m => m.type === 'general').length,
    byZone: {
      'cn-north-1a': models.filter(m => m.availabilityZone === 'cn-north-1a').length,
      'cn-north-1b': models.filter(m => m.availabilityZone === 'cn-north-1b').length,
      'cn-east-1a': models.filter(m => m.availabilityZone === 'cn-east-1a').length,
      'cn-east-1b': models.filter(m => m.availabilityZone === 'cn-east-1b').length,
      'cn-south-1a': models.filter(m => m.availabilityZone === 'cn-south-1a').length,
    },
    byVisibility: {
      private: models.filter(m => m.visibility === 'private').length,
      public: models.filter(m => m.visibility === 'public').length,
      team: models.filter(m => m.visibility === 'team').length,
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">模型管理</h1>
          <p className="text-slate-600">管理AI模型资产，支持可用区隔离、版本控制和推理部署</p>
        </div>
        <Button onClick={() => setShowImportDialog(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          导入模型
        </Button>
      </div>

      {/* 使用说明 */}
      <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <Server className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-sm">
          <strong className="text-purple-900">🔧 可用区隔离说明：</strong>
          <div className="mt-2 text-slate-700 space-y-1">
            <p>• <strong>可用区管理</strong>：模型按可用区隔离存储，确保数据本地化和高性能访问</p>
            <p>• <strong>跨区同步</strong>：需要跨可用区使用时，可发起同步任务将模型复制到目标可用区</p>
            <p>• <strong>访问权限</strong>：支持私有、团队和公开三种可见性级别，灵活控制模型共享范围</p>
            <p className="text-purple-700 mt-2">
              💡 <strong>提示</strong>：当前显示 <strong>{selectedZone === 'all' ? '全部可用区' : getAvailabilityZoneLabel(selectedZone)}</strong> 的模型
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">全部模型</p>
                <p className="text-2xl text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {filteredModels.length} 个匹配
                </p>
              </div>
              <Box className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">文本模型</p>
                <p className="text-2xl text-purple-600">{stats.text}</p>
                <p className="text-xs text-slate-500 mt-1">
                  跨 {Object.values(stats.byZone).filter(v => v > 0).length} 个可用区
                </p>
              </div>
              <Tag className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">图像模型</p>
                <p className="text-2xl text-blue-600">{stats.image}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.byVisibility.public} 个公开
                </p>
              </div>
              <Layers className="w-10 h-10 text-blue-600 opacity-50" />
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
      </div>

      {/* 筛选和搜索栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索模型名称、类型或备注..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedZone} onValueChange={(v) => setSelectedZone(v as AvailabilityZone | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
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

            <Select value={selectedVisibility} onValueChange={(v) => setSelectedVisibility(v as ModelVisibility | 'all')}>
              <SelectTrigger className="w-full md:w-[140px]">
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
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="模型类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="text">文本模型</SelectItem>
                <SelectItem value="image">图像模型</SelectItem>
                <SelectItem value="general">通用文件</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 模型列表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-12">
              <Box className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-1">
                {searchQuery || selectedZone !== 'all' || selectedVisibility !== 'all' || selectedType !== 'all'
                  ? '未找到匹配的模型'
                  : '暂无模型'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {searchQuery || selectedZone !== 'all' || selectedVisibility !== 'all' || selectedType !== 'all'
                  ? '尝试调整筛选条件'
                  : '点击"导入模型"开始添加'}
              </p>
              {!searchQuery && selectedZone === 'all' && selectedVisibility === 'all' && selectedType === 'all' && (
                <Button
                  onClick={() => setShowImportDialog(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  导入模型
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent">
                  <TableHead>模型名称</TableHead>
                  <TableHead>模型类型</TableHead>
                  <TableHead>可用区</TableHead>
                  <TableHead>同步状态</TableHead>
                  <TableHead>可见性</TableHead>
                  <TableHead>最新版本</TableHead>
                  <TableHead>版本数</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model) => {
                  const VisibilityIcon = getVisibilityIcon(model.visibility);
                  
                  return (
                    <TableRow key={model.id} className="border-slate-200 group hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Box className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-slate-900 font-medium mb-0.5">{model.name}</p>
                            {model.remark && (
                              <p className="text-xs text-slate-500 truncate max-w-xs">
                                {model.remark}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getModelTypeColor(model.type)}>
                          {getModelTypeLabel(model.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Server className="w-3 h-3 mr-1" />
                          {getAvailabilityZoneLabel(model.availabilityZone)}
                        </Badge>
                        {model.syncedZones && model.syncedZones.length > 1 && (
                          <p className="text-xs text-slate-500 mt-1">
                            已同步 {model.syncedZones.length} 个区
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {getSyncStatusBadge(model.syncStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <VisibilityIcon className="w-4 h-4 text-slate-600" />
                          <span className="text-sm text-slate-700">
                            {getVisibilityLabel(model.visibility)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-mono">
                        {model.latestVersion}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {model.versions.length} 个版本
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {model.createTime}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-200">
                              <DropdownMenuItem onClick={() => handleViewDetail(model)} className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeploy(model)} className="cursor-pointer">
                                <Rocket className="w-4 h-4 mr-2" />
                                部署推理
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddVersion(model)} className="cursor-pointer">
                                <GitBranch className="w-4 h-4 mr-2" />
                                新增版本
                              </DropdownMenuItem>
                              {model.syncStatus !== 'syncing' && model.syncedZones && model.syncedZones.length === 1 && (
                                <DropdownMenuItem className="cursor-pointer">
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  跨区同步
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setDeleteModelId(model.id)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除模型
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* 导入模型对话框 */}
      <ImportModelDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={loadModels}
      />

      {/* 模型详情对话框 */}
      <ModelDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        model={selectedModel}
        onUpdate={loadModels}
      />

      {/* 新增版本对话框 */}
      <AddModelVersionDialog
        open={showAddVersionDialog}
        onOpenChange={setShowAddVersionDialog}
        model={selectedModel}
        onSuccess={loadModels}
      />

      {/* 部署推理服务对话框 */}
      <DeployInferenceDialog
        open={showDeployDialog}
        onOpenChange={setShowDeployDialog}
        model={selectedModel}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteModelId} onOpenChange={() => setDeleteModelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除模型？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该模型及其所有版本，并从所有已同步的可用区中移除，无法恢复。请确认是否继续？
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
