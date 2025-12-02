import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Server,
  Search,
  Activity,
  Cpu,
  HardDrive,
  Thermometer,
  Circle,
  Layers,
  Network,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
  MoreVertical,
  Zap,
  CheckCircle2,
  Flame,
  Hexagon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { GpuNode, getGpuNodes, calculateUtilization } from '../../services/mockDataService';
import { toast } from 'sonner@2.0.3';
import NodeDetailDialog from '../NodeDetailDialog';
import NodeMonitoringDialog from '../NodeMonitoringDialog';
import EditNodeLabelsDialog from '../EditNodeLabelsDialog';

type ViewMode = 'card' | 'list';

export default function ComputeNodesPage() {
  const [nodes, setNodes] = useState<GpuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedNodeType, setSelectedNodeType] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  
  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [monitoringDialogOpen, setMonitoringDialogOpen] = useState(false);
  const [labelsDialogOpen, setLabelsDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GpuNode | null>(null);

  useEffect(() => {
    loadNodes();
  }, []);

  const loadNodes = async () => {
    setLoading(true);
    try {
      const data = await getGpuNodes();
      setNodes(data);
    } catch (error) {
      toast.error('加载节点数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取显卡厂商信息
  const getGpuVendor = (gpuModel: string): 'NVIDIA' | 'AMD' | 'Intel' | 'Huawei' | 'Other' => {
    const model = gpuModel.toUpperCase();
    if (model.includes('A100') || model.includes('V100') || model.includes('H100') || 
        model.includes('RTX') || model.includes('GTX') || model.includes('TESLA') || 
        model.includes('NVIDIA')) {
      return 'NVIDIA';
    } else if (model.includes('AMD') || model.includes('RADEON') || model.includes('MI100') || 
               model.includes('MI200') || model.includes('MI300')) {
      return 'AMD';
    } else if (model.includes('INTEL') || model.includes('ARC') || model.includes('XE')) {
      return 'Intel';
    } else if (model.includes('昇腾') || model.includes('ASCEND') || model.includes('HUAWEI')) {
      return 'Huawei';
    }
    return 'Other';
  };

  // 获取显卡厂商配置
  const getVendorConfig = (vendor: 'NVIDIA' | 'AMD' | 'Intel' | 'Huawei' | 'Other') => {
    const configs = {
      NVIDIA: {
        label: 'NVIDIA',
        color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
        icon: Zap,
        iconColor: 'text-emerald-600',
        bgGlow: 'shadow-emerald-500/20',
      },
      AMD: {
        label: 'AMD',
        color: 'bg-red-500/10 text-red-700 border-red-500/30',
        icon: Flame,
        iconColor: 'text-red-600',
        bgGlow: 'shadow-red-500/20',
      },
      Intel: {
        label: 'Intel',
        color: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
        icon: Cpu,
        iconColor: 'text-blue-600',
        bgGlow: 'shadow-blue-500/20',
      },
      Huawei: {
        label: '华为昇腾',
        color: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
        icon: Hexagon,
        iconColor: 'text-orange-600',
        bgGlow: 'shadow-orange-500/20',
      },
      Other: {
        label: 'Other',
        color: 'bg-slate-500/10 text-slate-700 border-slate-500/30',
        icon: Server,
        iconColor: 'text-slate-600',
        bgGlow: 'shadow-slate-500/20',
      },
    };
    return configs[vendor];
  };

  // 获取节点架构信息
  const getArchitecture = (gpuModel: string): 'x86_64' | 'ARM' | 'unknown' => {
    // 根据GPU型号推断架构（实际应从节点数据获取）
    if (gpuModel.includes('A100') || gpuModel.includes('V100') || gpuModel.includes('RTX')) {
      return 'x86_64';
    } else if (gpuModel.includes('昇腾')) {
      return 'ARM';
    }
    return 'x86_64'; // 默认
  };

  // 获取架构配置
  const getArchConfig = (arch: 'x86_64' | 'ARM' | 'unknown') => {
    const configs = {
      x86_64: {
        label: 'x86_64',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Cpu,
      },
      ARM: {
        label: 'ARM64',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Zap,
      },
      unknown: {
        label: 'Unknown',
        color: 'bg-gray-50 text-gray-600 border-gray-200',
        icon: Cpu,
      },
    };
    return configs[arch];
  };

  // 获取状态配置 - 更丰富的颜色体系
  const getStatusConfig = (status: GpuNode['status']) => {
    const configs = {
      ready: {
        label: '就绪',
        color: 'bg-sky-50 text-sky-700 border-sky-200',
        cardBorder: 'border-l-sky-500',
        cardBg: 'bg-gradient-to-br from-sky-50 to-blue-50',
        icon: CheckCircle2,
        iconColor: 'text-sky-600',
      },
      idle: {
        label: '空闲中',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        cardBorder: 'border-l-emerald-500',
        cardBg: 'bg-gradient-to-br from-emerald-50 to-green-50',
        icon: Circle,
        iconColor: 'text-emerald-600',
      },
      'in-use': {
        label: '使用中',
        color: 'bg-violet-50 text-violet-700 border-violet-200',
        cardBorder: 'border-l-violet-500',
        cardBg: 'bg-gradient-to-br from-violet-50 to-purple-50',
        icon: Zap,
        iconColor: 'text-violet-600',
      },
      maintenance: {
        label: '维护中',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        cardBorder: 'border-l-amber-500',
        cardBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
        icon: AlertCircle,
        iconColor: 'text-amber-600',
      },
      offline: {
        label: '离线',
        color: 'bg-slate-50 text-slate-600 border-slate-200',
        cardBorder: 'border-l-slate-400',
        cardBg: 'bg-gradient-to-br from-slate-50 to-gray-50',
        icon: Circle,
        iconColor: 'text-slate-400',
      },
    };
    return configs[status];
  };

  // 获取节点类型配置
  const getNodeTypeConfig = (nodeType: GpuNode['nodeType']) => {
    return nodeType === 'dedicated'
      ? { label: '整卡独占', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      : { label: '共享切分', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
  };

  // 获取健康状态配置
  const getHealthConfig = (health: GpuNode['health']) => {
    const configs = {
      healthy: { color: 'text-emerald-600', label: '健康', icon: CheckCircle2 },
      warning: { color: 'text-amber-600', label: '告警', icon: AlertCircle },
      critical: { color: 'text-red-600', label: '异常', icon: AlertCircle },
    };
    return configs[health];
  };

  // 获取温度颜色
  const getTemperatureColor = (temp?: number) => {
    if (!temp) return 'text-slate-400';
    if (temp < 60) return 'text-emerald-600';
    if (temp < 75) return 'text-amber-600';
    return 'text-red-600';
  };

  // 筛选节点
  const filteredNodes = nodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.ipAddress.includes(searchTerm) ||
      node.gpuModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster = selectedCluster === 'all' || node.clusterId === selectedCluster;
    const matchesStatus = selectedStatus === 'all' || node.status === selectedStatus;
    const matchesNodeType = selectedNodeType === 'all' || node.nodeType === selectedNodeType;
    return matchesSearch && matchesCluster && matchesStatus && matchesNodeType;
  });

  // 统计数据
  const stats = {
    total: nodes.length,
    ready: nodes.filter((n) => n.status === 'ready').length,
    idle: nodes.filter((n) => n.status === 'idle').length,
    inUse: nodes.filter((n) => n.status === 'in-use').length,
    maintenance: nodes.filter((n) => n.status === 'maintenance').length,
    offline: nodes.filter((n) => n.status === 'offline').length,
    dedicated: nodes.filter((n) => n.nodeType === 'dedicated').length,
    shared: nodes.filter((n) => n.nodeType === 'shared').length,
  };

  // 获取唯一的集群列表
  const clusters = Array.from(new Set(nodes.map((n) => ({ id: n.clusterId, name: n.clusterName }))))
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2">计算节点管理</h1>
        <p className="text-slate-600">管理和监控集群中的所有计算节点，支持整卡独占和共享切分模式</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">总节点</p>
                <p className="text-2xl">{stats.total}</p>
              </div>
              <Server className="w-8 h-8 text-slate-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-violet-500 bg-gradient-to-br from-violet-50/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">使用中</p>
                <p className="text-2xl text-violet-600">{stats.inUse}</p>
              </div>
              <Zap className="w-8 h-8 text-violet-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">空闲中</p>
                <p className="text-2xl text-emerald-600">{stats.idle}</p>
              </div>
              <Circle className="w-8 h-8 text-emerald-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">就绪</p>
                <p className="text-2xl text-sky-600">{stats.ready}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-sky-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">维护中</p>
                <p className="text-2xl text-amber-600">{stats.maintenance}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">离线</p>
                <p className="text-2xl text-slate-600">{stats.offline}</p>
              </div>
              <Circle className="w-8 h-8 text-slate-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和视图切换 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索节点名称、IP地址、GPU型号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCluster} onValueChange={setSelectedCluster}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="选择集群" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部集群</SelectItem>
                {clusters.map((cluster) => (
                  <SelectItem key={cluster.id} value={cluster.id}>
                    {cluster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="节点状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="ready">就绪</SelectItem>
                <SelectItem value="idle">空闲中</SelectItem>
                <SelectItem value="in-use">使用中</SelectItem>
                <SelectItem value="maintenance">维护中</SelectItem>
                <SelectItem value="offline">离线</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedNodeType} onValueChange={setSelectedNodeType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="节点类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="dedicated">整卡独占</SelectItem>
                <SelectItem value="shared">共享切分</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="card" className="gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  卡片
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  列表
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* 内容区域 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">载中...</p>
        </div>
      ) : filteredNodes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">未找到符合条件的节点</p>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        // 卡片视图 - 优化后
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNodes.map((node) => {
            const statusConfig = getStatusConfig(node.status);
            const nodeTypeConfig = getNodeTypeConfig(node.nodeType);
            const healthConfig = getHealthConfig(node.health);
            const architecture = getArchitecture(node.gpuModel);
            const archConfig = getArchConfig(architecture);
            const gpuVendor = getGpuVendor(node.gpuModel);
            const vendorConfig = getVendorConfig(gpuVendor);

            return (
              <Card 
                key={node.id} 
                className="hover:shadow-lg transition-all overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* 节点名称 - 更突出 */}
                      <CardTitle className="text-lg mb-3 truncate flex items-center gap-2">
                        <Server className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        {node.name}
                      </CardTitle>
                      
                      {/* 状态徽章 - 第一行 */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`${statusConfig.color} shadow-sm`} variant="outline">
                          <statusConfig.icon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Badge className={`${nodeTypeConfig.color} shadow-sm`} variant="outline">
                          <Layers className="w-3 h-3 mr-1" />
                          {nodeTypeConfig.label}
                        </Badge>
                      </div>

                      {/* GPU和架构 - 第二行，更突出 */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-slate-900 text-white font-medium">
                          {node.gpuModel}
                        </Badge>
                        <Badge className={`${archConfig.color} shadow-sm`} variant="outline">
                          <archConfig.icon className="w-3 h-3 mr-1" />
                          {archConfig.label}
                        </Badge>
                        <Badge className={`${vendorConfig.color} shadow-sm`} variant="outline">
                          <vendorConfig.icon className="w-3 h-3 mr-1" />
                          {vendorConfig.label}
                        </Badge>
                      </div>
                      
                      {/* 网络信息 */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Network className="w-3.5 h-3.5" />
                          <span className="font-mono">{node.ipAddress}</span>
                        </div>
                        <span className="text-slate-400">•</span>
                        <div className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          {node.clusterName}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedNode(node);
                            setDetailDialogOpen(true);
                          }}
                        >
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedNode(node);
                            setMonitoringDialogOpen(true);
                          }}
                        >
                          查看监控
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>设置维护模式</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedNode(node);
                            setLabelsDialogOpen(true);
                          }}
                        >
                          编辑标签
                        </DropdownMenuItem>
                        {node.status === 'offline' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">移除节点</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 健康状态和温度 - 更突出 */}
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                    <div className={`flex items-center gap-2 ${healthConfig.color}`}>
                      <healthConfig.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{healthConfig.label}</span>
                    </div>
                    {node.temperature !== undefined && node.temperature > 0 && (
                      <div className={`flex items-center gap-1.5 ${getTemperatureColor(node.temperature)}`}>
                        <Thermometer className="w-4 h-4" />
                        <span className="text-sm font-medium">{node.temperature}°C</span>
                      </div>
                    )}
                  </div>

                  {/* 资源监控 */}
                  <div className="space-y-3">
                    {/* GPU 使用详情 */}
                    {node.gpuCards && node.gpuCards.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-sm text-slate-700 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-purple-600" />
                            计算卡监控
                          </span>
                          <span className="text-xs text-slate-500">
                            {node.gpuUsed}/{node.gpuCount} 张使用中
                          </span>
                        </div>
                        <div className="space-y-2 p-3 bg-gradient-to-br from-purple-50/50 to-white rounded-lg border border-purple-200/50">
                          {node.gpuCards.map((gpu) => {
                            const utilizationPercent = gpu.utilization;
                            const memoryPercent = (gpu.memoryUsed / gpu.memoryTotal) * 100;
                            const isInUse = gpu.status === 'in-use';
                            
                            return (
                              <div key={gpu.id} className="space-y-1.5">
                                {/* GPU 卡头部 */}
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700">GPU {gpu.index}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs h-5 ${
                                        gpu.status === 'idle' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        gpu.status === 'in-use' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        'bg-red-50 text-red-700 border-red-200'
                                      }`}
                                    >
                                      {gpu.status === 'idle' ? '空闲' : gpu.status === 'in-use' ? '使用中' : '异常'}
                                    </Badge>
                                    {isInUse && gpu.allocatedTo && (
                                      <span className="text-slate-500">
                                        {gpu.allocatedTo.userName}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-slate-600">
                                    <div className={`flex items-center gap-1 ${getTemperatureColor(gpu.temperature)}`}>
                                      <Thermometer className="w-3 h-3" />
                                      <span>{gpu.temperature}°C</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Zap className="w-3 h-3" />
                                      <span>{gpu.powerUsage}W</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* GPU 利用率 */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">计算利用率</span>
                                    <span className="font-medium text-slate-700">{utilizationPercent}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${
                                        utilizationPercent > 80 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                                        utilizationPercent > 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                        'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                      }`}
                                      style={{ width: `${utilizationPercent}%` }}
                                    />
                                  </div>
                                </div>
                                
                                {/* 显存使用 */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">显存使用</span>
                                    <span className="font-medium text-slate-700">
                                      {(gpu.memoryUsed / 1024).toFixed(1)}GB / {(gpu.memoryTotal / 1024).toFixed(1)}GB
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${
                                        memoryPercent > 80 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                        memoryPercent > 50 ? 'bg-gradient-to-r from-sky-500 to-sky-600' :
                                        'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                      }`}
                                      style={{ width: `${memoryPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : node.nodeType === 'shared' && node.gpuPartitions ? (
                      /* 共享模式 - GPU 分区 */
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-sm text-slate-700 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-purple-600" />
                            GPU 分区
                          </span>
                          <span className="text-xs text-slate-500">
                            {node.gpuPartitions.allocated}/{node.gpuPartitions.total} 分区使用中
                          </span>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-50/50 to-white rounded-lg border border-purple-200/50">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">分区使用情况</span>
                              <span className="font-medium text-slate-700">
                                {((node.gpuPartitions.allocated / node.gpuPartitions.total) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                                style={{ width: `${(node.gpuPartitions.allocated / node.gpuPartitions.total) * 100}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                              <span>已分配: {node.gpuPartitions.allocated}</span>
                              <span>空闲: {node.gpuPartitions.free}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 简化的 GPU 显示 */
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-sm text-slate-700 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-purple-600" />
                            GPU 使用
                          </span>
                          <span className="text-xs text-slate-500">
                            {node.gpuUsed}/{node.gpuCount} 张
                          </span>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-50/50 to-white rounded-lg border border-purple-200/50">
                          <div className="space-y-1">
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                                style={{ width: `${(node.gpuUsed / node.gpuCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CPU & 内存 */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* CPU */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 px-1">
                          <Cpu className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs text-slate-700">CPU</span>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-blue-50/50 to-white rounded-lg border border-blue-200/50">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">使用</span>
                              <span className="font-medium text-slate-700">{node.cpuUsed}/{node.cpuCores} 核</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                                style={{ width: `${(node.cpuUsed / node.cpuCores) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 内存 */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 px-1">
                          <Activity className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs text-slate-700">内存</span>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-emerald-50/50 to-white rounded-lg border border-emerald-200/50">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">使用</span>
                              <span className="font-medium text-slate-700">{node.memoryUsed}/{node.memoryGB} GB</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                                style={{ width: `${(node.memoryUsed / node.memoryGB) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 存储 */}
                    {(node.systemDisk || node.dataDisk) && (
                      <div className="grid grid-cols-2 gap-3">
                        {node.systemDisk && (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 px-1">
                              <HardDrive className="w-3.5 h-3.5 text-sky-600" />
                              <span className="text-xs text-slate-700">系统盘</span>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-sky-50/50 to-white rounded-lg border border-sky-200/50">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600">{node.systemDisk.usagePercent}%</span>
                                  <span className="font-medium text-slate-700">{node.systemDisk.used}/{node.systemDisk.total}GB</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      node.systemDisk.usagePercent > 85 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                      node.systemDisk.usagePercent > 70 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                      'bg-gradient-to-r from-sky-500 to-sky-600'
                                    }`}
                                    style={{ width: `${node.systemDisk.usagePercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {node.dataDisk && (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 px-1">
                              <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="text-xs text-slate-700">数据盘</span>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-indigo-50/50 to-white rounded-lg border border-indigo-200/50">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600">{node.dataDisk.usagePercent}%</span>
                                  <span className="font-medium text-slate-700">{node.dataDisk.used}/{node.dataDisk.total}GB</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      node.dataDisk.usagePercent > 85 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                      node.dataDisk.usagePercent > 70 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                      'bg-gradient-to-r from-indigo-500 to-indigo-600'
                                    }`}
                                    style={{ width: `${node.dataDisk.usagePercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 详细信息 - 网格布局 */}
                  <div className="grid grid-cols-2 gap-3 text-sm p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-600">CPU: </span>
                        <span className="font-medium">
                          {node.cpuUsed}/{node.cpuCores}核
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-600">内存: </span>
                        <span className="font-medium">
                          {node.memoryUsed}/{node.memoryGB}GB
                        </span>
                      </div>
                    </div>
                    {node.systemDisk && (
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        <div>
                          <span className="text-slate-600">系统盘: </span>
                          <span className={`font-medium ${node.systemDisk.usagePercent > 85 ? 'text-red-600' : node.systemDisk.usagePercent > 70 ? 'text-amber-600' : ''}`}>
                            {node.systemDisk.usagePercent}%
                          </span>
                          <span className="text-xs text-slate-500 ml-1">
                            ({node.systemDisk.used}GB/{node.systemDisk.total}GB)
                          </span>
                        </div>
                      </div>
                    )}
                    {node.dataDisk && (
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-purple-400" />
                        <div>
                          <span className="text-slate-600">数据盘: </span>
                          <span className={`font-medium ${node.dataDisk.usagePercent > 85 ? 'text-red-600' : node.dataDisk.usagePercent > 70 ? 'text-amber-600' : ''}`}>
                            {node.dataDisk.usagePercent}%
                          </span>
                          <span className="text-xs text-slate-500 ml-1">
                            ({node.dataDisk.used}GB/{node.dataDisk.total}GB)
                          </span>
                        </div>
                      </div>
                    )}
                    {node.nodeType === 'shared' && node.gpuPartitions && (
                      <div className="col-span-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-slate-600">GPU分区: </span>
                          <span className="font-medium">
                            {node.gpuPartitions.allocated}/{node.gpuPartitions.total}
                          </span>
                          <span className="text-emerald-600 ml-2">
                            (空闲 {node.gpuPartitions.free})
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="col-span-2 flex items-center gap-2 pt-2 border-t">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-600">运行时间: </span>
                        <span className="font-medium">{node.uptime}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // 列表视图保持不变
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>节点信息</TableHead>
                  <TableHead>显卡厂商</TableHead>
                  <TableHead>架构</TableHead>
                  <TableHead>集群</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>GPU使用</TableHead>
                  <TableHead>CPU使用</TableHead>
                  <TableHead>内存使用</TableHead>
                  <TableHead>系统盘</TableHead>
                  <TableHead>数据盘</TableHead>
                  <TableHead>健康状态</TableHead>
                  <TableHead>运行时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNodes.map((node) => {
                  const statusConfig = getStatusConfig(node.status);
                  const nodeTypeConfig = getNodeTypeConfig(node.nodeType);
                  const healthConfig = getHealthConfig(node.health);
                  const architecture = getArchitecture(node.gpuModel);
                  const archConfig = getArchConfig(architecture);
                  const gpuVendor = getGpuVendor(node.gpuModel);
                  const vendorConfig = getVendorConfig(gpuVendor);

                  return (
                    <TableRow key={node.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{node.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-600 font-mono">{node.ipAddress}</p>
                            <Badge variant="secondary" className="text-xs bg-slate-900 text-white">
                              {node.gpuModel}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={vendorConfig.color} variant="outline">
                          <vendorConfig.icon className="w-3 h-3 mr-1" />
                          {vendorConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={archConfig.color} variant="outline">
                          <archConfig.icon className="w-3 h-3 mr-1" />
                          {archConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {node.clusterName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color} variant="outline">
                          <statusConfig.icon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={nodeTypeConfig.color} variant="outline">
                          {nodeTypeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {node.nodeType === 'dedicated' ? (
                          <span>
                            {node.gpuUsed}/{node.gpuCount}
                          </span>
                        ) : (
                          <span>
                            {node.gpuPartitions?.allocated || 0}/{node.gpuPartitions?.total || 0}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {node.cpuUsed}/{node.cpuCores}核
                      </TableCell>
                      <TableCell>
                        {node.memoryUsed}/{node.memoryGB}GB
                      </TableCell>
                      <TableCell>
                        {node.systemDisk ? (
                          <div className="flex flex-col">
                            <span className={`font-medium ${node.systemDisk.usagePercent > 85 ? 'text-red-600' : node.systemDisk.usagePercent > 70 ? 'text-amber-600' : ''}`}>
                              {node.systemDisk.usagePercent}%
                            </span>
                            <span className="text-xs text-slate-500">
                              {node.systemDisk.used}/{node.systemDisk.total}GB
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {node.dataDisk ? (
                          <div className="flex flex-col">
                            <span className={`font-medium ${node.dataDisk.usagePercent > 85 ? 'text-red-600' : node.dataDisk.usagePercent > 70 ? 'text-amber-600' : ''}`}>
                              {node.dataDisk.usagePercent}%
                            </span>
                            <span className="text-xs text-slate-500">
                              {node.dataDisk.used}/{node.dataDisk.total}GB
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${healthConfig.color}`}>
                          <healthConfig.icon className="w-3 h-3" />
                          {healthConfig.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{node.uptime}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedNode(node);
                                setDetailDialogOpen(true);
                              }}
                            >
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedNode(node);
                                setMonitoringDialogOpen(true);
                              }}
                            >
                              查看监控
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>设置维护模式</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedNode(node);
                                setLabelsDialogOpen(true);
                              }}
                            >
                              编辑标签
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {selectedNode && (
        <>
          <NodeDetailDialog
            nodeId={selectedNode.id}
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
          />
          <NodeMonitoringDialog
            open={monitoringDialogOpen}
            onOpenChange={setMonitoringDialogOpen}
            node={selectedNode}
          />
          <EditNodeLabelsDialog
            open={labelsDialogOpen}
            onOpenChange={setLabelsDialogOpen}
            node={selectedNode}
            onSave={(labels) => {
              toast.success('标签已更新');
              setLabelsDialogOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}