import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  FileText,
  Download,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { getInvoices, Invoice } from '../../services/billingService';
import { toast } from 'sonner@2.0.3';
import ApplyInvoiceDialog from '../ApplyInvoiceDialog';

export default function InvoiceManagementPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      toast.error('加载发票列表失败');
    } finally {
      setLoading(false);
    }
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

  const getInvoiceTypeLabel = (type: string) => {
    const labels = {
      'vat-normal': '增值税普通发票',
      'vat-special': '增值税专用发票',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        label: '待审核',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Clock,
      },
      processing: {
        label: '开票中',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: RefreshCw,
      },
      issued: {
        label: '已开具',
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle,
      },
      rejected: {
        label: '已拒绝',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const handleDownload = (invoice: Invoice) => {
    if (!invoice.downloadUrl) {
      toast.error('发票文件不可用');
      return;
    }
    toast.success('发票下载中...');
    // 实际应该触发文件下载
  };

  // 统计
  const stats = {
    total: invoices.length,
    issued: invoices.filter((inv) => inv.status === 'issued').length,
    processing: invoices.filter((inv) => inv.status === 'processing' || inv.status === 'pending').length,
    totalAmount: invoices
      .filter((inv) => inv.status === 'issued')
      .reduce((sum, inv) => sum + inv.totalAmount, 0),
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-900 mb-2">发票管理</h1>
            <p className="text-slate-600">申请、查看和下载您的发票</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadInvoices} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button onClick={() => setApplyDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              申请发票
            </Button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">发票总数</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">已开具</p>
            <p className="text-2xl font-semibold text-green-600">{stats.issued}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">处理中</p>
            <p className="text-2xl font-semibold text-blue-600">{stats.processing}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">已开票金额</p>
            <p className="text-xl font-semibold text-orange-600">
              {formatCurrency(stats.totalAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 发票列表 */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">加载中...</p>
          </CardContent>
        </Card>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">暂无发票记录</p>
            <Button onClick={() => setApplyDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              申请发票
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>发票列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">发票号码</TableHead>
                    <TableHead>发票类型</TableHead>
                    <TableHead>发票抬头</TableHead>
                    <TableHead>计费周期</TableHead>
                    <TableHead className="text-right">金额</TableHead>
                    <TableHead className="text-right">税额</TableHead>
                    <TableHead className="text-right">价税合计</TableHead>
                    <TableHead>申请时间</TableHead>
                    <TableHead>开具时间</TableHead>
                    <TableHead className="w-24">状态</TableHead>
                    <TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const statusConfig = getStatusConfig(invoice.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">
                          {invoice.invoiceNo || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getInvoiceTypeLabel(invoice.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.title}</p>
                            <p className="text-xs text-slate-500">{invoice.taxNo}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{invoice.billingPeriod}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(invoice.taxAmount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(invoice.totalAmount)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDateTime(invoice.appliedAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {invoice.issuedAt ? formatDateTime(invoice.issuedAt) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.status === 'issued' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(invoice)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 发票说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>发票申请说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                增值税普通发票
              </h3>
              <ul className="text-sm space-y-2 text-slate-600">
                <li>• 适用于个人和企业</li>
                <li>• 可用于报销</li>
                <li>• 申请后1-3个工作日开具</li>
                <li>• 提供电子发票</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                增值税专用发票
              </h3>
              <ul className="text-sm space-y-2 text-slate-600">
                <li>• 适用于一般纳税人企业</li>
                <li>• 可用于抵扣增值税</li>
                <li>• 申请后3-5个工作日开具</li>
                <li>• 需提供完整开票资料</li>
                <li>• 邮寄纸质发票（运费到付）</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">重要提示：</p>
                <ul className="space-y-1">
                  <li>• 发票金额不能超过当月实际消费金额</li>
                  <li>• 每月最多可申请一次发票</li>
                  <li>• 发票一经开具，不支持退换</li>
                  <li>• 如需帮助，请联系客服：invoice@fermicluster.com</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ApplyInvoiceDialog
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        onSuccess={loadInvoices}
      />
    </div>
  );
}
