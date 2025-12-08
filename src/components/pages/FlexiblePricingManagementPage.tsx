import { useState, useEffect } from 'react';
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
  Cpu,
  HardDrive,
  Zap,
  DollarSign,
  Edit,
  Plus,
  Trash2,
  Settings,
  ChevronRight,
  Info,
  Layers,
  Database,
  Network,
  Globe,
  Server,
  Box,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  PricingRule,
  PricingScope,
  ResourceType,
  BillingCycle,
  getAllPricingRules,
  getPricingRulesByScope,
  savePricingRule,
  deletePricingRule,
  getResourceTypes,
  getBillingCycles,
  getPricingScopes,
  queryPricing,
} from '../../services/pricingService';

export default function FlexiblePricingManagementPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<PricingRule> | null>(null);

  // 筛选条件
  const [filterScope, setFilterScope] = useState<PricingScope | 'all'>('all');
  const [filterResourceType, setFilterResourceType] = useState<ResourceType | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadPricingRules();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rules, filterScope, filterResourceType, searchText]);

  const loadPricingRules = async () => {
    setLoading(true);
    try {
      const data = await getAllPricingRules();
      setRules(data);
    } catch (error) {
      toast.error('加载定价规则失败');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rules];

    if (filterScope !== 'all') {
      filtered = filtered.filter((r) => r.scope === filterScope);
    }

    if (filterResourceType !== 'all') {
      filtered = filtered.filter((r) => r.resourceType === filterResourceType);
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.resourceSpec?.toLowerCase().includes(search) ||
          r.scopeName?.toLowerCase().includes(search) ||
          r.description?.toLowerCase().includes(search)
      );
    }

    setFilteredRules(filtered);
  };

  const handleCreateNew = () => {
    setEditingRule({
      scope: 'default',
      resourceType: 'gpu',
      billingCycle: 'hourly',
      currency: 'CNY',
      enabled: true,
      effectiveDate: new Date().toISOString(),
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingRule) return;

    try {
      await savePricingRule(editingRule);
      toast.success('保存成功');
      setEditDialogOpen(false);
      setEditingRule(null);
      loadPricingRules();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('确定要删除这条定价规则吗？')) return;

    try {
      await deletePricingRule(ruleId);
      toast.success('删除成功');
      loadPricingRules();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'gpu':
        return <Zap className="w-4 h-4" />;
      case 'cpu':
        return <Cpu className="w-4 h-4" />;
      case 'memory':
        return <HardDrive className="w-4 h-4" />;
      case 'storage':
        return <Database className="w-4 h-4" />;
      case 'network':
        return <Network className="w-4 h-4" />;
    }
  };

  const getScopeIcon = (scope: PricingScope) => {
    switch (scope) {
      case 'default':
        return <Globe className="w-4 h-4" />;
      case 'zone':
        return <Layers className="w-4 h-4" />;
      case 'pool':
        return <Box className="w-4 h-4" />;
      case 'node':
        return <Server className="w-4 h-4" />;
    }
  };

  const getScopeColor = (scope: PricingScope) => {
    switch (scope) {
      case 'default':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'zone':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pool':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'node':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getScopeLabel = (scope: PricingScope) => {
    const scopes = getPricingScopes();
    return scopes.find((s) => s.value === scope)?.label || scope;
  };

  const getResourceTypeLabel = (type: ResourceType) => {
    const types = getResourceTypes();
    return types.find((t) => t.value === type)?.label || type;
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // 按范围分组规则
  const rulesByScope = {
    default: filteredRules.filter((r) => r.scope === 'default'),
    zone: filteredRules.filter((r) => r.scope === 'zone'),
    pool: filteredRules.filter((r) => r.scope === 'pool'),
    node: filteredRules.filter((r) => r.scope === 'node'),
  };

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-slate-900">资源定价管理</h1>
            <p className="text-slate-600">
              配置算力、网络、存储资源的分层定价规则
            </p>
          </div>
        </div>
      </div>

      {/* 定价规则说明 */}
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription>
          <strong className="text-blue-900">定价继承规则</strong>
          <p className="text-sm text-blue-800 mt-2">
            系统按优先级应用定价：
            <strong> 节点价格 &gt; 资源池价格 &gt; 可用区价格 &gt; 默认价格</strong>
          </p>
          <p className="text-xs text-blue-700 mt-1">
            资源若无额外配置则自动使用上层定价，灵活支持不同场景的差异化定价
          </p>
        </AlertDescription>
      </Alert>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* 范围筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={filterScope} onValueChange={(v) => setFilterScope(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部范围</SelectItem>
                <SelectItem value="default">默认定价</SelectItem>
                <SelectItem value="zone">可用区定价</SelectItem>
                <SelectItem value="pool">资源池定价</SelectItem>
                <SelectItem value="node">节点定价</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 资源类型筛选 */}
          <Select value={filterResourceType} onValueChange={(v) => setFilterResourceType(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部资源</SelectItem>
              <SelectItem value="gpu">GPU</SelectItem>
              <SelectItem value="cpu">CPU</SelectItem>
              <SelectItem value="memory">内存</SelectItem>
              <SelectItem value="storage">存储</SelectItem>
              <SelectItem value="network">网络</SelectItem>
            </SelectContent>
          </Select>

          {/* 搜索 */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="搜索规格、名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 w-[240px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setTestDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            测试定价查询
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            新建定价规则
          </Button>
        </div>
      </div>

      {/* 定价规则标签页 */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            全部 ({filteredRules.length})
          </TabsTrigger>
          <TabsTrigger value="default">
            默认定价 ({rulesByScope.default.length})
          </TabsTrigger>
          <TabsTrigger value="zone">
            可用区 ({rulesByScope.zone.length})
          </TabsTrigger>
          <TabsTrigger value="pool">
            资源池 ({rulesByScope.pool.length})
          </TabsTrigger>
          <TabsTrigger value="node">
            节点 ({rulesByScope.node.length})
          </TabsTrigger>
        </TabsList>

        {/* 全部规则 */}
        <TabsContent value="all">
          <PricingRulesTable
            rules={filteredRules}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getResourceIcon={getResourceIcon}
            getScopeIcon={getScopeIcon}
            getScopeColor={getScopeColor}
            getScopeLabel={getScopeLabel}
            getResourceTypeLabel={getResourceTypeLabel}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        {/* 默认定价 */}
        <TabsContent value="default">
          <PricingRulesTable
            rules={rulesByScope.default}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getResourceIcon={getResourceIcon}
            getScopeIcon={getScopeIcon}
            getScopeColor={getScopeColor}
            getScopeLabel={getScopeLabel}
            getResourceTypeLabel={getResourceTypeLabel}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        {/* 可用区定价 */}
        <TabsContent value="zone">
          <PricingRulesTable
            rules={rulesByScope.zone}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getResourceIcon={getResourceIcon}
            getScopeIcon={getScopeIcon}
            getScopeColor={getScopeColor}
            getScopeLabel={getScopeLabel}
            getResourceTypeLabel={getResourceTypeLabel}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        {/* 资源池定价 */}
        <TabsContent value="pool">
          <PricingRulesTable
            rules={rulesByScope.pool}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getResourceIcon={getResourceIcon}
            getScopeIcon={getScopeIcon}
            getScopeColor={getScopeColor}
            getScopeLabel={getScopeLabel}
            getResourceTypeLabel={getResourceTypeLabel}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        {/* 节点定价 */}
        <TabsContent value="node">
          <PricingRulesTable
            rules={rulesByScope.node}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getResourceIcon={getResourceIcon}
            getScopeIcon={getScopeIcon}
            getScopeColor={getScopeColor}
            getScopeLabel={getScopeLabel}
            getResourceTypeLabel={getResourceTypeLabel}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>

      {/* 编辑对话框 */}
      <PricingRuleEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        rule={editingRule}
        onRuleChange={setEditingRule}
        onSave={handleSave}
        getScopeLabel={getScopeLabel}
        getResourceTypeLabel={getResourceTypeLabel}
      />

      {/* 测试查询对话框 */}
      <PricingTestDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
      />
    </div>
  );
}

// 定价规则表格组件
interface PricingRulesTableProps {
  rules: PricingRule[];
  loading: boolean;
  onEdit: (rule: PricingRule) => void;
  onDelete: (ruleId: string) => void;
  getResourceIcon: (type: ResourceType) => JSX.Element;
  getScopeIcon: (scope: PricingScope) => JSX.Element;
  getScopeColor: (scope: PricingScope) => string;
  getScopeLabel: (scope: PricingScope) => string;
  getResourceTypeLabel: (type: ResourceType) => string;
  formatCurrency: (amount: number) => string;
}

function PricingRulesTable({
  rules,
  loading,
  onEdit,
  onDelete,
  getResourceIcon,
  getScopeIcon,
  getScopeColor,
  getScopeLabel,
  getResourceTypeLabel,
  formatCurrency,
}: PricingRulesTableProps) {
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
          <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-2">暂无定价规则</p>
          <p className="text-sm text-slate-500">请创建新的定价规则</p>
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
              <TableHead>范围</TableHead>
              <TableHead>资源类型</TableHead>
              <TableHead>资源规格</TableHead>
              <TableHead className="text-right">单价</TableHead>
              <TableHead>计费单位</TableHead>
              <TableHead>计费周期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getScopeColor(rule.scope)}>
                      <span className="flex items-center gap-1">
                        {getScopeIcon(rule.scope)}
                        {getScopeLabel(rule.scope)}
                      </span>
                    </Badge>
                    {rule.scopeName && (
                      <span className="text-xs text-slate-500">{rule.scopeName}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getResourceIcon(rule.resourceType)}
                    <span>{getResourceTypeLabel(rule.resourceType)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {rule.resourceSpec ? (
                    <Badge variant="outline">{rule.resourceSpec}</Badge>
                  ) : (
                    <span className="text-xs text-slate-400">通用</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(rule.pricePerUnit)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">{rule.unit}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {rule.billingCycle === 'hourly' && '按小时'}
                    {rule.billingCycle === 'daily' && '按天'}
                    {rule.billingCycle === 'monthly' && '按月'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {rule.enabled ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      启用
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                      禁用
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
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
interface PricingRuleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: Partial<PricingRule> | null;
  onRuleChange: (rule: Partial<PricingRule>) => void;
  onSave: () => void;
  getScopeLabel: (scope: PricingScope) => string;
  getResourceTypeLabel: (type: ResourceType) => string;
}

function PricingRuleEditDialog({
  open,
  onOpenChange,
  rule,
  onRuleChange,
  onSave,
  getScopeLabel,
  getResourceTypeLabel,
}: PricingRuleEditDialogProps) {
  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rule.id ? '编辑定价规则' : '新建定价规则'}
          </DialogTitle>
          <DialogDescription>
            配置资源的定价信息，支持分层定价策略
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 定价范围 */}
          <div className="space-y-2">
            <Label>定价范围 *</Label>
            <Select
              value={rule.scope}
              onValueChange={(v) => onRuleChange({ ...rule, scope: v as PricingScope })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getPricingScopes().map((scope) => (
                  <SelectItem key={scope.value} value={scope.value}>
                    <div>
                      <p>{scope.label}</p>
                      <p className="text-xs text-slate-500">{scope.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 范围ID（非默认定价时） */}
          {rule.scope !== 'default' && (
            <>
              <div className="space-y-2">
                <Label>范围ID *</Label>
                <Input
                  placeholder={`输入${getScopeLabel(rule.scope!)}的ID`}
                  value={rule.scopeId || ''}
                  onChange={(e) => onRuleChange({ ...rule, scopeId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>范围名称</Label>
                <Input
                  placeholder="显示名称"
                  value={rule.scopeName || ''}
                  onChange={(e) => onRuleChange({ ...rule, scopeName: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* 资源类型 */}
            <div className="space-y-2">
              <Label>资源类型 *</Label>
              <Select
                value={rule.resourceType}
                onValueChange={(v) => onRuleChange({ ...rule, resourceType: v as ResourceType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getResourceTypes().map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 资源规格 */}
            <div className="space-y-2">
              <Label>资源规格</Label>
              <Input
                placeholder="如: A100-40GB, V100, SSD"
                value={rule.resourceSpec || ''}
                onChange={(e) => onRuleChange({ ...rule, resourceSpec: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 单价 */}
            <div className="space-y-2">
              <Label>单价 (CNY) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={rule.pricePerUnit || ''}
                onChange={(e) =>
                  onRuleChange({ ...rule, pricePerUnit: parseFloat(e.target.value) })
                }
              />
            </div>

            {/* 计费单位 */}
            <div className="space-y-2">
              <Label>计费单位 *</Label>
              <Input
                placeholder="如: 卡·小时, 核·小时"
                value={rule.unit || ''}
                onChange={(e) => onRuleChange({ ...rule, unit: e.target.value })}
              />
            </div>
          </div>

          {/* 计费周期 */}
          <div className="space-y-2">
            <Label>计费周期 *</Label>
            <Select
              value={rule.billingCycle}
              onValueChange={(v) => onRuleChange({ ...rule, billingCycle: v as BillingCycle })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getBillingCycles().map((cycle) => (
                  <SelectItem key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label>描述</Label>
            <Input
              placeholder="定价规则说明"
              value={rule.description || ''}
              onChange={(e) => onRuleChange({ ...rule, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 生效日期 */}
            <div className="space-y-2">
              <Label>生效日期 *</Label>
              <Input
                type="datetime-local"
                value={rule.effectiveDate?.slice(0, 16) || ''}
                onChange={(e) =>
                  onRuleChange({ ...rule, effectiveDate: new Date(e.target.value).toISOString() })
                }
              />
            </div>

            {/* 失效日期 */}
            <div className="space-y-2">
              <Label>失效日期</Label>
              <Input
                type="datetime-local"
                value={rule.expiryDate?.slice(0, 16) || ''}
                onChange={(e) =>
                  onRuleChange({ ...rule, expiryDate: new Date(e.target.value).toISOString() })
                }
              />
            </div>
          </div>

          {/* 启用状态 */}
          <div className="flex items-center justify-between">
            <div>
              <Label>启用状态</Label>
              <p className="text-xs text-slate-500">关闭后此规则将不会被应用</p>
            </div>
            <Switch
              checked={rule.enabled}
              onCheckedChange={(checked) => onRuleChange({ ...rule, enabled: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 测试查询对话框
interface PricingTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PricingTestDialog({ open, onOpenChange }: PricingTestDialogProps) {
  const [resourceType, setResourceType] = useState<ResourceType>('gpu');
  const [resourceSpec, setResourceSpec] = useState('A100-40GB');
  const [zoneId, setZoneId] = useState('');
  const [poolId, setPoolId] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    try {
      const pricing = await queryPricing({
        resourceType,
        resourceSpec: resourceSpec || undefined,
        zoneId: zoneId || undefined,
        poolId: poolId || undefined,
        nodeId: nodeId || undefined,
      });
      setResult(pricing);
    } catch (error: any) {
      toast.error(error.message || '查询失败');
      setResult(null);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>测试定价查询</DialogTitle>
          <DialogDescription>
            测试分层定价的继承规则，查看实际应用的价格
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>资源类型</Label>
              <Select value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getResourceTypes().map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>资源规格</Label>
              <Input
                placeholder="如: A100-40GB"
                value={resourceSpec}
                onChange={(e) => setResourceSpec(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>可用区ID（可选）</Label>
              <Input
                placeholder="zone-001"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>资源池ID（可选）</Label>
              <Input
                placeholder="pool-001"
                value={poolId}
                onChange={(e) => setPoolId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>节点ID（可选）</Label>
              <Input
                placeholder="node-001"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleTest} disabled={testing} className="w-full">
            {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            查询定价
          </Button>

          {/* 查询结果 */}
          {result && (
            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-lg">查询结果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 价格信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">单价</p>
                    <p className="text-2xl font-semibold text-purple-600">
                      ¥{result.pricePerUnit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">计费单位</p>
                    <p className="text-lg">{result.unit}</p>
                  </div>
                </div>

                {/* 定价继承链 */}
                <div>
                  <p className="text-sm text-slate-600 mb-2">定价继承链</p>
                  <div className="flex items-center gap-2">
                    {result.scopeChain.map((scope: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white">
                          {scope}
                        </Badge>
                        {index < result.scopeChain.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 应用的规则 */}
                <div>
                  <p className="text-sm text-slate-600 mb-2">应用的定价规则</p>
                  <div className="bg-white rounded-lg p-3 border text-sm">
                    <p><strong>ID:</strong> {result.appliedRule.id}</p>
                    <p><strong>范围:</strong> {result.appliedRule.scope}</p>
                    {result.appliedRule.scopeName && (
                      <p><strong>名称:</strong> {result.appliedRule.scopeName}</p>
                    )}
                    <p><strong>描述:</strong> {result.appliedRule.description || '无'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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