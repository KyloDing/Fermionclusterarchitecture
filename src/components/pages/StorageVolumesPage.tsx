import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import {
  Plus,
  Search,
  FolderOpen,
  Database,
  HardDrive,
  Users,
  AlertCircle,
  ExternalLink,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { StorageVolume, getStorageVolumes, getStoragePools } from '../../services/storageService';
import { toast } from 'sonner@2.0.3';
import CreateStorageVolumeDialog from '../CreateStorageVolumeDialog';
import ExpandStorageVolumeDialog from '../ExpandStorageVolumeDialog';
import VolumePermissionsDialog from '../VolumePermissionsDialog';
import VolumeMountPointsDialog from '../VolumeMountPointsDialog';
import VolumeSettingsDialog from '../VolumeSettingsDialog';

interface StorageVolumesPageProps {
  onNavigateToFiles?: (volumeId: string) => void;
}

export default function StorageVolumesPage({ onNavigateToFiles }: StorageVolumesPageProps) {
  const [volumes, setVolumes] = useState<StorageVolume[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPool, setSelectedPool] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandDialogOpen, setExpandDialogOpen] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<StorageVolume | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [mountPointsDialogOpen, setMountPointsDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [volumesData, poolsData] = await Promise.all([
        getStorageVolumes(),
        getStoragePools(),
      ]);
      setVolumes(volumesData);
      setPools(poolsData);
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: StorageVolume['status']) => {
    const configs = {
      creating: { label: '创建中', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      available: { label: '可用', color: 'bg-green-50 text-green-700 border-green-200' },
      bound: { label: '已挂载', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      expanding: { label: '扩容中', color: 'bg-orange-50 text-orange-700 border-orange-200' },
      deleting: { label: '删除中', color: 'bg-red-50 text-red-700 border-red-200' },
    };
    return configs[status];
  };

  const getAccessModeLabel = (mode: StorageVolume['accessMode']) => {
    const labels = {
      RWO: '单节点读写',
      RWX: '多节点读写',
      ROX: '多节点只读',
    };
    return labels[mode];
  };

  // 筛选
  const filteredVolumes = volumes.filter((vol) => {
    const matchesSearch =
      vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.owner.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPool = selectedPool === 'all' || vol.poolId === selectedPool;
    const matchesStatus = selectedStatus === 'all' || vol.status === selectedStatus;
    return matchesSearch && matchesPool && matchesStatus;
  });

  // 统计
  const stats = {
    total: volumes.length,
    totalCapacity: volumes.reduce((sum, v) => sum + v.capacityGB, 0),
    totalUsed: volumes.reduce((sum, v) => sum + v.usedGB, 0),
    bound: volumes.filter((v) => v.status === 'bound').length,
  };

  const handleOpenFileBrowser = (volumeId: string) => {
    if (onNavigateToFiles) {
      onNavigateToFiles(volumeId);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-900 mb-2">存储卷管理</h1>
            <p className="text-slate-600">
              管理个人和团队的存储卷，支持容器挂载和文件管理
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            创建存储卷
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">存储卷总数</p>
                <p className="text-xl">{stats.total}</p>
              </div>
              <Database className="w-8 h-8 text-slate-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">总容量</p>
                <p className="text-xl">{(stats.totalCapacity / 1024).toFixed(1)} TB</p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">已使用</p>
                <p className="text-xl text-orange-600">
                  {(stats.totalUsed / 1024).toFixed(1)} TB
                </p>
              </div>
              <FolderOpen className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">已挂载</p>
                <p className="text-xl text-purple-600">{stats.bound}</p>
              </div>
              <ExternalLink className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选栏 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索存储卷名称或所有者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedPool} onValueChange={setSelectedPool}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="选择存储池" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部存储池</SelectItem>
                {pools.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id}>
                    {pool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="available">可用</SelectItem>
                <SelectItem value="bound">已挂载</SelectItem>
                <SelectItem value="creating">创建中</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 存储卷列表 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">加载中...</p>
        </div>
      ) : filteredVolumes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">未找到符合条件的存储卷</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredVolumes.map((volume) => {
            const statusConfig = getStatusConfig(volume.status);
            const usagePercent = (volume.usedGB / volume.capacityGB) * 100;
            const isNearQuota = usagePercent >= volume.quota.warningThreshold;

            return (
              <Card key={volume.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{volume.name}</h3>
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      {volume.description && (
                        <p className="text-sm text-slate-600 mb-2">{volume.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">{volume.poolName}</Badge>
                        <Badge variant="outline">{getAccessModeLabel(volume.accessMode)}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            volume.poolType === 'file'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }
                        >
                          {volume.poolType === 'file' ? '文件存储' : '对象存储'}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenFileBrowser(volume.id)}>
                          <FolderOpen className="w-4 h-4 mr-2" />
                          打开文件浏览器
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedVolume(volume);
                            setExpandDialogOpen(true);
                          }}
                        >
                          扩容
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedVolume(volume);
                            setPermissionsDialogOpen(true);
                          }}
                        >
                          管理权限
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedVolume(volume);
                            setMountPointsDialogOpen(true);
                          }}
                        >
                          查看挂载点
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedVolume(volume);
                            setSettingsDialogOpen(true);
                          }}
                        >
                          设置
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* 容量使用 */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">容量使用</span>
                      <span className="font-medium">
                        {volume.usedGB.toFixed(1)} / {volume.capacityGB} GB
                      </span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-500">{usagePercent.toFixed(1)}%</p>
                      {isNearQuota && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertCircle className="w-3 h-3" />
                          接近配额限制
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 文件统计 */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3 pb-3 border-b">
                    <div>
                      <span>文件: </span>
                      <span className="font-medium">{volume.usage.filesCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span>文件夹: </span>
                      <span className="font-medium">{volume.usage.directoriesCount}</span>
                    </div>
                  </div>

                  {/* 所有者和权限 */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">所有者: </span>
                      <span className="font-medium">{volume.owner.userName}</span>
                      {volume.owner.groupName && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{volume.owner.groupName}</span>
                        </>
                      )}
                    </div>
                    {volume.permissions.length > 1 && (
                      <p className="text-xs text-slate-500 ml-6">
                        与 {volume.permissions.length - 1} 个用户共享
                      </p>
                    )}
                  </div>

                  {/* 挂载信息 */}
                  {volume.mountedTo.length > 0 && (
                    <div className="mb-3 p-2 bg-purple-50 rounded text-xs">
                      <p className="text-purple-900 font-medium mb-1">
                        已挂载到 {volume.mountedTo.length} 个位置:
                      </p>
                      {volume.mountedTo.slice(0, 2).map((mount, idx) => (
                        <p key={idx} className="text-purple-700">
                          • {mount.resourceName} ({mount.mountPath})
                        </p>
                      ))}
                      {volume.mountedTo.length > 2 && (
                        <p className="text-purple-700">
                          • 还有 {volume.mountedTo.length - 2} 个...
                        </p>
                      )}
                    </div>
                  )}

                  {/* 计费信息 */}
                  <div className="flex items-center justify-between text-sm pt-3 border-t">
                    <div>
                      <span className="text-slate-600">本月费用: </span>
                      <span className="font-medium text-orange-600">
                        ¥{volume.billing.currentMonthCost.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">预付费余额: </span>
                      <span className="font-medium text-green-600">
                        ¥{volume.billing.prepaidBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* 快速操作 */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenFileBrowser(volume.id)}
                    >
                      <FolderOpen className="w-4 h-4 mr-1" />
                      文件管理
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 显示结果数量 */}
      {!loading && filteredVolumes.length > 0 && (
        <div className="mt-6 text-center text-sm text-slate-600">
          显示 {filteredVolumes.length} / {volumes.length} 个存储卷
        </div>
      )}

      <CreateStorageVolumeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadData}
      />
      <ExpandStorageVolumeDialog
        open={expandDialogOpen}
        onOpenChange={setExpandDialogOpen}
        volume={selectedVolume}
        onSuccess={loadData}
      />
      <VolumePermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        volume={selectedVolume}
        onSuccess={loadData}
      />
      <VolumeMountPointsDialog
        open={mountPointsDialogOpen}
        onOpenChange={setMountPointsDialogOpen}
        volume={selectedVolume}
      />
      <VolumeSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        volume={selectedVolume}
        onSuccess={loadData}
      />
    </div>
  );
}