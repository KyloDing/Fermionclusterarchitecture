import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import {
  Plus,
  Search,
  MoreVertical,
  Container,
  Download,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Tag,
  Cpu,
  Server,
  Package,
  Info,
  RefreshCw,
  Loader2,
  Hammer,
  FolderGit2,
  FileCode2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// 镜像类型定义
interface ContainerImage {
  id?: string;
  registryName: string; // 仓库名称
  status: 'AVAILABLE' | 'SYNC_ING' | 'BUILD_ING'; // 状态
  fullName: string; // 全称
  project: string; // 镜像工程项目名称
  name: string; // 镜像名称
  tag: string; // 标签
  digest: string; // 镜像版本（SHA256）
  abbreviation: string; // 简称
  description: string; // 描述
  fileSize: string; // 文件大小
  architecture: string; // 架构
  createdAt?: string;
  updatedAt?: string;
}

export default function ImagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterArchitecture, setFilterArchitecture] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImageDetailDialogOpen, setIsImageDetailDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ContainerImage | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // 自定义镜像表单状态
  const [customImage, setCustomImage] = useState({
    registryName: '',
    name: '',
    tag: 'latest',
    project: '',
    description: '',
    dockerfile: '',
    buildMethod: 'registry',
  });

  // 模拟镜像数据 - 根据新的数据结构
  const [images, setImages] = useState<ContainerImage[]>([
    {
      id: 'img-001',
      registryName: 'harbor156',
      status: 'AVAILABLE',
      fullName: '192.168.100.156/attendance/attendance-server:1.0',
      project: 'attendance',
      name: 'attendance-server',
      tag: '1.0',
      digest: 'sha256:e2ea90600b7b622d78e71027317a863e431130631aaf2c24a2396af3bca9e323',
      abbreviation: 'attendance-server',
      description: '考勤服务后端应用镜像，包含完整的业务逻辑和API接口',
      fileSize: '240 MB',
      architecture: 'amd64',
      createdAt: '2024-11-15',
      updatedAt: '2024-11-20',
    },
    {
      id: 'img-002',
      registryName: 'harbor156',
      status: 'AVAILABLE',
      fullName: '192.168.100.156/ml-platform/pytorch-training:2.1.0-cuda12.1',
      project: 'ml-platform',
      name: 'pytorch-training',
      tag: '2.1.0-cuda12.1',
      digest: 'sha256:a3f5c8901234567890abcdef1234567890abcdef1234567890abcdef12345678',
      abbreviation: 'pytorch-training',
      description: 'PyTorch 2.1.0 深度学习训练环境，支持CUDA 12.1和cuDNN 8',
      fileSize: '8.5 GB',
      architecture: 'amd64',
      createdAt: '2024-11-10',
      updatedAt: '2024-11-18',
    },
    {
      id: 'img-003',
      registryName: 'harbor156',
      status: 'SYNC_ING',
      fullName: '192.168.100.156/ml-platform/tensorflow-gpu:2.14.0',
      project: 'ml-platform',
      name: 'tensorflow-gpu',
      tag: '2.14.0',
      digest: 'sha256:b4e6d9012345678901bcdef1234567890bcdef1234567890bcdef1234567890',
      abbreviation: 'tensorflow-gpu',
      description: 'TensorFlow 2.14.0 GPU版本，内置Keras，支持分布式训练',
      fileSize: '7.2 GB',
      architecture: 'amd64',
      createdAt: '2024-11-12',
      updatedAt: '2024-11-19',
    },
    {
      id: 'img-004',
      registryName: 'harbor156',
      status: 'BUILD_ING',
      fullName: '192.168.100.156/custom/llama-finetune:latest',
      project: 'custom',
      name: 'llama-finetune',
      tag: 'latest',
      digest: 'sha256:c5f7e9012345678901cdef1234567890cdef1234567890cdef12345678901234',
      abbreviation: 'llama-finetune',
      description: 'LLaMA模型微调环境，包含LoRA、QLoRA、DeepSpeed等工具',
      fileSize: '13.2 GB',
      architecture: 'amd64',
      createdAt: '2024-11-20',
      updatedAt: '2024-11-20',
    },
    {
      id: 'img-005',
      registryName: 'harbor156',
      status: 'AVAILABLE',
      fullName: '192.168.100.156/inference/triton-server:23.10',
      project: 'inference',
      name: 'triton-server',
      tag: '23.10',
      digest: 'sha256:d6g8f9012345678901def1234567890def1234567890def12345678901234567',
      abbreviation: 'triton-server',
      description: 'NVIDIA Triton推理服务器，支持多种模型框架',
      fileSize: '12.3 GB',
      architecture: 'amd64',
      createdAt: '2024-11-08',
      updatedAt: '2024-11-16',
    },
    {
      id: 'img-006',
      registryName: 'harbor156',
      status: 'AVAILABLE',
      fullName: '192.168.100.156/data-science/jupyter-notebook:latest',
      project: 'data-science',
      name: 'jupyter-notebook',
      tag: 'latest',
      digest: 'sha256:e7h9g0012345678901ef1234567890ef1234567890ef123456789012345678',
      abbreviation: 'jupyter-notebook',
      description: 'Jupyter Notebook数据科学环境，预装常用Python库',
      fileSize: '5.8 GB',
      architecture: 'amd64',
      createdAt: '2024-11-05',
      updatedAt: '2024-11-17',
    },
    {
      id: 'img-007',
      registryName: 'harbor156',
      status: 'AVAILABLE',
      fullName: '192.168.100.156/web/nginx-proxy:1.25.3',
      project: 'web',
      name: 'nginx-proxy',
      tag: '1.25.3',
      digest: 'sha256:f8i0h1012345678901fg1234567890fg1234567890fg123456789012345678',
      abbreviation: 'nginx-proxy',
      description: 'Nginx反向代理服务器，用于负载均衡和API网关',
      fileSize: '145 MB',
      architecture: 'amd64',
      createdAt: '2024-11-01',
      updatedAt: '2024-11-14',
    },
    {
      id: 'img-008',
      registryName: 'harbor156',
      status: 'AVAILABLE',
      fullName: '192.168.100.156/database/postgres-ha:15.4',
      project: 'database',
      name: 'postgres-ha',
      tag: '15.4',
      digest: 'sha256:g9j1i2012345678901gh1234567890gh1234567890gh123456789012345678',
      abbreviation: 'postgres-ha',
      description: 'PostgreSQL 15.4高可用版本，支持主从复制',
      fileSize: '380 MB',
      architecture: 'amd64',
      createdAt: '2024-10-28',
      updatedAt: '2024-11-12',
    },
  ]);

  // 获取状态配置
  const getStatusConfig = (status: ContainerImage['status']) => {
    const configs = {
      AVAILABLE: {
        label: '可用',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle2,
      },
      SYNC_ING: {
        label: '同步中',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: RefreshCw,
      },
      BUILD_ING: {
        label: '构建中',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: Hammer,
      },
    };
    return configs[status];
  };

  // 筛选镜像
  const filteredImages = images.filter((image) => {
    const matchesSearch =
      image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || image.status === filterStatus;
    const matchesArchitecture =
      filterArchitecture === 'all' || image.architecture === filterArchitecture;
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'available' && image.status === 'AVAILABLE') ||
      (activeTab === 'building' &&
        (image.status === 'BUILD_ING' || image.status === 'SYNC_ING'));

    return matchesSearch && matchesStatus && matchesArchitecture && matchesTab;
  });

  // 统计信息
  const stats = {
    total: images.length,
    available: images.filter((i) => i.status === 'AVAILABLE').length,
    syncing: images.filter((i) => i.status === 'SYNC_ING').length,
    building: images.filter((i) => i.status === 'BUILD_ING').length,
  };

  // 处理复制
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}已复制到剪贴板`);
  };

  // 处理拉取镜像
  const handlePullImage = (image: ContainerImage) => {
    toast.success(`开始拉取镜像: ${image.fullName}`);
  };

  // 处理删除镜像
  const handleDeleteImage = (image: ContainerImage) => {
    toast.success(`镜像 ${image.name} 已删除`);
    setImages(images.filter((img) => img.id !== image.id));
  };

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">镜像管理</h1>
        <p className="text-slate-600">
          管理容器镜像仓库，查看、拉取和构建容器镜像
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">镜像总数</p>
                <p className="text-3xl">{stats.total}</p>
              </div>
              <Container className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">可用镜像</p>
                <p className="text-3xl text-green-600">{stats.available}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">同步中</p>
                <p className="text-3xl text-blue-600">{stats.syncing}</p>
              </div>
              <RefreshCw className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">构建中</p>
                <p className="text-3xl text-orange-600">{stats.building}</p>
              </div>
              <Hammer className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="available">可用</TabsTrigger>
            <TabsTrigger value="building">构建/同步中</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          添加镜像
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索镜像名称、项目、标签或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="AVAILABLE">可用</SelectItem>
            <SelectItem value="SYNC_ING">同步中</SelectItem>
            <SelectItem value="BUILD_ING">构建中</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterArchitecture} onValueChange={setFilterArchitecture}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部架构</SelectItem>
            <SelectItem value="amd64">amd64</SelectItem>
            <SelectItem value="arm64">arm64</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 镜像列表 */}
      <div className="space-y-4">
        {filteredImages.map((image) => {
          const statusConfig = getStatusConfig(image.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Card
              key={image.id}
              className="border-2 hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FolderGit2 className="w-5 h-5 text-slate-600" />
                      <CardTitle className="text-lg">{image.name}</CardTitle>
                      <Badge variant="outline" className={statusConfig.color}>
                        <StatusIcon
                          className={`w-3 h-3 mr-1 ${
                            image.status === 'SYNC_ING' || image.status === 'BUILD_ING'
                              ? 'animate-spin'
                              : ''
                          }`}
                        />
                        {statusConfig.label}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {image.tag}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Server className="w-4 h-4" />
                        {image.registryName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {image.project}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Cpu className="w-4 h-4" />
                        {image.architecture}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handlePullImage(image)}
                        disabled={image.status !== 'AVAILABLE'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        拉取镜像
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCopy(image.fullName, '镜像地址')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        复制完整地址
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCopy(image.digest, 'Digest')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        复制Digest
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedImage(image);
                          setIsImageDetailDialogOpen(true);
                        }}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteImage(image)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除镜像
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="mt-2">{image.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 完整地址 */}
                <div className="p-3 bg-slate-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-green-400 font-mono">
                      {image.fullName}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white h-8"
                      onClick={() => handleCopy(image.fullName, '镜像地址')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 元数据 */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">文件大小</p>
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-purple-600" />
                      <p className="font-medium">{image.fileSize}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">架构</p>
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <p className="font-medium">{image.architecture}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">创建时间</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-green-600" />
                      <p className="font-medium text-sm">{image.createdAt}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">最后更新</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <p className="font-medium text-sm">{image.updatedAt}</p>
                    </div>
                  </div>
                </div>

                {/* Digest */}
                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-600 mb-2">Digest</p>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded font-mono text-xs">
                    <span className="text-slate-700">{image.digest}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6"
                      onClick={() => handleCopy(image.digest, 'Digest')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredImages.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Container className="w-16 h-16 mx-auto text-slate-300" />
            <div>
              <h3 className="text-xl mb-2">没有找到镜像</h3>
              <p className="text-slate-600">调整筛选条件或添加新镜像</p>
            </div>
          </div>
        </Card>
      )}

      {/* 添加镜像对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">添加镜像</DialogTitle>
            <DialogDescription>从镜像仓库拉取或通过 Dockerfile 构建新镜像</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="registry" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registry">从仓库拉取</TabsTrigger>
              <TabsTrigger value="dockerfile">Dockerfile 构建</TabsTrigger>
            </TabsList>

            {/* 从仓库拉取 */}
            <TabsContent value="registry" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="registry">镜像仓库 *</Label>
                <Input
                  id="registry"
                  placeholder="例如: harbor156"
                  value={customImage.registryName}
                  onChange={(e) =>
                    setCustomImage({ ...customImage, registryName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">项目名称 *</Label>
                <Input
                  id="project"
                  placeholder="例如: ml-platform"
                  value={customImage.project}
                  onChange={(e) =>
                    setCustomImage({ ...customImage, project: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-name">镜像名称 *</Label>
                <Input
                  id="image-name"
                  placeholder="例如: pytorch-training"
                  value={customImage.name}
                  onChange={(e) =>
                    setCustomImage({ ...customImage, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-tag">镜像标签</Label>
                <Input
                  id="image-tag"
                  placeholder="latest"
                  value={customImage.tag}
                  onChange={(e) =>
                    setCustomImage({ ...customImage, tag: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-desc">描述</Label>
                <Textarea
                  id="image-desc"
                  placeholder="简要描述此镜像的用途和特性"
                  value={customImage.description}
                  onChange={(e) =>
                    setCustomImage({ ...customImage, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-900 text-sm">
                  完整镜像地址: {customImage.registryName}/{customImage.project}/
                  {customImage.name}:{customImage.tag}
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Dockerfile 构建 */}
            <TabsContent value="dockerfile" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="dockerfile-name">镜像名称 *</Label>
                <Input
                  id="dockerfile-name"
                  placeholder="my-custom-image"
                  value={customImage.name}
                  onChange={(e) =>
                    setCustomImage({ ...customImage, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dockerfile-project">项目 *</Label>
                <Input
                  id="dockerfile-project"
                  placeholder="custom"
                  value={customImage.project}
                  onChange={(e) =>
                    setCustomImage({ ...customImage, project: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dockerfile">Dockerfile 内容 *</Label>
                <Textarea
                  id="dockerfile"
                  placeholder={`FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

RUN pip install transformers accelerate

WORKDIR /workspace

CMD ["/bin/bash"]`}
                  value={customImage.dockerfile}
                  onChange={(e) =>
                    setCustomImage({ ...customImage, dockerfile: e.target.value })
                  }
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900 text-sm">
                  镜像构建可能需要较长时间，取决于基础镜像大小和安装的软件包
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                setIsCreateDialogOpen(false);
                toast.success('镜像添加请求已提交');
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              添加镜像
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 镜像详情对话框 */}
      <Dialog open={isImageDetailDialogOpen} onOpenChange={setIsImageDetailDialogOpen}>
        <DialogContent className="max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">镜像详情</DialogTitle>
            <DialogDescription>
              {selectedImage?.name}:{selectedImage?.tag}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 py-6">
            {selectedImage && (
              <div className="space-y-6">
                {/* 基本信息 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">镜像名称</p>
                        <p className="font-medium">{selectedImage.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">简称</p>
                        <p className="font-medium">{selectedImage.abbreviation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">标签</p>
                        <p className="font-mono text-sm">{selectedImage.tag}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">状态</p>
                        <Badge
                          variant="outline"
                          className={getStatusConfig(selectedImage.status).color}
                        >
                          {getStatusConfig(selectedImage.status).label}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">仓库名称</p>
                        <p className="font-medium">{selectedImage.registryName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">项目</p>
                        <p className="font-medium">{selectedImage.project}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">架构</p>
                        <p className="font-medium">{selectedImage.architecture}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">文件大小</p>
                        <p className="font-medium">{selectedImage.fileSize}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-2">描述</p>
                      <p className="text-sm">{selectedImage.description}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-2">完整地址</p>
                      <div className="p-3 bg-slate-900 rounded text-green-400 font-mono text-sm break-all">
                        {selectedImage.fullName}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-2">Digest</p>
                      <div className="p-3 bg-slate-50 rounded font-mono text-xs break-all text-slate-700">
                        {selectedImage.digest}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Docker命令 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Docker 命令</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">拉取镜像</p>
                      <div className="p-3 bg-slate-900 rounded">
                        <code className="text-green-400 text-sm">
                          docker pull {selectedImage.fullName}
                        </code>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">运行容器</p>
                      <div className="p-3 bg-slate-900 rounded">
                        <code className="text-green-400 text-sm">
                          docker run -it {selectedImage.fullName} /bin/bash
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImageDetailDialogOpen(false)}
            >
              关闭
            </Button>
            <Button
              onClick={() => {
                if (selectedImage) {
                  handlePullImage(selectedImage);
                  setIsImageDetailDialogOpen(false);
                }
              }}
              disabled={selectedImage?.status !== 'AVAILABLE'}
            >
              <Download className="w-4 h-4 mr-2" />
              拉取镜像
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
