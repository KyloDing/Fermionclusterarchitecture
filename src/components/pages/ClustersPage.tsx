import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import {
  Plus,
  Search,
  MapPin,
  Server,
  Cpu,
  HardDrive,
  Network,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreVertical,
  Eye,
  Settings,
  Upload,
  Loader2,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  Activity,
  TrendingUp,
  BarChart3,
  Zap,
  Clock,
  ChevronRight,
  Layers,
  LineChart as LineChartIcon,
  FileText,
  Download,
  Edit,
  Pause,
  Play,
  Shield,
  Trash2,
  Info,
  ScrollText,
  Microchip,
  MemoryStick,
  Database,
  Workflow,
  Container,
  Boxes,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts@2.15.2';

interface Node {
  name: string;
  ip: string;
  gpuModel: string;
  gpuCount: number;
  cpuCores: number;
  memory: number;
  verified: boolean;
  verifying: boolean;
  verifyStatus: 'pending' | 'success' | 'failed';
  verifyMessage?: string;
  selected: boolean;
  status?: 'running' | 'warning' | 'offline';
  gpuUsed?: number;
  cpuUsed?: number;
  memoryUsed?: number;
  diskUsed?: number;
  diskTotal?: number;
  uptime?: string;
  // 架构信息
  architecture?: {
    gpu?: {
      architecture: string; // 如 Ampere, Hopper, Ada Lovelace
      computeCapability: string; // 如 8.0, 9.0
      cudaVersion: string;
      driverVersion: string;
      vramPerGpu: number; // GB
      nvlinkEnabled: boolean;
    };
    cpu?: {
      model: string;
      architecture: string; // x86_64, ARM64
      sockets: number;
      coresPerSocket: number;
      threadsPerCore: number;
      l3Cache: number; // MB
      frequency: number; // GHz
    };
    memory?: {
      type: string; // DDR4, DDR5
      speed: number; // MHz
      channels: number;
      bandwidth: number; // GB/s
    };
    storage?: {
      type: string; // NVMe SSD, SATA SSD
      capacity: number; // GB
      readSpeed: number; // MB/s
      writeSpeed: number; // MB/s
    };
    network?: {
      type: string; // InfiniBand, Ethernet
      speed: number; // Gbps
      topology: string;
    };
    container?: {
      runtime: string; // Docker, containerd
      runtimeVersion: string;
      kubernetesVersion: string;
    };
  };
}

export default function ClustersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // 创建集群向导状态
  const [createStep, setCreateStep] = useState(1);
  const [kubeconfigContent, setKubeconfigContent] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [clusterInfo, setClusterInfo] = useState<any>(null);
  const [discoveredNodes, setDiscoveredNodes] = useState<Node[]>([]);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);

  // 节点同步对话框状态
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [syncClusterId, setSyncClusterId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedNodes, setSyncedNodes] = useState<Node[]>([]);

  // 查看节点对话框状态
  const [isViewNodesDialogOpen, setIsViewNodesDialogOpen] = useState(false);
  const [viewNodesClusterId, setViewNodesClusterId] = useState<string | null>(null);
  const [nodeSearchTerm, setNodeSearchTerm] = useState('');

  // 监控面板对话框状态
  const [isMonitorDialogOpen, setIsMonitorDialogOpen] = useState(false);
  const [monitorClusterId, setMonitorClusterId] = useState<string | null>(null);

  // 集群操作对话框状态
  const [isClusterDetailDialogOpen, setIsClusterDetailDialogOpen] = useState(false);
  const [isEditClusterDialogOpen, setIsEditClusterDialogOpen] = useState(false);
  const [isExportConfigDialogOpen, setIsExportConfigDialogOpen] = useState(false);
  const [isEventLogDialogOpen, setIsEventLogDialogOpen] = useState(false);
  const [isHealthCheckDialogOpen, setIsHealthCheckDialogOpen] = useState(false);
  const [isUnmanageDialogOpen, setIsUnmanageDialogOpen] = useState(false);
  const [selectedOperationClusterId, setSelectedOperationClusterId] = useState<string | null>(null);
  const [clusterSchedulingPaused, setClusterSchedulingPaused] = useState<{ [key: string]: boolean }>({});

  // 节点详情对话框状态
  const [isNodeDetailDialogOpen, setIsNodeDetailDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const clusters = [
    {
      id: 'cluster-001',
      name: '北京可用区A',
      region: '华北',
      location: '北京',
      status: 'healthy',
      nodes: 24,
      gpus: { total: 192, used: 145, available: 47 },
      cpu: { total: 3072, used: 2156 },
      memory: { total: 12288, used: 8960 },
      storage: { total: 500, used: 378 },
      utilization: 75.5,
      latency: 3.2,
      uptime: '99.95%',
      createdAt: '2024-01-15',
      tags: ['生产环境', '高性能'],
      karmadaManaged: true,
    },
    {
      id: 'cluster-002',
      name: '上海可用区A',
      region: '华东',
      location: '上海',
      status: 'healthy',
      nodes: 16,
      gpus: { total: 128, used: 82, available: 46 },
      cpu: { total: 2048, used: 1380 },
      memory: { total: 8192, used: 5520 },
      storage: { total: 320, used: 215 },
      utilization: 64.1,
      latency: 4.5,
      uptime: '99.92%',
      createdAt: '2024-02-10',
      tags: ['生产环境'],
      karmadaManaged: true,
    },
    {
      id: 'cluster-003',
      name: '深圳可用区A',
      region: '华南',
      location: '深圳',
      status: 'warning',
      nodes: 12,
      gpus: { total: 96, used: 88, available: 8 },
      cpu: { total: 1536, used: 1420 },
      memory: { total: 6144, used: 5680 },
      storage: { total: 240, used: 210 },
      utilization: 91.7,
      latency: 5.8,
      uptime: '99.87%',
      createdAt: '2024-03-05',
      tags: ['生产环境', '高负载'],
      karmadaManaged: true,
    },
    {
      id: 'cluster-004',
      name: '成都可用区A',
      region: '西南',
      location: '成都',
      status: 'healthy',
      nodes: 8,
      gpus: { total: 64, used: 28, available: 36 },
      cpu: { total: 1024, used: 456 },
      memory: { total: 4096, used: 1820 },
      storage: { total: 160, used: 85 },
      utilization: 43.8,
      latency: 6.2,
      uptime: '99.90%',
      createdAt: '2024-04-20',
      tags: ['测试环境'],
      karmadaManaged: true,
    },
    {
      id: 'cluster-005',
      name: '杭州可用区B',
      region: '华东',
      location: '杭州',
      status: 'offline',
      nodes: 6,
      gpus: { total: 48, used: 0, available: 0 },
      cpu: { total: 768, used: 0 },
      memory: { total: 3072, used: 0 },
      storage: { total: 120, used: 0 },
      utilization: 0,
      latency: 0,
      uptime: '0%',
      createdAt: '2024-05-12',
      tags: ['维护中'],
      karmadaManaged: false,
    },
  ];

  const getStatusBadge = (status: string) => {
    const configs = {
      healthy: {
        label: '健康',
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle2,
      },
      warning: {
        label: '告警',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: AlertCircle,
      },
      offline: {
        label: '离线',
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
      },
    };
    const config = configs[status as keyof typeof configs] || configs.offline;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredClusters = clusters.filter(
    (cluster) =>
      cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: clusters.length,
    healthy: clusters.filter((c) => c.status === 'healthy').length,
    warning: clusters.filter((c) => c.status === 'warning').length,
    offline: clusters.filter((c) => c.status === 'offline').length,
    totalGpus: clusters.reduce((sum, c) => sum + c.gpus.total, 0),
    usedGpus: clusters.reduce((sum, c) => sum + c.gpus.used, 0),
    totalNodes: clusters.reduce((sum, c) => sum + c.nodes, 0),
  };

  // 模拟上传 kubeconfig 文件
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setKubeconfigContent(content);
      };
      reader.readAsText(file);
    }
  };

  // 验证 kubeconfig 和集群连接
  const handleVerifyKubeconfig = async () => {
    setIsVerifying(true);
    setVerifySuccess(false);
    
    // 模拟 API 调用验证 kubeconfig
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // 模拟验证成功，返回集群信息
    setClusterInfo({
      name: 'kubernetes-cluster-prod',
      version: 'v1.28.3',
      endpoint: 'https://192.168.1.100:6443',
      provider: 'Karmada',
      nodeCount: 6,
    });
    setVerifySuccess(true);
    setIsVerifying(false);
  };

  // 发现可纳管的节点
  const handleDiscoverNodes = async () => {
    setIsLoadingNodes(true);
    setCreateStep(3);
    
    // 模拟 API 调用获取节点列表
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const mockNodes: Node[] = [
      {
        name: 'gpu-node-01',
        ip: '192.168.1.101',
        gpuModel: 'NVIDIA A100',
        gpuCount: 8,
        cpuCores: 128,
        memory: 512,
        verified: false,
        verifying: false,
        verifyStatus: 'pending',
        selected: true,
      },
      {
        name: 'gpu-node-02',
        ip: '192.168.1.102',
        gpuModel: 'NVIDIA A100',
        gpuCount: 8,
        cpuCores: 128,
        memory: 512,
        verified: false,
        verifying: false,
        verifyStatus: 'pending',
        selected: true,
      },
      {
        name: 'gpu-node-03',
        ip: '192.168.1.103',
        gpuModel: 'NVIDIA V100',
        gpuCount: 4,
        cpuCores: 64,
        memory: 256,
        verified: false,
        verifying: false,
        verifyStatus: 'pending',
        selected: true,
      },
    ];
    
    setDiscoveredNodes(mockNodes);
    setIsLoadingNodes(false);
  };

  // 验证单个节点环境
  const handleVerifyNode = async (index: number) => {
    const newNodes = [...discoveredNodes];
    newNodes[index].verifying = true;
    setDiscoveredNodes(newNodes);

    // 模拟节点验证
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 随机成功或失败（实际应该根据真实验证结果）
    const success = Math.random() > 0.2;
    newNodes[index].verifying = false;
    newNodes[index].verified = true;
    newNodes[index].verifyStatus = success ? 'success' : 'failed';
    newNodes[index].verifyMessage = success
      ? '环境验证通过，GPU驱动、CUDA、容器运行时均正常'
      : 'GPU驱动版本不匹配，需要升级到 535.x 版本';
    setDiscoveredNodes(newNodes);
  };

  // 批量验证所有选中的节点
  const handleVerifyAllNodes = async () => {
    const selectedIndices = discoveredNodes
      .map((node, index) => (node.selected ? index : -1))
      .filter((index) => index !== -1);

    for (const index of selectedIndices) {
      await handleVerifyNode(index);
    }
  };

  // 完成集群创建
  const handleFinishCreate = () => {
    // 这里应该调用 API 将验证通过的节点同步到平台
    const verifiedNodes = discoveredNodes.filter(
      (node) => node.selected && node.verifyStatus === 'success'
    );
    
    console.log('同步节点到平台:', verifiedNodes);
    
    // 重置状态并关闭对话框
    resetCreateDialog();
    setIsCreateDialogOpen(false);
  };

  // 重置创建对话框状态
  const resetCreateDialog = () => {
    setCreateStep(1);
    setKubeconfigContent('');
    setVerifySuccess(false);
    setClusterInfo(null);
    setDiscoveredNodes([]);
  };

  const toggleNodeSelection = (index: number) => {
    const newNodes = [...discoveredNodes];
    newNodes[index].selected = !newNodes[index].selected;
    setDiscoveredNodes(newNodes);
  };

  const getNodeVerifyIcon = (node: Node) => {
    if (node.verifying) {
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    }
    if (node.verifyStatus === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    if (node.verifyStatus === 'failed') {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-slate-400" />;
  };

  // 同步节点 - 发现新节点
  const handleSyncNodes = async () => {
    setIsSyncing(true);
    
    // 模拟从集群同步新节点
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const newNodes: Node[] = [
      {
        name: 'gpu-node-07',
        ip: '192.168.1.107',
        gpuModel: 'NVIDIA H100',
        gpuCount: 8,
        cpuCores: 192,
        memory: 768,
        verified: false,
        verifying: false,
        verifyStatus: 'pending',
        selected: true,
        status: 'running',
        gpuUsed: 0,
        cpuUsed: 0,
        memoryUsed: 0,
        diskUsed: 100,
        diskTotal: 2000,
        uptime: '刚加入',
      },
      {
        name: 'gpu-node-08',
        ip: '192.168.1.108',
        gpuModel: 'NVIDIA H100',
        gpuCount: 8,
        cpuCores: 192,
        memory: 768,
        verified: false,
        verifying: false,
        verifyStatus: 'pending',
        selected: true,
        status: 'running',
        gpuUsed: 0,
        cpuUsed: 0,
        memoryUsed: 0,
        diskUsed: 100,
        diskTotal: 2000,
        uptime: '刚加入',
      },
    ];
    
    setSyncedNodes(newNodes);
    setIsSyncing(false);
  };

  // 切换同步节点选择
  const toggleSyncNodeSelection = (index: number) => {
    setSyncedNodes(
      syncedNodes.map((node, i) =>
        i === index ? { ...node, selected: !node.selected } : node
      )
    );
  };

  // 验证单个同步节点
  const handleVerifySyncNode = async (index: number) => {
    setSyncedNodes(
      syncedNodes.map((node, i) =>
        i === index ? { ...node, verifying: true, verifyStatus: 'pending' as const } : node
      )
    );

    // 模拟验证过程
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 模拟验证结果（随机成功或失败）
    const success = Math.random() > 0.2;

    setSyncedNodes(
      syncedNodes.map((node, i) =>
        i === index
          ? {
              ...node,
              verifying: false,
              verified: success,
              verifyStatus: success ? ('success' as const) : ('failed' as const),
              verifyMessage: success
                ? '节点环境验证通过，所有依赖项就绪'
                : 'GPU 驱动版本不匹配，需要升级到 CUDA 12.0+',
            }
          : node
      )
    );
  };

  // 批量验证所有选中的同步节点
  const handleVerifyAllSyncNodes = async () => {
    const selectedIndices = syncedNodes
      .map((node, index) => (node.selected ? index : -1))
      .filter((index) => index !== -1);

    for (const index of selectedIndices) {
      await handleVerifySyncNode(index);
    }
  };

  // 获取集群的节点列表（模拟数据）
  const getClusterNodes = (clusterId: string): Node[] => {
    const nodeMockData: { [key: string]: Node[] } = {
      'cluster-001': [
        {
          name: 'gpu-node-01',
          ip: '192.168.1.101',
          gpuModel: 'NVIDIA A100',
          gpuCount: 8,
          cpuCores: 128,
          memory: 512,
          verified: true,
          verifying: false,
          verifyStatus: 'success',
          selected: false,
          status: 'running',
          gpuUsed: 6,
          cpuUsed: 95,
          memoryUsed: 420,
          diskUsed: 800,
          diskTotal: 2000,
          uptime: '45天',
          architecture: {
            gpu: {
              architecture: 'Ampere',
              computeCapability: '8.0',
              cudaVersion: '12.2',
              driverVersion: '535.129.03',
              vramPerGpu: 80,
              nvlinkEnabled: true,
            },
            cpu: {
              model: 'AMD EPYC 7763',
              architecture: 'x86_64',
              sockets: 2,
              coresPerSocket: 64,
              threadsPerCore: 2,
              l3Cache: 256,
              frequency: 3.5,
            },
            memory: {
              type: 'DDR4',
              speed: 3200,
              channels: 16,
              bandwidth: 204.8,
            },
            storage: {
              type: 'NVMe SSD',
              capacity: 2000,
              readSpeed: 7000,
              writeSpeed: 5000,
            },
            network: {
              type: 'InfiniBand HDR',
              speed: 200,
              topology: 'Fat-Tree',
            },
            container: {
              runtime: 'containerd',
              runtimeVersion: '1.7.8',
              kubernetesVersion: 'v1.28.3',
            },
          },
        },
        {
          name: 'gpu-node-02',
          ip: '192.168.1.102',
          gpuModel: 'NVIDIA A100',
          gpuCount: 8,
          cpuCores: 128,
          memory: 512,
          verified: true,
          verifying: false,
          verifyStatus: 'success',
          selected: false,
          status: 'running',
          gpuUsed: 8,
          cpuUsed: 112,
          memoryUsed: 480,
          diskUsed: 1200,
          diskTotal: 2000,
          uptime: '45天',
          architecture: {
            gpu: {
              architecture: 'Ampere',
              computeCapability: '8.0',
              cudaVersion: '12.2',
              driverVersion: '535.129.03',
              vramPerGpu: 80,
              nvlinkEnabled: true,
            },
            cpu: {
              model: 'AMD EPYC 7763',
              architecture: 'x86_64',
              sockets: 2,
              coresPerSocket: 64,
              threadsPerCore: 2,
              l3Cache: 256,
              frequency: 3.5,
            },
            memory: {
              type: 'DDR4',
              speed: 3200,
              channels: 16,
              bandwidth: 204.8,
            },
            storage: {
              type: 'NVMe SSD',
              capacity: 2000,
              readSpeed: 7000,
              writeSpeed: 5000,
            },
            network: {
              type: 'InfiniBand HDR',
              speed: 200,
              topology: 'Fat-Tree',
            },
            container: {
              runtime: 'containerd',
              runtimeVersion: '1.7.8',
              kubernetesVersion: 'v1.28.3',
            },
          },
        },
        {
          name: 'gpu-node-03',
          ip: '192.168.1.103',
          gpuModel: 'NVIDIA V100',
          gpuCount: 4,
          cpuCores: 64,
          memory: 256,
          verified: true,
          verifying: false,
          verifyStatus: 'success',
          selected: false,
          status: 'warning',
          gpuUsed: 4,
          cpuUsed: 60,
          memoryUsed: 240,
          diskUsed: 1800,
          diskTotal: 2000,
          uptime: '38天',
          architecture: {
            gpu: {
              architecture: 'Volta',
              computeCapability: '7.0',
              cudaVersion: '11.8',
              driverVersion: '520.61.05',
              vramPerGpu: 32,
              nvlinkEnabled: true,
            },
            cpu: {
              model: 'Intel Xeon Gold 6248R',
              architecture: 'x86_64',
              sockets: 2,
              coresPerSocket: 32,
              threadsPerCore: 2,
              l3Cache: 35.75,
              frequency: 3.0,
            },
            memory: {
              type: 'DDR4',
              speed: 2933,
              channels: 12,
              bandwidth: 140.8,
            },
            storage: {
              type: 'NVMe SSD',
              capacity: 2000,
              readSpeed: 3500,
              writeSpeed: 3000,
            },
            network: {
              type: 'Ethernet',
              speed: 100,
              topology: 'Leaf-Spine',
            },
            container: {
              runtime: 'Docker',
              runtimeVersion: '24.0.7',
              kubernetesVersion: 'v1.27.8',
            },
          },
        },
      ],
    };
    return nodeMockData[clusterId] || [];
  };

  // 获取监控数据（模拟）
  const getMonitoringData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    return hours.map((hour, index) => ({
      time: hour,
      gpuUtil: 50 + Math.random() * 40,
      cpuUtil: 40 + Math.random() * 35,
      memoryUtil: 55 + Math.random() * 30,
      networkIn: 100 + Math.random() * 200,
      networkOut: 80 + Math.random() * 150,
    }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 mb-2">集群管理</h1>
          <p className="text-slate-600">基于 Karmada 管理多个可用区的计算集群</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetCreateDialog();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              纳管新集群
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[1920px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6 border-b">
              <DialogTitle className="text-2xl">纳管 Kubernetes 集群</DialogTitle>
              <DialogDescription className="text-base">
                通过 Karmada 将新的 Kubernetes 集群纳入费米平台统一管理
              </DialogDescription>
            </DialogHeader>

            {/* 步骤指示器 */}
            <div className="py-8">
              <div className="flex items-start justify-between relative">
                {/* 连接线 */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((createStep - 1) / 4) * 100}%` }}
                  />
                </div>

                {[
                  { step: 1, label: '上传配置', desc: 'Kubeconfig' },
                  { step: 2, label: '验证连接', desc: '集群连通性' },
                  { step: 3, label: '发现节点', desc: '获取节点列表' },
                  { step: 4, label: '环境验证', desc: '检查节点环境' },
                  { step: 5, label: '完成纳管', desc: '同步到平台' },
                ].map((item, index) => (
                  <div key={item.step} className="flex flex-col items-center flex-1 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        createStep >= item.step
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      } ${createStep === item.step ? 'ring-4 ring-blue-100' : ''}`}
                    >
                      {createStep > item.step ? <Check className="w-5 h-5" /> : item.step}
                    </div>
                    <div className="text-center mt-3">
                      <p
                        className={`text-sm font-medium ${
                          createStep >= item.step ? 'text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 步骤 1: 上传 kubeconfig */}
            {createStep === 1 && (
              <div className="space-y-6 py-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    请上传目标 Kubernetes 集群的 kubeconfig 文件。确保该文件具有集群管理权限，用于发现和纳管集群节点。
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="kubeconfig-upload" className="text-base">
                        上传 Kubeconfig 文件
                      </Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <Input
                          id="kubeconfig-upload"
                          type="file"
                          accept=".yaml,.yml,.conf"
                          onChange={handleFileUpload}
                          className="mb-3"
                        />
                        <p className="text-sm text-slate-600">
                          支持 .yaml、.yml、.conf 格式
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <h5 className="text-sm font-medium text-slate-900">注意事项</h5>
                      <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                        <li>确保 kubeconfig 具有集群管理员权限</li>
                        <li>文件中应包含 API Server 访问地址</li>
                        <li>需要包含有效的认证凭证</li>
                        <li>支持多集群配置文件</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="kubeconfig-content" className="text-base">
                      配置内容 {kubeconfigContent && <span className="text-green-600 text-sm ml-2">✓ 已加载</span>}
                    </Label>
                    <Textarea
                      id="kubeconfig-content"
                      value={kubeconfigContent}
                      onChange={(e) => setKubeconfigContent(e.target.value)}
                      placeholder="也可以直接粘贴 kubeconfig 内容到这里..."
                      rows={20}
                      className="font-mono text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    onClick={() => setIsCreateDialogOpen(false)}
                    variant="outline"
                    size="lg"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={() => setCreateStep(2)}
                    disabled={!kubeconfigContent}
                    size="lg"
                  >
                    下一步：验证连接
                  </Button>
                </div>
              </div>
            )}

            {/* 步骤 2: 验证集群连接 */}
            {createStep === 2 && (
              <div className="space-y-6 py-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    系统将验证 kubeconfig 配置的有效性，并测试与 Kubernetes API Server 的连接性
                  </AlertDescription>
                </Alert>

                {!verifySuccess && !isVerifying && (
                  <div className="p-12 border-2 border-dashed rounded-lg text-center bg-slate-50">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                      <Server className="w-10 h-10 text-blue-600" />
                    </div>
                    <h4 className="text-lg text-slate-900 mb-3">准备验证集群连接</h4>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      点击下方按钮开始验证，系统将检查配置文件的有效性并尝试连接到集群
                    </p>
                    <Button onClick={handleVerifyKubeconfig} size="lg">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      开始验证
                    </Button>
                  </div>
                )}

                {isVerifying && (
                  <div className="p-12 border rounded-lg text-center bg-blue-50">
                    <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
                    <h4 className="text-lg text-slate-900 mb-2">正在验证集群连接</h4>
                    <p className="text-slate-600 mb-4">正在连接到 Kubernetes API Server...</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span>验证配置有效性</span>
                    </div>
                  </div>
                )}

                {verifySuccess && clusterInfo && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg text-green-900 mb-2">集群连接验证成功</h4>
                          <p className="text-green-700">
                            已成功连接到 Kubernetes 集群，可以继续发现和纳管节点
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Card className="border-2">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-600" />
                            集群基本信息
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b">
                              <span className="text-sm text-slate-600">集群名称</span>
                              <span className="font-medium">{clusterInfo.name}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                              <span className="text-sm text-slate-600">Kubernetes 版本</span>
                              <Badge variant="secondary">{clusterInfo.version}</Badge>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                              <span className="text-sm text-slate-600">节点数量</span>
                              <span className="font-medium">{clusterInfo.nodeCount} 个</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-slate-600">管理方式</span>
                              <Badge className="bg-blue-600">{clusterInfo.provider}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Network className="w-5 h-5 text-purple-600" />
                            连接信息
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="py-2 border-b">
                              <span className="text-sm text-slate-600 block mb-1">API Endpoint</span>
                              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                                {clusterInfo.endpoint}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                              <span className="text-sm text-slate-600">连接状态</span>
                              <Badge className="bg-green-600">正常</Badge>
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-slate-600">认证方式</span>
                              <span className="text-sm font-medium">证书认证</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t">
                  <Button onClick={() => setCreateStep(1)} variant="outline" size="lg">
                    上一步
                  </Button>
                  <Button
                    onClick={handleDiscoverNodes}
                    disabled={!verifySuccess}
                    size="lg"
                  >
                    下一步：发现节点
                  </Button>
                </div>
              </div>
            )}

            {/* 步骤 3 & 4: 发现节点和环境验证 */}
            {(createStep === 3 || createStep === 4) && (
              <div className="space-y-6 py-6">
                {isLoadingNodes ? (
                  <div className="p-12 border rounded-lg text-center bg-blue-50">
                    <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
                    <h4 className="text-lg text-slate-900 mb-2">正在发现集群节点</h4>
                    <p className="text-slate-600">通过 Karmada 从集群获取可纳管的节点列表...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <Alert className="flex-1 mr-4 bg-blue-50 border-blue-200">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                          发现 <span className="font-medium">{discoveredNodes.length}</span> 个节点，
                          已选择 <span className="font-medium">{discoveredNodes.filter((n) => n.selected).length}</span> 个，
                          请对节点进行环境验证
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={handleVerifyAllNodes}
                        disabled={discoveredNodes.filter((n) => n.selected).length === 0}
                        size="lg"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        批量验证环境
                      </Button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {discoveredNodes.map((node, index) => (
                        <Card
                          key={index}
                          className={`transition-all ${
                            node.selected ? 'border-2 border-blue-400 shadow-md' : 'border-2 border-transparent'
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Checkbox
                                checked={node.selected}
                                onCheckedChange={() => toggleNodeSelection(index)}
                                className="mt-1.5 w-5 h-5"
                              />
                              
                              <div className="flex-1 min-w-0">
                                {/* 节点头部 */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h5 className="font-medium text-lg">{node.name}</h5>
                                      {getNodeVerifyIcon(node)}
                                      {node.verifyStatus === 'success' && (
                                        <Badge className="bg-green-600">已验证</Badge>
                                      )}
                                      {node.verifyStatus === 'failed' && (
                                        <Badge variant="destructive">验证失败</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-600 flex items-center gap-2">
                                      <Network className="w-4 h-4" />
                                      {node.ip}
                                    </p>
                                  </div>
                                  <Button
                                    variant={node.verified ? 'outline' : 'default'}
                                    size="lg"
                                    onClick={() => handleVerifyNode(index)}
                                    disabled={node.verifying || !node.selected}
                                  >
                                    {node.verifying ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        验证中...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {node.verified ? '重新验证' : '验证环境'}
                                      </>
                                    )}
                                  </Button>
                                </div>

                                {/* 资源信息 */}
                                <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                                  <div className="text-center">
                                    <Cpu className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                                    <p className="text-xs text-slate-600 mb-1">GPU型号</p>
                                    <p className="font-medium text-sm">{node.gpuModel}</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="w-5 h-5 mx-auto mb-2 text-orange-600 flex items-center justify-center">
                                      <span className="text-lg">×</span>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-1">GPU数量</p>
                                    <p className="font-medium text-sm">{node.gpuCount} 卡</p>
                                  </div>
                                  <div className="text-center">
                                    <Server className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                                    <p className="text-xs text-slate-600 mb-1">CPU核心</p>
                                    <p className="font-medium text-sm">{node.cpuCores} 核</p>
                                  </div>
                                  <div className="text-center">
                                    <HardDrive className="w-5 h-5 mx-auto mb-2 text-green-600" />
                                    <p className="text-xs text-slate-600 mb-1">内存</p>
                                    <p className="font-medium text-sm">{node.memory} GB</p>
                                  </div>
                                </div>

                                {/* 验证结果 */}
                                {node.verified && (
                                  <div
                                    className={`p-4 rounded-lg ${
                                      node.verifyStatus === 'success'
                                        ? 'bg-green-50 border-2 border-green-200'
                                        : 'bg-red-50 border-2 border-red-200'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      {node.verifyStatus === 'success' ? (
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                          <Check className="w-5 h-5 text-green-600" />
                                        </div>
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                          <X className="w-5 h-5 text-red-600" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <h6
                                          className={`font-medium mb-1 ${
                                            node.verifyStatus === 'success' ? 'text-green-900' : 'text-red-900'
                                          }`}
                                        >
                                          {node.verifyStatus === 'success' ? '环境验证通过' : '环境验证失败'}
                                        </h6>
                                        <p
                                          className={`text-sm ${
                                            node.verifyStatus === 'success' ? 'text-green-700' : 'text-red-700'
                                          }`}
                                        >
                                          {node.verifyMessage}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pt-6 border-t">
                  <Button onClick={() => setCreateStep(2)} variant="outline" size="lg">
                    上一步
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-600">
                      {discoveredNodes.filter((n) => n.selected && n.verifyStatus === 'success').length > 0 ? (
                        <span className="text-green-600 font-medium">
                          ✓ {discoveredNodes.filter((n) => n.selected && n.verifyStatus === 'success').length} 个节点验证通过
                        </span>
                      ) : (
                        <span>请至少验证通过一个节点</span>
                      )}
                    </div>
                    <Button
                      onClick={() => setCreateStep(5)}
                      disabled={
                        discoveredNodes.filter(
                          (n) => n.selected && n.verifyStatus === 'success'
                        ).length === 0
                      }
                      size="lg"
                    >
                      下一步：完成纳管
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤 5: 完成纳管 */}
            {createStep === 5 && (
              <div className="space-y-6 py-6">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl text-green-900 mb-2">环境验证完成</h4>
                      <p className="text-green-700">
                        所有选中的节点已通过环境验证，准备将节点信息同步到费米平台
                      </p>
                    </div>
                  </div>
                </div>

                {/* 纳管摘要 */}
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-2">
                    <CardHeader className="pb-4 bg-slate-50">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Server className="w-5 h-5 text-blue-600" />
                        集群信息
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b">
                          <span className="text-slate-600">集群名称</span>
                          <span className="font-medium">{clusterInfo?.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b">
                          <span className="text-slate-600">Kubernetes 版本</span>
                          <Badge variant="secondary" className="text-base">
                            {clusterInfo?.version}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b">
                          <span className="text-slate-600">API Endpoint</span>
                          <span className="text-xs font-mono">{clusterInfo?.endpoint}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-slate-600">管理方式</span>
                          <Badge className="bg-blue-600 text-base">{clusterInfo?.provider}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 资源统计 */}
                  <Card className="border-2">
                    <CardHeader className="pb-4 bg-slate-50">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-purple-600" />
                        资源统计
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <p className="text-3xl font-semibold text-blue-600 mb-1">
                            {discoveredNodes.filter((n) => n.selected && n.verifyStatus === 'success').length}
                          </p>
                          <p className="text-xs text-slate-600">纳管节点</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                          <p className="text-3xl font-semibold text-purple-600 mb-1">
                            {discoveredNodes
                              .filter((n) => n.selected && n.verifyStatus === 'success')
                              .reduce((sum, n) => sum + n.gpuCount, 0)}
                          </p>
                          <p className="text-xs text-slate-600">GPU卡数</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <p className="text-3xl font-semibold text-green-600 mb-1">
                            {discoveredNodes
                              .filter((n) => n.selected && n.verifyStatus === 'success')
                              .reduce((sum, n) => sum + n.cpuCores, 0)}
                          </p>
                          <p className="text-xs text-slate-600">CPU核心</p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-900">
                          <span className="font-medium">内存总量：</span>
                          {discoveredNodes
                            .filter((n) => n.selected && n.verifyStatus === 'success')
                            .reduce((sum, n) => sum + n.memory, 0)}{' '}
                          GB
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 节点列表 */}
                <Card className="border-2">
                  <CardHeader className="pb-4 bg-slate-50">
                    <CardTitle className="text-lg">将纳管以下节点</CardTitle>
                    <CardDescription>
                      共 {discoveredNodes.filter((n) => n.selected && n.verifyStatus === 'success').length} 个节点通过验证
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      {discoveredNodes
                        .filter((n) => n.selected && n.verifyStatus === 'success')
                        .map((node, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg"
                          >
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Check className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h6 className="font-medium">{node.name}</h6>
                                <Badge className="bg-green-600 text-xs">已验证</Badge>
                              </div>
                              <p className="text-xs text-slate-600 mb-2">{node.ip}</p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-slate-600">
                                  <span className="font-medium text-slate-900">{node.gpuCount}</span> × {node.gpuModel}
                                </span>
                                <span className="text-slate-400">|</span>
                                <span className="text-slate-600">
                                  <span className="font-medium text-slate-900">{node.cpuCores}</span> 核 CPU
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Alert className="bg-orange-50 border-orange-200">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-orange-900">
                    <strong>操作提醒：</strong>点击"完成纳管"后，系统将执行以下操作：
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>通过 Karmada 将节点信息同步到费米平台数据库</li>
                      <li>自动创建 GPU 资源池并关联节点</li>
                      <li>配置资源调度策略和容错机制</li>
                      <li>启动节点监控和健康检查</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between items-center pt-6 border-t">
                  <Button onClick={() => setCreateStep(4)} variant="outline" size="lg">
                    上一步
                  </Button>
                  <Button onClick={handleFinishCreate} size="lg" className="px-8">
                    <Check className="w-5 h-5 mr-2" />
                    完成纳管并同步
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">集群总数</p>
                <p className="text-2xl">{stats.total}</p>
                <p className="text-xs text-slate-500 mt-1">Karmada 管理</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">健康集群</p>
                <p className="text-2xl text-green-600">{stats.healthy}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总计算节点</p>
                <p className="text-2xl">{stats.totalNodes}</p>
              </div>
              <Server className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">GPU总数</p>
                <p className="text-2xl">{stats.totalGpus}</p>
                <p className="text-xs text-slate-500 mt-1">使用中: {stats.usedGpus}</p>
              </div>
              <Cpu className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索集群名称、区域或位置..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                  全部 ({clusters.length})
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                  华北
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                  华东
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                  华南
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">显示方式:</span>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                <TabsList>
                  <TabsTrigger value="grid">卡片</TabsTrigger>
                  <TabsTrigger value="list">列表</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cluster Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClusters.map((cluster) => (
            <Card key={cluster.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{cluster.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {cluster.region} · {cluster.location}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setViewNodesClusterId(cluster.id);
                            setIsViewNodesDialogOpen(true);
                          }}
                        >
                          <Layers className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>查看节点</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setMonitorClusterId(cluster.id);
                            setIsMonitorDialogOpen(true);
                          }}
                        >
                          <LineChartIcon className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>监控面板</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSyncClusterId(cluster.id);
                            setIsSyncDialogOpen(true);
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>同步节点</p>
                      </TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {/* 信息管理 */}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOperationClusterId(cluster.id);
                            setIsClusterDetailDialogOpen(true);
                          }}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOperationClusterId(cluster.id);
                            setIsEditClusterDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          编辑信息
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOperationClusterId(cluster.id);
                            setIsExportConfigDialogOpen(true);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          导出配置
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {/* 运维操作 */}
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          配置管理
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOperationClusterId(cluster.id);
                            setIsHealthCheckDialogOpen(true);
                          }}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          健康检查
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOperationClusterId(cluster.id);
                            setIsEventLogDialogOpen(true);
                          }}
                        >
                          <ScrollText className="w-4 h-4 mr-2" />
                          事件日志
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {/* 集群控制 */}
                        {clusterSchedulingPaused[cluster.id] ? (
                          <DropdownMenuItem
                            onClick={() => {
                              setClusterSchedulingPaused({
                                ...clusterSchedulingPaused,
                                [cluster.id]: false,
                              });
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            恢复调度
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setClusterSchedulingPaused({
                                ...clusterSchedulingPaused,
                                [cluster.id]: true,
                              });
                            }}
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            暂停调度
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        {/* 危险操作 */}
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setSelectedOperationClusterId(cluster.id);
                            setIsUnmanageDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          解除纳管
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(cluster.status)}
                  {cluster.karmadaManaged && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Karmada
                    </Badge>
                  )}
                  {cluster.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resource Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-600">节点</p>
                      <p className="text-sm">{cluster.nodes}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-600">GPU</p>
                      <p className="text-sm">{cluster.gpus.total}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-600">存储</p>
                      <p className="text-sm">{cluster.storage.total}TB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-600">延迟</p>
                      <p className="text-sm">{cluster.latency}ms</p>
                    </div>
                  </div>
                </div>

                {/* GPU Utilization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">GPU使用率</span>
                    <span className="font-medium">{cluster.utilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={cluster.utilization} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      使用: {cluster.gpus.used} / {cluster.gpus.total}
                    </span>
                    <span>空闲: {cluster.gpus.available}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="pt-3 border-t flex items-center justify-between text-xs">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                      <span className="text-slate-600">运行时长</span>
                      <p className="font-medium">{cluster.uptime}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">创建时间</span>
                      <p className="font-medium">{cluster.createdAt}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredClusters.map((cluster) => (
                <div key={cluster.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h4>{cluster.name}</h4>
                        {getStatusBadge(cluster.status)}
                        {cluster.karmadaManaged && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Karmada
                          </Badge>
                        )}
                        {cluster.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        {cluster.region} · {cluster.location}
                      </p>
                      <div className="grid grid-cols-6 gap-6 text-sm">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">节点数</p>
                          <p className="font-medium">{cluster.nodes}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">GPU总数</p>
                          <p className="font-medium">{cluster.gpus.total}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">GPU使用</p>
                          <p className="font-medium">{cluster.gpus.used}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">利用率</p>
                          <p className="font-medium">{cluster.utilization.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">延迟</p>
                          <p className="font-medium">{cluster.latency}ms</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">可用性</p>
                          <p className="font-medium">{cluster.uptime}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setViewNodesClusterId(cluster.id);
                              setIsViewNodesDialogOpen(true);
                            }}
                          >
                            <Layers className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>查看节点</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setMonitorClusterId(cluster.id);
                              setIsMonitorDialogOpen(true);
                            }}
                          >
                            <LineChartIcon className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>监控面板</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSyncClusterId(cluster.id);
                              setIsSyncDialogOpen(true);
                            }}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>同步节点</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 节点同步对话框 */}
      <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent className="max-w-[1920px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="text-2xl">同步集群节点</DialogTitle>
            <DialogDescription className="text-base">
              从 Kubernetes 集群同步新加入的节点到费米平台，需要先验证节点环境
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                系统将查询集群中新加入的节点，验证环境后将其信息同步到平台数据库中
              </AlertDescription>
            </Alert>

            {!isSyncing && syncedNodes.length === 0 && (
              <div className="p-12 border-2 border-dashed rounded-lg text-center bg-slate-50">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-lg text-slate-900 mb-3">发现新节点</h4>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  点击下方按钮开始发现，系统将从集群中查询新加入的节点
                </p>
                <Button onClick={handleSyncNodes} size="lg">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  开始发现节点
                </Button>
              </div>
            )}

            {isSyncing && (
              <div className="p-12 border rounded-lg text-center bg-blue-50">
                <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
                <h4 className="text-lg text-slate-900 mb-2">正在发现节点</h4>
                <p className="text-slate-600">正在从集群查询新加入的节点...</p>
              </div>
            )}

            {!isSyncing && syncedNodes.length > 0 && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl text-green-900 mb-2">
                          发现 {syncedNodes.length} 个新节点
                        </h4>
                        <p className="text-green-700">
                          以下节点已在 Kubernetes 集群中注册，请勾选需要同步的节点并验证环境
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleVerifyAllSyncNodes}
                      disabled={
                        !syncedNodes.some((n) => n.selected) ||
                        syncedNodes.some((n) => n.verifying)
                      }
                      size="lg"
                      className="ml-4"
                    >
                      {syncedNodes.some((n) => n.verifying) ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          验证中...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          批量验证
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {syncedNodes.map((node, index) => (
                    <Card
                      key={index}
                      className={`border-2 transition-all ${
                        node.verifyStatus === 'success'
                          ? 'border-green-300 bg-green-50/30'
                          : node.verifyStatus === 'failed'
                          ? 'border-red-300 bg-red-50/30'
                          : node.selected
                          ? 'border-blue-300'
                          : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* 选择框 */}
                          <Checkbox
                            checked={node.selected}
                            onCheckedChange={() => toggleSyncNodeSelection(index)}
                            className="mt-1.5 w-5 h-5"
                          />

                          <div className="flex-1 min-w-0">
                            {/* 节点头部 */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-medium text-lg">{node.name}</h5>
                                  {getNodeVerifyIcon(node)}
                                  {node.verifyStatus === 'success' && (
                                    <Badge className="bg-green-600">已验证</Badge>
                                  )}
                                  {node.verifyStatus === 'failed' && (
                                    <Badge variant="destructive">验证失败</Badge>
                                  )}
                                  {node.verifyStatus === 'pending' && (
                                    <Badge className="bg-blue-600">新节点</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 flex items-center gap-2">
                                  <Network className="w-4 h-4" />
                                  {node.ip}
                                </p>
                              </div>
                              <Button
                                variant={node.verified ? 'outline' : 'default'}
                                size="lg"
                                onClick={() => handleVerifySyncNode(index)}
                                disabled={node.verifying || !node.selected}
                              >
                                {node.verifying ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    验证中...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {node.verified ? '重新验证' : '验证环境'}
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* 资源信息 */}
                            <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                              <div className="text-center">
                                <Cpu className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                                <p className="text-xs text-slate-600 mb-1">GPU型号</p>
                                <p className="font-medium text-sm">{node.gpuModel}</p>
                              </div>
                              <div className="text-center">
                                <div className="w-5 h-5 mx-auto mb-2 text-orange-600 flex items-center justify-center">
                                  <span className="text-lg">×</span>
                                </div>
                                <p className="text-xs text-slate-600 mb-1">GPU数量</p>
                                <p className="font-medium text-sm">{node.gpuCount} 卡</p>
                              </div>
                              <div className="text-center">
                                <Server className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                                <p className="text-xs text-slate-600 mb-1">CPU核心</p>
                                <p className="font-medium text-sm">{node.cpuCores} 核</p>
                              </div>
                              <div className="text-center">
                                <HardDrive className="w-5 h-5 mx-auto mb-2 text-green-600" />
                                <p className="text-xs text-slate-600 mb-1">内存</p>
                                <p className="font-medium text-sm">{node.memory} GB</p>
                              </div>
                            </div>

                            {/* 验证状态信息 */}
                            {node.verifyStatus === 'success' && node.verifyMessage && (
                              <Alert className="bg-green-50 border-green-200">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <AlertDescription className="text-green-900">
                                  {node.verifyMessage}
                                </AlertDescription>
                              </Alert>
                            )}
                            {node.verifyStatus === 'failed' && node.verifyMessage && (
                              <Alert className="bg-red-50 border-red-200">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <AlertDescription className="text-red-900">
                                  {node.verifyMessage}
                                </AlertDescription>
                              </Alert>
                            )}
                            {node.verifying && (
                              <Alert className="bg-blue-50 border-blue-200">
                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                <AlertDescription className="text-blue-900">
                                  正在验证节点环境：检查 GPU 驱动、CUDA 环境、Docker 和 Kubernetes 配置...
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {syncedNodes.some((n) => n.verifyStatus === 'success') && (
                  <Alert className="bg-orange-50 border-orange-200">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <AlertDescription className="text-orange-900">
                      只有验证通过的节点会被同步到平台，并自动分配到对应的 GPU 资源池
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                onClick={() => {
                  setIsSyncDialogOpen(false);
                  setSyncedNodes([]);
                }}
                variant="outline"
                size="lg"
              >
                取消
              </Button>
              {syncedNodes.length > 0 && (
                <Button
                  onClick={() => {
                    setIsSyncDialogOpen(false);
                    setSyncedNodes([]);
                  }}
                  size="lg"
                  disabled={!syncedNodes.some((n) => n.verifyStatus === 'success')}
                >
                  <Check className="w-5 h-5 mr-2" />
                  确认同步 ({syncedNodes.filter((n) => n.verifyStatus === 'success').length} 个节点)
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看节点对话框 */}
      <Dialog open={isViewNodesDialogOpen} onOpenChange={setIsViewNodesDialogOpen}>
        <DialogContent className="max-w-[1920px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="text-2xl">集群节点管理</DialogTitle>
            <DialogDescription className="text-base">
              {viewNodesClusterId &&
                clusters.find((c) => c.id === viewNodesClusterId)?.name} - 查看和管理所有计算节点
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden py-6">
            {/* 搜索和筛选 */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索节点名称或 IP..."
                  value={nodeSearchTerm}
                  onChange={(e) => setNodeSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                  全部节点
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                  运行中
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                  告警
                </Badge>
                <Button
                  onClick={() => {
                    setSyncClusterId(viewNodesClusterId);
                    setIsViewNodesDialogOpen(false);
                    setIsSyncDialogOpen(true);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  同步新节点
                </Button>
              </div>
            </div>

            {/* 节点列表 */}
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pr-4">
                {viewNodesClusterId &&
                  getClusterNodes(viewNodesClusterId)
                    .filter(
                      (node) =>
                        node.name.toLowerCase().includes(nodeSearchTerm.toLowerCase()) ||
                        node.ip.includes(nodeSearchTerm)
                    )
                    .map((node, index) => (
                      <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* 节点头部 */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-medium text-lg">{node.name}</h5>
                                  {node.status === 'running' && (
                                    <Badge className="bg-green-600">运行中</Badge>
                                  )}
                                  {node.status === 'warning' && (
                                    <Badge className="bg-orange-600">告警</Badge>
                                  )}
                                  {node.status === 'offline' && (
                                    <Badge variant="destructive">离线</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 flex items-center gap-2">
                                  <Network className="w-4 h-4" />
                                  {node.ip}
                                </p>
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
                                      setIsNodeDetailDialogOpen(true);
                                    }}
                                  >
                                    <Info className="w-4 h-4 mr-2" />
                                    查看详情
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Activity className="w-4 h-4 mr-2" />
                                    查看监控
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    节点配置
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    移除节点
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* GPU 信息 */}
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Cpu className="w-5 h-5 text-purple-600" />
                                  <span className="font-medium">{node.gpuModel}</span>
                                </div>
                                <Badge variant="outline" className="bg-white">
                                  {node.gpuCount} 卡
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">GPU 使用</span>
                                  <span className="font-medium">
                                    {node.gpuUsed} / {node.gpuCount}
                                  </span>
                                </div>
                                <Progress
                                  value={(node.gpuUsed! / node.gpuCount) * 100}
                                  className="h-2"
                                />
                              </div>
                            </div>

                            {/* 资源信息 */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Server className="w-4 h-4 text-blue-600" />
                                  <p className="text-xs text-slate-600">CPU</p>
                                </div>
                                <p className="text-sm font-medium">
                                  {node.cpuUsed}/{node.cpuCores} 核
                                </p>
                                <Progress
                                  value={(node.cpuUsed! / node.cpuCores) * 100}
                                  className="h-1 mt-2"
                                />
                              </div>
                              <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <HardDrive className="w-4 h-4 text-green-600" />
                                  <p className="text-xs text-slate-600">内存</p>
                                </div>
                                <p className="text-sm font-medium">
                                  {node.memoryUsed}/{node.memory} GB
                                </p>
                                <Progress
                                  value={(node.memoryUsed! / node.memory) * 100}
                                  className="h-1 mt-2"
                                />
                              </div>
                              <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <HardDrive className="w-4 h-4 text-orange-600" />
                                  <p className="text-xs text-slate-600">磁盘</p>
                                </div>
                                <p className="text-sm font-medium">
                                  {node.diskUsed}/{node.diskTotal} GB
                                </p>
                                <Progress
                                  value={(node.diskUsed! / node.diskTotal!) * 100}
                                  className="h-1 mt-2"
                                />
                              </div>
                            </div>

                            {/* 架构信息 */}
                            {node.architecture && (
                              <div className="grid grid-cols-2 gap-3">
                                {node.architecture.gpu && (
                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Microchip className="w-4 h-4 text-purple-600" />
                                      <p className="text-xs font-medium text-purple-900">GPU 架构</p>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-1">
                                      {node.architecture.gpu.architecture} · CUDA {node.architecture.gpu.cudaVersion}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {node.architecture.gpu.vramPerGpu}GB VRAM/卡
                                    </p>
                                  </div>
                                )}
                                {node.architecture.cpu && (
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Server className="w-4 h-4 text-blue-600" />
                                      <p className="text-xs font-medium text-blue-900">CPU 架构</p>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-1">
                                      {node.architecture.cpu.architecture}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {node.architecture.cpu.model.split(' ').slice(0, 3).join(' ')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 底部信息 */}
                            <div className="flex items-center justify-between pt-3 border-t text-sm">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="w-4 h-4" />
                                <span>运行时长: {node.uptime}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedNode(node);
                                  setIsNodeDetailDialogOpen(true);
                                }}
                              >
                                <Info className="w-4 h-4 mr-1.5" />
                                查看详情
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={() => setIsViewNodesDialogOpen(false)} size="lg">
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 监控面板对话框 */}
      <Dialog open={isMonitorDialogOpen} onOpenChange={setIsMonitorDialogOpen}>
        <DialogContent className="max-w-[1920px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="text-2xl">集群监控面板</DialogTitle>
            <DialogDescription className="text-base">
              {monitorClusterId &&
                clusters.find((c) => c.id === monitorClusterId)?.name} - 实时资源使用情况
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 py-6">
            {isMonitorDialogOpen && <div className="space-y-6">
              {/* 关键指标卡片 */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-purple-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h6 className="text-sm text-slate-600 mb-1">GPU 利用率</h6>
                    <p className="text-3xl font-semibold mb-2">75.5%</p>
                    <p className="text-xs text-slate-500">过去1小时平均</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Server className="w-6 h-6 text-blue-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h6 className="text-sm text-slate-600 mb-1">CPU 利用率</h6>
                    <p className="text-3xl font-semibold mb-2">68.2%</p>
                    <p className="text-xs text-slate-500">过去1小时平均</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <HardDrive className="w-6 h-6 text-green-600" />
                      </div>
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <h6 className="text-sm text-slate-600 mb-1">内存使用</h6>
                    <p className="text-3xl font-semibold mb-2">72.9%</p>
                    <p className="text-xs text-slate-500">8960 / 12288 GB</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <Network className="w-6 h-6 text-orange-600" />
                      </div>
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <h6 className="text-sm text-slate-600 mb-1">网络吞吐</h6>
                    <p className="text-3xl font-semibold mb-2">2.4 GB/s</p>
                    <p className="text-xs text-slate-500">入站 + 出站流量</p>
                  </CardContent>
                </Card>
              </div>

              {/* GPU 利用率趋势 */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    GPU 利用率趋势
                  </CardTitle>
                  <CardDescription>过去 24 小时</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getMonitoringData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="gpuUtil"
                        stroke="#9333ea"
                        fill="#e9d5ff"
                        name="GPU 利用率 (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* CPU 和内存利用率 */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-blue-600" />
                      CPU 利用率
                    </CardTitle>
                    <CardDescription>过去 24 小时</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={getMonitoringData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line
                          type="monotone"
                          dataKey="cpuUtil"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="CPU 利用率 (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-green-600" />
                      内存利用率
                    </CardTitle>
                    <CardDescription>过去 24 小时</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={getMonitoringData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line
                          type="monotone"
                          dataKey="memoryUtil"
                          stroke="#22c55e"
                          strokeWidth={2}
                          name="内存利用率 (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* 网络流量 */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-orange-600" />
                    网络流��
                  </CardTitle>
                  <CardDescription>过去 24 小时 (MB/s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getMonitoringData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="networkIn" fill="#f97316" name="入站流量" />
                      <Bar dataKey="networkOut" fill="#fb923c" name="出站流量" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>}
          </ScrollArea>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={() => setIsMonitorDialogOpen(false)} size="lg">
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看集群详情对话框 */}
      <Dialog open={isClusterDetailDialogOpen} onOpenChange={setIsClusterDetailDialogOpen}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">集群详细信息</DialogTitle>
            <DialogDescription>
              {selectedOperationClusterId &&
                clusters.find((c) => c.id === selectedOperationClusterId)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            {selectedOperationClusterId && (() => {
              const cluster = clusters.find((c) => c.id === selectedOperationClusterId);
              if (!cluster) return null;
              
              return (
                <>
                  {/* 基本信息 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">基本信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">集群ID</p>
                          <p className="font-mono text-sm">{cluster.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">集群名称</p>
                          <p className="font-medium">{cluster.name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">区域</p>
                          <p>{cluster.region}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">位置</p>
                          <p>{cluster.location}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">创建时间</p>
                          <p>{cluster.createdAt}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">运行时长</p>
                          <p>{cluster.uptime}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 资源统计 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">资源统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b">
                            <span className="text-sm text-slate-600">计算节点</span>
                            <span className="font-medium">{cluster.nodes} 个</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b">
                            <span className="text-sm text-slate-600">GPU总数</span>
                            <span className="font-medium">{cluster.gpus.total} 卡</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b">
                            <span className="text-sm text-slate-600">GPU使用中</span>
                            <span className="font-medium">{cluster.gpus.used} 卡</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">GPU可用</span>
                            <span className="font-medium text-green-600">{cluster.gpus.available} 卡</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b">
                            <span className="text-sm text-slate-600">CPU核心</span>
                            <span className="font-medium">{cluster.cpu.total} 核</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b">
                            <span className="text-sm text-slate-600">内存容量</span>
                            <span className="font-medium">{cluster.memory.total} GB</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b">
                            <span className="text-sm text-slate-600">存储容量</span>
                            <span className="font-medium">{cluster.storage.total} TB</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">网络延迟</span>
                            <span className="font-medium">{cluster.latency} ms</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 标签 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">标签和分类</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 flex-wrap">
                        {cluster.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        {cluster.karmadaManaged && (
                          <Badge className="bg-blue-600">Karmada 管理</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>
          <div className="flex justify-end pt-6 border-t">
            <Button onClick={() => setIsClusterDetailDialogOpen(false)}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑集群信息对话框 */}
      <Dialog open={isEditClusterDialogOpen} onOpenChange={setIsEditClusterDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">编辑集群信息</DialogTitle>
            <DialogDescription>修改集群的基本���息和标签</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cluster-name">集群名称</Label>
                <Input
                  id="cluster-name"
                  defaultValue={
                    selectedOperationClusterId
                      ? clusters.find((c) => c.id === selectedOperationClusterId)?.name
                      : ''
                  }
                  placeholder="输入集群名称"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cluster-region">区域</Label>
                <Select
                  defaultValue={
                    selectedOperationClusterId
                      ? clusters.find((c) => c.id === selectedOperationClusterId)?.region
                      : ''
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择区域" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="华北">华北</SelectItem>
                    <SelectItem value="华东">华东</SelectItem>
                    <SelectItem value="华南">华南</SelectItem>
                    <SelectItem value="西南">西南</SelectItem>
                    <SelectItem value="华中">华中</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cluster-location">位置</Label>
                <Input
                  id="cluster-location"
                  defaultValue={
                    selectedOperationClusterId
                      ? clusters.find((c) => c.id === selectedOperationClusterId)?.location
                      : ''
                  }
                  placeholder="输入具体位置"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cluster-tags">标签</Label>
                <Input
                  id="cluster-tags"
                  defaultValue={
                    selectedOperationClusterId
                      ? clusters.find((c) => c.id === selectedOperationClusterId)?.tags.join(', ')
                      : ''
                  }
                  placeholder="输入标签，用逗号分隔"
                />
                <p className="text-xs text-slate-500">例如：生产环境, 高性能, GPU集群</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClusterDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setIsEditClusterDialogOpen(false)}>
              <Check className="w-4 h-4 mr-2" />
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导出配置对话框 */}
      <Dialog open={isExportConfigDialogOpen} onOpenChange={setIsExportConfigDialogOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">导出集群配置</DialogTitle>
            <DialogDescription>
              导出 Kubeconfig 文件用于集群访问和管理
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                导出的配置文件包含集群访问凭证，请妥善保管，避免泄露
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>配置文件格式</Label>
                <Select defaultValue="yaml">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yaml">YAML 格式 (.yaml)</SelectItem>
                    <SelectItem value="json">JSON 格式 (.json)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>配置预览</Label>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    下载文件
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={`apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTi...
    server: https://192.168.1.100:6443
  name: ${selectedOperationClusterId ? clusters.find((c) => c.id === selectedOperationClusterId)?.name : 'cluster'}
contexts:
- context:
    cluster: ${selectedOperationClusterId ? clusters.find((c) => c.id === selectedOperationClusterId)?.name : 'cluster'}
    user: admin
  name: default
current-context: default
users:
- name: admin
  user:
    client-certificate-data: LS0tLS1CRUdJTi...
    client-key-data: LS0tLS1CRUdJTi...`}
                  className="font-mono text-xs h-64"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportConfigDialogOpen(false)}>
              关闭
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              下载 Kubeconfig
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 事件日志对话框 */}
      <Dialog open={isEventLogDialogOpen} onOpenChange={setIsEventLogDialogOpen}>
        <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">集群事件日志</DialogTitle>
            <DialogDescription>
              {selectedOperationClusterId &&
                clusters.find((c) => c.id === selectedOperationClusterId)?.name} - 查看集群历史事件
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden py-6">
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {[
                  {
                    time: '2024-11-10 14:23:45',
                    type: 'info',
                    event: '节点加入',
                    message: '节点 gpu-node-07 成功加入集群',
                  },
                  {
                    time: '2024-11-10 12:15:30',
                    type: 'success',
                    event: '健康检查',
                    message: '集群健康检查通过，所有节点运行正常',
                  },
                  {
                    time: '2024-11-10 09:42:18',
                    type: 'warning',
                    event: 'GPU 告警',
                    message: '节点 gpu-node-03 GPU 使用率持续超过 95%',
                  },
                  {
                    time: '2024-11-09 18:30:22',
                    type: 'info',
                    event: '配置更新',
                    message: '集群调度策略已更新',
                  },
                  {
                    time: '2024-11-09 15:20:11',
                    type: 'error',
                    event: '节点离线',
                    message: '节点 gpu-node-05 失去连接',
                  },
                  {
                    time: '2024-11-09 10:05:33',
                    type: 'success',
                    event: '任务完成',
                    message: '训练任务 job-12345 在集群中成功完成',
                  },
                  {
                    time: '2024-11-08 16:45:28',
                    type: 'info',
                    event: '节点维护',
                    message: '节点 gpu-node-02 进入维护模式',
                  },
                ].map((log, index) => (
                  <Card key={index} className="border-l-4 border-l-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {log.type === 'success' && (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                          {log.type === 'info' && (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Info className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          {log.type === 'warning' && (
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                          )}
                          {log.type === 'error' && (
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h6 className="font-medium">{log.event}</h6>
                            <span className="text-xs text-slate-500">{log.time}</span>
                          </div>
                          <p className="text-sm text-slate-600">{log.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出日志
            </Button>
            <Button onClick={() => setIsEventLogDialogOpen(false)}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 健康检查对话框 */}
      <Dialog open={isHealthCheckDialogOpen} onOpenChange={setIsHealthCheckDialogOpen}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">集群健康检查</DialogTitle>
            <DialogDescription>
              检查集群和节点的健康状态，确保系统正常运行
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* 总体状态 */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl text-green-900 mb-2">集群状态健康</h4>
                  <p className="text-green-700">
                    所有关键组件运行正常，未发现严重问题
                  </p>
                </div>
              </div>
            </div>

            {/* 检查项目 */}
            <div className="space-y-3">
              <h5 className="font-medium">检查详情</h5>
              
              {[
                { name: 'API Server', status: 'healthy', message: '响应正常，延迟 3.2ms' },
                { name: 'Karmada 控制器', status: 'healthy', message: '运行正常，版本 v1.8.0' },
                { name: '节点连接', status: 'healthy', message: '24/24 节点在线' },
                { name: 'GPU 驱动', status: 'healthy', message: '所有节点驱动版本一致' },
                { name: '存储系统', status: 'warning', message: '集群存储使用率 75.6%' },
                { name: '网络连通性', status: 'healthy', message: '网络延迟正常' },
              ].map((check, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {check.status === 'healthy' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        )}
                        <div>
                          <p className="font-medium">{check.name}</p>
                          <p className="text-sm text-slate-600">{check.message}</p>
                        </div>
                      </div>
                      <Badge className={check.status === 'healthy' ? 'bg-green-600' : 'bg-orange-600'}>
                        {check.status === 'healthy' ? '正常' : '警告'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                建议每周进行一次完整的健康检查，确保集群稳定运行
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHealthCheckDialogOpen(false)}>
              关闭
            </Button>
            <Button>
              <RefreshCw className="w-4 h-4 mr-2" />
              重新检查
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 解除纳管确认对话框 */}
      <Dialog open={isUnmanageDialogOpen} onOpenChange={setIsUnmanageDialogOpen}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-600">解除集群纳管</DialogTitle>
            <DialogDescription>
              此操作将从费米平台中移除该集群，请谨慎操作
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>警告：</strong>解除纳管后将执行以下操作：
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>从费米平台移除集群配置信息</li>
                  <li>停止所有正在运行的监控任务</li>
                  <li>清除集群节点的同步数据</li>
                  <li>无法再通过平台管理该集群</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">即将解除纳管的集群：</p>
                <p className="font-medium text-lg">
                  {selectedOperationClusterId &&
                    clusters.find((c) => c.id === selectedOperationClusterId)?.name}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-text">输入集群名称以确认</Label>
                <Input
                  id="confirm-text"
                  placeholder="输入集群名称"
                />
                <p className="text-xs text-slate-500">
                  请输入完整的集群名称以确认解除纳管操作
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnmanageDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              确认解除纳管
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 节点详情对话框 */}
      <Dialog open={isNodeDetailDialogOpen} onOpenChange={setIsNodeDetailDialogOpen}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">节点架构详情</DialogTitle>
            <DialogDescription>
              {selectedNode?.name} - 完整的硬件和软件架构信息
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 py-6">
            {selectedNode && (
              <div className="space-y-6">
                {/* 基本信息 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-blue-600" />
                      基本信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">节点名称</p>
                        <p className="font-medium">{selectedNode.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">IP 地址</p>
                        <p className="font-mono text-sm">{selectedNode.ip}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">运行状态</p>
                        {selectedNode.status === 'running' && (
                          <Badge className="bg-green-600">运行中</Badge>
                        )}
                        {selectedNode.status === 'warning' && (
                          <Badge className="bg-orange-600">告警</Badge>
                        )}
                        {selectedNode.status === 'offline' && (
                          <Badge variant="destructive">离线</Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">运行时长</p>
                        <p className="font-medium">{selectedNode.uptime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* GPU 架构 */}
                {selectedNode.architecture?.gpu && (
                  <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-purple-600" />
                        GPU 架构
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">GPU 型号</p>
                            <p className="font-medium text-lg">{selectedNode.gpuModel}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-600 mb-1">数量</p>
                              <p className="font-medium">{selectedNode.gpuCount} 卡</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">单卡显存</p>
                              <p className="font-medium">{selectedNode.architecture.gpu.vramPerGpu} GB</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">架构代号</p>
                            <Badge className="bg-purple-600">{selectedNode.architecture.gpu.architecture}</Badge>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-600 mb-1">计算能力</p>
                              <p className="font-medium">{selectedNode.architecture.gpu.computeCapability}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">CUDA 版本</p>
                              <p className="font-medium">{selectedNode.architecture.gpu.cudaVersion}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">驱动版本</p>
                            <p className="font-mono text-sm">{selectedNode.architecture.gpu.driverVersion}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">NVLink</p>
                            {selectedNode.architecture.gpu.nvlinkEnabled ? (
                              <Badge className="bg-green-600">已启用</Badge>
                            ) : (
                              <Badge variant="secondary">未启用</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CPU 架构 */}
                {selectedNode.architecture?.cpu && (
                  <Card className="border-2 border-blue-200 bg-blue-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Microchip className="w-5 h-5 text-blue-600" />
                        CPU 架构
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">处理器型号</p>
                            <p className="font-medium">{selectedNode.architecture.cpu.model}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">架构类型</p>
                            <Badge className="bg-blue-600">{selectedNode.architecture.cpu.architecture}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-slate-600 mb-1">插槽数</p>
                              <p className="font-medium">{selectedNode.architecture.cpu.sockets}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">核心/槽</p>
                              <p className="font-medium">{selectedNode.architecture.cpu.coresPerSocket}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">线程/核</p>
                              <p className="font-medium">{selectedNode.architecture.cpu.threadsPerCore}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">总核心数</p>
                            <p className="text-2xl font-semibold text-blue-600">{selectedNode.cpuCores}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-600 mb-1">L3 缓存</p>
                              <p className="font-medium">{selectedNode.architecture.cpu.l3Cache} MB</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">主频</p>
                              <p className="font-medium">{selectedNode.architecture.cpu.frequency} GHz</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {/* 内存架构 */}
                  {selectedNode.architecture?.memory && (
                    <Card className="border-2 border-green-200 bg-green-50/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MemoryStick className="w-5 h-5 text-green-600" />
                          内存架构
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">总容量</p>
                          <p className="text-2xl font-semibold text-green-600">{selectedNode.memory} GB</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">类型</p>
                            <Badge className="bg-green-600">{selectedNode.architecture.memory.type}</Badge>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">频率</p>
                            <p className="font-medium">{selectedNode.architecture.memory.speed} MHz</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">通道数</p>
                            <p className="font-medium">{selectedNode.architecture.memory.channels}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">带宽</p>
                            <p className="font-medium">{selectedNode.architecture.memory.bandwidth} GB/s</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 存储架构 */}
                  {selectedNode.architecture?.storage && (
                    <Card className="border-2 border-orange-200 bg-orange-50/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-orange-600" />
                          存储架构
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">总容量</p>
                          <p className="text-2xl font-semibold text-orange-600">
                            {selectedNode.architecture.storage.capacity} GB
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">存储类型</p>
                          <Badge className="bg-orange-600">{selectedNode.architecture.storage.type}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">读取速度</p>
                            <p className="font-medium">{selectedNode.architecture.storage.readSpeed} MB/s</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">写入速度</p>
                            <p className="font-medium">{selectedNode.architecture.storage.writeSpeed} MB/s</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* 网络架构 */}
                  {selectedNode.architecture?.network && (
                    <Card className="border-2 border-cyan-200 bg-cyan-50/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="w-5 h-5 text-cyan-600" />
                          网络架构
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">网络类型</p>
                          <Badge className="bg-cyan-600">{selectedNode.architecture.network.type}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">带宽</p>
                          <p className="text-2xl font-semibold text-cyan-600">
                            {selectedNode.architecture.network.speed} Gbps
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">网络拓扑</p>
                          <p className="font-medium">{selectedNode.architecture.network.topology}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 容器运行时 */}
                  {selectedNode.architecture?.container && (
                    <Card className="border-2 border-indigo-200 bg-indigo-50/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Container className="w-5 h-5 text-indigo-600" />
                          容器运行时
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">运行时</p>
                          <Badge className="bg-indigo-600">{selectedNode.architecture.container.runtime}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">运行时版本</p>
                          <p className="font-mono text-sm">{selectedNode.architecture.container.runtimeVersion}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Kubernetes 版本</p>
                          <p className="font-mono text-sm">
                            {selectedNode.architecture.container.kubernetesVersion}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* 资源使用情况 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-slate-600" />
                      当前资源使用
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">GPU 使用率</span>
                          <span className="font-medium">
                            {selectedNode.gpuUsed} / {selectedNode.gpuCount} 卡
                          </span>
                        </div>
                        <Progress value={(selectedNode.gpuUsed! / selectedNode.gpuCount) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">CPU 使用率</span>
                          <span className="font-medium">
                            {selectedNode.cpuUsed} / {selectedNode.cpuCores} 核
                          </span>
                        </div>
                        <Progress value={(selectedNode.cpuUsed! / selectedNode.cpuCores) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">内存使用率</span>
                          <span className="font-medium">
                            {selectedNode.memoryUsed} / {selectedNode.memory} GB
                          </span>
                        </div>
                        <Progress value={(selectedNode.memoryUsed! / selectedNode.memory) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">磁盘使用率</span>
                          <span className="font-medium">
                            {selectedNode.diskUsed} / {selectedNode.diskTotal} GB
                          </span>
                        </div>
                        <Progress value={(selectedNode.diskUsed! / selectedNode.diskTotal!) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={() => setIsNodeDetailDialogOpen(false)} size="lg">
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
