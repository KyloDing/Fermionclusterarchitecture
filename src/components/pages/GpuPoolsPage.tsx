import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Cpu,
  Plus,
  TrendingUp,
  Server,
  Info,
  Eye,
  Settings,
  Users,
  Activity,
  Database,
  BarChart3,
} from 'lucide-react';
import {
  getClusters,
  getGpuPools,
  getGpuNodes,
  calculateUtilization,
  type Cluster,
  type GpuPool,
  type GpuNode,
} from '../../services/mockDataService';
import { toast } from 'sonner';
import CreateGpuPoolDialog from '../CreateGpuPoolDialog';

export default function GpuPoolsPage() {
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [pools, setPools] = useState<GpuPool[]>([]);
  const [nodes, setNodes] = useState<GpuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<GpuPool | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [clustersData, poolsData, nodesData] = await Promise.all([
          getClusters(),
          getGpuPools(),
          getGpuNodes(),
        ]);
        setClusters(clustersData);
        setPools(poolsData);
        setNodes(nodesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 筛选资源池
  const filteredPools =
    selectedCluster === 'all'
      ? pools
      : pools.filter((pool) => pool.clusterId === selectedCluster);

  // 计算统计数据
  const stats = {
    totalPools: pools.length,
    totalGpus: pools.reduce((sum, p) => sum + p.totalGpus, 0),
    usedGpus: pools.reduce((sum, p) => sum + p.usedGpus, 0),
    allocatedGpus: pools.reduce((sum, p) => sum + p.allocatedGpus, 0),
    avgUtilization: pools.length
      ? Math.round(
          pools.reduce((sum, p) => sum + calculateUtilization(p.usedGpus, p.totalGpus), 0) /
            pools.length
        )
      : 0,
  };

  // 查看资源池详情
  const viewPoolDetail = (pool: GpuPool) => {
    setSelectedPool(pool);
    setIsDetailDialogOpen(true);
  };

  // 获取资源池对应的节点
  const getPoolNodes = (pool: GpuPool): GpuNode[] => {
    return nodes.filter((node) => {
      const matchesCluster = node.clusterId === pool.clusterId;
      const matchesGpuModel = node.gpuModel.includes(
        pool.gpuModel.split(' ')[1] // 提取型号如 A100
      );
      return matchesCluster && matchesGpuModel;
    });
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">GPU资源池</h1>
        <p className="text-slate-600">管理和监控GPU资源池的分配与使用情况</p>
      </div>

      {/* 使用说明 */}
      <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <Info className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-sm">
          <strong className="text-purple-900">💎 GPU资源池说明：</strong>
          <div className="mt-2 text-slate-700 space-y-1">
            <p>
              • <strong>数据来源</strong>：资源池通过节点标签自动聚合生成，实时同步自Kubernetes集群
            </p>
            <p>
              • <strong>分配策略</strong>：根据标签选择器自动将节点归类到对应资源池
            </p>
            <p>
              • <strong>用途</strong>：为训练任务、推理服务和开发环境提供GPU资源隔离和配额管理
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">资源池总数</p>
                <p className="text-3xl">{stats.totalPools}</p>
                <p className="text-xs text-slate-500 mt-1">
                  来源：{clusters.length} 个集群
                </p>
              </div>
              <Server className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">GPU总数</p>
                <p className="text-3xl text-purple-600">{stats.totalGpus}</p>
                <p className="text-xs text-slate-500 mt-1">
                  来源：{nodes.length} 个节点
                </p>
              </div>
              <Cpu className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">使用中GPU</p>
                <p className="text-3xl text-green-600">{stats.usedGpus}</p>
                <p className="text-xs text-green-600 mt-1">
                  已分配: {stats.allocatedGpus} 卡
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">平均利用率</p>
                <p className="text-3xl">{stats.avgUtilization}%</p>
                <p className="text-xs text-slate-500 mt-1">
                  空闲: {stats.totalGpus - stats.usedGpus} 卡
                </p>
              </div>
              <Activity className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between gap-4">
        <Select value={selectedCluster} onValueChange={setSelectedCluster}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部集群 ({pools.length}个资源池)</SelectItem>
            {clusters.map((cluster) => (
              <SelectItem key={cluster.id} value={cluster.id}>
                {cluster.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => {
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          创建资源池
        </Button>
      </div>

      {/* 资源池卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPools.map((pool) => {
          const utilization = calculateUtilization(pool.usedGpus, pool.totalGpus);
          const allocationRate = calculateUtilization(pool.allocatedGpus, pool.totalGpus);

          return (
            <Card
              key={pool.id}
              className="border-2 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => viewPoolDetail(pool)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{pool.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {pool.description}
                    </CardDescription>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50">
                    {pool.gpuModel}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {pool.clusterName}
                  </Badge>
                  {pool.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 资源统计 */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">节点数量</p>
                    <p className="text-xl">{pool.totalNodes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">GPU总数</p>
                    <p className="text-xl text-purple-600">{pool.totalGpus}</p>
                  </div>
                </div>

                {/* GPU使用情况 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">GPU使用情况</span>
                    <span className="font-medium">
                      {pool.usedGpus} / {pool.totalGpus}
                    </span>
                  </div>
                  <Progress value={utilization} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">实际使用率: {utilization}%</span>
                    <span className="text-blue-600">分配率: {allocationRate}%</span>
                  </div>
                </div>

                {/* 配额信息 */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="text-slate-600 mb-1">单用户限制</p>
                    <p className="font-medium">{pool.quotas.maxGpusPerUser} 卡</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-slate-600 mb-1">单任务限制</p>
                    <p className="font-medium">{pool.quotas.maxGpusPerJob} 卡</p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="pt-3 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewPoolDetail(pool);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    详情
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                    disabled
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    配置
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPools.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Database className="w-16 h-16 mx-auto text-slate-300" />
            <div>
              <h3 className="text-xl mb-2">没有找到资源池</h3>
              <p className="text-slate-600">该集群暂无GPU资源池</p>
            </div>
          </div>
        </Card>
      )}

      {/* 资源池详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">资源池详情</DialogTitle>
            <DialogDescription>{selectedPool?.name}</DialogDescription>
          </DialogHeader>

          {selectedPool && (
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* 基本信息 */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">资源池ID</p>
                      <p className="font-mono text-sm">{selectedPool.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">所属集群</p>
                      <p>{selectedPool.clusterName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">GPU型号</p>
                      <p>{selectedPool.gpuModel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">创建时间</p>
                      <p>{new Date(selectedPool.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">创建者</p>
                      <p>{selectedPool.createdBy}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600 mb-2">标签</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPool.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600 mb-2">节点选择器</p>
                    <div className="p-3 bg-slate-900 rounded font-mono text-xs text-green-400">
                      {Object.entries(selectedPool.nodeSelector).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 资源统计 */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>资源统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm text-slate-600 mb-1">节点总数</p>
                      <p className="text-2xl font-semibold">{selectedPool.totalNodes}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-sm text-slate-600 mb-1">GPU总数</p>
                      <p className="text-2xl font-semibold text-purple-600">
                        {selectedPool.totalGpus}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg text-center">
                      <p className="text-sm text-slate-600 mb-1">已分配</p>
                      <p className="text-2xl font-semibold text-orange-600">
                        {selectedPool.allocatedGpus}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-slate-600 mb-1">使用中</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {selectedPool.usedGpus}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>分配率</span>
                        <span className="font-medium">
                          {calculateUtilization(
                            selectedPool.allocatedGpus,
                            selectedPool.totalGpus
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={calculateUtilization(
                          selectedPool.allocatedGpus,
                          selectedPool.totalGpus
                        )}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>实际使用率</span>
                        <span className="font-medium">
                          {calculateUtilization(selectedPool.usedGpus, selectedPool.totalGpus)}%
                        </span>
                      </div>
                      <Progress
                        value={calculateUtilization(selectedPool.usedGpus, selectedPool.totalGpus)}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 配额限制 */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>配额限制</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <p className="font-medium">单用户GPU限制</p>
                      </div>
                      <p className="text-3xl text-blue-600">
                        {selectedPool.quotas.maxGpusPerUser}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">每个用户最多可使用的GPU数量</p>
                    </div>
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        <p className="font-medium">单任务GPU限制</p>
                      </div>
                      <p className="text-3xl text-green-600">
                        {selectedPool.quotas.maxGpusPerJob}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        单个训练任务或服务最多可使用的GPU数量
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 节点列表 */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>
                    节点列表 ({getPoolNodes(selectedPool).length} 个节点)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>节点名称</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>GPU型号</TableHead>
                        <TableHead>GPU数量</TableHead>
                        <TableHead>CPU/内存</TableHead>
                        <TableHead>IP地址</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPoolNodes(selectedPool).map((node) => (
                        <TableRow key={node.id}>
                          <TableCell className="font-mono text-sm">{node.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={node.status === 'ready' ? 'default' : 'secondary'}
                              className={
                                node.status === 'ready' ? 'bg-green-600' : 'bg-slate-400'
                              }
                            >
                              {node.status === 'ready'
                                ? 'Ready'
                                : node.status === 'not-ready'
                                  ? 'NotReady'
                                  : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell>{node.gpuModel}</TableCell>
                          <TableCell>{node.gpuCount}卡</TableCell>
                          <TableCell>
                            {node.cpuCores}核 / {node.memoryGB}GB
                          </TableCell>
                          <TableCell className="font-mono text-xs">{node.ipAddress}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="pt-6 border-t">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              关闭
            </Button>
            <Button disabled>
              <Settings className="w-4 h-4 mr-2" />
              配置资源池
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建资源池对话框 */}
      <CreateGpuPoolDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => {
          console.log('创建资源池:', data);
          toast.success('资源池创建成功');
          // 这里应该调用API创建资源池，然后刷新列表
          // 暂时模拟添加到列表
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
}