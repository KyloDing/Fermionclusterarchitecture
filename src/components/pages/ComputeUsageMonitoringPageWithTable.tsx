/**
 * 算力使用监控页面（带明细表格）
 * @description 提供多维度查询、统计分析和数据导出功能，所见即所得
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Monitor,
  Download,
  RefreshCw,
  Calendar,
  Building2,
  Loader2,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  List,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  queryUsageRecords,
  getAllEnterprises,
  getTimeRangePresets,
  exportUsageData,
  formatCurrency,
  ComputeUsageRecord,
  PaginatedResponse,
  UsageQueryFilter,
  ExportConfig,
} from '../../services/computeUsageService';
import ComputeUsageMonitoringPage from './ComputeUsageMonitoringPage';

export default function ComputeUsageMonitoringPageWithTable() {
  // 时间范围状态
  const [timeRangePreset, setTimeRangePreset] = useState<string>('last7days');
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // 组织筛选状态
  const [enterprises, setEnterprises] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string>('all');

  // 明细表格状态
  const [records, setRecords] = useState<PaginatedResponse<ComputeUsageRecord> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<string>('startTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 列显隐状态
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      'userName',
      'enterpriseName',
      'resourceType',
      'resourceSpec',
      'startTime',
      'gpuHours',
      'finalAmount',
    ])
  );

  // 初始化
  useEffect(() => {
    initializeData();
  }, []);

  // 时间范围/企业/分页/排序变化时重新加载
  useEffect(() => {
    if (timeRange.start && timeRange.end) {
      loadRecords();
    }
  }, [timeRange, selectedEnterprise, page, pageSize, sortBy, sortOrder]);

  const initializeData = async () => {
    const ents = await getAllEnterprises();
    setEnterprises(ents);

    const presets = getTimeRangePresets();
    const defaultPreset = presets.find((p) => p.value === 'last7days');
    if (defaultPreset) {
      setTimeRange({
        start: defaultPreset.start.toISOString(),
        end: defaultPreset.end.toISOString(),
      });
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const filter: UsageQueryFilter = {
        startTime: timeRange.start,
        endTime: timeRange.end,
        enterpriseId: selectedEnterprise === 'all' ? undefined : selectedEnterprise,
        page,
        pageSize,
        sortBy,
        sortOrder,
      };

      const data = await queryUsageRecords(filter);
      setRecords(data);
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
    setPage(1); // 重置页码
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const toggleColumn = (column: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(column)) {
      newVisible.delete(column);
    } else {
      newVisible.add(column);
    }
    setVisibleColumns(newVisible);
  };

  const handleExport = async () => {
    try {
      const config: ExportConfig = {
        scope: 'current',
        format: 'csv',
        fields: Array.from(visibleColumns),
        filters: {
          startTime: timeRange.start,
          endTime: timeRange.end,
          enterpriseId: selectedEnterprise === 'all' ? undefined : selectedEnterprise,
        },
      };

      const result = await exportUsageData(config);

      if ('downloadUrl' in result) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `算力使用明细_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('导出成功');
      } else {
        toast.success('导出任务已创建');
      }
    } catch (error) {
      toast.error('导出失败');
    }
  };

  // 所有可用字段
  const allColumns = [
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

  // 格式化日期时间
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
            <p className="text-slate-600">多维度查询、统计分析和数据导出（所见即所得）</p>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            数据总览
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            使用明细
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: 数据总览 */}
        <TabsContent value="overview">
          <ComputeUsageMonitoringPage />
        </TabsContent>

        {/* Tab 2: 使用明细 */}
        <TabsContent value="records">
          {/* 筛选条件栏 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* 时间范围 */}
                <div className="space-y-2">
                  <label className="text-sm">时间范围</label>
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
                  <label className="text-sm">企业</label>
                  <Select value={selectedEnterprise} onValueChange={(v) => { setSelectedEnterprise(v); setPage(1); }}>
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

                {/* 搜索 */}
                <div className="space-y-2">
                  <label className="text-sm">搜索</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="搜索..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 列配置 */}
                <div className="space-y-2">
                  <label className="text-sm">列配置</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        列显隐
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>选择显示的列</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {allColumns.map((col) => (
                        <DropdownMenuCheckboxItem
                          key={col.value}
                          checked={visibleColumns.has(col.value)}
                          onCheckedChange={() => toggleColumn(col.value)}
                        >
                          {col.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2">
                  <label className="text-sm opacity-0">操作</label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={loadRecords} className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      刷新
                    </Button>
                    <Button onClick={handleExport} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      导出
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 使用记录表格 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  使用记录明细
                </span>
                <span className="text-sm font-normal text-slate-600">
                  共 {records?.total || 0} 条记录
                </span>
              </CardTitle>
              <CardDescription>
                当前显示的数据与导出内容完全一致（所见即所得）
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">加载中...</p>
                </div>
              ) : records && records.data.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {visibleColumns.has('userName') && (
                            <TableHead>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('userName')}
                                className="hover:bg-transparent"
                              >
                                用户名
                                <ArrowUpDown className="w-3 h-3 ml-1" />
                              </Button>
                            </TableHead>
                          )}
                          {visibleColumns.has('enterpriseName') && (
                            <TableHead>企业</TableHead>
                          )}
                          {visibleColumns.has('departmentName') && (
                            <TableHead>部门</TableHead>
                          )}
                          {visibleColumns.has('userGroupName') && (
                            <TableHead>用户组</TableHead>
                          )}
                          {visibleColumns.has('resourceType') && (
                            <TableHead>资源类型</TableHead>
                          )}
                          {visibleColumns.has('resourceSpec') && (
                            <TableHead>资源规格</TableHead>
                          )}
                          {visibleColumns.has('instanceId') && (
                            <TableHead>实例ID</TableHead>
                          )}
                          {visibleColumns.has('zoneId') && (
                            <TableHead>可用区</TableHead>
                          )}
                          {visibleColumns.has('startTime') && (
                            <TableHead>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('startTime')}
                                className="hover:bg-transparent"
                              >
                                开始时间
                                <ArrowUpDown className="w-3 h-3 ml-1" />
                              </Button>
                            </TableHead>
                          )}
                          {visibleColumns.has('endTime') && (
                            <TableHead>结束时间</TableHead>
                          )}
                          {visibleColumns.has('gpuHours') && (
                            <TableHead className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('gpuHours')}
                                className="hover:bg-transparent"
                              >
                                GPU小时
                                <ArrowUpDown className="w-3 h-3 ml-1" />
                              </Button>
                            </TableHead>
                          )}
                          {visibleColumns.has('costAmount') && (
                            <TableHead className="text-right">原价</TableHead>
                          )}
                          {visibleColumns.has('finalAmount') && (
                            <TableHead className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('finalAmount')}
                                className="hover:bg-transparent"
                              >
                                折后价
                                <ArrowUpDown className="w-3 h-3 ml-1" />
                              </Button>
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.data
                          .filter((record) =>
                            searchText
                              ? record.userName.toLowerCase().includes(searchText.toLowerCase()) ||
                                record.enterpriseName?.toLowerCase().includes(searchText.toLowerCase()) ||
                                record.instanceId.toLowerCase().includes(searchText.toLowerCase())
                              : true
                          )
                          .map((record) => (
                            <TableRow key={record.recordId}>
                              {visibleColumns.has('userName') && (
                                <TableCell className="font-medium">{record.userName}</TableCell>
                              )}
                              {visibleColumns.has('enterpriseName') && (
                                <TableCell>{record.enterpriseName || '-'}</TableCell>
                              )}
                              {visibleColumns.has('departmentName') && (
                                <TableCell>{record.departmentName || '-'}</TableCell>
                              )}
                              {visibleColumns.has('userGroupName') && (
                                <TableCell>{record.userGroupName || '-'}</TableCell>
                              )}
                              {visibleColumns.has('resourceType') && (
                                <TableCell>
                                  <Badge variant="outline">{record.resourceType.toUpperCase()}</Badge>
                                </TableCell>
                              )}
                              {visibleColumns.has('resourceSpec') && (
                                <TableCell>{record.resourceSpec}</TableCell>
                              )}
                              {visibleColumns.has('instanceId') && (
                                <TableCell className="font-mono text-xs">{record.instanceId}</TableCell>
                              )}
                              {visibleColumns.has('zoneId') && (
                                <TableCell>{record.zoneId || '-'}</TableCell>
                              )}
                              {visibleColumns.has('startTime') && (
                                <TableCell>{formatDateTime(record.startTime)}</TableCell>
                              )}
                              {visibleColumns.has('endTime') && (
                                <TableCell>{formatDateTime(record.endTime)}</TableCell>
                              )}
                              {visibleColumns.has('gpuHours') && (
                                <TableCell className="text-right">{record.gpuHours?.toFixed(2) || '-'}</TableCell>
                              )}
                              {visibleColumns.has('costAmount') && (
                                <TableCell className="text-right">{formatCurrency(record.costAmount)}</TableCell>
                              )}
                              {visibleColumns.has('finalAmount') && (
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(record.finalAmount)}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* 分页 */}
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">每页显示</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                          setPageSize(Number(v));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-slate-600">条</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-slate-600">
                        第 {page} / {records.totalPages} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === records.totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <List className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">暂无数据</p>
                  <p className="text-sm text-slate-500">请调整筛选条件</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
