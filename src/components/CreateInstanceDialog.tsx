import {
  Info,
  CheckCircle2,
  AlertCircle,
  Zap,
  Network,
  HardDrive,
  Plus,
  X,
  FolderOpen,
  Lock,
  Unlock,
  Database,
  RefreshCw,
  List,
  ArrowRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { getStorageVolumes, StorageVolume } from '../services/storageService';
import { getDatasets, type Dataset } from '../services/datasetService';
import { toast } from 'sonner@2.0.3';

interface VolumeMount {
  id: string;
  type: 'volume' | 'dataset';  // 挂载类型：存储卷或数据集
  volumeId: string;
  volumeName: string;
  mountPath: string;
  readOnly: boolean;
  datasetId?: string;  // 当type为dataset时使用
  datasetVersion?: string;  // 数据集版本
}

interface CreateInstanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export default function CreateInstanceDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateInstanceDialogProps) {
  // 添加确认状态
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // 存储卷和数据集
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  
  // 模拟存储卷数据
  const [storageVolumes, setStorageVolumes] = useState<StorageVolume[]>([
    {
      id: 'vol-001',
      name: 'imagenet-dataset',
      description: 'ImageNet 2012训练数据集，包含1000个类别的120万张图片',
      capacityGB: 500,
      usedGB: 145.6,
      usage: 29.12,
      poolName: 'SSD-Pool-01',
      poolId: 'pool-ssd-01',
      status: 'Active',
      type: 'SSD',
      createdAt: '2024-11-01T10:30:00Z',
      createdBy: 'admin',
    },
    {
      id: 'vol-002',
      name: 'model-output',
      description: '模型训练输出目录，用于保存checkpoints和最终模型',
      capacityGB: 200,
      usedGB: 56.3,
      usage: 28.15,
      poolName: 'SSD-Pool-01',
      poolId: 'pool-ssd-01',
      status: 'Active',
      type: 'SSD',
      createdAt: '2024-11-05T14:20:00Z',
      createdBy: 'zhangsan',
    },
    {
      id: 'vol-003',
      name: 'shared-datasets',
      description: '团队共享数据集，包含多个预训练模型和公开数据集',
      capacityGB: 1000,
      usedGB: 678.9,
      usage: 67.89,
      poolName: 'HDD-Pool-02',
      poolId: 'pool-hdd-02',
      status: 'Active',
      type: 'HDD',
      createdAt: '2024-10-15T09:00:00Z',
      createdBy: 'admin',
    },
    {
      id: 'vol-004',
      name: 'logs-archive',
      description: '训练日志归档存储，保存历史实验日志和tensorboard数据',
      capacityGB: 300,
      usedGB: 89.4,
      usage: 29.8,
      poolName: 'HDD-Pool-02',
      poolId: 'pool-hdd-02',
      status: 'Active',
      type: 'HDD',
      createdAt: '2024-11-08T16:45:00Z',
      createdBy: 'lisi',
    },
    {
      id: 'vol-005',
      name: 'pretrained-models',
      description: 'BERT、GPT、ResNet等预训练模型权重文件',
      capacityGB: 150,
      usedGB: 98.7,
      usage: 65.8,
      poolName: 'SSD-Pool-01',
      poolId: 'pool-ssd-01',
      status: 'Active',
      type: 'SSD',
      createdAt: '2024-10-20T11:30:00Z',
      createdBy: 'wangwu',
    },
  ]);
  const [loadingVolumes, setLoadingVolumes] = useState(false);
  
  // 模拟初始挂载点示例（可选，注释掉则显示空状态）
  const [volumeMounts, setVolumeMounts] = useState<VolumeMount[]>([
    {
      id: 'mount-example-1',
      type: 'volume',
      volumeId: 'vol-001',
      volumeName: 'imagenet-dataset',
      mountPath: '/data/imagenet',
      readOnly: true,
    },
    {
      id: 'mount-example-2',
      type: 'volume',
      volumeId: 'vol-002',
      volumeName: 'model-output',
      mountPath: '/workspace/output',
      readOnly: false,
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'training',
    image: 'pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime',
    cluster: '',
    gpus: 1,
    cpuCores: 8,
    memory: 32,
    storage: 100,
    command: '',
    workdir: '/workspace',
    ports: '',
    env: '',
    autoRestart: false,
    // 添加调度相关字段
    queueName: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    preemptible: false,
    expectedDuration: 60, // 分钟
  });

  const presetImages = [
    { label: 'PyTorch 2.1.0 (CUDA 12.1)', value: 'pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime' },
    { label: 'TensorFlow 2.14 (GPU)', value: 'tensorflow/tensorflow:2.14.0-gpu' },
    { label: 'Jupyter TensorFlow', value: 'jupyter/tensorflow-notebook:latest' },
    { label: 'NVIDIA Triton Server', value: 'nvcr.io/nvidia/tritonserver:23.10-py3' },
    { label: 'Python 3.11', value: 'python:3.11-slim' },
    { label: '自定义镜像', value: 'custom' },
  ];

  // 加载存储卷和数据集列表
  useEffect(() => {
    if (open) {
      // 使用模拟数据，注释掉 API 调用
      // loadStorageVolumes();
      loadDatasets();
    }
  }, [open]);

  const loadDatasets = async () => {
    setLoadingDatasets(true);
    try {
      const data = await getDatasets();
      // 只显示就绪状态的数据集
      setDatasets(data.filter(d => d.status === 'ready'));
    } catch (error) {
      toast.error('加载数据集列表失败');
    } finally {
      setLoadingDatasets(false);
    }
  };

  const loadStorageVolumes = async () => {
    setLoadingVolumes(true);
    try {
      const volumes = await getStorageVolumes();
      // 只显示已创建成功的存储卷
      setStorageVolumes(volumes.filter((v) => v.status === 'Active'));
    } catch (error) {
      toast.error('加载存储卷列表失败');
    } finally {
      setLoadingVolumes(false);
    }
  };

  // 添加存储卷挂载
  const handleAddVolumeMount = (e?: React.MouseEvent) => {
    // 阻止事件冒泡和默认行为
    e?.preventDefault();
    e?.stopPropagation();
    
    if (storageVolumes.length === 0) {
      toast.error('没有可用的存储卷，请先创建存储卷');
      return;
    }

    // 智能选择未使用的存储卷
    const usedVolumeIds = new Set(volumeMounts.filter(m => m.type === 'volume').map((m) => m.volumeId));
    const availableVolume = storageVolumes.find((v) => !usedVolumeIds.has(v.id)) || storageVolumes[0];

    // 智能生成不重复的挂载路径
    const existingPaths = new Set(volumeMounts.map((m) => m.mountPath));
    let mountPath = '/data';
    let counter = 1;
    while (existingPaths.has(mountPath)) {
      mountPath = `/data${counter}`;
      counter++;
    }

    const newMount: VolumeMount = {
      id: `mount-${Date.now()}`,
      type: 'volume',
      volumeId: availableVolume.id,
      volumeName: availableVolume.name,
      mountPath: mountPath,
      readOnly: false,
    };
    
    setVolumeMounts([...volumeMounts, newMount]);
    toast.success(`已添加挂载点: ${availableVolume.name} -> ${mountPath}`);
  };

  // 添加数据集挂载
  const handleAddDatasetMount = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (datasets.length === 0) {
      toast.error('没有可用的数据集');
      return;
    }

    // 智能选择未使用的数据集
    const usedDatasetIds = new Set(volumeMounts.filter(m => m.type === 'dataset').map((m) => m.datasetId));
    const availableDataset = datasets.find((d) => !usedDatasetIds.has(d.id)) || datasets[0];

    // 智能生成不重复的挂载路径
    const existingPaths = new Set(volumeMounts.map((m) => m.mountPath));
    let mountPath = '/datasets';
    let counter = 1;
    while (existingPaths.has(mountPath)) {
      mountPath = `/datasets${counter}`;
      counter++;
    }

    const newMount: VolumeMount = {
      id: `mount-${Date.now()}`,
      type: 'dataset',
      volumeId: availableDataset.id, // 复用volumeId字段存储datasetId
      volumeName: availableDataset.name,
      mountPath: mountPath,
      readOnly: true, // 数据集默认只读
      datasetId: availableDataset.id,
      datasetVersion: availableDataset.latestVersion,
    };
    
    setVolumeMounts([...volumeMounts, newMount]);
    toast.success(`已添加数据集挂载: ${availableDataset.name} -> ${mountPath}`);
  };

  // 删除存储卷挂载
  const handleRemoveVolumeMount = (id: string) => {
    setVolumeMounts(volumeMounts.filter((m) => m.id !== id));
  };

  // 更新存储卷挂载
  const handleUpdateVolumeMount = (id: string, updates: Partial<VolumeMount>) => {
    setVolumeMounts(
      volumeMounts.map((m) => {
        if (m.id === id) {
          // 如果更新了volumeId，同时更新volumeName
          if (updates.volumeId) {
            const volume = storageVolumes.find((v) => v.id === updates.volumeId);
            if (volume) {
              updates.volumeName = volume.name;
            }
          }
          return { ...m, ...updates };
        }
        return m;
      })
    );
  };

  const handleSubmit = () => {
    // 验证
    if (!formData.name.trim()) {
      toast.error('请输入实例名称');
      return;
    }
    if (!formData.cluster) {
      toast.error('请选择目标集群');
      return;
    }

    // 验证挂载路径不重复
    const mountPaths = volumeMounts.map((m) => m.mountPath);
    const uniquePaths = new Set(mountPaths);
    if (mountPaths.length !== uniquePaths.size) {
      toast.error('挂载路径不能重复');
      return;
    }

    // 显示确认界面
    setShowConfirmation(true);
  };

  // 最终提交
  const handleFinalSubmit = () => {
    onSubmit({
      ...formData,
      volumeMounts,
    });
    setShowConfirmation(false);
    onOpenChange(false);
  };

  // 返回修改
  const handleBackToEdit = () => {
    setShowConfirmation(false);
  };

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      training: '训练任务',
      inference: '推理服务',
      notebook: '开发环境 (Jupyter)',
      custom: '自定义应用',
    };
    return types[type] || type;
  };

  // 获取镜像标签
  const getImageLabel = (image: string) => {
    const preset = presetImages.find((img) => img.value === image);
    return preset ? preset.label : image;
  };

  // 获取集群标签
  const getClusterLabel = (cluster: string) => {
    const clusters: Record<string, string> = {
      'cluster-bj-a': '北京集群-A',
      'cluster-sh-b': '上海集群-B',
      'cluster-sz-c': '深圳集群-C',
      'cluster-cd-d': '成都集群-D',
    };
    return clusters[cluster] || cluster;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {showConfirmation ? '确认配置信息' : '创建开发环境'}
          </DialogTitle>
          <DialogDescription>
            {showConfirmation 
              ? '请仔细核对以下配置信息，确认无误后提交创建' 
              : '配置您的交互式开发容器实例'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 py-6">
          <div className="space-y-6 pr-4">
            {!showConfirmation ? (
              <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">基本配置</TabsTrigger>
                <TabsTrigger value="resources">资源配置</TabsTrigger>
                <TabsTrigger value="storage">存储挂载</TabsTrigger>
                <TabsTrigger value="network">网络配置</TabsTrigger>
                <TabsTrigger value="advanced">高级配置</TabsTrigger>
              </TabsList>

              {/* 基本配置 */}
              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="instance-name">实例名称 *</Label>
                  <Input
                    id="instance-name"
                    placeholder="my-training-instance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instance-type">实例类型 *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training">训练任务</SelectItem>
                      <SelectItem value="inference">推理服务</SelectItem>
                      <SelectItem value="notebook">开发环境 (Jupyter)</SelectItem>
                      <SelectItem value="custom">自定义应用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="container-image">容器镜像 *</Label>
                  <Select
                    value={formData.image}
                    onValueChange={(value) => setFormData({ ...formData, image: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presetImages.map((img) => (
                        <SelectItem key={img.value} value={img.value}>
                          {img.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.image === 'custom' && (
                    <Input
                      placeholder="输入自定义镜像地址，如: myregistry.com/myimage:tag"
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cluster">目标集群 *</Label>
                  <Select
                    value={formData.cluster}
                    onValueChange={(value) => setFormData({ ...formData, cluster: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择部署集群" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cluster-bj-a">北京集群-A (24 节点可用)</SelectItem>
                      <SelectItem value="cluster-sh-b">上海集群-B (16 节点可用)</SelectItem>
                      <SelectItem value="cluster-sz-c">深圳集群-C (12 节点可用)</SelectItem>
                      <SelectItem value="cluster-cd-d">成都集群-D (8 节点可用)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="command">启动命令</Label>
                  <Textarea
                    id="command"
                    placeholder="python train.py --epochs 100"
                    value={formData.command}
                    onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-slate-500">留空则使用镜像默认启动命令</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workdir">工作目录</Label>
                  <Input
                    id="workdir"
                    placeholder="/workspace"
                    value={formData.workdir}
                    onChange={(e) => setFormData({ ...formData, workdir: e.target.value })}
                  />
                </div>
              </TabsContent>

              {/* 资源配置 */}
              <TabsContent value="resources" className="space-y-6 mt-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    根据您的任务类型选择合适的资源配置。训练任务建议使用更多GPU，推理服务可使用较少资源。
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>GPU 数量</Label>
                      <Badge className="bg-purple-600">{formData.gpus} 卡</Badge>
                    </div>
                    <Slider
                      value={[formData.gpus]}
                      onValueChange={([value]) => setFormData({ ...formData, gpus: value })}
                      max={8}
                      min={0}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>0</span>
                      <span>8 卡</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>CPU 核心</Label>
                      <Badge className="bg-blue-600">{formData.cpuCores} 核</Badge>
                    </div>
                    <Slider
                      value={[formData.cpuCores]}
                      onValueChange={([value]) => setFormData({ ...formData, cpuCores: value })}
                      max={128}
                      min={4}
                      step={4}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>4</span>
                      <span>128 核</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>内存</Label>
                      <Badge className="bg-green-600">{formData.memory} GB</Badge>
                    </div>
                    <Slider
                      value={[formData.memory]}
                      onValueChange={([value]) => setFormData({ ...formData, memory: value })}
                      max={1024}
                      min={16}
                      step={16}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>16 GB</span>
                      <span>1024 GB</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>临时存储空间</Label>
                      <Badge className="bg-orange-600">{formData.storage} GB</Badge>
                    </div>
                    <Slider
                      value={[formData.storage]}
                      onValueChange={([value]) => setFormData({ ...formData, storage: value })}
                      max={2000}
                      min={50}
                      step={50}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>50 GB</span>
                      <span>2000 GB</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      临时存储用于容器运行时数据，实例删除后数据将丢失。持久化数据请使用存储卷挂载。
                    </p>
                  </div>
                </div>

                {/* 预估费用 */}
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">预估费用</p>
                        <p className="text-2xl text-orange-600">
                          ¥
                          {(
                            formData.gpus * 12 +
                            formData.cpuCores * 0.5 +
                            formData.memory * 0.1
                          ).toFixed(2)}
                          <span className="text-sm">/天</span>
                        </p>
                      </div>
                      <Zap className="w-10 h-10 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 存储挂载 - 新增 */}
              <TabsContent value="storage" className="space-y-6 mt-6">
                <Alert className="bg-purple-50 border-purple-200">
                  <Database className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-purple-900">
                    <strong>数据挂载说明：</strong> 支持挂载存储卷和平台数据集。
                    <div className="mt-2 space-y-1 text-sm">
                      <p>• <strong>数据集挂载</strong>（只读）：用于训练、验证，保护数据完整性</p>
                      <p>• <strong>存储卷挂载</strong>（读写）：用于保存处理后的数据、模型输出等</p>
                      <p className="text-purple-700 mt-1">💡 工作流：挂载平台数据集 → 数据扩增处理 → 保存到存储卷 → 注册为新数据集</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1">数据挂载配置</h3>
                      <p className="text-sm text-slate-600">
                        {volumeMounts.length > 0 
                          ? `已配置 ${volumeMounts.length} 个挂载点 (${volumeMounts.filter(m => m.type === 'volume').length} 个存储卷, ${volumeMounts.filter(m => m.type === 'dataset').length} 个数据集)` 
                          : '尚未配置数据挂载'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleAddDatasetMount}
                        variant="outline"
                        size="sm"
                        disabled={datasets.length === 0}
                      >
                        <Database className="w-4 h-4 mr-2" />
                        挂载数据集
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddVolumeMount}
                        variant="outline"
                        size="sm"
                        disabled={storageVolumes.length === 0}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        挂载存储卷
                      </Button>
                    </div>
                  </div>

                  {loadingVolumes ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>正在加载存储卷列表...</span>
                        </div>
                      </CardContent>
                    </Card>
                  ) : storageVolumes.length === 0 ? (
                    <Card className="border-dashed border-2">
                      <CardContent className="py-12 text-center">
                        <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-medium mb-2">暂无可用的存储卷</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          请先在"存储管理"页面创建存储卷，然后再进行挂载配置
                        </p>
                        <p className="text-xs text-slate-400">
                          💡 提示：存储卷可用于持久化保存训练数据、模型文件等
                        </p>
                      </CardContent>
                    </Card>
                  ) : volumeMounts.length === 0 ? (
                    <Card className="border-dashed border-2">
                      <CardContent className="py-12 text-center">
                        <HardDrive className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-medium mb-2">尚未添加存储卷挂载</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          点击"添加挂载"按钮配置存储卷，实现数据持久化
                        </p>
                        <div className="flex flex-col gap-2 text-xs text-slate-500 max-w-md mx-auto text-left">
                          <div className="flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            <span>数据集目录建议挂载为只读模式</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            <span>模型输出目录需要挂载为读写模式</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            <span>一个存储卷可以被多个实例同时使用</span>
                          </div>
                        </div>
                        <Button onClick={handleAddVolumeMount} className="mt-6" variant="outline" size="sm" type="button">
                          <Plus className="w-4 h-4 mr-2" />
                          添加第一个挂载点
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {volumeMounts.map((mount, index) => {
                        const volume = mount.type === 'volume' ? storageVolumes.find((v) => v.id === mount.volumeId) : null;
                        const dataset = mount.type === 'dataset' ? datasets.find((d) => d.id === mount.datasetId) : null;
                        return (
                          <Card key={mount.id} className={`border-2 hover:border-purple-300 transition-colors ${mount.type === 'dataset' ? 'bg-gradient-to-r from-blue-50/30 to-purple-50/30' : ''}`}>
                            <CardContent className="p-5">
                              <div className="space-y-4">
                                {/* 头部标题 */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mount.type === 'dataset' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                      <span className={`text-sm font-medium ${mount.type === 'dataset' ? 'text-blue-700' : 'text-purple-700'}`}>#{index + 1}</span>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">挂载点 {index + 1}</h4>
                                      <Badge variant="outline" className={`text-xs ${mount.type === 'dataset' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                        {mount.type === 'dataset' ? '数据集' : '存储卷'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveVolumeMount(mount.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* 数据源选择和路径配置 */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                      <Database className="w-3.5 h-3.5" />
                                      {mount.type === 'dataset' ? '选择数据集 *' : '选择存储卷 *'}
                                    </Label>
                                    {mount.type === 'volume' ? (
                                      <Select
                                        value={mount.volumeId}
                                        onValueChange={(value) =>
                                          handleUpdateVolumeMount(mount.id, { volumeId: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {storageVolumes.map((vol) => (
                                            <SelectItem key={vol.id} value={vol.id}>
                                              <div className="flex flex-col">
                                                <span className="font-medium">{vol.name}</span>
                                                <span className="text-xs text-slate-500">
                                                  {vol.capacityGB}GB · {vol.poolName}
                                                </span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Select
                                        value={mount.datasetId}
                                        onValueChange={(value) =>
                                          handleUpdateVolumeMount(mount.id, { datasetId: value, volumeId: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {datasets.map((ds) => (
                                            <SelectItem key={ds.id} value={ds.id}>
                                              <div className="flex flex-col">
                                                <span className="font-medium">{ds.name}</span>
                                                <span className="text-xs text-slate-500">
                                                  {(ds.size / 1024 / 1024 / 1024).toFixed(1)}GB · {ds.recordCount.toLocaleString()} 条
                                                </span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                      <FolderOpen className="w-3.5 h-3.5" />
                                      容器内挂载路径 *
                                    </Label>
                                    <Input
                                      placeholder="/data 或 /workspace/data"
                                      value={mount.mountPath}
                                      onChange={(e) =>
                                        handleUpdateVolumeMount(mount.id, {
                                          mountPath: e.target.value,
                                        })
                                      }
                                    />
                                    <p className="text-xs text-slate-500">
                                      必须是绝对路径（以 / 开头）
                                    </p>
                                  </div>
                                </div>

                                {/* 访问权限配置 */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor={`readonly-${mount.id}`} className="font-medium">
                                        访问权限
                                      </Label>
                                      <Badge
                                        variant={mount.readOnly ? 'secondary' : 'outline'}
                                        className={mount.readOnly ? 'bg-slate-200' : 'bg-green-50 text-green-700 border-green-200'}
                                      >
                                        {mount.readOnly ? (
                                          <>
                                            <Lock className="w-3 h-3 mr-1" />
                                            只读
                                          </>
                                        ) : (
                                          <>
                                            <Unlock className="w-3 h-3 mr-1" />
                                            读写
                                          </>
                                        )}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                      {mount.type === 'dataset' 
                                        ? '数据集固定为只读模式，保护数据完整性'
                                        : mount.readOnly
                                        ? '容器只能读取数据，无法修改或删除文件'
                                        : '容器可以读取、修改和创建新文件'}
                                    </p>
                                  </div>
                                  <Switch
                                    id={`readonly-${mount.id}`}
                                    checked={!mount.readOnly}
                                    onCheckedChange={(checked) =>
                                      handleUpdateVolumeMount(mount.id, { readOnly: !checked })
                                    }
                                    disabled={mount.type === 'dataset'}
                                  />
                                </div>

                                {/* 数据源详细信息 */}
                                {mount.type === 'volume' && volume && (
                                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                                    <div className="flex items-start gap-3">
                                      <HardDrive className="w-5 h-5 text-purple-600 mt-0.5" />
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <h5 className="font-medium text-sm">存储卷信息</h5>
                                          <Badge variant="outline" className="text-xs">
                                            {volume.status}
                                          </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-xs">
                                          <div>
                                            <p className="text-slate-600 mb-0.5">存储池</p>
                                            <p className="font-medium">{volume.poolName}</p>
                                          </div>
                                          <div>
                                            <p className="text-slate-600 mb-0.5">总容量</p>
                                            <p className="font-medium">{volume.capacityGB} GB</p>
                                          </div>
                                          <div>
                                            <p className="text-slate-600 mb-0.5">已使用</p>
                                            <p className="font-medium">
                                              {volume.usedGB} GB ({volume.usage.toFixed(1)}%)
                                            </p>
                                          </div>
                                        </div>
                                        {volume.description && (
                                          <p className="text-xs text-slate-600 pt-2 border-t border-purple-200">
                                            {volume.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {mount.type === 'dataset' && dataset && (
                                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="flex items-start gap-3">
                                      <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <h5 className="font-medium text-sm">数据集信息</h5>
                                          <Badge variant="outline" className="text-xs bg-blue-50">
                                            {dataset.status === 'ready' ? '就绪' : dataset.status}
                                          </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-xs">
                                          <div>
                                            <p className="text-slate-600 mb-0.5">数据类型</p>
                                            <p className="font-medium">{dataset.type === 'image' ? '图像' : dataset.type}</p>
                                          </div>
                                          <div>
                                            <p className="text-slate-600 mb-0.5">数据量</p>
                                            <p className="font-medium">{dataset.recordCount.toLocaleString()} 条</p>
                                          </div>
                                          <div>
                                            <p className="text-slate-600 mb-0.5">大小</p>
                                            <p className="font-medium">
                                              {(dataset.size / 1024 / 1024 / 1024).toFixed(1)} GB
                                            </p>
                                          </div>
                                        </div>
                                        {dataset.description && (
                                          <p className="text-xs text-slate-600 pt-2 border-t border-blue-200">
                                            {dataset.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-1 pt-2 border-t border-blue-200">
                                          <Lock className="w-3 h-3 text-blue-600" />
                                          <p className="text-xs text-blue-700">
                                            数据集以只读模式挂载，确保数据完整性
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 挂载说明和最佳实践 */}
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    <strong>挂载配置指南：</strong>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1.5">
                      <li><strong>路径规范：</strong>挂载路径必须是绝对路径（如 /data），不同挂载点路径不能重复</li>
                      <li><strong>权限建议：</strong>数据集挂载为只读避免意外修改，模型输出目录挂载为读写</li>
                      <li><strong>性能优化：</strong>大量小文件建议使用SSD存储池，大文件建议使用HDD存储池</li>
                      <li><strong>共享访问：</strong>一个存储卷可被多个实例同时挂载，注意文件并发访问冲突</li>
                      <li><strong>数据安全：</strong>存储卷独立于实例生命周期，实例删除后数据依然保留</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* 网络配置 */}
              <TabsContent value="network" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="ports">端口映射</Label>
                  <Input
                    id="ports"
                    placeholder="8888,6006,8080 (用逗号分隔)"
                    value={formData.ports}
                    onChange={(e) => setFormData({ ...formData, ports: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">
                    暴露容器端口，系统将自动分配外部访问地址
                  </p>
                </div>

                <Alert>
                  <Network className="w-4 h-4" />
                  <AlertDescription>
                    <strong>常用端口：</strong>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                      <li>Jupyter Notebook: 8888</li>
                      <li>TensorBoard: 6006</li>
                      <li>API 服务: 8000, 8080</li>
                      <li>SSH: 22</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* 高级配置 */}
              <TabsContent value="advanced" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="env-vars">环境变量</Label>
                  <Textarea
                    id="env-vars"
                    placeholder={'KEY1=value1\nKEY2=value2'}
                    value={formData.env}
                    onChange={(e) => setFormData({ ...formData, env: e.target.value })}
                    rows={5}
                  />
                  <p className="text-xs text-slate-500">每行一个环境变量，格式: KEY=VALUE</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="auto-restart">自动重启</Label>
                    <p className="text-xs text-slate-500">实例异常退出时自动重启</p>
                  </div>
                  <Switch
                    id="auto-restart"
                    checked={formData.autoRestart}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, autoRestart: checked })
                    }
                  />
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-900">
                    高级配置选项可能影响实例的稳定性，请谨慎设置
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
            ) : (
              // 确认界面
              <div className="space-y-6">
                {/* 基本配置摘要 */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      基本配置
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-600">实例名称</Label>
                        <p className="font-medium mt-1">{formData.name}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">实例类型</Label>
                        <p className="font-medium mt-1">{getTypeLabel(formData.type)}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">容器镜像</Label>
                        <p className="font-medium mt-1 text-sm">{getImageLabel(formData.image)}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">目标集群</Label>
                        <p className="font-medium mt-1">{getClusterLabel(formData.cluster)}</p>
                      </div>
                      {formData.command && (
                        <div className="col-span-2">
                          <Label className="text-slate-600">启动命令</Label>
                          <p className="font-medium mt-1 font-mono text-sm bg-slate-100 p-2 rounded">
                            {formData.command}
                          </p>
                        </div>
                      )}
                      <div>
                        <Label className="text-slate-600">工作目录</Label>
                        <p className="font-medium mt-1 font-mono text-sm">{formData.workdir}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 资源配置摘要 */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      资源配置
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-sm text-slate-600 mb-1">GPU</p>
                        <p className="text-2xl font-semibold text-purple-600">{formData.gpus}</p>
                        <p className="text-xs text-slate-500">卡</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-slate-600 mb-1">CPU</p>
                        <p className="text-2xl font-semibold text-blue-600">{formData.cpuCores}</p>
                        <p className="text-xs text-slate-500">核</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm text-slate-600 mb-1">内存</p>
                        <p className="text-2xl font-semibold text-green-600">{formData.memory}</p>
                        <p className="text-xs text-slate-500">GB</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="text-sm text-slate-600 mb-1">存储</p>
                        <p className="text-2xl font-semibold text-orange-600">{formData.storage}</p>
                        <p className="text-xs text-slate-500">GB</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">预估费用</p>
                          <p className="text-xl font-semibold text-orange-600">
                            ¥{(formData.gpus * 12 + formData.cpuCores * 0.5 + formData.memory * 0.1).toFixed(2)}
                            <span className="text-sm font-normal">/天</span>
                          </p>
                        </div>
                        <Zap className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 存储挂载摘要 */}
                {volumeMounts.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        存储挂载配置
                        <Badge variant="outline">{volumeMounts.length} 个挂载点</Badge>
                      </h3>
                      <div className="space-y-3">
                        {volumeMounts.map((mount, index) => {
                          const volume = storageVolumes.find((v) => v.id === mount.volumeId);
                          return (
                            <div
                              key={mount.id}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-medium text-purple-700">#{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">{mount.volumeName}</p>
                                    <Badge
                                      variant={mount.readOnly ? 'secondary' : 'outline'}
                                      className={mount.readOnly ? 'bg-slate-200 text-xs' : 'bg-green-50 text-green-700 border-green-200 text-xs'}
                                    >
                                      {mount.readOnly ? <><Lock className="w-3 h-3 mr-1" />只读</> : <><Unlock className="w-3 h-3 mr-1" />读写</>}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                      <FolderOpen className="w-3.5 h-3.5" />
                                      <span className="font-mono">{mount.mountPath}</span>
                                    </div>
                                    {volume && (
                                      <>
                                        <span>•</span>
                                        <span>{volume.capacityGB}GB {volume.type}</span>
                                        <span>•</span>
                                        <span>{volume.poolName}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 网络配置摘要 */}
                {formData.ports && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Network className="w-5 h-5 text-blue-600" />
                        网络配置
                      </h3>
                      <div>
                        <Label className="text-slate-600">端口映射</Label>
                        <p className="font-medium mt-1 font-mono text-sm">{formData.ports}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 高级配置摘要 */}
                {(formData.env || formData.autoRestart) && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        高级配置
                      </h3>
                      <div className="space-y-4">
                        {formData.env && (
                          <div>
                            <Label className="text-slate-600">环境变量</Label>
                            <pre className="font-mono text-sm bg-slate-100 p-3 rounded mt-1 whitespace-pre-wrap">
                              {formData.env}
                            </pre>
                          </div>
                        )}
                        {formData.autoRestart && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="font-medium">已启用自动重启</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 重要提示 */}
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>创建提示：</strong>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                      <li>实例创建通常需要 1-3 分钟，请耐心等待</li>
                      <li>创建后实例将自动启动，您可以在实例列表中查看状态</li>
                      <li>资源配置创建后不可修改，如需调整请删除后重新创建</li>
                      <li>实例将按实际运行时长计费，暂停实例可节省费用</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-6 border-t">
          {!showConfirmation ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                下一步：确认配置
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBackToEdit}>
                返回修改
              </Button>
              <Button onClick={handleFinalSubmit} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                确认创建实例
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}