import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
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
import { Alert, AlertDescription } from '../ui/alert';
import {
  Server,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Database,
  HardDrive,
  Network,
  Cloud,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  HardDriveIcon,
} from 'lucide-react';
import {
  StorageBackendConfig,
  getStorageBackends,
  createStorageBackend,
  updateStorageBackend,
  deleteStorageBackend,
  toggleStorageBackend,
} from '../../services/storageBackendService';
import StorageBackendDialog from '../StorageBackendDialog';
import { toast } from 'sonner@2.0.3';

export default function StorageBackendsPage() {
  const [backends, setBackends] = useState<StorageBackendConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBackend, setEditingBackend] = useState<StorageBackendConfig | null>(null);

  useEffect(() => {
    loadBackends();
  }, []);

  const loadBackends = async () => {
    setLoading(true);
    try {
      const data = await getStorageBackends();
      setBackends(data);
    } catch (error) {
      toast.error('加载存储后端失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBackend = () => {
    setEditingBackend(null);
    setDialogOpen(true);
  };

  const handleEditBackend = (backend: StorageBackendConfig) => {
    setEditingBackend(backend);
    setDialogOpen(true);
  };

  const handleDeleteBackend = async (backend: StorageBackendConfig) => {
    if (backend.stats && backend.stats.poolCount > 0) {
      toast.error('无法删除：此后端仍有关联的存储池');
      return;
    }

    if (!confirm(`确认删除存储后端 "${backend.name}"？`)) {
      return;
    }

    try {
      await deleteStorageBackend(backend.id);
      toast.success('存储后端已删除');
      loadBackends();
    } catch (error) {
      toast.error('删除存储后端失败');
    }
  };

  const handleToggleBackend = async (backend: StorageBackendConfig) => {
    try {
      await toggleStorageBackend(backend.id, !backend.enabled);
      toast.success(backend.enabled ? '已禁用存储后端' : '已启用存储后端');
      loadBackends();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleDialogConfirm = async (data: any) => {
    try {
      if (editingBackend) {
        await updateStorageBackend(editingBackend.id, data);
        toast.success('存储后端已更新');
      } else {
        await createStorageBackend(data);
        toast.success('存储后端已添加');
      }
      loadBackends();
    } catch (error) {
      toast.error(editingBackend ? '更新失败' : '添加失败');
    }
  };

  const filteredBackends = backends.filter(
    (backend) =>
      backend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      backend.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status: StorageBackendConfig['status']) => {
    const configs = {
      connected: {
        label: '已连接',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
      },
      disconnected: {
        label: '未连接',
        color: 'bg-slate-100 text-slate-700',
        icon: XCircle,
      },
      error: {
        label: '错误',
        color: 'bg-red-100 text-red-700',
        icon: AlertCircle,
      },
      configuring: {
        label: '配置中',
        color: 'bg-blue-100 text-blue-700',
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.disconnected;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      local: HardDrive,
      nfs: Network,
      ceph: Database,
      cephfs: Database,
      glusterfs: Network,
      s3: Cloud,
      minio: Cloud,
      iscsi: HardDriveIcon,
      fc: HardDriveIcon,
      beegfs: Database,
      cubefs: Network,
    };
    return icons[type] || Server;
  };

  const formatSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  // 统计数据
  const stats = {
    total: backends.length,
    connected: backends.filter((b) => b.status === 'connected').length,
    enabled: backends.filter((b) => b.enabled).length,
    totalCapacity: backends.reduce((sum, b) => sum + (b.stats?.totalCapacity || 0), 0),
    usedCapacity: backends.reduce((sum, b) => sum + (b.stats?.usedCapacity || 0), 0),
  };

  const usagePercent = stats.totalCapacity > 0
    ? Math.round((stats.usedCapacity / stats.totalCapacity) * 100)
    : 0;

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 mb-2">
            <Server className="w-8 h-8 text-purple-600" />
            存储后端管理
          </h1>
          <p className="text-slate-600">
            配置和管理存储后端服务，控制可用的存储类型
          </p>
        </div>
        <Button onClick={handleAddBackend}>
          <Plus className="w-4 h-4 mr-2" />
          添加存储后端
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总后端数</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-600" />
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>已连接</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {stats.connected}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>已启用</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Power className="w-5 h-5 text-blue-600" />
              {stats.enabled}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总容量使用率</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              {usagePercent}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-600">
              {formatSize(stats.usedCapacity)} / {formatSize(stats.totalCapacity)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 提示信息 */}
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          只有已启用且已连接的存储后端才能在创建存储池时选择。删除后端前请确保没有关联的存储池。
        </AlertDescription>
      </Alert>

      {/* 搜索栏 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索存储后端..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 存储后端列表 */}
      <Card>
        <CardHeader>
          <CardTitle>存储后端列表</CardTitle>
          <CardDescription>管理所有已配置的存储后端服务</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-500">加载中...</div>
          ) : filteredBackends.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-1">
                {searchQuery ? '未找到匹配的后端' : '暂无存储后端'}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {searchQuery ? '尝试其他搜索条件' : '点击上方按钮添加第一个存储后端'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>容量</TableHead>
                  <TableHead>存储池</TableHead>
                  <TableHead>存储卷</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBackends.map((backend) => {
                  const TypeIcon = getTypeIcon(backend.type);
                  const statusConfig = getStatusConfig(backend.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <TableRow key={backend.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {backend.name}
                              {!backend.enabled && (
                                <Badge variant="outline" className="bg-slate-100">
                                  已禁用
                                </Badge>
                              )}
                            </div>
                            {backend.description && (
                              <div className="text-xs text-slate-600">
                                {backend.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{backend.type.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {backend.stats ? (
                          <div>
                            <div className="text-sm">
                              {formatSize(backend.stats.usedCapacity)} /{' '}
                              {formatSize(backend.stats.totalCapacity)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {Math.round(
                                (backend.stats.usedCapacity / backend.stats.totalCapacity) * 100
                              )}
                              % 已用
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {backend.stats?.poolCount ? (
                          <span className="font-medium">{backend.stats.poolCount}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {backend.stats?.volumeCount ? (
                          <span className="font-medium">{backend.stats.volumeCount}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(backend.updatedAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditBackend(backend)}>
                              <Edit className="w-4 h-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleBackend(backend)}>
                              {backend.enabled ? (
                                <>
                                  <PowerOff className="w-4 h-4 mr-2" />
                                  禁用
                                </>
                              ) : (
                                <>
                                  <Power className="w-4 h-4 mr-2" />
                                  启用
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteBackend(backend)}
                              className="text-red-600"
                              disabled={backend.stats && backend.stats.poolCount > 0}
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
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      <StorageBackendDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        backend={editingBackend}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
}