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
import { ScrollArea } from './ui/scroll-area';
import {
  Info,
  CheckCircle2,
  Server,
  Cpu,
  Plus,
  X,
  Users,
  BarChart3,
  Tag,
  Settings,
} from 'lucide-react';
import { getClusters, Cluster } from '../services/mockDataService';
import { toast } from 'sonner@2.0.3';

interface CreateGpuPoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

interface NodeSelector {
  key: string;
  value: string;
}

export default function CreateGpuPoolDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateGpuPoolDialogProps) {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loadingClusters, setLoadingClusters] = useState(false);
  const [nodeSelectors, setNodeSelectors] = useState<NodeSelector[]>([
    { key: 'gpu-type', value: '' },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clusterId: '',
    gpuModel: 'NVIDIA A100',
    maxGpusPerUser: 4,
    maxGpusPerJob: 8,
  });

  const gpuModels = [
    'NVIDIA A100',
    'NVIDIA V100',
    'NVIDIA H100',
    'NVIDIA RTX 4090',
    'AMD MI100',
    'AMD MI200',
    '华为昇腾 910',
  ];

  // 加载集群列表
  useEffect(() => {
    if (open) {
      loadClusters();
    }
  }, [open]);

  const loadClusters = async () => {
    setLoadingClusters(true);
    try {
      const data = await getClusters();
      setClusters(data);
      if (data.length > 0 && !formData.clusterId) {
        setFormData({ ...formData, clusterId: data[0].id });
      }
    } catch (error) {
      toast.error('加载集群列表失败');
    } finally {
      setLoadingClusters(false);
    }
  };

  // 添加节点选择器
  const handleAddNodeSelector = () => {
    setNodeSelectors([...nodeSelectors, { key: '', value: '' }]);
  };

  // 删除节点选择器
  const handleRemoveNodeSelector = (index: number) => {
    setNodeSelectors(nodeSelectors.filter((_, i) => i !== index));
  };

  // 更新节点选择器
  const handleUpdateNodeSelector = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const updated = [...nodeSelectors];
    updated[index][field] = value;
    setNodeSelectors(updated);
  };

  // 添加标签
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    // 验证
    if (!formData.name.trim()) {
      toast.error('请输入资源池名称');
      return;
    }
    if (!formData.clusterId) {
      toast.error('请选择目标集群');
      return;
    }

    // 验证节点选择器
    const validSelectors = nodeSelectors.filter((s) => s.key && s.value);
    if (validSelectors.length === 0) {
      toast.error('请至少配置一个有效的节点选择器');
      return;
    }

    // 转换节点选择器为对象
    const nodeSelectorObj: Record<string, string> = {};
    validSelectors.forEach((selector) => {
      nodeSelectorObj[selector.key] = selector.value;
    });

    onSubmit({
      ...formData,
      nodeSelector: nodeSelectorObj,
      tags,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Server className="w-6 h-6 text-purple-600" />
            创建GPU资源池
          </DialogTitle>
          <DialogDescription>
            配置资源池以便对GPU资源进行分组管理和配额控制
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 py-6">
          <div className="space-y-6 pr-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">基本配置</TabsTrigger>
                <TabsTrigger value="selectors">节点选择器</TabsTrigger>
                <TabsTrigger value="quotas">配额限制</TabsTrigger>
              </TabsList>

              {/* 基本配置 */}
              <TabsContent value="basic" className="space-y-4 mt-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>资源池说明：</strong> GPU资源池通过节点标签选择器自动聚合节点，为不同团队或项目提供资源隔离和配额管理。
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="pool-name">资源池名称 *</Label>
                  <Input
                    id="pool-name"
                    placeholder="training-pool-a100"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">
                    使用小写字母、数字和连字符，便于识别和管理
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pool-description">资源池描述</Label>
                  <Textarea
                    id="pool-description"
                    placeholder="用于深度学习训练的A100 GPU资源池"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cluster">所属集群 *</Label>
                  <Select
                    value={formData.clusterId}
                    onValueChange={(value) => setFormData({ ...formData, clusterId: value })}
                    disabled={loadingClusters}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择集群" />
                    </SelectTrigger>
                    <SelectContent>
                      {clusters.map((cluster) => (
                        <SelectItem key={cluster.id} value={cluster.id}>
                          <div className="flex items-center gap-2">
                            <span>{cluster.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {cluster.region}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpu-model">GPU型号 *</Label>
                  <Select
                    value={formData.gpuModel}
                    onValueChange={(value) => setFormData({ ...formData, gpuModel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gpuModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    资源池标签
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入标签，如: production, ml, research"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button onClick={handleAddTag} variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 节点选择器 */}
              <TabsContent value="selectors" className="space-y-4 mt-6">
                <Alert className="bg-purple-50 border-purple-200">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-purple-900">
                    <strong>节点选择器说明：</strong> 通过Kubernetes标签匹配节点，自动将符合条件的节点加入资源池。标签键值对必须精确匹配。
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>节点标签选择器 *</Label>
                    <Button onClick={handleAddNodeSelector} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      添加选择器
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    配置Kubernetes节点标签选择器，系统将自动匹配符合条件的计算节点
                  </p>
                </div>

                <div className="space-y-3">
                  {nodeSelectors.map((selector, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-purple-700">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">标签键</Label>
                              <Input
                                placeholder="gpu-type"
                                value={selector.key}
                                onChange={(e) =>
                                  handleUpdateNodeSelector(index, 'key', e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">标签值</Label>
                              <Input
                                placeholder="a100"
                                value={selector.value}
                                onChange={(e) =>
                                  handleUpdateNodeSelector(index, 'value', e.target.value)
                                }
                              />
                            </div>
                          </div>
                          {nodeSelectors.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveNodeSelector(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 常用标签示例 */}
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    <strong>常用标签示例：</strong>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                      <li>
                        <code className="bg-slate-100 px-1 py-0.5 rounded">gpu-type: a100</code> -
                        匹配A100 GPU节点
                      </li>
                      <li>
                        <code className="bg-slate-100 px-1 py-0.5 rounded">
                          node-role: training
                        </code>{' '}
                        - 匹配训练节点
                      </li>
                      <li>
                        <code className="bg-slate-100 px-1 py-0.5 rounded">
                          environment: production
                        </code>{' '}
                        - 匹配生产环境节点
                      </li>
                      <li>
                        <code className="bg-slate-100 px-1 py-0.5 rounded">zone: beijing-a</code> -
                        匹配特定可用区
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* 配额限制 */}
              <TabsContent value="quotas" className="space-y-4 mt-6">
                <Alert className="bg-green-50 border-green-200">
                  <Info className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    <strong>配额限制说明：</strong>{' '}
                    设置单用户和单任务的GPU使用上限，防止资源被少数用户或任务垄断，确保资源公平分配。
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-2 border-blue-200">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <Label className="text-base">单用户GPU限制</Label>
                          <p className="text-xs text-slate-500">
                            每个用户在此资源池中最多可使用的GPU数量
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">GPU数量</span>
                          <Badge className="bg-blue-600">{formData.maxGpusPerUser} 卡</Badge>
                        </div>
                        <Input
                          type="number"
                          min={1}
                          max={32}
                          value={formData.maxGpusPerUser}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxGpusPerUser: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                        <p className="text-xs text-slate-500">建议：训练池设为4-8卡，开发池设为1-2卡</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <Label className="text-base">单任务GPU限制</Label>
                          <p className="text-xs text-slate-500">
                            单个训练任务或推理服务最多可使用的GPU数量
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">GPU数量</span>
                          <Badge className="bg-green-600">{formData.maxGpusPerJob} 卡</Badge>
                        </div>
                        <Input
                          type="number"
                          min={1}
                          max={64}
                          value={formData.maxGpusPerJob}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxGpusPerJob: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                        <p className="text-xs text-slate-500">
                          建议：分布式训练可设为8-16卡，推理服务设为1-4卡
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 配额关系说明 */}
                <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-orange-900">配额设置建议：</p>
                        <ul className="space-y-1 text-slate-700">
                          <li>
                            • <strong>关系：</strong> 单任务限制应小于等于单用户限制
                          </li>
                          <li>
                            • <strong>训练资源池：</strong> 单用户4-8卡，单任务8-16卡（支持大规模训练）
                          </li>
                          <li>
                            • <strong>推理资源池：</strong> 单用户2-4卡，单任务1-4卡（支持多服务部署）
                          </li>
                          <li>
                            • <strong>开发资源池：</strong> 单用户1-2卡，单任务1卡（支持交互式开发）
                          </li>
                          <li>
                            • <strong>动态调整：</strong> 可根据实际使用情况随时调整配额限制
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            创建资源池
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
