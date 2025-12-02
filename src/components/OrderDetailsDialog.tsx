import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Separator } from './ui/separator';
import {
  ShoppingCart,
  Server,
  Brain,
  Zap,
  Database,
  Cpu,
  Camera,
  User,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Tag,
  CheckCircle,
  PlayCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Order } from '../services/orderService';
import PaymentDialog from './PaymentDialog';
import { useState } from 'react';

interface OrderDetailsDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

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
    return Icon;
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

  const getBillingTypeLabel = (type: string) => {
    const labels = {
      hourly: '按小时计费',
      daily: '按天计费',
      monthly: '按月计费',
      package: '套餐包',
    };
    return labels[type as keyof typeof labels] || type;
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
      second: '2-digit',
    });
  };

  const formatDuration = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    const minutes = Math.floor((hours % 1) * 60);

    if (days > 0) {
      return `${days}天 ${remainingHours}小时 ${minutes}分钟`;
    } else if (remainingHours > 0) {
      return `${remainingHours}小时 ${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
  const OrderTypeIcon = getOrderTypeIcon(order.orderType);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            订单详情
          </DialogTitle>
          <DialogDescription>订单号: {order.orderNo}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 订单基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <OrderTypeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-slate-900 mb-1">
                      {order.orderName}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getOrderTypeColor(order.orderType)}>
                        {getOrderTypeLabel(order.orderType)}
                      </Badge>
                      <Badge variant="outline" className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <Badge variant="outline" className={paymentConfig.color}>
                        {paymentConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{order.resourceName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-purple-600">
                    {formatCurrency(order.totalCost)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {getBillingTypeLabel(order.billingType)}
                  </p>
                </div>
              </div>
            </div>

            {/* 时间信息 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium">时间信息</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">创建时间:</span>
                  <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">开始时间:</span>
                  <span className="font-medium">{formatDateTime(order.startTime)}</span>
                </div>
                {order.endTime && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">结束时间:</span>
                    <span className="font-medium">{formatDateTime(order.endTime)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-slate-600">运行时长:</span>
                  <span className="font-medium text-purple-600">
                    {formatDuration(order.duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* 用户信息 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium">用户信息</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">用户ID:</span>
                  <span className="font-medium font-mono">{order.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">用户名:</span>
                  <span className="font-medium">{order.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">资源ID:</span>
                  <span className="font-medium font-mono text-xs">{order.resourceId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 资源规格 */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-purple-600" />
              <h3 className="font-medium">资源规格</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {order.specs.cpu && (
                <div className="flex justify-between">
                  <span className="text-slate-600">CPU:</span>
                  <span className="font-medium">{order.specs.cpu} 核</span>
                </div>
              )}
              {order.specs.memory && (
                <div className="flex justify-between">
                  <span className="text-slate-600">内存:</span>
                  <span className="font-medium">{order.specs.memory} GB</span>
                </div>
              )}
              {order.specs.gpu && (
                <>
                  <div className="flex justify-between col-span-2">
                    <span className="text-slate-600">GPU:</span>
                    <span className="font-medium">
                      {order.specs.gpu.count} × {order.specs.gpu.type}
                    </span>
                  </div>
                </>
              )}
              {order.specs.storage && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">存储类型:</span>
                    <span className="font-medium">{order.specs.storage.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">存储大小:</span>
                    <span className="font-medium">{order.specs.storage.size} GB</span>
                  </div>
                </>
              )}
              {order.specs.bandwidth && (
                <div className="flex justify-between">
                  <span className="text-slate-600">带宽:</span>
                  <span className="font-medium">{order.specs.bandwidth} Mbps</span>
                </div>
              )}
            </div>
          </div>

          {/* 费用明细 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-slate-50 border-b">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium">费用明细</h3>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>计费项</TableHead>
                  <TableHead className="text-right">用量</TableHead>
                  <TableHead className="text-right">单价</TableHead>
                  <TableHead className="text-right">小计</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.breakdown.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.item}</p>
                        {item.description && (
                          <p className="text-xs text-slate-500">{item.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity.toFixed(2)} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 bg-slate-50 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">
                    已支付: {formatCurrency(order.paidAmount)}
                  </p>
                  {order.unpaidAmount > 0 && (
                    <p className="text-sm text-red-600">
                      待支付: {formatCurrency(order.unpaidAmount)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-1">订单总额</p>
                  <p className="text-2xl font-semibold text-purple-600">
                    {formatCurrency(order.totalCost)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 标签和描述 */}
          {(order.tags || order.description) && (
            <div className="p-4 border rounded-lg">
              {order.tags && order.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium text-sm">标签</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {order.description && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium text-sm">描述</h3>
                  </div>
                  <p className="text-sm text-slate-600">{order.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          {order.paymentStatus === 'unpaid' && (
            <Button onClick={() => setPaymentDialogOpen(true)}>立即支付</Button>
          )}
        </div>
      </DialogContent>
      
      {/* 支付对话框 */}
      <PaymentDialog
        order={order}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onPaymentSuccess={() => {
          // 支付成功后刷新订单数据
          onOpenChange(false);
        }}
      />
    </Dialog>
  );
}