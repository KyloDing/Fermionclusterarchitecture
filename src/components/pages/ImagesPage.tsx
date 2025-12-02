import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
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
  Shield,
  Download,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Star,
  Clock,
  HardDrive,
  Tag,
  FileCode,
  Terminal,
  Cpu,
  Server,
  Layers,
  Package,
  Info,
  RefreshCw,
} from 'lucide-react';
import {
  getContainerImages,
  formatBytes,
  formatRelativeTime,
  type ContainerImage,
} from '../../services/mockDataService';

export default function ImagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFramework, setFilterFramework] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImageDetailDialogOpen, setIsImageDetailDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ContainerImage | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // 自定义镜像表单状态
  const [customImage, setCustomImage] = useState({
    name: '',
    tag: 'latest',
    registry: 'docker.io',
    description: '',
    dockerfile: '',
    buildMethod: 'dockerfile',
  });

  // 模拟镜像数据
  const [images, setImages] = useState<ContainerImage[]>([
    {
      id: 'img-001',
      name: 'pytorch',
      tag: '2.1.0-cuda12.1-cudnn8-runtime',
      category: 'official',
      framework: 'PyTorch',
      size: 8500,
      pulls: 15234,
      createdAt: '2024-10-15',
      updatedAt: '2024-11-01',
      description: 'PyTorch 2.1.0 官方镜像，包含 CUDA 12.1 和 cuDNN 8，适用于深度学习训练和推理',
      featured: true,
      verified: true,
      gpuSupport: true,
      cudaVersion: '12.1',
      pythonVersion: '3.10',
      frameworks: ['PyTorch 2.1.0', 'torchvision', 'torchaudio'],
      includesJupyter: false,
      registry: 'docker.io',
    },
    {
      id: 'img-002',
      name: 'tensorflow',
      tag: '2.14.0-gpu',
      category: 'official',
      framework: 'TensorFlow',
      size: 7200,
      pulls: 12456,
      createdAt: '2024-10-10',
      updatedAt: '2024-10-28',
      description: 'TensorFlow 2.14.0 GPU 版本，内置 Keras，支持分布式训练',
      featured: true,
      verified: true,
      gpuSupport: true,
      cudaVersion: '11.8',
      pythonVersion: '3.11',
      frameworks: ['TensorFlow 2.14.0', 'Keras'],
      includesJupyter: false,
      registry: 'docker.io',
    },
    {
      id: 'img-003',
      name: 'jupyter-pytorch-notebook',
      tag: 'latest',
      category: 'official',
      framework: 'PyTorch',
      size: 9800,
      pulls: 8934,
      createdAt: '2024-11-01',
      updatedAt: '2024-11-08',
      description: 'Jupyter Notebook 环境，预装 PyTorch、NumPy、Pandas、Matplotlib 等常用库',
      featured: true,
      verified: true,
      gpuSupport: true,
      cudaVersion: '12.1',
      pythonVersion: '3.11',
      frameworks: ['PyTorch 2.1.0', 'Jupyter Lab'],
      includesJupyter: true,
      registry: 'fermi-registry.io',
    },
    {
      id: 'img-004',
      name: 'triton-inference-server',
      tag: '23.10-py3',
      category: 'official',
      framework: 'Triton',
      size: 12300,
      pulls: 5678,
      createdAt: '2024-10-20',
      updatedAt: '2024-11-05',
      description: 'NVIDIA Triton 推理服务器，支持 TensorRT、PyTorch、TensorFlow 等多种后端',
      featured: true,
      verified: true,
      gpuSupport: true,
      cudaVersion: '12.2',
      pythonVersion: '3.10',
      frameworks: ['Triton Server', 'TensorRT', 'ONNX'],
      includesJupyter: false,
      registry: 'nvcr.io',
    },
    {
      id: 'img-005',
      name: 'vllm-openai',
      tag: 'v0.2.1',
      category: 'official',
      framework: 'vLLM',
      size: 11500,
      pulls: 4521,
      createdAt: '2024-11-01',
      updatedAt: '2024-11-09',
      description: 'vLLM 高性能 LLM 推理引擎，兼容 OpenAI API 接口',
      featured: true,
      verified: true,
      gpuSupport: true,
      cudaVersion: '12.1',
      pythonVersion: '3.11',
      frameworks: ['vLLM', 'FastAPI'],
      includesJupyter: false,
      registry: 'docker.io',
    },
    {
      id: 'img-006',
      name: 'custom-llama-finetune',
      tag: 'v1.0',
      category: 'custom',
      framework: 'PyTorch',
      size: 13200,
      pulls: 156,
      createdAt: '2024-11-05',
      updatedAt: '2024-11-08',
      description: '自定义 LLaMA 微调环境，包含 LoRA、QLoRA、DeepSpeed 等工具',
      featured: false,
      verified: false,
      gpuSupport: true,
      cudaVersion: '12.1',
      pythonVersion: '3.10',
      frameworks: ['PyTorch 2.1.0', 'transformers', 'peft', 'DeepSpeed'],
      includesJupyter: true,
      registry: 'fermi-registry.io/user123',
    },
    {
      id: 'img-007',
      name: 'rapids-ml',
      tag: '23.10',
      category: 'community',
      framework: 'RAPIDS',
      size: 15600,
      pulls: 2341,
      createdAt: '2024-10-25',
      updatedAt: '2024-11-03',
      description: 'NVIDIA RAPIDS GPU 加速数据科学库，包含 cuDF、cuML、cuGraph',
      featured: false,
      verified: true,
      gpuSupport: true,
      cudaVersion: '11.8',
      pythonVersion: '3.10',
      frameworks: ['RAPIDS', 'cuDF', 'cuML', 'Dask'],
      includesJupyter: true,
      registry: 'nvcr.io',
    },
    {
      id: 'img-008',
      name: 'stable-diffusion-webui',
      tag: 'latest',
      category: 'community',
      framework: 'Stable Diffusion',
      size: 18900,
      pulls: 6789,
      createdAt: '2024-10-18',
      updatedAt: '2024-11-07',
      description: 'Stable Diffusion WebUI，包含 ControlNet、LoRA、各种扩展插件',
      featured: false,
      verified: false,
      gpuSupport: true,
      cudaVersion: '11.8',
      pythonVersion: '3.10',
      frameworks: ['Stable Diffusion', 'gradio'],
      includesJupyter: false,
      registry: 'docker.io',
    },
  ]);

  // 获取类别徽章
  const getCategoryBadge = (category: ContainerImage['category']) => {
    switch (category) {
      case 'official':
        return (
          <Badge className="bg-blue-600">
            <Shield className="w-3 h-3 mr-1" />
            官方镜像
          </Badge>
        );
      case 'custom':
        return <Badge variant="outline">自定义</Badge>;
      case 'community':
        return <Badge className="bg-purple-600">社区</Badge>;
    }
  };

  // 筛选镜像
  const filteredImages = images.filter((image) => {
    const matchesSearch =
      image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || image.category === filterCategory;
    const matchesFramework =
      filterFramework === 'all' || image.framework === filterFramework;
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'featured' && image.featured) ||
      (activeTab === 'official' && image.category === 'official') ||
      (activeTab === 'custom' && image.category === 'custom');

    return matchesSearch && matchesCategory && matchesFramework && matchesTab;
  });

  // 统计信息
  const stats = {
    total: images.length,
    official: images.filter((i) => i.category === 'official').length,
    custom: images.filter((i) => i.category === 'custom').length,
    featured: images.filter((i) => i.featured).length,
  };

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">镜像管理</h1>
        <p className="text-slate-600">
          管理容器镜像环境，使用平台内置镜像或构建自定义镜像
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总镜像数</p>
                <p className="text-3xl">{stats.total}</p>
              </div>
              <Container className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">官方镜像</p>
                <p className="text-3xl text-blue-600">{stats.official}</p>
              </div>
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">自定义镜像</p>
                <p className="text-3xl text-purple-600">{stats.custom}</p>
              </div>
              <Package className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">精选镜像</p>
                <p className="text-3xl text-orange-600">{stats.featured}</p>
              </div>
              <Star className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="featured">精选</TabsTrigger>
            <TabsTrigger value="official">官方</TabsTrigger>
            <TabsTrigger value="custom">我的自定义</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          添加自定义镜像
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索镜像名称、标签或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterFramework} onValueChange={setFilterFramework}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部框架</SelectItem>
            <SelectItem value="PyTorch">PyTorch</SelectItem>
            <SelectItem value="TensorFlow">TensorFlow</SelectItem>
            <SelectItem value="Triton">Triton</SelectItem>
            <SelectItem value="vLLM">vLLM</SelectItem>
            <SelectItem value="RAPIDS">RAPIDS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 镜像列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <Card
            key={image.id}
            className="border-2 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedImage(image);
              setIsImageDetailDialogOpen(true);
            }}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{image.name}</CardTitle>
                    {image.featured && <Star className="w-4 h-4 text-orange-500 fill-orange-500" />}
                    {image.verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(image.category)}
                    <Badge variant="outline" className="font-mono text-xs">
                      {image.tag}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      拉取镜像
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      复制标签
                    </DropdownMenuItem>
                    {image.category === 'custom' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除镜像
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                {image.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 框架标签 */}
              {image.frameworks && image.frameworks.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {image.frameworks.slice(0, 3).map((fw) => (
                    <Badge key={fw} variant="outline" className="text-xs bg-slate-50">
                      {fw}
                    </Badge>
                  ))}
                  {image.frameworks.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-slate-50">
                      +{image.frameworks.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* 规格信息 */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-slate-600">GPU支持</p>
                    <p className="font-medium">
                      {image.gpuSupport ? `CUDA ${image.cudaVersion}` : '仅CPU'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-600">Python</p>
                    <p className="font-medium">{image.pythonVersion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-slate-600">镜像大小</p>
                    <p className="font-medium">{(image.size / 1024).toFixed(1)} GB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-slate-600">拉取次数</p>
                    <p className="font-medium">{image.pulls.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* 底部信息 */}
              <div className="flex items-center justify-between pt-3 border-t text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>更新于 {image.updatedAt}</span>
                </div>
                {image.includesJupyter && (
                  <Badge variant="outline" className="text-xs">
                    <Terminal className="w-3 h-3 mr-1" />
                    Jupyter
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Container className="w-16 h-16 mx-auto text-slate-300" />
            <div>
              <h3 className="text-xl mb-2">没有找到镜像</h3>
              <p className="text-slate-600">调整筛选条件或添加自定义镜像</p>
            </div>
          </div>
        </Card>
      )}

      {/* 添加自定义镜像对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">添加自定义镜像</DialogTitle>
            <DialogDescription>从镜像仓库添加或通过 Dockerfile 构建</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="registry" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registry">从仓库添加</TabsTrigger>
              <TabsTrigger value="dockerfile">Dockerfile 构建</TabsTrigger>
            </TabsList>

            {/* 从仓库添加 */}
            <TabsContent value="registry" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="registry">镜像仓库</Label>
                <Select
                  value={customImage.registry}
                  onValueChange={(value) => setCustomImage({ ...customImage, registry: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="docker.io">Docker Hub (docker.io)</SelectItem>
                    <SelectItem value="nvcr.io">NVIDIA NGC (nvcr.io)</SelectItem>
                    <SelectItem value="fermi-registry.io">费米私有仓库</SelectItem>
                    <SelectItem value="custom">自定义仓库地址</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-name">镜像名称 *</Label>
                <Input
                  id="image-name"
                  placeholder="例如: pytorch/pytorch"
                  value={customImage.name}
                  onChange={(e) => setCustomImage({ ...customImage, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-tag">镜像标签</Label>
                <Input
                  id="image-tag"
                  placeholder="latest"
                  value={customImage.tag}
                  onChange={(e) => setCustomImage({ ...customImage, tag: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-desc">描述</Label>
                <Textarea
                  id="image-desc"
                  placeholder="简要描述此镜像的用途和特性"
                  value={customImage.description}
                  onChange={(e) => setCustomImage({ ...customImage, description: e.target.value })}
                  rows={3}
                />
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-900 text-sm">
                  完整镜像地址将是: {customImage.registry}/{customImage.name}:{customImage.tag}
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
                  onChange={(e) => setCustomImage({ ...customImage, name: e.target.value })}
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
                  onChange={(e) => setCustomImage({ ...customImage, dockerfile: e.target.value })}
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
                // TODO: 提交自定义镜像
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
                        <p className="text-xs text-slate-600 mb-1">标签</p>
                        <p className="font-mono text-sm">{selectedImage.tag}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">类别</p>
                        {getCategoryBadge(selectedImage.category)}
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">镜像仓库</p>
                        <p className="font-mono text-sm">{selectedImage.registry}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">创建时间</p>
                        <p>{selectedImage.createdAt}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">最后更新</p>
                        <p>{selectedImage.updatedAt}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-2">描述</p>
                      <p className="text-sm">{selectedImage.description}</p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded text-green-400 font-mono text-xs">
                      docker pull {selectedImage.registry}/{selectedImage.name}:
                      {selectedImage.tag}
                    </div>
                  </CardContent>
                </Card>

                {/* 环境信息 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>环境规格</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className="w-5 h-5 text-green-600" />
                          <p className="font-medium">GPU 支持</p>
                        </div>
                        <p className="text-sm">
                          {selectedImage.gpuSupport
                            ? `CUDA ${selectedImage.cudaVersion}`
                            : '仅 CPU'}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileCode className="w-5 h-5 text-blue-600" />
                          <p className="font-medium">Python 版本</p>
                        </div>
                        <p className="text-sm">{selectedImage.pythonVersion}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <HardDrive className="w-5 h-5 text-purple-600" />
                          <p className="font-medium">镜像大小</p>
                        </div>
                        <p className="text-sm">{(selectedImage.size / 1024).toFixed(2)} GB</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Download className="w-5 h-5 text-orange-600" />
                          <p className="font-medium">拉取次数</p>
                        </div>
                        <p className="text-sm">{selectedImage.pulls.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 预装框架 */}
                {selectedImage.frameworks && selectedImage.frameworks.length > 0 && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>预装框架和工具</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.frameworks.map((fw) => (
                          <Badge key={fw} variant="outline" className="bg-slate-50">
                            <Layers className="w-3 h-3 mr-1.5" />
                            {fw}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="pt-6 border-t">
            <Button variant="outline" onClick={() => setIsImageDetailDialogOpen(false)}>
              关闭
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              使用此镜像
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}