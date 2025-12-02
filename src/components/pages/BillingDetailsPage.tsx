import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  Search,
  Filter,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Network,
  Zap,
  Camera,
} from 'lucide-react';
import { getBillingRecords, BillingRecord } from '../../services/billingService';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function BillingDetailsPage() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, selectedType]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await getBillingRecords(
        startDate?.toISOString() || '',
        endDate?.toISOString() || ''
      );
      setRecords(data);
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.resourceId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((record) => record.resourceType === selectedType);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const getResourceIcon = (type: string) => {
    const icons = {
      instance: Server,
      storage: Database,
      gpu: Cpu,
      network: Network,
      inference: Zap,
      snapshot: Camera,
    };
    const Icon = icons[type as keyof typeof icons] || Server;
    return <Icon className="w-4 h-4" />;
  };

  const getResourceTypeLabel = (type: string) => {
    const labels = {
      instance: '容器实例',
      storage: '存储卷',
      gpu: 'GPU算力',
      network: '网络流量',
      inference: '推理服务',
      snapshot: '快照备份',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getResourceTypeColor = (type: string) => {
    const colors = {
      instance: 'bg-blue-50 text-blue-700 border-blue-200',
      storage: 'bg-green-50 text-green-700 border-green-200',
      gpu: 'bg-purple-50 text-purple-700 border-purple-200',
      network: 'bg-orange-50 text-orange-700 border-orange-200',
      inference: 'bg-pink-50 text-pink-700 border-pink-200',
      snapshot: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[type as keyof typeof colors] || '';
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      billed: { label: '已计费', color: 'bg-green-50 text-green-700 border-green-200' },
      pending: { label: '待计费', color: 'bg-orange-50 text-orange-700 border-orange-200' },
      refunded: { label: '已退款', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    };
    return configs[status as keyof typeof configs] || configs.billed;
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = () => {
    toast.success('导出成功，正在下载...');
    // 实际应该调用导出API
  };

  // 分页
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 统计
  const totalCost = filteredRecords.reduce((sum, record) => sum + record.totalCost, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-900 mb-2">计费明细</h1>
            <p className="text-slate-600">查看详细的资源使用和费用记录</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadRecords} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出账单
            </Button>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜索 */}
            <div className="md:col-span-2">
              <Label className="mb-2">搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索资源名称、描述或ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* 资源类型 */}
            <div>
              <Label className="mb-2">资源类型</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="gpu">GPU算力</SelectItem>
                  <SelectItem value="instance">容器实例</SelectItem>
                  <SelectItem value="storage">存储卷</SelectItem>
                  <SelectItem value="network">网络流量</SelectItem>
                  <SelectItem value="inference">推理服务</SelectItem>
                  <SelectItem value="snapshot">快照备份</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 日期范围 */}
            <div>
              <Label className="mb-2">日期范围</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {startDate && endDate
                      ? `${format(startDate, 'MM/dd')} - ${format(endDate, 'MM/dd')}`
                      : '选择日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
                        setEndDate(new Date());
                        loadRecords();
                      }}
                    >
                      最近7天
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
                        setEndDate(new Date());
                        loadRecords();
                      }}
                    >
                      最近30天
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setStartDate(new Date(new Date().setDate(new Date().getDate() - 90)));
                        setEndDate(new Date());
                        loadRecords();
                      }}
                    >
                      最近90天
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t text-sm">
            <div>
              <span className="text-slate-600">共 </span>
              <span className="font-semibold text-purple-600">{filteredRecords.length}</span>
              <span className="text-slate-600"> 条记录</span>
            </div>
            <div>
              <span className="text-slate-600">总费用: </span>
              <span className="font-semibold text-purple-600">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 明细表格 */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">加载中...</p>
          </CardContent>
        </Card>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">未找到计费记录</p>
            <p className="text-sm text-slate-500">尝试调整筛选条件</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">日期</TableHead>
                      <TableHead>资源类型</TableHead>
                      <TableHead>资源名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead className="text-right">用量</TableHead>
                      <TableHead className="text-right">单价</TableHead>
                      <TableHead className="text-right">费用</TableHead>
                      <TableHead className="w-24">状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record) => {
                      const statusConfig = getStatusConfig(record.status);
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="text-sm">
                            {formatDateTime(record.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getResourceTypeColor(record.resourceType)}
                            >
                              <span className="mr-1">
                                {getResourceIcon(record.resourceType)}
                              </span>
                              {getResourceTypeLabel(record.resourceType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.resourceName}</p>
                              <p className="text-xs text-slate-500">{record.resourceId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {record.description}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {record.quantity.toFixed(2)} {record.unit}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {formatCurrency(record.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(record.totalCost)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-600">
                显示 {(currentPage - 1) * itemsPerPage + 1} 到{' '}
                {Math.min(currentPage * itemsPerPage, filteredRecords.length)} 条，
                共 {filteredRecords.length} 条
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
