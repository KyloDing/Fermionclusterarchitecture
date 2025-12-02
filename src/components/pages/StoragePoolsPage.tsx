import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Database,
  HardDrive,
  Plus,
  TrendingUp,
  Activity,
  Gauge,
  Server,
} from 'lucide-react';
import { StoragePool, getStoragePools } from '../../services/storageService';
import { toast } from 'sonner@2.0.3';
import CreateStoragePoolDialog from '../CreateStoragePoolDialog';

export default function StoragePoolsPage() {
  const [pools, setPools] = useState<StoragePool[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    setLoading(true);
    try {
      const data = await getStoragePools();
      setPools(data);
    } catch (error) {
      toast.error('加载存储池失败');
    } finally {
      setLoading(false);
    }
  };

  const getStorageTypeConfig = (type: StoragePool['type']) => {
    return type === 'file'
      ? { label: '文件存储', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: HardDrive }
      : { label: '对象存储', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Database };
  };

  const getStorageClassConfig = (storageClass: StoragePool['storageClass']) => {
    const configs = {
      ssd: { label: 'SSD', color: 'bg-green-50 text-green-700 border-green-200' },
      hdd: { label: 'HDD', color: 'bg-slate-50 text-slate-700 border-slate-200' },
      hybrid: { label: '混合', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    };
    return configs[storageClass];
  };

  const getStatusConfig = (status: StoragePool['status']) => {
    const configs = {
      active: { label: '运行中', color: 'bg-green-50 text-green-700 border-green-200' },
      expanding: { label: '扩容中', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      maintenance: { label: '维护中', color: 'bg-orange-50 text-orange-700 border-orange-200' },
      error: { label: '错误', color: 'bg-red-50 text-red-700 border-red-200' },
    };
    return configs[status];
  };

  // 计算总体统计
  const stats = {
    totalPools: pools.length,
    totalCapacityGB: pools.reduce((sum, p) => sum + p.totalCapacityGB, 0),
    usedCapacityGB: pools.reduce((sum, p) => sum + p.usedCapacityGB, 0),
    totalVolumes: pools.reduce((sum, p) => sum + p.volumeCount, 0),
  };

  const utilizationPercent = (stats.usedCapacityGB / stats.totalCapacityGB) * 100;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-900 mb-2">存储池管理</h1>
            <p className="text-slate-600">
              管理分布式存储池，支持CephFS文件存储和MinIO对象存储
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建存储池
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">存储池总数</p>
                <p className="text-xl">{stats.totalPools}</p>
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
                <p className="text-xl">{(stats.totalCapacityGB / 1024).toFixed(1)} TB</p>
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
                  {(stats.usedCapacityGB / 1024).toFixed(1)} TB
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">存储卷总数</p>
                <p className="text-xl text-purple-600">{stats.totalVolumes}</p>
              </div>
              <Server className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 总体使用率 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">总体存储使用率</h3>
            <span className="text-sm text-slate-600">{utilizationPercent.toFixed(1)}%</span>
          </div>
          <Progress value={utilizationPercent} className="h-2" />
          <div className="flex justify-between text-xs text-slate-600 mt-2">
            <span>已使用 {(stats.usedCapacityGB / 1024).toFixed(2)} TB</span>
            <span>
              可用 {((stats.totalCapacityGB - stats.usedCapacityGB) / 1024).toFixed(2)} TB
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 存储池列表 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">加载中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pools.map((pool) => {
            const typeConfig = getStorageTypeConfig(pool.type);
            const classConfig = getStorageClassConfig(pool.storageClass);
            const statusConfig = getStatusConfig(pool.status);
            const usagePercent = (pool.usedCapacityGB / pool.totalCapacityGB) * 100;
            const TypeIcon = typeConfig.icon;

            return (
              <Card key={pool.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="w-5 h-5 text-slate-600" />
                        <CardTitle className="text-base">{pool.name}</CardTitle>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{pool.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                        <Badge variant="outline" className={classConfig.color}>
                          {classConfig.label}
                        </Badge>
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {pool.backend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 容量使用 */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">容量使用</span>
                      <span className="font-medium">
                        {(pool.usedCapacityGB / 1024).toFixed(2)} / {(pool.totalCapacityGB / 1024).toFixed(2)} TB
                      </span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1">使用率: {usagePercent.toFixed(1)}%</p>
                  </div>

                  {/* 性能指标 */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Gauge className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-600">IOPS</p>
                      </div>
                      <p className="text-sm font-medium">
                        {pool.performance.iops.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-600">吞吐量</p>
                      </div>
                      <p className="text-sm font-medium">
                        {pool.performance.throughputMBps} MB/s
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-600">延迟</p>
                      </div>
                      <p className="text-sm font-medium">
                        {pool.performance.latencyMs.toFixed(1)} ms
                      </p>
                    </div>
                  </div>

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between pt-3 border-t text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-600">存储卷: </span>
                        <span className="font-medium">{pool.volumeCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">集群: </span>
                        <span className="font-medium">{pool.clusterName}</span>
                      </div>
                    </div>
                    <div className="text-slate-600">
                      ¥{pool.pricing.pricePerGBPerMonth}/GB/月
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <CreateStoragePoolDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadPools}
      />
    </div>
  );
}