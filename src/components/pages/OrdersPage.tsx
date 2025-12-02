import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  ShoppingCart,
  Server,
  Brain,
  Zap,
  Database,
  Cpu,
  Camera,
  Search,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  PlayCircle,
  DollarSign,
} from 'lucide-react';
import {
  getOrders,
  getOrderStatistics,
  Order,
  OrderStatistics,
  OrderFilter,
} from '../../services/orderService';
import { toast } from 'sonner@2.0.3';
import OrderDetailsDialog from '../OrderDetailsDialog';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedType, selectedStatus, selectedPaymentStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filter: OrderFilter = {
        orderType: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        paymentStatus: selectedPaymentStatus !== 'all' ? selectedPaymentStatus : undefined,
        searchTerm: searchTerm || undefined,
      };

      const [ordersData, statsData] = await Promise.all([
        getOrders(filter),
        getOrderStatistics(),
      ]);

      setOrders(ordersData);
      setStatistics(statsData);
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleExport = () => {
    toast.success('导出成功，正在下载...');
  };

  const getOrderTypeIcon = (type: string) => {
    const icons = {
      instance: Server,
      training: Brain,
      inference: Zap,
      storage: Database,
      gpu: Cpu,
      snapshot: Camera,
    };
    const Icon = icons[type as keyof typeof icons] || Server;
    return <Icon className="w-4 h-4" />;
  };

  const getOrderTypeLabel = (type: string) => {
    const labels = {
      instance: '容器实例',
      training: '训练任务',
      inference: '推理服务',
      storage: '存储服务',
      gpu: 'GPU算力包',
      snapshot: '快照备份',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getOrderTypeColor = (type: string) => {
    const colors = {
      instance: 'bg-blue-50 text-blue-700 border-blue-200',
      training: 'bg-purple-50 text-purple-700 border-purple-200',
      inference: 'bg-green-50 text-green-700 border-green-200',
      storage: 'bg-orange-50 text-orange-700 border-orange-200',
      gpu: 'bg-pink-50 text-pink-700 border-pink-200',
      snapshot: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[type as keyof typeof colors] || '';
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      running: {
        label: '运行中',
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: PlayCircle,
      },
      completed: {
        label: '已完成',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: CheckCircle,
      },
      cancelled: {
        label: '已取消',
        color: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: XCircle,
      },
      pending: {
        label: '待启动',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Clock,
      },
      failed: {
        label: '失败',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: AlertCircle,
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      paid: {
        label: '已支付',
        color: 'bg-green-50 text-green-700 border-green-200',
      },
      unpaid: {
        label: '未支付',
        color: 'bg-red-50 text-red-700 border-red-200',
      },
      partial: {
        label: '部分支付',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      overdue: {
        label: '已逾期',
        color: 'bg-red-50 text-red-700 border-red-200',
      },
    };
    return configs[status as keyof typeof configs] || configs.unpaid;
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

  const formatDuration = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    const minutes = Math.floor((hours % 1) * 60);

    if (days > 0) {
      return `${days}天${remainingHours}小时`;
    } else if (remainingHours > 0) {
      return `${remainingHours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  // 分页
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-900 mb-2">订单管理</h1>
            <p className="text-slate-600">查看和管理所有计费订单</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出订单
            </Button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">订单总数</p>
              <p className="text-2xl font-semibold text-slate-900">{statistics.totalOrders}</p>
              <p className="text-xs text-slate-500 mt-2">
                运行中: {statistics.runningOrders} | 已完成: {statistics.completedOrders}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">总费用</p>
              <p className="text-2xl font-semibold text-blue-600">
                {formatCurrency(statistics.totalCost)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">已支付</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(statistics.totalPaid)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">待支付</p>
              <p className="text-2xl font-semibold text-orange-600">
                {formatCurrency(statistics.totalUnpaid)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 订单类型统计 */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statistics.ordersByType.map((item, index) => {
            const Icon = getOrderTypeIcon(item.type);
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${getOrderTypeColor(
                        item.type
                      )}`}
                    >
                      {Icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 truncate">
                        {getOrderTypeLabel(item.type)}
                      </p>
                      <p className="font-semibold">{item.count}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{formatCurrency(item.cost)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 筛选栏 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜索 */}
            <div>
              <Label className="mb-2">搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="订单号、名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* 订单类型 */}
            <div>
              <Label className="mb-2">订单类型</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="instance">容器实例</SelectItem>
                  <SelectItem value="training">训练任务</SelectItem>
                  <SelectItem value="inference">推理服务</SelectItem>
                  <SelectItem value="storage">存储服务</SelectItem>
                  <SelectItem value="gpu">GPU算力包</SelectItem>
                  <SelectItem value="snapshot">快照备份</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 订单状态 */}
            <div>
              <Label className="mb-2">订单状态</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="running">运行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                  <SelectItem value="pending">待启动</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 支付状态 */}
            <div>
              <Label className="mb-2">支付状态</Label>
              <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="paid">已支付</SelectItem>
                  <SelectItem value="unpaid">未支付</SelectItem>
                  <SelectItem value="partial">部分支付</SelectItem>
                  <SelectItem value="overdue">已逾期</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t text-sm">
            <div>
              <span className="text-slate-600">共 </span>
              <span className="font-semibold text-purple-600">{orders.length}</span>
              <span className="text-slate-600"> 个订单</span>
            </div>
            <div>
              <span className="text-slate-600">总费用: </span>
              <span className="font-semibold text-purple-600">
                {formatCurrency(orders.reduce((sum, o) => sum + o.totalCost, 0))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订单列表 */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">加载中...</p>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">未找到订单</p>
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
                      <TableHead className="w-32">订单号</TableHead>
                      <TableHead>订单类型</TableHead>
                      <TableHead>订单名称</TableHead>
                      <TableHead>资源规格</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">运行时长</TableHead>
                      <TableHead className="text-right">费用</TableHead>
                      <TableHead className="w-24">状态</TableHead>
                      <TableHead className="w-24">支付</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.orderNo}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getOrderTypeColor(order.orderType)}
                            >
                              <span className="mr-1">
                                {getOrderTypeIcon(order.orderType)}
                              </span>
                              {getOrderTypeLabel(order.orderType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.orderName}</p>
                              <p className="text-xs text-slate-500">{order.resourceName}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.specs.gpu && (
                              <div>
                                {order.specs.gpu.count}×{order.specs.gpu.type}
                              </div>
                            )}
                            {order.specs.cpu && order.specs.memory && (
                              <div className="text-xs text-slate-500">
                                {order.specs.cpu}核 {order.specs.memory}GB
                              </div>
                            )}
                            {order.specs.storage && (
                              <div>
                                {order.specs.storage.size}GB {order.specs.storage.type}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {formatDuration(order.duration)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(order.totalCost)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={paymentConfig.color}>
                              {paymentConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
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
                {Math.min(currentPage * itemsPerPage, orders.length)} 条，
                共 {orders.length} 条
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

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </div>
  );
}
