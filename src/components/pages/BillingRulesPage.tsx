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
  Settings,
  Clock,
  DollarSign,
  Zap,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  Edit,
  Plus,
  Shield,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

interface BillingRule {
  id: string;
  name: string;
  type: 'on-demand' | 'reserved' | 'spot' | 'package' | 'subscription';
  description: string;
  enabled: boolean;
  minBillingUnit: number;
  billingPrecision: number;
  prepayment: boolean;
  autoStop: boolean;
  autoStopThreshold?: number;
  gracePeriod?: number;
}

const mockRules: BillingRule[] = [
  {
    id: 'rule-001',
    name: '按需计费',
    type: 'on-demand',
    description: '按实际使用量计费，灵活高效，适合临时和短期任务',
    enabled: true,
    minBillingUnit: 1,
    billingPrecision: 2,
    prepayment: false,
    autoStop: true,
    autoStopThreshold: 0,
    gracePeriod: 300,
  },
  {
    id: 'rule-002',
    name: '预留实例',
    type: 'reserved',
    description: '预付费购买长期使用的资源，享受更低折扣',
    enabled: true,
    minBillingUnit: 720,
    billingPrecision: 2,
    prepayment: true,
    autoStop: false,
  },
  {
    id: 'rule-003',
    name: '竞价实例',
    type: 'spot',
    description: '使用闲置资源，价格优惠但可能被回收',
    enabled: true,
    minBillingUnit: 1,
    billingPrecision: 2,
    prepayment: false,
    autoStop: true,
    autoStopThreshold: 0,
  },
  {
    id: 'rule-004',
    name: '资源包',
    type: 'package',
    description: '一次性购买资源包，使用时抵扣',
    enabled: true,
    minBillingUnit: 1,
    billingPrecision: 2,
    prepayment: true,
    autoStop: false,
  },
  {
    id: 'rule-005',
    name: '包年包月',
    type: 'subscription',
    description: '按月或年订阅，享受最优惠价格',
    enabled: true,
    minBillingUnit: 720,
    billingPrecision: 2,
    prepayment: true,
    autoStop: false,
  },
];

export default function BillingRulesPage() {
  const [rules, setRules] = useState<BillingRule[]>(mockRules);
  const [selectedRule, setSelectedRule] = useState<BillingRule | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<BillingRule>>({});

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'on-demand':
        return <Zap className="w-5 h-5" />;
      case 'reserved':
        return <Calendar className="w-5 h-5" />;
      case 'spot':
        return <Clock className="w-5 h-5" />;
      case 'package':
        return <Package className="w-5 h-5" />;
      case 'subscription':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'on-demand':
        return 'from-blue-500 to-cyan-500';
      case 'reserved':
        return 'from-purple-500 to-pink-500';
      case 'spot':
        return 'from-orange-500 to-red-500';
      case 'package':
        return 'from-green-500 to-teal-500';
      case 'subscription':
        return 'from-indigo-500 to-purple-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      'on-demand': '按需计费',
      reserved: '预留实例',
      spot: '竞价实例',
      package: '资源包',
      subscription: '包年包月',
    };
    return names[type] || type;
  };

  const handleEditRule = (rule: BillingRule) => {
    setSelectedRule(rule);
    setEditingRule(rule);
    setIsEditDialogOpen(true);
  };

  const handleSaveRule = () => {
    if (selectedRule) {
      setRules(
        rules.map((r) =>
          r.id === selectedRule.id ? { ...r, ...editingRule } : r
        )
      );
      setIsEditDialogOpen(false);
      toast.success('计费规则已更新');
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      )
    );
    toast.success('状态已更新');
  };

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">计费规则管理</h1>
          <p className="text-slate-600">配置不同的计费模式和扣费规则</p>
        </div>
        <Button size="lg">
          <Plus className="w-4 h-4 mr-2" />
          添加规则
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">计费规则</p>
                <p className="text-3xl">{rules.length}</p>
              </div>
              <Settings className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已启用</p>
                <p className="text-3xl text-green-600">
                  {rules.filter((r) => r.enabled).length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">预付费规则</p>
                <p className="text-3xl text-blue-600">
                  {rules.filter((r) => r.prepayment).length}
                </p>
              </div>
              <Wallet className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">后付费规则</p>
                <p className="text-3xl text-orange-600">
                  {rules.filter((r) => !r.prepayment).length}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 计费规则列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTypeColor(rule.type)} flex items-center justify-center text-white`}>
                    {getTypeIcon(rule.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      {rule.enabled ? (
                        <Badge className="bg-green-600">已启用</Badge>
                      ) : (
                        <Badge variant="outline">已禁用</Badge>
                      )}
                    </div>
                    <Badge variant="outline">{getTypeName(rule.type)}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{rule.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">最小计费单位</p>
                  <p className="text-lg font-medium">{rule.minBillingUnit} 分钟</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">计费精度</p>
                  <p className="text-lg font-medium">{rule.billingPrecision} 位小数</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {rule.prepayment ? (
                      <Wallet className="w-4 h-4 text-blue-600" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="text-sm">
                      {rule.prepayment ? '预付费模式' : '后付费模式'}
                    </span>
                  </div>
                  <Badge variant={rule.prepayment ? 'default' : 'outline'}>
                    {rule.prepayment ? '预付' : '后付'}
                  </Badge>
                </div>

                {rule.autoStop && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">余额不足自动停止</p>
                        {rule.gracePeriod && (
                          <p className="text-xs text-blue-700">
                            宽限期: {rule.gracePeriod}秒
                          </p>
                        )}
                      </div>
                    </div>
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRuleStatus(rule.id)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditRule(rule)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  编辑规则
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 全局配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            全局计费配置
          </CardTitle>
          <CardDescription>适用于所有计费规则的通用设置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium mb-1">启用计费系统</p>
                  <p className="text-sm text-slate-600">关闭后将停止所有计费</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium mb-1">自动账单生成</p>
                  <p className="text-sm text-slate-600">每月自动生成账单</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium mb-1">允许欠费使用</p>
                  <p className="text-sm text-slate-600">余额不足时继续服务</p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <Label htmlFor="billing-cycle" className="mb-2 block">
                  账单周期
                </Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="billing-cycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">按天</SelectItem>
                    <SelectItem value="weekly">按周</SelectItem>
                    <SelectItem value="monthly">按月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <Label htmlFor="currency" className="mb-2 block">
                  默认货币
                </Label>
                <Select defaultValue="cny">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cny">人民币 (¥)</SelectItem>
                    <SelectItem value="usd">美元 ($)</SelectItem>
                    <SelectItem value="eur">欧元 (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <Label htmlFor="low-balance" className="mb-2 block">
                  低余额预警阈值 (¥)
                </Label>
                <Input
                  id="low-balance"
                  type="number"
                  defaultValue="100"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline">重置为默认</Button>
            <Button>
              <DollarSign className="w-4 h-4 mr-2" />
              保存配置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 编辑规则对话框 */}
      {selectedRule && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>编辑计费规则 - {selectedRule.name}</DialogTitle>
              <DialogDescription>修改计费规则的详细配置</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">规则名称</Label>
                <Input
                  id="rule-name"
                  value={editingRule.name || ''}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-description">规则描述</Label>
                <Textarea
                  id="rule-description"
                  value={editingRule.description || ''}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-unit">最小计费单位 (分钟)</Label>
                  <Input
                    id="min-unit"
                    type="number"
                    value={editingRule.minBillingUnit || 1}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        minBillingUnit: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precision">计费精度 (小数位)</Label>
                  <Input
                    id="precision"
                    type="number"
                    value={editingRule.billingPrecision || 2}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        billingPrecision: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium mb-1">预付费模式</p>
                    <p className="text-sm text-slate-600">用户需要先充值才能使用</p>
                  </div>
                  <Switch
                    checked={editingRule.prepayment || false}
                    onCheckedChange={(checked) =>
                      setEditingRule({ ...editingRule, prepayment: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium mb-1">余额不足自动停止</p>
                    <p className="text-sm text-slate-600">账户余额为0时自动停止服务</p>
                  </div>
                  <Switch
                    checked={editingRule.autoStop || false}
                    onCheckedChange={(checked) =>
                      setEditingRule({ ...editingRule, autoStop: checked })
                    }
                  />
                </div>

                {editingRule.autoStop && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="grace-period">宽限期 (秒)</Label>
                    <Input
                      id="grace-period"
                      type="number"
                      value={editingRule.gracePeriod || 0}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          gracePeriod: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveRule}>
                <Settings className="w-4 h-4 mr-2" />
                保存规则
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
