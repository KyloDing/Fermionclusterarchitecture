/**
 * 高级折扣管理页面 - 支持结构化条件和优先级
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  TrendingDown,
  Loader2,
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  Info,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  DiscountRule,
  DiscountStatus,
  DiscountActionType,
  UserType,
  DiscountConditions,
  DiscountAction,
  getAllDiscountRules,
  getDiscountRulesByStatus,
  saveDiscountRule,
  deleteDiscountRule,
  updateDiscountRuleStatus,
  getUserTypes,
  getDiscountStatuses,
  getDiscountActionTypes,
  formatDiscountAction,
  formatConditionsSummary,
} from '../../services/discountService';

export default function AdvancedDiscountManagementPage() {
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<DiscountRule> | null>(null);

  // 筛选条件
  const [filterStatus, setFilterStatus] = useState<DiscountStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadDiscountRules();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rules, filterStatus, searchText]);

  const loadDiscountRules = async () => {
    setLoading(true);
    try {
      const data = await getAllDiscountRules();
      setRules(data);
    } catch (error) {
      toast.error('加载折扣规则失败');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rules];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.description?.toLowerCase().includes(search) ||
          r.id.toLowerCase().includes(search)
      );
    }

    setFilteredRules(filtered);
  };

  const handleCreateNew = () => {
    setEditingRule({
      status: 'DRAFT',
      priority: 100,
      effectiveDate: new Date().toISOString(),
      conditions: {},
      action: {
        type: 'PERCENTAGE',
        discountRate: 0.9,
        exclusive: false,
      },
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (rule: DiscountRule) => {
    setEditingRule(rule);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingRule) return;

    // 验证必填字段
    if (!editingRule.name) {
      toast.error('请输入规则名称');
      return;
    }

    if (!editingRule.effectiveDate) {
      toast.error('请选择生效时间');
      return;
    }

    try {
      const ruleToSave: DiscountRule = {
        id: editingRule.id || `disc-${Date.now()}`,
        name: editingRule.name,
        description: editingRule.description,
        status: editingRule.status || 'DRAFT',
        priority: editingRule.priority || 100,
        effectiveDate: editingRule.effectiveDate,
        expiryDate: editingRule.expiryDate,
        conditions: editingRule.conditions || {},
        action: editingRule.action || { type: 'PERCENTAGE', discountRate: 1 },
        usageCount: editingRule.usageCount,
        maxUsage: editingRule.maxUsage,
        createdBy: editingRule.createdBy || 'admin',
      };

      await saveDiscountRule(ruleToSave);
      toast.success('保存成功');
      setEditDialogOpen(false);
      setEditingRule(null);
      loadDiscountRules();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('确定要删除这条折扣规则吗？')) return;

    try {
      await deleteDiscountRule(ruleId);
      toast.success('删除成功');
      loadDiscountRules();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleToggleStatus = async (rule: DiscountRule) => {
    const newStatus: DiscountStatus =
      rule.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await updateDiscountRuleStatus(rule.id, newStatus);
      toast.success(newStatus === 'ACTIVE' ? '已启用' : '已停用');
      loadDiscountRules();
    } catch (error) {
      toast.error('状态更新失败');
    }
  };

  const getStatusBadge = (status: DiscountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            生效中
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200">
            <FileText className="w-3 h-3 mr-1" />
            草稿
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <Pause className="w-3 h-3 mr-1" />
            已停用
          </Badge>
        );
    }
  };

  // 按状态分组规则
  const rulesByStatus = {
    all: filteredRules,
    ACTIVE: filteredRules.filter((r) => r.status === 'ACTIVE'),
    DRAFT: filteredRules.filter((r) => r.status === 'DRAFT'),
    INACTIVE: filteredRules.filter((r) => r.status === 'INACTIVE'),
  };

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Tag className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-slate-900">折扣管理</h1>
            <p className="text-slate-600">配置和管理资源折扣规则，支持复杂条件组合</p>
          </div>
        </div>
      </div>

      {/* 说明提示 */}
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription>
          <strong className="text-blue-900">折扣优先级规则</strong>
          <p className="text-sm text-blue-800 mt-2">
            系统按<strong>优先级数字从小到大</strong>依次应用折扣。
            若规则标记为"互斥"，则只应用该规则，不再叠加后续折扣。
          </p>
        </AlertDescription>
      </Alert>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* 状态筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="ACTIVE">生效中</SelectItem>
                <SelectItem value="DRAFT">草稿</SelectItem>
                <SelectItem value="INACTIVE">已停用</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 搜索 */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="搜索规则名称、ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 w-[240px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewDialogOpen(true)}>
            <Eye className="w-4 h-4 mr-2" />
            测试预览
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            新建规则
          </Button>
        </div>
      </div>

      {/* 折扣规则标签页 */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            全部 ({rulesByStatus.all.length})
          </TabsTrigger>
          <TabsTrigger value="ACTIVE">
            生效中 ({rulesByStatus.ACTIVE.length})
          </TabsTrigger>
          <TabsTrigger value="DRAFT">
            草稿 ({rulesByStatus.DRAFT.length})
          </TabsTrigger>
          <TabsTrigger value="INACTIVE">
            已停用 ({rulesByStatus.INACTIVE.length})
          </TabsTrigger>
        </TabsList>

        {['all', 'ACTIVE', 'DRAFT', 'INACTIVE'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <DiscountRulesTable
              rules={rulesByStatus[tab as keyof typeof rulesByStatus]}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* 编辑对话框 */}
      <DiscountRuleEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        rule={editingRule}
        onRuleChange={setEditingRule}
        onSave={handleSave}
      />

      {/* 测试预览对话框 */}
      <DiscountPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
      />
    </div>
  );
}

// 折扣规则表格组件
interface DiscountRulesTableProps {
  rules: DiscountRule[];
  loading: boolean;
  onEdit: (rule: DiscountRule) => void;
  onDelete: (ruleId: string) => void;
  onToggleStatus: (rule: DiscountRule) => void;
  getStatusBadge: (status: DiscountStatus) => JSX.Element;
}

function DiscountRulesTable({
  rules,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  getStatusBadge,
}: DiscountRulesTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-sm text-slate-600">加载中...</p>
        </CardContent>
      </Card>
    );
  }

  if (rules.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-2">暂无折扣规则</p>
          <p className="text-sm text-slate-500">请创建新的折扣规则</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>优先级</TableHead>
              <TableHead>规则名称</TableHead>
              <TableHead>触发条件</TableHead>
              <TableHead>折扣动作</TableHead>
              <TableHead>生效时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>使用次数</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {rule.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    {rule.description && (
                      <p className="text-xs text-slate-500 mt-1">
                        {rule.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {formatConditionsSummary(rule.conditions).map((cond, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {cond}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {formatDiscountAction(rule.action)}
                  </Badge>
                  {rule.action.exclusive && (
                    <Badge variant="outline" className="ml-1 text-xs bg-red-50 text-red-700 border-red-200">
                      互斥
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3" />
                      {new Date(rule.effectiveDate).toLocaleDateString()}
                    </div>
                    {rule.expiryDate && (
                      <div className="text-xs text-slate-500 mt-1">
                        至 {new Date(rule.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(rule.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-medium">{rule.usageCount || 0}</span>
                    {rule.maxUsage && (
                      <span className="text-slate-500"> / {rule.maxUsage}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {rule.status !== 'DRAFT' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(rule)}
                        title={rule.status === 'ACTIVE' ? '停用' : '启用'}
                      >
                        {rule.status === 'ACTIVE' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(rule)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// 编辑对话框组件
interface DiscountRuleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: Partial<DiscountRule> | null;
  onRuleChange: (rule: Partial<DiscountRule>) => void;
  onSave: () => void;
}

function DiscountRuleEditDialog({
  open,
  onOpenChange,
  rule,
  onRuleChange,
  onSave,
}: DiscountRuleEditDialogProps) {
  if (!rule) return null;

  const updateConditions = (updates: Partial<DiscountConditions>) => {
    onRuleChange({
      ...rule,
      conditions: { ...rule.conditions, ...updates },
    });
  };

  const updateAction = (updates: Partial<DiscountAction>) => {
    onRuleChange({
      ...rule,
      action: { ...rule.action, ...updates } as DiscountAction,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rule.id ? '编辑折扣规则' : '新建折扣规则'}
          </DialogTitle>
          <DialogDescription>
            配置折扣规则的触发条件和折扣动作
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="py-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基础信息</TabsTrigger>
            <TabsTrigger value="conditions">触发条件</TabsTrigger>
            <TabsTrigger value="action">折扣动作</TabsTrigger>
          </TabsList>

          {/* Tab 1: 基础信息 */}
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label>规则名称 *</Label>
              <Input
                placeholder="如：新用户首单9折"
                value={rule.name || ''}
                onChange={(e) => onRuleChange({ ...rule, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                placeholder="详细说明折扣规则"
                value={rule.description || ''}
                onChange={(e) => onRuleChange({ ...rule, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>优先级 *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="数字越小优先级越高"
                  value={rule.priority || 100}
                  onChange={(e) =>
                    onRuleChange({ ...rule, priority: parseInt(e.target.value) || 100 })
                  }
                />
                <p className="text-xs text-slate-500">数字越小，优先级越高</p>
              </div>

              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={rule.status}
                  onValueChange={(v) => onRuleChange({ ...rule, status: v as DiscountStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getDiscountStatuses().map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>生效时间 *</Label>
                <Input
                  type="datetime-local"
                  value={rule.effectiveDate?.slice(0, 16) || ''}
                  onChange={(e) =>
                    onRuleChange({ ...rule, effectiveDate: new Date(e.target.value).toISOString() })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>失效时间</Label>
                <Input
                  type="datetime-local"
                  value={rule.expiryDate?.slice(0, 16) || ''}
                  onChange={(e) =>
                    onRuleChange({
                      ...rule,
                      expiryDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    })
                  }
                />
                <p className="text-xs text-slate-500">不填则永久有效</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>最大使用次数</Label>
              <Input
                type="number"
                min="1"
                placeholder="不填则无限制"
                value={rule.maxUsage || ''}
                onChange={(e) =>
                  onRuleChange({
                    ...rule,
                    maxUsage: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </TabsContent>

          {/* Tab 2: 触发条件 */}
          <TabsContent value="conditions" className="space-y-4">
            {/* 用户条件 */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                用户条件
              </h4>
              
              <div className="space-y-2">
                <Label>目标用户类型（可多选）</Label>
                <div className="grid grid-cols-2 gap-2">
                  {getUserTypes().map((type) => {
                    const checked =
                      rule.conditions?.targetUserTypes?.includes(type.value) || false;
                    return (
                      <div key={type.value} className="flex items-center gap-2">
                        <Switch
                          checked={checked}
                          onCheckedChange={(checked) => {
                            const current = rule.conditions?.targetUserTypes || [];
                            const updated = checked
                              ? [...current, type.value]
                              : current.filter((t) => t !== type.value);
                            updateConditions({
                              targetUserTypes: updated.length > 0 ? updated : undefined,
                            });
                          }}
                        />
                        <Label>{type.label}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>仅限首单</Label>
                  <p className="text-xs text-slate-500">限用户第一笔消费</p>
                </div>
                <Switch
                  checked={rule.conditions?.firstOrderOnly || false}
                  onCheckedChange={(checked) =>
                    updateConditions({ firstOrderOnly: checked || undefined })
                  }
                />
              </div>
            </div>

            {/* 资源条件 */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                资源条件
              </h4>
              
              <div className="space-y-2">
                <Label>目标资源类型</Label>
                <Input
                  placeholder="如：gpu,cpu,memory（逗号分隔）"
                  value={rule.conditions?.targetResourceTypes?.join(',') || ''}
                  onChange={(e) =>
                    updateConditions({
                      targetResourceTypes: e.target.value
                        ? e.target.value.split(',').map((s) => s.trim())
                        : undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>目标资源规格</Label>
                <Input
                  placeholder="如：A100-80GB,V100-32GB（逗号分隔）"
                  value={rule.conditions?.targetResourceSpecs?.join(',') || ''}
                  onChange={(e) =>
                    updateConditions({
                      targetResourceSpecs: e.target.value
                        ? e.target.value.split(',').map((s) => s.trim())
                        : undefined,
                    })
                  }
                />
              </div>
            </div>

            {/* 用量条件 */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                用量门槛
              </h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>最低金额</Label>
                  <Input
                    type="number"
                    placeholder="¥"
                    value={rule.conditions?.minAmount || ''}
                    onChange={(e) =>
                      updateConditions({
                        minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>最低数量</Label>
                  <Input
                    type="number"
                    placeholder="卡数"
                    value={rule.conditions?.minQuantity || ''}
                    onChange={(e) =>
                      updateConditions({
                        minQuantity: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>最低时长</Label>
                  <Input
                    type="number"
                    placeholder="小时"
                    value={rule.conditions?.minUsageHours || ''}
                    onChange={(e) =>
                      updateConditions({
                        minUsageHours: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* 地域和时段条件 */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">其他条件</h4>
              
              <div className="space-y-2">
                <Label>目标可用区</Label>
                <Input
                  placeholder="如：zone-cd-01,zone-bj-01（逗号分隔）"
                  value={rule.conditions?.targetZones?.join(',') || ''}
                  onChange={(e) =>
                    updateConditions({
                      targetZones: e.target.value
                        ? e.target.value.split(',').map((s) => s.trim())
                        : undefined,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>时段开始（小时）</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="0-23"
                    value={rule.conditions?.timeRange?.startHour ?? ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateConditions({
                        timeRange:
                          value !== undefined || rule.conditions?.timeRange?.endHour !== undefined
                            ? {
                                startHour: value ?? 0,
                                endHour: rule.conditions?.timeRange?.endHour ?? 24,
                              }
                            : undefined,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>时段结束（小时）</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="0-23"
                    value={rule.conditions?.timeRange?.endHour ?? ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateConditions({
                        timeRange:
                          value !== undefined || rule.conditions?.timeRange?.startHour !== undefined
                            ? {
                                startHour: rule.conditions?.timeRange?.startHour ?? 0,
                                endHour: value ?? 24,
                              }
                            : undefined,
                      });
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                如：0-6 表示凌晨00:00-06:00，22-6 表示晚上22:00-次日06:00
              </p>
            </div>
          </TabsContent>

          {/* Tab 3: 折扣动作 */}
          <TabsContent value="action" className="space-y-4">
            <div className="space-y-2">
              <Label>折扣方式 *</Label>
              <Select
                value={rule.action?.type}
                onValueChange={(v) => updateAction({ type: v as DiscountActionType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getDiscountActionTypes().map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <p>{type.label}</p>
                        <p className="text-xs text-slate-500">{type.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {rule.action?.type === 'PERCENTAGE' && (
              <div className="space-y-2">
                <Label>折扣率 *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    placeholder="0.9"
                    value={rule.action?.discountRate || ''}
                    onChange={(e) =>
                      updateAction({ discountRate: parseFloat(e.target.value) || 1 })
                    }
                  />
                  <span className="text-sm text-slate-600">
                    （{((1 - (rule.action?.discountRate || 1)) * 100).toFixed(0)}% OFF）
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  0.9 = 9折，0.8 = 8折
                </p>
              </div>
            )}

            {rule.action?.type === 'FIXED' && (
              <div className="space-y-2">
                <Label>固定减免金额 *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">¥</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="100.00"
                    value={rule.action?.fixedDeduction || ''}
                    onChange={(e) =>
                      updateAction({ fixedDeduction: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            )}

            {rule.action?.type === 'CAPPED' && (
              <>
                <div className="space-y-2">
                  <Label>折扣率 *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    placeholder="0.9"
                    value={rule.action?.discountRate || ''}
                    onChange={(e) =>
                      updateAction({ discountRate: parseFloat(e.target.value) || 1 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>最大减免金额 *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">¥</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="200.00"
                      value={rule.action?.maxDeduction || ''}
                      onChange={(e) =>
                        updateAction({ maxDeduction: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    减免金额不超过此上限
                  </p>
                </div>
              </>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <Label>互斥策略</Label>
                <p className="text-xs text-slate-500">
                  启用后，本折扣不可与其他折扣叠加
                </p>
              </div>
              <Switch
                checked={rule.action?.exclusive || false}
                onCheckedChange={(checked) => updateAction({ exclusive: checked })}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 测试预览对话框（简化版）
interface DiscountPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DiscountPreviewDialog({ open, onOpenChange }: DiscountPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>折扣预览测试</DialogTitle>
          <DialogDescription>
            测试功能开发中...
          </DialogDescription>
        </DialogHeader>
        <div className="p-8 text-center text-slate-500">
          <Settings className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>折扣预览工具正在开发中</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
