import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  HardDrive, 
  FolderOpen, 
  ChevronRight, 
  Folder,
  File as FileIcon,
  Database,
  Info,
  Check,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';
import { 
  type CreateDatasetRequest,
  type AvailabilityZone,
  type DatasetVisibility,
  getAvailabilityZoneLabel,
  getVisibilityLabel
} from '../../services/datasetService';
import { getStorageVolumes, type StorageVolume } from '../../services/storageService';
import { toast } from 'sonner@2.0.3';

interface CreateDatasetFromVolumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface DirectoryItem {
  name: string;
  path: string;
  type: 'directory' | 'file';
  size?: number;
  modifiedAt?: string;
}

export function CreateDatasetFromVolumeDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateDatasetFromVolumeDialogProps) {
  const [step, setStep] = useState<'select-volume' | 'select-path' | 'configure'>('select-volume');
  const [volumes, setVolumes] = useState<StorageVolume[]>([]);
  const [loadingVolumes, setLoadingVolumes] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<StorageVolume | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [loadingDirs, setLoadingDirs] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'image' as 'text' | 'image' | 'audio' | 'video' | 'mixed',
    description: '',
    availabilityZone: 'cn-north-1a' as AvailabilityZone,
    visibility: 'private' as DatasetVisibility,
  });

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      loadVolumes();
    }
  }, [open]);

  useEffect(() => {
    if (selectedVolume && step === 'select-path') {
      loadDirectories(currentPath);
    }
  }, [selectedVolume, currentPath, step]);

  const loadVolumes = async () => {
    setLoadingVolumes(true);
    try {
      const data = await getStorageVolumes();
      // 只显示可用状态的存储卷（available 或 bound）
      setVolumes(data.filter(v => v.status === 'available' || v.status === 'bound'));
    } catch (error) {
      toast.error('加载存储卷失败');
    } finally {
      setLoadingVolumes(false);
    }
  };

  // 模拟加载目录结构
  const loadDirectories = async (path: string) => {
    setLoadingDirs(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 根据路径生成不同的目录结构
      let mockDirs: DirectoryItem[] = [];
      
      if (path === '/') {
        // 根目录
        mockDirs = [
          { name: 'datasets', path: '/datasets/', type: 'directory' },
          { name: 'workspace', path: '/workspace/', type: 'directory' },
          { name: 'experiments', path: '/experiments/', type: 'directory' },
          { name: 'models', path: '/models/', type: 'directory' },
          { name: 'temp', path: '/temp/', type: 'directory' },
          { name: 'README.md', path: '/README.md', type: 'file', size: 2048, modifiedAt: '2024-11-10 14:30' },
        ];
      } else if (path === '/datasets/') {
        // datasets 目录
        mockDirs = [
          { name: 'imagenet-2024', path: '/datasets/imagenet-2024/', type: 'directory' },
          { name: 'cifar10-augmented', path: '/datasets/cifar10-augmented/', type: 'directory' },
          { name: 'coco-detection', path: '/datasets/coco-detection/', type: 'directory' },
          { name: 'custom-dataset-v1', path: '/datasets/custom-dataset-v1/', type: 'directory' },
          { name: 'text-corpus', path: '/datasets/text-corpus/', type: 'directory' },
          { name: 'audio-samples', path: '/datasets/audio-samples/', type: 'directory' },
          { name: 'video-clips', path: '/datasets/video-clips/', type: 'directory' },
          { name: 'dataset-index.json', path: '/datasets/dataset-index.json', type: 'file', size: 15360, modifiedAt: '2024-11-12 09:15' },
        ];
      } else if (path === '/datasets/imagenet-2024/') {
        // imagenet 数据集目录
        mockDirs = [
          { name: 'train', path: '/datasets/imagenet-2024/train/', type: 'directory' },
          { name: 'val', path: '/datasets/imagenet-2024/val/', type: 'directory' },
          { name: 'test', path: '/datasets/imagenet-2024/test/', type: 'directory' },
          { name: 'metadata.json', path: '/datasets/imagenet-2024/metadata.json', type: 'file', size: 8192, modifiedAt: '2024-11-08 16:20' },
          { name: 'labels.txt', path: '/datasets/imagenet-2024/labels.txt', type: 'file', size: 10240, modifiedAt: '2024-11-08 16:20' },
          { name: 'statistics.csv', path: '/datasets/imagenet-2024/statistics.csv', type: 'file', size: 5120, modifiedAt: '2024-11-09 10:45' },
        ];
      } else if (path === '/datasets/imagenet-2024/train/') {
        // train 子目录
        mockDirs = [
          { name: 'n01440764', path: '/datasets/imagenet-2024/train/n01440764/', type: 'directory' },
          { name: 'n01443537', path: '/datasets/imagenet-2024/train/n01443537/', type: 'directory' },
          { name: 'n01484850', path: '/datasets/imagenet-2024/train/n01484850/', type: 'directory' },
          { name: 'n01491361', path: '/datasets/imagenet-2024/train/n01491361/', type: 'directory' },
          { name: 'n01494475', path: '/datasets/imagenet-2024/train/n01494475/', type: 'directory' },
          { name: 'n01496331', path: '/datasets/imagenet-2024/train/n01496331/', type: 'directory' },
        ];
      } else if (path === '/datasets/cifar10-augmented/') {
        // cifar10 数据集
        mockDirs = [
          { name: 'airplane', path: '/datasets/cifar10-augmented/airplane/', type: 'directory' },
          { name: 'automobile', path: '/datasets/cifar10-augmented/automobile/', type: 'directory' },
          { name: 'bird', path: '/datasets/cifar10-augmented/bird/', type: 'directory' },
          { name: 'cat', path: '/datasets/cifar10-augmented/cat/', type: 'directory' },
          { name: 'deer', path: '/datasets/cifar10-augmented/deer/', type: 'directory' },
          { name: 'dog', path: '/datasets/cifar10-augmented/dog/', type: 'directory' },
          { name: 'frog', path: '/datasets/cifar10-augmented/frog/', type: 'directory' },
          { name: 'horse', path: '/datasets/cifar10-augmented/horse/', type: 'directory' },
          { name: 'ship', path: '/datasets/cifar10-augmented/ship/', type: 'directory' },
          { name: 'truck', path: '/datasets/cifar10-augmented/truck/', type: 'directory' },
          { name: 'augmentation_config.yaml', path: '/datasets/cifar10-augmented/augmentation_config.yaml', type: 'file', size: 2048, modifiedAt: '2024-11-11 13:25' },
        ];
      } else if (path === '/workspace/') {
        // workspace 目录
        mockDirs = [
          { name: 'processed', path: '/workspace/processed/', type: 'directory' },
          { name: 'augmented', path: '/workspace/augmented/', type: 'directory' },
          { name: 'output', path: '/workspace/output/', type: 'directory' },
          { name: 'cache', path: '/workspace/cache/', type: 'directory' },
          { name: 'notebooks', path: '/workspace/notebooks/', type: 'directory' },
          { name: 'scripts', path: '/workspace/scripts/', type: 'directory' },
        ];
      } else if (path === '/workspace/processed/') {
        // processed 目录
        mockDirs = [
          { name: 'dataset-v1', path: '/workspace/processed/dataset-v1/', type: 'directory' },
          { name: 'dataset-v2', path: '/workspace/processed/dataset-v2/', type: 'directory' },
          { name: 'dataset-v3', path: '/workspace/processed/dataset-v3/', type: 'directory' },
          { name: 'filtered-data', path: '/workspace/processed/filtered-data/', type: 'directory' },
          { name: 'merged-data', path: '/workspace/processed/merged-data/', type: 'directory' },
          { name: 'processing_log.txt', path: '/workspace/processed/processing_log.txt', type: 'file', size: 25600, modifiedAt: '2024-11-13 11:30' },
        ];
      } else if (path === '/workspace/augmented/') {
        // augmented 目录
        mockDirs = [
          { name: 'rotation', path: '/workspace/augmented/rotation/', type: 'directory' },
          { name: 'flip', path: '/workspace/augmented/flip/', type: 'directory' },
          { name: 'color', path: '/workspace/augmented/color/', type: 'directory' },
          { name: 'combined', path: '/workspace/augmented/combined/', type: 'directory' },
          { name: 'augmentation_stats.json', path: '/workspace/augmented/augmentation_stats.json', type: 'file', size: 4096, modifiedAt: '2024-11-14 08:15' },
        ];
      } else if (path === '/experiments/') {
        // experiments 目录
        mockDirs = [
          { name: 'exp-001-baseline', path: '/experiments/exp-001-baseline/', type: 'directory' },
          { name: 'exp-002-augmented', path: '/experiments/exp-002-augmented/', type: 'directory' },
          { name: 'exp-003-filtered', path: '/experiments/exp-003-filtered/', type: 'directory' },
          { name: 'exp-004-mixed', path: '/experiments/exp-004-mixed/', type: 'directory' },
          { name: 'experiment_results.xlsx', path: '/experiments/experiment_results.xlsx', type: 'file', size: 51200, modifiedAt: '2024-11-13 17:40' },
        ];
      } else if (path === '/models/') {
        // models 目录
        mockDirs = [
          { name: 'checkpoints', path: '/models/checkpoints/', type: 'directory' },
          { name: 'final', path: '/models/final/', type: 'directory' },
          { name: 'pretrained', path: '/models/pretrained/', type: 'directory' },
          { name: 'model_config.json', path: '/models/model_config.json', type: 'file', size: 3072, modifiedAt: '2024-11-12 14:55' },
        ];
      } else {
        // 默认：空目录或通用文件
        mockDirs = [
          { name: 'data', path: `${path}data/`, type: 'directory' },
          { name: 'images', path: `${path}images/`, type: 'directory' },
          { name: 'annotations', path: `${path}annotations/`, type: 'directory' },
          { name: 'info.txt', path: `${path}info.txt`, type: 'file', size: 512, modifiedAt: '2024-11-10 10:00' },
        ];
      }

      setDirectories(mockDirs);
    } catch (error) {
      toast.error('加载目录失败');
    } finally {
      setLoadingDirs(false);
    }
  };

  const handleVolumeSelect = (volume: StorageVolume) => {
    setSelectedVolume(volume);
    setCurrentPath('/');
    setStep('select-path');
  };

  const handleNavigateToDir = (dir: DirectoryItem) => {
    if (dir.type === 'directory') {
      setCurrentPath(dir.path);
    }
  };

  const handleSelectPath = (path: string) => {
    setSelectedPath(path);
  };

  const handleBackToBrowse = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      pathParts.pop();
      setCurrentPath('/' + pathParts.join('/') + (pathParts.length > 0 ? '/' : ''));
    }
  };

  const handleContinueToConfig = () => {
    if (!selectedPath) {
      toast.error('请选择一个目录');
      return;
    }
    
    // 自动推荐数据集名称（从路径提取目录名）
    const pathParts = selectedPath.split('/').filter(Boolean);
    const suggestedName = pathParts[pathParts.length - 1] || 'dataset';
    if (!formData.name) {
      setFormData(prev => ({ ...prev, name: suggestedName }));
    }
    
    setStep('configure');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入数据集名称');
      return;
    }

    if (!selectedVolume || !selectedPath) {
      toast.error('请选择存储卷和目录');
      return;
    }

    setCreating(true);
    try {
      // 模拟创建数据集
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`数据集创建成功！从 ${selectedVolume.name}:${selectedPath} 导入`);
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error('创建数据集失败');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setStep('select-volume');
      setSelectedVolume(null);
      setCurrentPath('/');
      setSelectedPath('');
      setFormData({
        name: '',
        type: 'image',
        description: '',
        availabilityZone: 'cn-north-1a',
        visibility: 'private',
      });
      onOpenChange(false);
    }
  };

  const filteredDirectories = directories.filter(dir => 
    dir.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            从存储卷创建数据集
          </DialogTitle>
          <DialogDescription>
            从已挂载的存储卷中选择目录来创建新的数据集
          </DialogDescription>
        </DialogHeader>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 py-4 border-y">
          <div className={`flex items-center gap-2 ${step === 'select-volume' ? 'text-purple-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'select-volume' ? 'bg-purple-600 text-white' : 'bg-slate-200'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">选择存储卷</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center gap-2 ${step === 'select-path' ? 'text-purple-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'select-path' ? 'bg-purple-600 text-white' : 'bg-slate-200'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">选择目录</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center gap-2 ${step === 'configure' ? 'text-purple-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'configure' ? 'bg-purple-600 text-white' : 'bg-slate-200'
            }`}>
              3
            </div>
            <span className="text-sm font-medium">配置信息</span>
          </div>
        </div>

        <ScrollArea className="max-h-[50vh] pr-4">
          {/* 步骤 1: 选择存储卷 */}
          {step === 'select-volume' && (
            <div className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  选择包含数据的存储卷。系统将从该存储卷的指定目录创建数据集。
                </AlertDescription>
              </Alert>

              {loadingVolumes ? (
                <div className="py-12 text-center text-slate-600">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>加载存储卷...</p>
                </div>
              ) : volumes.length === 0 ? (
                <div className="py-12 text-center">
                  <HardDrive className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">暂无可用的存储卷</p>
                  <p className="text-sm text-slate-500">请先在存储管理中创建存储卷</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {volumes.map((volume) => (
                    <Card
                      key={volume.id}
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        selectedVolume?.id === volume.id ? 'border-purple-500 bg-purple-50/50' : ''
                      }`}
                      onClick={() => handleVolumeSelect(volume)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-purple-600" />
                            <h4 className="font-medium">{volume.name}</h4>
                          </div>
                          {selectedVolume?.id === volume.id && (
                            <Check className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mb-3">{volume.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {volume.poolType === 'file' ? '文件存储' : '对象存储'}
                              </Badge>
                              <span className="text-slate-500">{volume.poolName}</span>
                            </div>
                            <span className="text-slate-600 font-medium">
                              {volume.usedGB}GB / {volume.capacityGB}GB
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all ${
                                (volume.usedGB / volume.capacityGB * 100) > 90 ? 'bg-red-500' : 
                                (volume.usedGB / volume.capacityGB * 100) > 70 ? 'bg-yellow-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${Math.min((volume.usedGB / volume.capacityGB * 100), 100)}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 步骤 2: 选择目录 */}
          {step === 'select-path' && selectedVolume && (
            <div className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p>浏览 <strong>{selectedVolume.name}</strong> 的目录结构，选择包含数据的目录</p>
                    <p className="text-xs text-slate-600">💡 提示：单击目录选择，双击目录进入查看子目录</p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* 当前路径面包屑 */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                <HardDrive className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{selectedVolume.name}</span>
                <span className="text-slate-400">:</span>
                <span className="text-sm font-mono text-slate-600">{currentPath || '/'}</span>
                {currentPath !== '/' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToBrowse}
                    className="ml-auto"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                    返回上级
                  </Button>
                )}
              </div>

              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索目录或文件..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* 目录列表 */}
              {loadingDirs ? (
                <div className="py-12 text-center text-slate-600">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>加载目录...</p>
                </div>
              ) : filteredDirectories.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>{searchTerm ? '未找到匹配的目录或文件' : '此目录为空'}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1 mb-2">
                    <span>共 {filteredDirectories.length} 项</span>
                    <span>单击选择 • 双击进入</span>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-4">
                      {filteredDirectories.map((item) => (
                    <Card
                      key={item.path}
                      className={`cursor-pointer hover:shadow-sm transition-all ${
                        selectedPath === item.path ? 'border-purple-500 bg-purple-50/50' : ''
                      }`}
                      onClick={() => {
                        if (item.type === 'directory') {
                          handleSelectPath(item.path);
                        }
                      }}
                      onDoubleClick={() => {
                        if (item.type === 'directory') {
                          handleNavigateToDir(item);
                        }
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {item.type === 'directory' ? (
                              <Folder className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            ) : (
                              <FileIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                {item.type === 'file' && item.size && (
                                  <span>
                                    {item.size >= 1048576 
                                      ? `${(item.size / 1048576).toFixed(1)} MB`
                                      : `${(item.size / 1024).toFixed(1)} KB`}
                                  </span>
                                )}
                                {item.modifiedAt && (
                                  <>
                                    {item.size && <span>•</span>}
                                    <span>{item.modifiedAt}</span>
                                  </>
                                )}
                                {item.type === 'directory' && (
                                  <span className="text-blue-600">双击进入</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedPath === item.path && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                已选择
                              </Badge>
                            )}
                            {item.type === 'directory' && (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}

              {selectedPath && (
                <Alert className="bg-purple-50 border-purple-200">
                  <Check className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-purple-900">
                    已选择目录: <strong className="font-mono">{selectedPath}</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* 步骤 3: 配置数据集信息 */}
          {step === 'configure' && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <Check className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  <div className="space-y-1">
                    <p>
                      <strong>数据源：</strong>
                      <span className="font-mono text-sm ml-2">
                        {selectedVolume?.name}:{selectedPath}
                      </span>
                    </p>
                    <p className="text-xs text-green-700">
                      数据集将引用此目录，不会复制数据，节省存储空间
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="dataset-name">数据集名称 *</Label>
                  <Input
                    id="dataset-name"
                    placeholder="例如: imagenet-augmented"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    💡 已根据目录名称自动填充，可手动修改
                  </p>
                </div>

                <div>
                  <Label htmlFor="dataset-type">数据类型 *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">文本数据</SelectItem>
                      <SelectItem value="image">图像数据</SelectItem>
                      <SelectItem value="audio">音频数据</SelectItem>
                      <SelectItem value="video">视频数据</SelectItem>
                      <SelectItem value="mixed">混合数据</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dataset-description">描述（可选）</Label>
                  <Textarea
                    id="dataset-description"
                    placeholder="描述数据集的内容、来源和用途&#10;例如：基于 ImageNet 进行数据扩增（旋转、翻转、颜色抖动），共生成 3 倍数据"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availability-zone">可用区 *</Label>
                    <Select
                      value={formData.availabilityZone}
                      onValueChange={(value: any) => setFormData({ ...formData, availabilityZone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cn-north-1a">
                          {getAvailabilityZoneLabel('cn-north-1a')}
                        </SelectItem>
                        <SelectItem value="cn-north-1b">
                          {getAvailabilityZoneLabel('cn-north-1b')}
                        </SelectItem>
                        <SelectItem value="cn-east-1a">
                          {getAvailabilityZoneLabel('cn-east-1a')}
                        </SelectItem>
                        <SelectItem value="cn-south-1a">
                          {getAvailabilityZoneLabel('cn-south-1a')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="visibility">可见性 *</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          {getVisibilityLabel('private')}
                        </SelectItem>
                        <SelectItem value="team">
                          {getVisibilityLabel('team')}
                        </SelectItem>
                        <SelectItem value="organization">
                          {getVisibilityLabel('organization')}
                        </SelectItem>
                        <SelectItem value="public">
                          {getVisibilityLabel('public')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {step !== 'select-volume' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 'select-path') {
                    setStep('select-volume');
                    setSelectedPath('');
                  } else if (step === 'configure') {
                    setStep('select-path');
                  }
                }}
                disabled={creating}
              >
                上一步
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={creating}>
              取消
            </Button>
            {step === 'select-volume' && (
              <Button
                onClick={() => setStep('select-path')}
                disabled={!selectedVolume}
              >
                下一步
              </Button>
            )}
            {step === 'select-path' && (
              <Button
                onClick={handleContinueToConfig}
                disabled={!selectedPath}
              >
                下一步
              </Button>
            )}
            {step === 'configure' && (
              <Button onClick={handleSubmit} disabled={creating}>
                {creating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    创建中...
                  </>
                ) : (
                  '创建数据集'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
