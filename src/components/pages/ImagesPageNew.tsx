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
import { Switch } from '../ui/switch';
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
  Globe,
  Lock,
  Cloud,
  GitBranch,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getContainerImages,
  formatBytes,
  formatRelativeTime,
  type ContainerImage,
  type ImageAvailabilityZone,
  type ImageVisibility,
} from '../../services/mockDataService';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../contexts/AuthContext';

export default function ImagesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFramework, setFilterFramework] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<ImageAvailabilityZone | 'all'>('all');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPullDialogOpen, setIsPullDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [isImageDetailDialogOpen, setIsImageDetailDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ContainerImage | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [images, setImages] = useState<ContainerImage[]>([]);
  const [loading, setLoading] = useState(true);

  // 自定义镜像表单状态
  const [customImage, setCustomImage] = useState({
    name: '',
    tag: 'latest',
    registry: 'docker.io',
    description: '',
    dockerfile: '',
    buildMethod: 'registry',
    availabilityZone: 'cn-north-1a' as ImageAvailabilityZone,
    visibility: 'private' as ImageVisibility,
  });

  // 外部镜像拉取表单状态
  const [pullImageForm, setPullImageForm] = useState({
    sourceRegistry: '',
    imageName: '',
    tag: 'latest',
    targetZone: 'cn-north-1a' as ImageAvailabilityZone,
    visibility: 'private' as ImageVisibility,
  });

  // 镜像同步表单状态
  const [syncImageForm, setSyncImageForm] = useState({
    targetZones: [] as ImageAvailabilityZone[],
  });

  // 可用区列表
  const availabilityZones: { value: ImageAvailabilityZone; label: string }[] = [
    { value: 'cn-north-1a', label: '华北1区-A' },
    { value: 'cn-north-1b', label: '华北1区-B' },
    { value: 'cn-east-1a', label: '华东1区-A' },
    { value: 'cn-south-1a', label: '华南1区-A' },
  ];

  // 加载镜像数据
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await getContainerImages();
      setImages(data);
    } catch (error) {
      console.error('Failed to load images:', error);
      toast.error('加载镜像列表失败');
    } finally {
      setLoading(false);
    }
  };

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
    const matchesFramework =
      filterFramework === 'all' || image.framework === filterFramework;
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'featured' && image.featured) ||
      (activeTab === 'official' && image.category === 'official') ||
      (activeTab === 'custom' && image.category === 'custom');

    // 可用区筛选
    const matchesZone = 
      selectedZone === 'all' || 
      image.availabilityZone === selectedZone || 
      image.syncedZones?.includes(selectedZone as ImageAvailabilityZone);
    
    // 可见性筛选
    const matchesVisibility = 
      filterVisibility === 'all' || 
      image.visibility === filterVisibility;
    
    // 私有镜像权限控制：只有创建者可见
    const hasPermission = 
      image.visibility === 'public' || 
      image.createdBy === user?.username;

    return matchesSearch && matchesFramework && matchesTab && matchesZone && matchesVisibility && hasPermission;
  });

  // 统计信息
  const stats = {
    total: images.length,
    official: images.filter((i) => i.category === 'official').length,
    custom: images.filter((i) => i.category === 'custom').length,
    featured: images.filter((i) => i.featured).length,
  };

  // 处理镜像操作
  const handlePullImage = (image: ContainerImage) => {
    toast.success(`正在拉取镜像: ${image.fullPath}`);
    // 模拟拉取过程
    setTimeout(() => {
      toast.success(`镜像拉取完成: ${image.name}:${image.tag}`);
    }, 2000);
  };

  const handleCopyTag = (image: ContainerImage) => {
    navigator.clipboard.writeText(image.fullPath);
    toast.success('镜像地址已复制到剪贴板');
  };

  const handleDeleteImage = (image: ContainerImage) => {
    if (image.category !== 'custom') {
      toast.error('只能删除自定义镜像');
      return;
    }
    toast.success(`镜像 ${image.name}:${image.tag} 已删除`);
    setImages(images.filter((i) => i.id !== image.id));
  };

  const handleCreateImage = () => {
    if (!customImage.name) {
      toast.error('请输入镜像名称');
      return;
    }

    if (customImage.buildMethod === 'dockerfile' && !customImage.dockerfile) {
      toast.error('请输入 Dockerfile 内容');
      return;
    }

    toast.success('镜像创建任务已提交，正在构建中...');
    setIsCreateDialogOpen(false);
    
    // 重置表单
    setCustomImage({
      name: '',
      tag: 'latest',
      registry: 'docker.io',
      description: '',
      dockerfile: '',
      buildMethod: 'registry',
      availabilityZone: 'cn-north-1a' as ImageAvailabilityZone,
      visibility: 'private' as ImageVisibility,
    });
  };

  const handlePullExternalImage = () => {
    if (!pullImageForm.sourceRegistry || !pullImageForm.imageName) {
      toast.error('请输入完整的镜像路径');
      return;
    }

    toast.success('镜像拉取任务已提交，正在拉取中...');
    setIsPullDialogOpen(false);
    
    // 重置表单
    setPullImageForm({
      sourceRegistry: '',
      imageName: '',
      tag: 'latest',
      targetZone: 'cn-north-1a' as ImageAvailabilityZone,
      visibility: 'private' as ImageVisibility,
    });
  };

  const handleSyncImage = () => {
    if (syncImageForm.targetZones.length === 0) {
      toast.error('请选择目标可用区');
      return;
    }

    toast.success('镜像同步任务已提交，正在同步中...');
    setIsSyncDialogOpen(false);
    
    // 重置表单
    setSyncImageForm({
      targetZones: [] as ImageAvailabilityZone[],
    });
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <h1 className="text-3xl mb-2">镜像管理</h1>
        <p className="text-slate-600">
          管理容器镜像环境，使用平台内置镜像或构建自定义镜像
        </p>
      </div>

      {/* 使用说明 */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <Info className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-sm">
          <strong className="text-blue-900">📦 镜像数据来源：</strong>
          <div className="mt-2 text-slate-700 space-y-1">
            <p>• <strong>官方镜像</strong>：从 Docker Hub、NVIDIA NGC 等公共仓库同步，平台验证后提供</p>
            <p>• <strong>社区镜像</strong>：第三方开发者贡献，经过平台审核</p>
            <p>• <strong>自定义镜像</strong>：用户通过 Dockerfile 构建或从私有仓库导入</p>
            <p>• <strong>使用场景</strong>：为开发环境、训练任务、推理服务提供基础运行环境</p>
          </div>
        </AlertDescription>
      </Alert>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总镜像数</p>
                <p className="text-3xl">{stats.total}</p>
                <p className="text-xs text-slate-500 mt-1">来源：容器仓库同步</p>
              </div>
              <Container className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">官方镜像</p>
                <p className="text-3xl text-blue-600">{stats.official}</p>
                <p className="text-xs text-slate-500 mt-1">平台验证</p>
              </div>
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">自定义镜像</p>
                <p className="text-3xl text-purple-600">{stats.custom}</p>
                <p className="text-xs text-slate-500 mt-1">用户创建</p>
              </div>
              <Package className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">精选镜像</p>
                <p className="text-3xl text-orange-600">{stats.featured}</p>
                <p className="text-xs text-slate-500 mt-1">推荐使用</p>
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
            <TabsTrigger value="all">全部 ({images.length})</TabsTrigger>
            <TabsTrigger value="featured">精选 ({stats.featured})</TabsTrigger>
            <TabsTrigger value="official">官方 ({stats.official})</TabsTrigger>
            <TabsTrigger value="custom">自定义 ({stats.custom})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadImages} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            添加镜像
          </Button>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索镜像名称、标签或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedZone} onValueChange={(value: any) => setSelectedZone(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择可用区" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部可用区</SelectItem>
            {availabilityZones.map((zone) => (
              <SelectItem key={zone.value} value={zone.value}>
                {zone.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterVisibility} onValueChange={(value: any) => setFilterVisibility(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="可见性" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="public">公开</SelectItem>
            <SelectItem value="private">私有</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterFramework} onValueChange={setFilterFramework}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="全部框架" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部框架</SelectItem>
            <SelectItem value="PyTorch">PyTorch</SelectItem>
            <SelectItem value="TensorFlow">TensorFlow</SelectItem>
            <SelectItem value="Triton">Triton</SelectItem>
            <SelectItem value="vLLM">vLLM</SelectItem>
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
                  <div className="flex items-center gap-2 flex-wrap">
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
                    <DropdownMenuItem onClick={() => handlePullImage(image)}>
                      <Download className="w-4 h-4 mr-2" />
                      拉取镜像
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyTag(image)}>
                      <Copy className="w-4 h-4 mr-2" />
                      复制路径
                    </DropdownMenuItem>
                    {image.category === 'custom' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteImage(image)}
                        >
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
                    <p className="text-xs text-slate-600">大小</p>
                    <p className="font-medium">{formatBytes(image.sizeBytes)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-slate-600">拉取</p>
                    <p className="font-medium">{image.pullCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* 底部信息 */}
              <div className="flex items-center justify-between pt-3 border-t text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatRelativeTime(image.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {image.registry}
                  </Badge>
                  {image.includesJupyter && (
                    <Badge variant="outline" className="text-xs">
                      <Terminal className="w-3 h-3 mr-1" />
                      Jupyter
                    </Badge>
                  )}
                </div>
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
            <DialogTitle className="text-2xl">添加镜像</DialogTitle>
            <DialogDescription>从镜像仓库添加或通过 Dockerfile 构建</DialogDescription>
          </DialogHeader>

          <Tabs value={customImage.buildMethod} onValueChange={(v) => setCustomImage({ ...customImage, buildMethod: v })} className="w-full">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availability-zone">目标可用区 *</Label>
                  <Select
                    value={customImage.availabilityZone}
                    onValueChange={(value: ImageAvailabilityZone) => setCustomImage({ ...customImage, availabilityZone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityZones.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">可见性 *</Label>
                  <Select
                    value={customImage.visibility}
                    onValueChange={(value: ImageVisibility) => setCustomImage({ ...customImage, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>公开</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <span>私有</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <div className="space-y-1">
                    <p>完整镜像地址: {customImage.registry}/{customImage.name}:{customImage.tag}</p>
                    <p>• 镜像将拉取到 <strong>{availabilityZones.find(z => z.value === customImage.availabilityZone)?.label}</strong> 的 Harbor 仓库</p>
                    <p>• 可见性: <strong>{customImage.visibility === 'public' ? '公开（所有用户可见）' : '私有（仅您可见）'}</strong></p>
                  </div>
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
            <Button onClick={handleCreateImage}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {customImage.buildMethod === 'registry' ? '添加镜像' : '开始构建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 拉取外部镜像对话框 */}
      <Dialog open={isPullDialogOpen} onOpenChange={setIsPullDialogOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">拉取外部镜像</DialogTitle>
            <DialogDescription>从外部镜像仓库拉取镜像到平台</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="source-registry">源镜像仓库</Label>
              <Input
                id="source-registry"
                placeholder="例如: docker.io"
                value={pullImageForm.sourceRegistry}
                onChange={(e) => setPullImageForm({ ...pullImageForm, sourceRegistry: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-name">镜像名称 *</Label>
              <Input
                id="image-name"
                placeholder="例如: pytorch/pytorch"
                value={pullImageForm.imageName}
                onChange={(e) => setPullImageForm({ ...pullImageForm, imageName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-tag">镜像标签</Label>
              <Input
                id="image-tag"
                placeholder="latest"
                value={pullImageForm.tag}
                onChange={(e) => setPullImageForm({ ...pullImageForm, tag: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-zone">目标可用区</Label>
              <Select
                value={pullImageForm.targetZone}
                onValueChange={(value) => setPullImageForm({ ...pullImageForm, targetZone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availabilityZones.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">可见性</Label>
              <Select
                value={pullImageForm.visibility}
                onValueChange={(value) => setPullImageForm({ ...pullImageForm, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">公开</SelectItem>
                  <SelectItem value="private">私有</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                完整镜像地址: {pullImageForm.sourceRegistry}/{pullImageForm.imageName}:{pullImageForm.tag}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPullDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handlePullExternalImage}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              开始拉取
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 同步镜像对话框 */}
      <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">同步镜像</DialogTitle>
            <DialogDescription>将镜像同步到其他可用区</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="target-zones">目标可用区</Label>
              <Select
                value={syncImageForm.targetZones}
                onValueChange={(value) => setSyncImageForm({ ...syncImageForm, targetZones: value })}
                multiple
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择可用区" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityZones.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                选择要同步镜像的目标可用区
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSyncDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSyncImage}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              开始同步
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
              <div className="space-y-6 pr-6">
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
                        <p>{new Date(selectedImage.createdAt).toLocaleString('zh-CN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">最后更新</p>
                        <p>{formatRelativeTime(selectedImage.updatedAt)}</p>
                      </div>
                      {selectedImage.createdBy && (
                        <div>
                          <p className="text-xs text-slate-600 mb-1">创建者</p>
                          <p>{selectedImage.createdBy}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-600 mb-1">镜像ID</p>
                        <p className="font-mono text-xs">{selectedImage.digest}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-2">描述</p>
                      <p className="text-sm">{selectedImage.description}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-2">完整路径</p>
                      <div className="p-3 bg-slate-900 rounded text-green-400 font-mono text-xs flex items-center justify-between">
                        <span>docker pull {selectedImage.fullPath}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-green-400 hover:text-green-300"
                          onClick={() => handleCopyTag(selectedImage)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
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
                        <p className="text-sm">{formatBytes(selectedImage.sizeBytes)}</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Download className="w-5 h-5 text-orange-600" />
                          <p className="font-medium">拉取次数</p>
                        </div>
                        <p className="text-sm">{selectedImage.pullCount.toLocaleString()}</p>
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
            <Button onClick={() => selectedImage && handlePullImage(selectedImage)}>
              <Download className="w-4 h-4 mr-2" />
              使用此镜像
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}