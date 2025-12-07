import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
  Plus,
  Minus,
  Server,
  MapPin,
  Cpu,
  HardDrive,
  Network,
  AlertCircle,
  Info,
  Trash2,
  Globe,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ZoneAllocation {
  zoneId: string;
  zoneName: string;
  nodeCount: number;
  gpuPerNode: number;
  cpuPerNode: number;
  memoryPerNode: number;
  availableNodes: number;
}

interface MultiZoneSchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'training' | 'inference';
  onConfirm?: (config: any) => void;
}

export function MultiZoneSchedulingDialog({
  open,
  onOpenChange,
  mode,
  onConfirm,
}: MultiZoneSchedulingDialogProps) {
  // 模拟可用区数据
  const availableZones = [
    {
      id: 'zone-a',
      name: 'A可用区（北京-1）',
      region: '北京',
      availableNodes: 24,
      totalGPUs: 96,
      availableGPUs: 64,
      latency: 1.2,
      status: 'healthy',
    },
    {
      id: 'zone-b',
      name: 'B可用区（北京-2）',
      region: '北京',
      availableNodes: 18,
      totalGPUs: 72,
      availableGPUs: 48,
      latency: 1.5,
      status: 'healthy',
    },
    {
      id: 'zone-c',
      name: 'C可用区（上海-1）',
      region: '上海',
      availableNodes: 32,
      totalGPUs: 128,
      availableGPUs: 80,
      latency: 8.5,
      status: 'healthy',
    },
    {
      id: 'zone-d',
      name: 'D可用区（深圳-1）',
      region: '深圳',
      availableNodes: 16,
      totalGPUs: 64,
      availableGPUs: 32,
      latency: 12.3,
      status: 'degraded',
    },
  ];

  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('pytorch');
  const [distributionStrategy, setDistributionStrategy] = useState('ddp');
  const [zoneAllocations, setZoneAllocations] = useState<ZoneAllocation[]>([]);
  const [selectedZone, setSelectedZone] = useState('');

  // 添加可用区配置
  const handleAddZone = () => {
    if (!selectedZone) {
      toast.error('请选择可用区');
      return;
    }

    const zone = availableZones.find(z => z.id === selectedZone);
    if (!zone) return;

    // 检查是否已添加
    if (zoneAllocations.find(z => z.zoneId === selectedZone)) {
      toast.error('该可用区已添加');
      return;
    }

    setZoneAllocations([
      ...zoneAllocations,
      {
        zoneId: zone.id,
        zoneName: zone.name,
        nodeCount: 1,
        gpuPerNode: 4,
        cpuPerNode: 32,
        memoryPerNode: 128,
        availableNodes: zone.availableNodes,
      },
    ]);

    setSelectedZone('');
    toast.success(`已添加 ${zone.name}`);
  };

  // 删除可用区配置
  const handleRemoveZone = (zoneId: string) => {
    setZoneAllocations(zoneAllocations.filter(z => z.zoneId !== zoneId));
    toast.success('已移除可用区配置');
  };

  // 更新节点数量
  const handleUpdateNodeCount = (zoneId: string, delta: number) => {
    setZoneAllocations(
      zoneAllocations.map(zone => {
        if (zone.zoneId === zoneId) {
          const newCount = Math.max(1, Math.min(zone.availableNodes, zone.nodeCount + delta));
          return { ...zone, nodeCount: newCount };
        }
        return zone;
      })
    );
  };

  // 更新资源配置
  const handleUpdateResource = (
    zoneId: string,
    field: 'gpuPerNode' | 'cpuPerNode' | 'memoryPerNode',
    value: number
  ) => {
    setZoneAllocations(
      zoneAllocations.map(zone => {
        if (zone.zoneId === zoneId) {
          return { ...zone, [field]: value };
        }
        return zone;
      })
    );
  };

  // 计算总资源
  const getTotalResources = () => {
    const totalNodes = zoneAllocations.reduce((sum, zone) => sum + zone.nodeCount, 0);
    const totalGPUs = zoneAllocations.reduce((sum, zone) => sum + zone.nodeCount * zone.gpuPerNode, 0);
    const totalCPUs = zoneAllocations.reduce((sum, zone) => sum + zone.nodeCount * zone.cpuPerNode, 0);
    const totalMemory = zoneAllocations.reduce((sum, zone) => sum + zone.nodeCount * zone.memoryPerNode, 0);

    return { totalNodes, totalGPUs, totalCPUs, totalMemory };
  };

  // 提交任务
  const handleSubmit = () => {
    if (!taskName.trim()) {
      toast.error('请输入任务名称');
      return;
    }

    if (zoneAllocations.length === 0) {
      toast.error('请至少添加一个可用区');
      return;
    }

    const config = {
      taskName,
      description,
      framework,
      distributionStrategy,
      zoneAllocations,
      totalResources: getTotalResources(),
      mode,
    };

    onConfirm?.(config);
    toast.success(`${mode === 'training' ? '训练任务' : '推理服务'}已创建`);
    onOpenChange(false);
    
    // 重置表单
    setTaskName('');
    setDescription('');
    setZoneAllocations([]);
  };

  const totalResources = getTotalResources();
  const selectedZoneIds = zoneAllocations.map(z => z.zoneId);
  const unselectedZones = availableZones.filter(z => !selectedZoneIds.includes(z.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            {mode === 'training' ? '跨可用区分布式训练' : '跨可用区推理部署'}
          </DialogTitle>
          <DialogDescription>
            支持在多个可用区分配计算资源，实现跨地域的分布式计算
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div>
              <Label>任务名称 *</Label>
              <Input
                placeholder={mode === 'training' ? '例如：GPT大模型分布式训练' : '例如：全球推理服务'}
                value={taskName}
                onChange={e => setTaskName(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>任务描述</Label>
              <Textarea
                placeholder="描述任务的目标、数据集、预期效果等..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>框架选择</Label>
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pytorch">PyTorch</SelectItem>
                    <SelectItem value="tensorflow">TensorFlow</SelectItem>
                    <SelectItem value="mxnet">MXNet</SelectItem>
                    <SelectItem value="paddlepaddle">PaddlePaddle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>分布式策略</Label>
                <Select value={distributionStrategy} onValueChange={setDistributionStrategy}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ddp">数据并行（DDP）</SelectItem>
                    <SelectItem value="fsdp">全分片数据并行（FSDP）</SelectItem>
                    <SelectItem value="pipeline">流水线并行</SelectItem>
                    <SelectItem value="tensor">张量并行</SelectItem>
                    <SelectItem value="hybrid">混合并行</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 跨可用区资源配置说明 */}
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <Info className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-sm">
              <strong className="text-blue-900">🌐 跨可用区调度说明：</strong>
              <div className="mt-2 text-slate-700 space-y-1">
                <p>• <strong>高可用性</strong>：资源分散在多个可用区，单点故障不影响整体任务</p>
                <p>• <strong>就近调度</strong>：优先使用低延迟可用区，提升训练效率</p>
                <p>• <strong>弹性扩展</strong>：动态调整各可用区的资源分配</p>
                <p className="text-blue-700">
                  ⚡ <strong>建议</strong>：同一区域的可用区延迟更低（&lt;2ms），跨区域延迟较高（5-20ms）
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* 添加可用区 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              选择可用区
            </Label>
            <div className="flex gap-2">
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="选择要添加的可用区..." />
                </SelectTrigger>
                <SelectContent>
                  {unselectedZones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>
                      <div className="flex items-center gap-2">
                        <span>{zone.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {zone.availableNodes}节点
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            zone.latency < 2
                              ? 'text-green-600 border-green-300'
                              : zone.latency < 10
                              ? 'text-blue-600 border-blue-300'
                              : 'text-orange-600 border-orange-300'
                          }`}
                        >
                          {zone.latency}ms
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddZone} disabled={!selectedZone}>
                <Plus className="w-4 h-4 mr-2" />
                添加可用区
              </Button>
            </div>
          </div>

          {/* 已配置的可用区列表 */}
          {zoneAllocations.length > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                资源分配配置（已选择 {zoneAllocations.length} 个可用区）
              </Label>

              <div className="space-y-3">
                {zoneAllocations.map((zone, index) => {
                  const zoneInfo = availableZones.find(z => z.id === zone.zoneId);
                  return (
                    <Card key={zone.zoneId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div>
                              <CardTitle className="text-base">{zone.zoneName}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                {zoneInfo && (
                                  <>
                                    <Badge variant="outline" className="text-xs">
                                      <Activity className="w-3 h-3 mr-1" />
                                      {zoneInfo.latency}ms延迟
                                    </Badge>
                                    <Badge
                                      variant={zoneInfo.status === 'healthy' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {zoneInfo.status === 'healthy' ? '健康' : '降级'}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveZone(zone.zoneId)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 节点数量调整 */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">节点数量</Label>
                            <span className="text-xs text-slate-500">
                              可用: {zone.availableNodes} 节点
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateNodeCount(zone.zoneId, -1)}
                              disabled={zone.nodeCount <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="flex-1 text-center px-4 py-2 bg-slate-100 rounded-lg">
                              <span className="text-lg text-slate-900">{zone.nodeCount}</span>
                              <span className="text-sm text-slate-600 ml-1">节点</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateNodeCount(zone.zoneId, 1)}
                              disabled={zone.nodeCount >= zone.availableNodes}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* 单节点资源配置 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-slate-600">GPU/节点</Label>
                            <Select
                              value={String(zone.gpuPerNode)}
                              onValueChange={v =>
                                handleUpdateResource(zone.zoneId, 'gpuPerNode', Number(v))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 GPU</SelectItem>
                                <SelectItem value="2">2 GPU</SelectItem>
                                <SelectItem value="4">4 GPU</SelectItem>
                                <SelectItem value="8">8 GPU</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs text-slate-600">CPU核心/节点</Label>
                            <Select
                              value={String(zone.cpuPerNode)}
                              onValueChange={v =>
                                handleUpdateResource(zone.zoneId, 'cpuPerNode', Number(v))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="16">16 核</SelectItem>
                                <SelectItem value="32">32 核</SelectItem>
                                <SelectItem value="64">64 核</SelectItem>
                                <SelectItem value="128">128 核</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs text-slate-600">内存/节点</Label>
                            <Select
                              value={String(zone.memoryPerNode)}
                              onValueChange={v =>
                                handleUpdateResource(zone.zoneId, 'memoryPerNode', Number(v))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="64">64 GB</SelectItem>
                                <SelectItem value="128">128 GB</SelectItem>
                                <SelectItem value="256">256 GB</SelectItem>
                                <SelectItem value="512">512 GB</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* 该可用区汇总 */}
                        <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-slate-600">节点</p>
                            <p className="text-slate-900">{zone.nodeCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">GPU总数</p>
                            <p className="text-purple-600">
                              {zone.nodeCount * zone.gpuPerNode}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">CPU总数</p>
                            <p className="text-blue-600">{zone.nodeCount * zone.cpuPerNode} 核</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">内存总量</p>
                            <p className="text-green-600">
                              {zone.nodeCount * zone.memoryPerNode} GB
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 总资源统计 */}
          {zoneAllocations.length > 0 && (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Network className="w-5 h-5 text-purple-600" />
                  总资源统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <Server className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="text-2xl text-slate-900">{totalResources.totalNodes}</p>
                    <p className="text-sm text-slate-600">总节点数</p>
                  </div>
                  <div className="text-center">
                    <Cpu className="w-8 h-8 text-purple-600 mx-auto mb-2 opacity-50" />
                    <p className="text-2xl text-purple-600">{totalResources.totalGPUs}</p>
                    <p className="text-sm text-slate-600">GPU 总数</p>
                  </div>
                  <div className="text-center">
                    <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2 opacity-50" />
                    <p className="text-2xl text-blue-600">{totalResources.totalCPUs}</p>
                    <p className="text-sm text-slate-600">CPU 核心</p>
                  </div>
                  <div className="text-center">
                    <HardDrive className="w-8 h-8 text-green-600 mx-auto mb-2 opacity-50" />
                    <p className="text-2xl text-green-600">{totalResources.totalMemory}</p>
                    <p className="text-sm text-slate-600">内存 (GB)</p>
                  </div>
                </div>

                <Alert className="mt-4 bg-white/50">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    <strong>预计费用：</strong> ¥
                    {(totalResources.totalGPUs * 8.5 + totalResources.totalCPUs * 0.2).toFixed(2)} /
                    小时 （GPU: ¥{(totalResources.totalGPUs * 8.5).toFixed(2)}/h + CPU: ¥
                    {(totalResources.totalCPUs * 0.2).toFixed(2)}/h）
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={zoneAllocations.length === 0}>
            {mode === 'training' ? '启动分布式训练' : '部署推理服务'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}