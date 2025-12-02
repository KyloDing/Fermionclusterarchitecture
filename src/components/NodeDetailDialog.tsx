import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Zap,
  Thermometer,
  User,
  Layers,
  Calendar,
  Box,
} from 'lucide-react';
import { GpuNode, getNodeDetails, formatRelativeTime } from '../services/mockDataService';
import GaugeChart from './GaugeChart';

interface NodeDetailDialogProps {
  nodeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NodeDetailDialog({ nodeId, open, onOpenChange }: NodeDetailDialogProps) {
  const [node, setNode] = useState<GpuNode | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && nodeId) {
      loadNodeDetails();
    }
  }, [open, nodeId]);

  const loadNodeDetails = async () => {
    if (!nodeId) return;
    setLoading(true);
    try {
      const data = await getNodeDetails(nodeId);
      setNode(data);
    } catch (error) {
      console.error('Failed to load node details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadTypeBadge = (type: 'training' | 'inference' | 'development') => {
    const configs = {
      training: { label: '训练任务', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      inference: { label: '推理服务', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      development: { label: '开发环境', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    };
    return configs[type];
  };

  const formatMemory = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  if (!node && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            节点详情
          </DialogTitle>
          <DialogDescription>查看节点的完整信息和GPU卡使用情况</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-slate-600">加载中...</div>
        ) : node ? (
          <ScrollArea className="max-h-[calc(85vh-120px)]">
            <div className="space-y-6 pr-4">
              {/* 基本信息 */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">基本信息</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">节点名称:</span>
                      <p className="font-medium mt-1">{node.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">IP地址:</span>
                      <p className="font-medium mt-1">{node.ipAddress}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">所属集群:</span>
                      <p className="font-medium mt-1">{node.clusterName}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">资源池:</span>
                      <p className="font-medium mt-1">{node.poolName || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">节点类型:</span>
                      <Badge
                        className={
                          node.nodeType === 'dedicated'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 mt-1'
                            : 'bg-teal-50 text-teal-700 border-teal-200 mt-1'
                        }
                        variant="outline"
                      >
                        {node.nodeType === 'dedicated' ? '整卡独占' : '共享切分'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-slate-600">运行时间:</span>
                      <p className="font-medium mt-1">{node.uptime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 系统信息 */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">系统信息</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">操作系统:</span>
                      <p className="font-medium mt-1">{node.osVersion || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">内核版本:</span>
                      <p className="font-medium mt-1">{node.kernelVersion || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Docker版本:</span>
                      <p className="font-medium mt-1">{node.dockerVersion || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Kubelet版本:</span>
                      <p className="font-medium mt-1">{node.kubeletVersion || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 资源概况 */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">资源概况</h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <GaugeChart
                        value={node.cpuUsed}
                        max={node.cpuCores}
                        size={90}
                        thickness={8}
                      />
                      <p className="text-sm text-slate-600 mt-2">CPU</p>
                      <p className="text-xs text-slate-500">
                        {node.cpuUsed}/{node.cpuCores} 核
                      </p>
                    </div>
                    <div className="text-center">
                      <GaugeChart
                        value={node.memoryUsed}
                        max={node.memoryGB}
                        size={90}
                        thickness={8}
                      />
                      <p className="text-sm text-slate-600 mt-2">内存</p>
                      <p className="text-xs text-slate-500">
                        {node.memoryUsed}/{node.memoryGB} GB
                      </p>
                    </div>
                    {node.nodeType === 'dedicated' ? (
                      <div className="text-center">
                        <GaugeChart
                          value={node.gpuUsed}
                          max={node.gpuCount}
                          size={90}
                          thickness={8}
                        />
                        <p className="text-sm text-slate-600 mt-2">GPU</p>
                        <p className="text-xs text-slate-500">
                          {node.gpuUsed}/{node.gpuCount} 卡
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <GaugeChart
                          value={node.gpuPartitions?.allocated || 0}
                          max={node.gpuPartitions?.total || 1}
                          size={90}
                          thickness={8}
                        />
                        <p className="text-sm text-slate-600 mt-2">GPU分区</p>
                        <p className="text-xs text-slate-500">
                          {node.gpuPartitions?.allocated}/{node.gpuPartitions?.total}
                        </p>
                      </div>
                    )}
                    {node.systemDisk && (
                      <div className="text-center">
                        <GaugeChart
                          value={node.systemDisk.used}
                          max={node.systemDisk.total}
                          size={90}
                          thickness={8}
                        />
                        <p className="text-sm text-slate-600 mt-2">系统盘</p>
                        <p className="text-xs text-slate-500">
                          {node.systemDisk.used}/{node.systemDisk.total} GB
                        </p>
                        <p className={`text-xs font-medium mt-1 ${node.systemDisk.usagePercent > 85 ? 'text-red-600' : node.systemDisk.usagePercent > 70 ? 'text-amber-600' : 'text-green-600'}`}>
                          {node.systemDisk.usagePercent}%
                        </p>
                      </div>
                    )}
                    {node.dataDisk && (
                      <div className="text-center">
                        <GaugeChart
                          value={node.dataDisk.used}
                          max={node.dataDisk.total}
                          size={90}
                          thickness={8}
                        />
                        <p className="text-sm text-slate-600 mt-2">数据盘</p>
                        <p className="text-xs text-slate-500">
                          {node.dataDisk.used}/{node.dataDisk.total} GB
                        </p>
                        <p className={`text-xs font-medium mt-1 ${node.dataDisk.usagePercent > 85 ? 'text-red-600' : node.dataDisk.usagePercent > 70 ? 'text-amber-600' : 'text-green-600'}`}>
                          {node.dataDisk.usagePercent}%
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* GPU卡详情 */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">GPU卡详情</h3>
                  <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">概览</TabsTrigger>
                      <TabsTrigger value="detailed">详细信息</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-3 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {node.gpuCards?.map((card) => (
                          <Card
                            key={card.id}
                            className={
                              card.status === 'in-use'
                                ? 'border-purple-200 bg-purple-50/30'
                                : 'border-green-200 bg-green-50/30'
                            }
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium text-sm">GPU {card.index}</p>
                                  <p className="text-xs text-slate-600 mt-0.5">{card.uuid}</p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    card.status === 'in-use'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : 'bg-green-50 text-green-700 border-green-200'
                                  }
                                >
                                  {card.status === 'in-use' ? '使用中' : '空闲'}
                                </Badge>
                              </div>

                              {card.allocatedTo && (
                                <div className="space-y-1.5 mb-3 p-2 bg-white rounded border">
                                  <div className="flex items-center gap-2 text-xs">
                                    <User className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-600">用户:</span>
                                    <span className="font-medium">{card.allocatedTo.userName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Box className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-600">任务:</span>
                                    <span className="font-medium">{card.allocatedTo.workloadName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Badge
                                      variant="outline"
                                      className={getWorkloadTypeBadge(card.allocatedTo.workloadType).color}
                                    >
                                      {getWorkloadTypeBadge(card.allocatedTo.workloadType).label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-600">开始时间:</span>
                                    <span className="font-medium">
                                      {formatRelativeTime(card.allocatedTo.startTime)}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center p-1.5 bg-white rounded">
                                  <Activity className="w-3 h-3 mx-auto mb-0.5 text-blue-600" />
                                  <p className="text-slate-600">利用率</p>
                                  <p className="font-medium">{card.utilization}%</p>
                                </div>
                                <div className="text-center p-1.5 bg-white rounded">
                                  <Thermometer
                                    className={`w-3 h-3 mx-auto mb-0.5 ${
                                      card.temperature > 75
                                        ? 'text-red-600'
                                        : card.temperature > 60
                                        ? 'text-orange-600'
                                        : 'text-green-600'
                                    }`}
                                  />
                                  <p className="text-slate-600">温度</p>
                                  <p className="font-medium">{Math.round(card.temperature)}°C</p>
                                </div>
                                <div className="text-center p-1.5 bg-white rounded">
                                  <Zap className="w-3 h-3 mx-auto mb-0.5 text-yellow-600" />
                                  <p className="text-slate-600">功耗</p>
                                  <p className="font-medium">{Math.round(card.powerUsage)}W</p>
                                </div>
                              </div>

                              <div className="mt-2 text-xs">
                                <div className="flex justify-between text-slate-600 mb-0.5">
                                  <span>显存</span>
                                  <span>
                                    {formatMemory(card.memoryUsed)} / {formatMemory(card.memoryTotal)}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{
                                      width: `${(card.memoryUsed / card.memoryTotal) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="detailed" className="space-y-3 mt-4">
                      {node.gpuCards?.map((card) => (
                        <Card key={card.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">GPU {card.index}</h4>
                              <Badge
                                variant="outline"
                                className={
                                  card.status === 'in-use'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-green-50 text-green-700 border-green-200'
                                }
                              >
                                {card.status === 'in-use' ? '使用中' : '空闲'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-slate-600">UUID:</span>
                                <p className="font-medium text-xs mt-1">{card.uuid}</p>
                              </div>
                              <div>
                                <span className="text-slate-600">利用率:</span>
                                <p className="font-medium mt-1">{card.utilization}%</p>
                              </div>
                              <div>
                                <span className="text-slate-600">温度:</span>
                                <p className="font-medium mt-1">{Math.round(card.temperature)}°C</p>
                              </div>
                              <div>
                                <span className="text-slate-600">功耗:</span>
                                <p className="font-medium mt-1">
                                  {Math.round(card.powerUsage)}W / {card.powerLimit}W
                                </p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-600">显存使用:</span>
                                <p className="font-medium mt-1">
                                  {formatMemory(card.memoryUsed)} / {formatMemory(card.memoryTotal)}
                                </p>
                              </div>
                            </div>

                            {card.allocatedTo && (
                              <div className="mt-3 pt-3 border-t">
                                <h5 className="text-sm font-medium mb-2">分配信息</h5>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-slate-600">用户:</span>
                                    <p className="font-medium mt-1">{card.allocatedTo.userName}</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">工作负载ID:</span>
                                    <p className="font-medium text-xs mt-1">{card.allocatedTo.workloadId}</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">工作负载名称:</span>
                                    <p className="font-medium mt-1">{card.allocatedTo.workloadName}</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">类型:</span>
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        getWorkloadTypeBadge(card.allocatedTo.workloadType).color
                                      } mt-1`}
                                    >
                                      {getWorkloadTypeBadge(card.allocatedTo.workloadType).label}
                                    </Badge>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-slate-600">开始时间:</span>
                                    <p className="font-medium mt-1">
                                      {new Date(card.allocatedTo.startTime).toLocaleString('zh-CN')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 共享节点显示分区信息 */}
                            {node.nodeType === 'shared' && card.partitions && (
                              <div className="mt-3 pt-3 border-t">
                                <h5 className="text-sm font-medium mb-2">GPU分区 ({card.partitions.length}个)</h5>
                                <div className="grid grid-cols-2 gap-2">
                                  {card.partitions.map((partition, idx) => (
                                    <div
                                      key={partition.partitionId}
                                      className={`p-2 rounded border text-xs ${
                                        partition.allocatedTo
                                          ? 'bg-purple-50 border-purple-200'
                                          : 'bg-gray-50 border-gray-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">分区 {idx}</span>
                                        <Badge
                                          variant="outline"
                                          className={
                                            partition.allocatedTo
                                              ? 'bg-purple-100 text-purple-700 border-purple-300 text-xs'
                                              : 'bg-gray-100 text-gray-700 border-gray-300 text-xs'
                                          }
                                        >
                                          {partition.allocatedTo ? '已分配' : '空闲'}
                                        </Badge>
                                      </div>
                                      <p className="text-slate-600 mb-1">
                                        显存: {formatMemory(partition.memoryMB)}
                                      </p>
                                      {partition.allocatedTo && (
                                        <div className="space-y-0.5 pt-1 border-t">
                                          <p>
                                            <span className="text-slate-600">用户:</span>{' '}
                                            {partition.allocatedTo.userName}
                                          </p>
                                          <p>
                                            <span className="text-slate-600">任务:</span>{' '}
                                            {partition.allocatedTo.workloadName}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* 节点标签 */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">节点标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(node.labels).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
