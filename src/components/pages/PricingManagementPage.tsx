import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
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
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Cpu,
  HardDrive,
  Zap,
  DollarSign,
  Edit,
  Plus,
  TrendingUp,
  Clock,
  Calendar,
  Tag,
  Percent,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface ResourcePrice {
  id: string;
  resourceType: 'gpu' | 'cpu' | 'memory' | 'storage' | 'network';
  resourceName: string;
  unit: string;
  pricePerUnit: number;
  billingCycle: 'hourly' | 'daily' | 'monthly';
  enabled: boolean;
  description?: string;
}

const mockPrices: ResourcePrice[] = [
  {
    id: 'price-001',
    resourceType: 'gpu',
    resourceName: 'NVIDIA A100 (40GB)',
    unit: '卡·小时',
    pricePerUnit: 25.0,
    billingCycle: 'hourly',
    enabled: true,
    description: '高性能训练GPU',
  },
  {
    id: 'price-002',
    resourceType: 'gpu',
    resourceName: 'NVIDIA A100 (80GB)',
    unit: '卡·小时',
    pricePerUnit: 35.0,
    billingCycle: 'hourly',
    enabled: true,
    description: '大显存训练GPU',
  },
  {
    id: 'price-003',
    resourceType: 'gpu',
    resourceName: 'NVIDIA V100',
    unit: '卡·小时',
    pricePerUnit: 18.0,
    billingCycle: 'hourly',
    enabled: true,
  },
  {
    id: 'price-004',
    resourceType: 'gpu',
    resourceName: 'NVIDIA T4',
    unit: '卡·小时',
    pricePerUnit: 8.0,
    billingCycle: 'hourly',
    enabled: true,
    description: '推理优化GPU',
  },
  {
    id: 'price-005',
    resourceType: 'cpu',
    resourceName: 'CPU核心',
    unit: '核·小时',
    pricePerUnit: 0.5,
    billingCycle: 'hourly',
    enabled: true,
  },
  {
    id: 'price-006',
    resourceType: 'memory',
    resourceName: '内存',
    unit: 'GB·小时',
    pricePerUnit: 0.1,
    billingCycle: 'hourly',
    enabled: true,
  },
  {
    id: 'price-007',
    resourceType: 'storage',
    resourceName: 'SSD存储',
    unit: 'GB·天',
    pricePerUnit: 0.002,
    billingCycle: 'daily',
    enabled: true,
  },
  {
    id: 'price-008',
    resourceType: 'storage',
    resourceName: 'HDD存储',
    unit: 'GB·天',
    pricePerUnit: 0.0008,
    billingCycle: 'daily',
    enabled: true,
  },
  {
    id: 'price-009',
    resourceType: 'network',
    resourceName: '公网流量',
    unit: 'GB',
    pricePerUnit: 0.8,
    billingCycle: 'hourly',
    enabled: true,
  },
];

export default function PricingManagementPage() {
  const [prices, setPrices] = useState<ResourcePrice[]>(mockPrices);
  const [selectedPrice, setSelectedPrice] = useState<ResourcePrice | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Partial<ResourcePrice>>({});

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'gpu':
        return <Zap className="w-5 h-5" />;
      case 'cpu':
        return <Cpu className="w-5 h-5" />;
      case 'memory':
        return <HardDrive className="w-5 h-5" />;
      case 'storage':
        return <HardDrive className="w-5 h-5" />;
      case 'network':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'gpu':
        return 'from-purple-500 to-blue-500';
      case 'cpu':
        return 'from-blue-500 to-cyan-500';
      case 'memory':
        return 'from-green-500 to-teal-500';
      case 'storage':
        return 'from-orange-500 to-red-500';
      case 'network':
        return 'from-pink-500 to-purple-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getResourceTypeName = (type: string) => {
    const names: Record<string, string> = {
      gpu: 'GPU',
      cpu: 'CPU',
      memory: '内存',
      storage: '存储',
      network: '网络',
    };
    return names[type] || type;
  };

  const getBillingCycleName = (cycle: string) => {
    const names: Record<string, string> = {
      hourly: '按小时',
      daily: '按天',
      monthly: '按月',
    };
    return names[cycle] || cycle;
  };

  const handleEditPrice = (price: ResourcePrice) => {
    setSelectedPrice(price);
    setEditingPrice(price);
    setIsEditDialogOpen(true);
  };

  const handleSavePrice = () => {
    if (selectedPrice && editingPrice.pricePerUnit) {
      setPrices(
        prices.map((p) =>
          p.id === selectedPrice.id
            ? { ...p, ...editingPrice }
            : p
        )
      );
      setIsEditDialogOpen(false);
      toast.success('价格已更新');
    }
  };

  const togglePriceStatus = (priceId: string) => {
    setPrices(
      prices.map((p) =>
        p.id === priceId ? { ...p, enabled: !p.enabled } : p
      )
    );
    toast.success('状态已更新');
  };

  const groupedPrices = prices.reduce((acc, price) => {
    if (!acc[price.resourceType]) {
      acc[price.resourceType] = [];
    }
    acc[price.resourceType].push(price);
    return acc;
  }, {} as Record<string, ResourcePrice[]>);

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">资源定价管理</h1>
          <p className="text-slate-600">管理各类计算和存储资源的定价策略</p>
        </div>
        <Button size="lg">
          <Plus className="w-4 h-4 mr-2" />
          添加定价
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">定价项目</p>
                <p className="text-3xl">{prices.length}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已启用</p>
                <p className="text-3xl text-green-600">
                  {prices.filter((p) => p.enabled).length}
                </p>
              </div>
              <Zap className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">GPU定价</p>
                <p className="text-3xl text-purple-600">
                  {prices.filter((p) => p.resourceType === 'gpu').length}
                </p>
              </div>
              <Zap className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">存储定价</p>
                <p className="text-3xl text-orange-600">
                  {prices.filter((p) => p.resourceType === 'storage').length}
                </p>
              </div>
              <HardDrive className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 资源定价列表 */}
      {Object.entries(groupedPrices).map(([type, priceList]) => (
        <Card key={type}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getResourceColor(type)} flex items-center justify-center text-white`}>
                {getResourceIcon(type)}
              </div>
              <div>
                <CardTitle>{getResourceTypeName(type)}定价</CardTitle>
                <CardDescription>共 {priceList.length} 个定价项</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priceList.map((price) => (
                <div
                  key={price.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{price.resourceName}</h4>
                      {price.enabled ? (
                        <Badge className="bg-green-600">已启用</Badge>
                      ) : (
                        <Badge variant="outline">已禁用</Badge>
                      )}
                      <Badge variant="outline">{getBillingCycleName(price.billingCycle)}</Badge>
                    </div>
                    {price.description && (
                      <p className="text-sm text-slate-600 mb-2">{price.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-slate-600">
                        计费单位: <span className="font-medium text-slate-900">{price.unit}</span>
                      </span>
                      <span className="text-green-600 font-medium">
                        ¥{price.pricePerUnit.toFixed(2)} / {price.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={price.enabled}
                      onCheckedChange={() => togglePriceStatus(price.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPrice(price)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 编辑定价对话框 */}
      {selectedPrice && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>编辑定价 - {selectedPrice.resourceName}</DialogTitle>
              <DialogDescription>修改资源的价格和计费周期</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resource-name">资源名称</Label>
                <Input
                  id="resource-name"
                  value={editingPrice.resourceName || ''}
                  onChange={(e) =>
                    setEditingPrice({ ...editingPrice, resourceName: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">单价 (¥)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingPrice.pricePerUnit || 0}
                    onChange={(e) =>
                      setEditingPrice({
                        ...editingPrice,
                        pricePerUnit: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">计费单位</Label>
                  <Input
                    id="unit"
                    value={editingPrice.unit || ''}
                    onChange={(e) =>
                      setEditingPrice({ ...editingPrice, unit: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-cycle">计费周期</Label>
                <Select
                  value={editingPrice.billingCycle || 'hourly'}
                  onValueChange={(value: any) =>
                    setEditingPrice({ ...editingPrice, billingCycle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">按小时</SelectItem>
                    <SelectItem value="daily">按天</SelectItem>
                    <SelectItem value="monthly">按月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={editingPrice.description || ''}
                  onChange={(e) =>
                    setEditingPrice({ ...editingPrice, description: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">启用此定价</p>
                  <p className="text-xs text-slate-600">禁用后用户将无法使用该资源</p>
                </div>
                <Switch
                  checked={editingPrice.enabled || false}
                  onCheckedChange={(checked) =>
                    setEditingPrice({ ...editingPrice, enabled: checked })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSavePrice}>
                <DollarSign className="w-4 h-4 mr-2" />
                保存修改
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
