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
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Percent,
  Clock,
  Calendar,
  Users,
  Gift,
  TrendingDown,
  Sparkles,
  CalendarClock,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'coupon' | 'time-based' | 'volume-based';
  value: number;
  description: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
  appliesTo: string[];
  conditions?: string;
  usageCount?: number;
  maxUsage?: number;
}

const mockDiscounts: Discount[] = [
  {
    id: 'discount-001',
    name: '新用户首单优惠',
    type: 'percentage',
    value: 20,
    description: '新注册用户首次使用可享受8折优惠',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    enabled: true,
    appliesTo: ['gpu', 'cpu', 'memory'],
    conditions: '仅限新用户首单',
    usageCount: 156,
    maxUsage: 1000,
  },
  {
    id: 'discount-002',
    name: '夜间时段优惠',
    type: 'time-based',
    value: 30,
    description: '凌晨00:00-06:00使用GPU享7折优惠',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    enabled: true,
    appliesTo: ['gpu'],
    conditions: '每日00:00-06:00',
    usageCount: 2345,
  },
  {
    id: 'discount-003',
    name: '批量使用折扣',
    type: 'volume-based',
    value: 15,
    description: '单次使用10卡以上GPU享85折',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    enabled: true,
    appliesTo: ['gpu'],
    conditions: '≥10卡',
    usageCount: 89,
  },
  {
    id: 'discount-004',
    name: '双十一促销',
    type: 'coupon',
    value: 100,
    description: '双十一专属优惠券，满1000减100',
    startDate: '2024-11-01',
    endDate: '2024-11-15',
    enabled: true,
    appliesTo: ['gpu', 'cpu', 'memory', 'storage'],
    conditions: '满¥1000可用',
    usageCount: 234,
    maxUsage: 500,
  },
  {
    id: 'discount-005',
    name: 'VIP会员专享',
    type: 'percentage',
    value: 10,
    description: 'VIP会员全场9折',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    enabled: true,
    appliesTo: ['gpu', 'cpu', 'memory', 'storage', 'network'],
    conditions: '仅限VIP会员',
    usageCount: 567,
  },
  {
    id: 'discount-006',
    name: '学术研究优惠',
    type: 'percentage',
    value: 25,
    description: '教育科研机构专享75折优惠',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    enabled: true,
    appliesTo: ['gpu', 'cpu', 'memory'],
    conditions: '需提供认证',
    usageCount: 123,
  },
];

export default function DiscountManagementPage() {
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    name: '',
    type: 'percentage',
    value: 0,
    description: '',
    startDate: '',
    endDate: '',
    enabled: true,
    appliesTo: [],
  });

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch = discount.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || discount.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: discounts.length,
    active: discounts.filter((d) => d.enabled).length,
    totalUsage: discounts.reduce((sum, d) => sum + (d.usageCount || 0), 0),
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-5 h-5" />;
      case 'fixed':
        return <TrendingDown className="w-5 h-5" />;
      case 'coupon':
        return <Gift className="w-5 h-5" />;
      case 'time-based':
        return <Clock className="w-5 h-5" />;
      case 'volume-based':
        return <Target className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'from-blue-500 to-cyan-500';
      case 'fixed':
        return 'from-green-500 to-teal-500';
      case 'coupon':
        return 'from-purple-500 to-pink-500';
      case 'time-based':
        return 'from-orange-500 to-red-500';
      case 'volume-based':
        return 'from-indigo-500 to-purple-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      percentage: '百分比折扣',
      fixed: '固定金额',
      coupon: '优惠券',
      'time-based': '时段优惠',
      'volume-based': '批量折扣',
    };
    return names[type] || type;
  };

  const getDiscountDisplay = (discount: Discount) => {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}% OFF`;
      case 'fixed':
        return `¥${discount.value}`;
      case 'coupon':
        return `满减 ¥${discount.value}`;
      case 'time-based':
        return `${discount.value}% OFF`;
      case 'volume-based':
        return `${discount.value}% OFF`;
      default:
        return `${discount.value}`;
    }
  };

  const handleCreateDiscount = () => {
    const discount: Discount = {
      id: `discount-${Date.now()}`,
      ...newDiscount as Discount,
      usageCount: 0,
    };
    setDiscounts([...discounts, discount]);
    setIsCreateDialogOpen(false);
    setNewDiscount({
      name: '',
      type: 'percentage',
      value: 0,
      description: '',
      startDate: '',
      endDate: '',
      enabled: true,
      appliesTo: [],
    });
    toast.success('折扣活动创建成功');
  };

  const toggleDiscountStatus = (discountId: string) => {
    setDiscounts(
      discounts.map((d) =>
        d.id === discountId ? { ...d, enabled: !d.enabled } : d
      )
    );
    toast.success('状态已更新');
  };

  const handleDeleteDiscount = (discountId: string) => {
    setDiscounts(discounts.filter((d) => d.id !== discountId));
    toast.success('折扣活动已删除');
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">折扣活动管理</h1>
          <p className="text-slate-600">管理优惠券、时段折扣和促销活动</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          创建折扣活动
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总活动数</p>
                <p className="text-3xl">{stats.total}</p>
              </div>
              <Tag className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">进行中</p>
                <p className="text-3xl text-green-600">{stats.active}</p>
              </div>
              <Sparkles className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已使用次数</p>
                <p className="text-3xl text-blue-600">{stats.totalUsage.toLocaleString()}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">优惠券</p>
                <p className="text-3xl text-pink-600">
                  {discounts.filter((d) => d.type === 'coupon').length}
                </p>
              </div>
              <Gift className="w-10 h-10 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="搜索活动名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="活动类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="percentage">百分比折扣</SelectItem>
                <SelectItem value="fixed">固定金额</SelectItem>
                <SelectItem value="coupon">优惠券</SelectItem>
                <SelectItem value="time-based">时段优惠</SelectItem>
                <SelectItem value="volume-based">批量折扣</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 折扣活动列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDiscounts.map((discount) => (
          <Card key={discount.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTypeColor(discount.type)} flex items-center justify-center text-white`}>
                    {getTypeIcon(discount.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{discount.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getTypeName(discount.type)}</Badge>
                      {discount.enabled ? (
                        isExpired(discount.endDate) ? (
                          <Badge className="bg-gray-600">已过期</Badge>
                        ) : (
                          <Badge className="bg-green-600">进行中</Badge>
                        )
                      ) : (
                        <Badge variant="outline">已禁用</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {getDiscountDisplay(discount)}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{discount.description}</p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                <div>
                  <p className="text-slate-600 mb-1">开始时间</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {discount.startDate}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">结束时间</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {discount.endDate}
                  </p>
                </div>
              </div>

              {discount.conditions && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900">
                    <strong>使用条件:</strong> {discount.conditions}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-sm">
                  <span className="text-slate-600">已使用: </span>
                  <span className="font-medium">
                    {discount.usageCount?.toLocaleString() || 0}
                  </span>
                  {discount.maxUsage && (
                    <span className="text-slate-600"> / {discount.maxUsage.toLocaleString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={discount.enabled}
                    onCheckedChange={() => toggleDiscountStatus(discount.id)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDiscount(discount);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDiscount(discount.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiscounts.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Tag className="w-16 h-16 mx-auto text-slate-300" />
            <div>
              <h3 className="text-xl mb-2">没有找到折扣活动</h3>
              <p className="text-slate-600">调整筛选条件或创建新活动</p>
            </div>
          </div>
        </Card>
      )}

      {/* 创建折扣活动对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle>创建折扣活动</DialogTitle>
            <DialogDescription>设置优惠类型、折扣力度和适用范围</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discount-name">活动名称 *</Label>
              <Input
                id="discount-name"
                placeholder="例如: 双十一促销"
                value={newDiscount.name}
                onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-type">折扣类型 *</Label>
              <Select
                value={newDiscount.type}
                onValueChange={(value: any) => setNewDiscount({ ...newDiscount, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">百分比折扣</SelectItem>
                  <SelectItem value="fixed">固定金额</SelectItem>
                  <SelectItem value="coupon">优惠券</SelectItem>
                  <SelectItem value="time-based">时段优惠</SelectItem>
                  <SelectItem value="volume-based">批量折扣</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-value">
                折扣力度 * {newDiscount.type === 'percentage' ? '(%)' : '(¥)'}
              </Label>
              <Input
                id="discount-value"
                type="number"
                placeholder={newDiscount.type === 'percentage' ? '例如: 20' : '例如: 100'}
                value={newDiscount.value || ''}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">开始日期 *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newDiscount.startDate}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">结束日期 *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newDiscount.endDate}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">活动描述</Label>
              <Textarea
                id="description"
                placeholder="描述折扣活动的详细信息"
                value={newDiscount.description}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">使用条件</Label>
              <Input
                id="conditions"
                placeholder="例如: 满¥1000可用"
                value={newDiscount.conditions || ''}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, conditions: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateDiscount}>
              <Plus className="w-4 h-4 mr-2" />
              创建活动
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
