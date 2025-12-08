/**
 * 算力使用监控页面
 * @description 提供多维度查询、统计分析和数据导出功能
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Monitor,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  DollarSign,
  Download,
  RefreshCw,
  Calendar,
  Building2,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  FileDown,
  Clock,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  List,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  queryAggregateMetrics,
  queryTopRankings,
  queryResourceDistribution,
  queryUsageRecords,
  getAllEnterprises,
  getTimeRangePresets,
  exportUsageData,
  formatLargeNumber,
  formatCurrency,
  formatPercentage,
  AggregateMetrics,
  TrendDataPoint,
  RankingItem,
  ResourceDistribution,
  ComputeUsageRecord,
  PaginatedResponse,
  UsageQueryFilter,
  ExportConfig,
  TimeRangePreset,
} from '../../services/computeUsageService';

export default function ComputeUsageMonitoringPage() {
  // 时间范围状态
  const [timeRangePreset, setTimeRangePreset] = useState<string>('last7days');
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // 组织筛选状态
  const [enterprises, setEnterprises] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string>('all');

  // 数据状态
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AggregateMetrics | null>(null);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [topEnterprises, setTopEnterprises] = useState<RankingItem[]>([]);
  const [resourceDist, setResourceDist] = useState<ResourceDistribution[]>([]);

  // 导出对话框状态
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState<Partial<ExportConfig>>({
    scope: 'current',
    format: 'csv',
    fields: ['userName', 'enterpriseName', 'resourceType', 'resourceSpec', 'startTime', 'gpuHours', 'finalAmount'],
  });
  const [exporting, setExporting] = useState(false);

  // 初始化
  useEffect(() => {
    initializeData();
  }, []);

  // 时间范围变化时重新加载
  useEffect(() => {
    if (timeRange.start && timeRange.end) {
      loadData();
    }
  }, [timeRange, selectedEnterprise]);

  const initializeData = async () => {
    // 加载企业列表
    const ents = await getAllEnterprises();
    setEnterprises(ents);

    // 设置默认时间范围（最近7天）
    const presets = getTimeRangePresets();
    const defaultPreset = presets.find((p) => p.value === 'last7days');
    if (defaultPreset) {
      setTimeRange({
        start: defaultPreset.start.toISOString(),
        end: defaultPreset.end.toISOString(),
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const filter: UsageQueryFilter = {
        startTime: timeRange.start,
        endTime: timeRange.end,
        enterpriseId: selectedEnterprise === 'all' ? undefined : selectedEnterprise,
      };

      // 并行加载所有数据
      const [metricsData, topData, distData] = await Promise.all([
        queryAggregateMetrics(filter),
        queryTopRankings(filter, 'enterprise', 'gpuHours', 5),
        queryResourceDistribution(filter),
      ]);

      setMetrics(metricsData.metrics);
      setTrend(metricsData.trend);
      setTopEnterprises(topData);
      setResourceDist(distData);
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (preset: string) => {
    setTimeRangePreset(preset);
    const presets = getTimeRangePresets();
    const selected = presets.find((p) => p.value === preset);
    if (selected) {
      setTimeRange({
        start: selected.start.toISOString(),
        end: selected.end.toISOString(),
      });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const config: ExportConfig = {
        scope: exportConfig.scope || 'current',
        format: exportConfig.format || 'csv',
        fields: exportConfig.fields || [],
        filters: {
          startTime: timeRange.start,
          endTime: timeRange.end,
          enterpriseId: selectedEnterprise === 'all' ? undefined : selectedEnterprise,
        },
      };

      const result = await exportUsageData(config);

      if ('downloadUrl' in result) {
        // 同步导出，直接下载
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `算力使用明细_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('导出成功');
      } else {
        // 异步导出
        toast.success('导出任务已创建，完成后将发送通知');
      }

      setExportDialogOpen(false);
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Monitor className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-slate-900">算力使用监控</h1>
            <p className="text-slate-600">多维度查询、统计分析和数据导出</p>
          </div>
        </div>
      </div>

      {/* 筛选条件栏 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 时间范围 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                时间范围
              </Label>
              <Select value={timeRangePreset} onValueChange={handleTimeRangeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getTimeRangePresets().map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 企业筛选 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                企业
              </Label>
              <Select value={selectedEnterprise} onValueChange={setSelectedEnterprise}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部企业</SelectItem>
                  {enterprises.map((ent) => (
                    <SelectItem key={ent.id} value={ent.id}>
                      {ent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 占位 */}
            <div className="space-y-2">
              <Label className="opacity-0">占位</Label>
              <div className="h-10"></div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-2">
              <Label className="opacity-0">操作</Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadData} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新
                </Button>
                <Button onClick={() => setExportDialogOpen(true)} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600">加载中...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 核心指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="GPU 小时"
              value={metrics?.totalGpuHours || 0}
              change={metrics?.gpuHoursChange || 0}
              icon={Zap}
              iconColor="text-purple-600"
              iconBg="bg-purple-100"
              unit="h"
            />
            <MetricCard
              title="CPU 核时"
              value={metrics?.totalCpuCoreHours || 0}
              change={metrics?.cpuCoreHoursChange || 0}
              icon={Cpu}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              unit="h"
            />
            <MetricCard
              title="存储 TB·天"
              value={metrics?.totalStorageTbDays || 0}
              change={metrics?.storageTbDaysChange || 0}
              icon={HardDrive}
              iconColor="text-orange-600"
              iconBg="bg-orange-100"
              unit="TB·天"
            />
            <MetricCard
              title="总费用"
              value={metrics?.totalFinalAmount || 0}
              change={metrics?.costChange || 0}
              icon={DollarSign}
              iconColor="text-green-600"
              iconBg="bg-green-100"
              isCurrency
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 使用趋势图 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  使用趋势
                </CardTitle>
                <CardDescription>过去{trend.length}天的算力使用情况</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                      labelFormatter={(label) => `日期: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="gpuHours"
                      name="GPU 小时"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      name="费用 (¥)"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top 5 企业排行 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top 5 企业
                </CardTitle>
                <CardDescription>按 GPU 小时排序</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topEnterprises.map((item, index) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm text-slate-600">
                          {formatLargeNumber(item.value)} h
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-12 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 资源分布 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                资源类型分布
              </CardTitle>
              <CardDescription>按资源规格统计</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={resourceDist}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="resourceSpec" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} h`} />
                  <Bar dataKey="value" name="GPU 小时" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* 导出对话框 */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        config={exportConfig}
        onConfigChange={setExportConfig}
        onExport={handleExport}
        exporting={exporting}
      />
    </div>
  );
}

// 指标卡片组件
interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  unit?: string;
  isCurrency?: boolean;
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBg,
  unit,
  isCurrency,
}: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">{title}</p>
          <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold">
            {isCurrency ? formatCurrency(value) : formatLargeNumber(value)}
            {unit && !isCurrency && <span className="text-lg text-slate-500 ml-1">{unit}</span>}
          </p>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(change)}
            </span>
            <span className="text-sm text-slate-500">vs 上周</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 导出对话框组件
interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: Partial<ExportConfig>;
  onConfigChange: (config: Partial<ExportConfig>) => void;
  onExport: () => void;
  exporting: boolean;
}

function ExportDialog({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onExport,
  exporting,
}: ExportDialogProps) {
  const allFields = [
    { value: 'userName', label: '用户名' },
    { value: 'enterpriseName', label: '企业' },
    { value: 'departmentName', label: '部门' },
    { value: 'userGroupName', label: '用户组' },
    { value: 'resourceType', label: '资源类型' },
    { value: 'resourceSpec', label: '资源规格' },
    { value: 'instanceId', label: '实例ID' },
    { value: 'zoneId', label: '可用区' },
    { value: 'startTime', label: '开始时间' },
    { value: 'endTime', label: '结束时间' },
    { value: 'gpuHours', label: 'GPU小时' },
    { value: 'costAmount', label: '原价' },
    { value: 'finalAmount', label: '折后价' },
  ];

  const toggleField = (field: string) => {
    const currentFields = config.fields || [];
    const newFields = currentFields.includes(field)
      ? currentFields.filter((f) => f !== field)
      : [...currentFields, field];
    onConfigChange({ ...config, fields: newFields });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            导出使用记录
          </DialogTitle>
          <DialogDescription>配置导出选项并下载数据</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 导出范围 */}
          <div className="space-y-3">
            <Label className="text-base">📦 导出范围</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="scope-current"
                  checked={config.scope === 'current'}
                  onChange={() => onConfigChange({ ...config, scope: 'current' })}
                />
                <label htmlFor="scope-current" className="cursor-pointer">
                  当前筛选结果（推荐）
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="scope-all"
                  checked={config.scope === 'all'}
                  onChange={() => onConfigChange({ ...config, scope: 'all' })}
                />
                <label htmlFor="scope-all" className="cursor-pointer">
                  全量数据
                </label>
              </div>
            </div>
          </div>

          {/* 导出格式 */}
          <div className="space-y-3">
            <Label className="text-base">📄 导出格式</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="format-csv"
                  checked={config.format === 'csv'}
                  onChange={() => onConfigChange({ ...config, format: 'csv' })}
                />
                <label htmlFor="format-csv" className="cursor-pointer">
                  CSV（兼容Excel）
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="format-excel"
                  checked={config.format === 'excel'}
                  onChange={() => onConfigChange({ ...config, format: 'excel' })}
                />
                <label htmlFor="format-excel" className="cursor-pointer">
                  Excel (.xlsx)
                </label>
              </div>
            </div>
          </div>

          {/* 字段选择 */}
          <div className="space-y-3">
            <Label className="text-base">✅ 字段选择</Label>
            <div className="grid grid-cols-3 gap-3">
              {allFields.map((field) => (
                <div key={field.value} className="flex items-center gap-2">
                  <Switch
                    checked={config.fields?.includes(field.value) || false}
                    onCheckedChange={() => toggleField(field.value)}
                  />
                  <label className="text-sm cursor-pointer" onClick={() => toggleField(field.value)}>
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 提示 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800">
              数据量较大时将转为异步导出，完成后将发送邮件通知
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            取消
          </Button>
          <Button onClick={onExport} disabled={exporting || !config.fields?.length}>
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                确认导出
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}