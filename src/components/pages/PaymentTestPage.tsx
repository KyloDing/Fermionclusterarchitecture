import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  CreditCard,
  Rocket,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Ticket,
} from 'lucide-react';
import PaymentDialog from '../PaymentDialog';
import { Order } from '../../services/orderService';

/**
 * 支付对话框测试页面
 * 用于演示和测试支付功能的所有场景
 */
export default function PaymentTestPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // 测试订单数据
  const testOrders: Order[] = [
    {
      id: 'order-test-001',
      orderNo: 'ORD202412060001',
      orderName: '中等金额订单',
      resourceName: 'GPU训练任务 - NVIDIA A100 40GB × 2',
      orderType: 'training',
      resourceType: 'gpu',
      totalCost: 1280.0,
      paidAmount: 0,
      unpaidAmount: 1280.0,
      paymentStatus: 'unpaid',
      status: 'pending',
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'order-test-002',
      orderNo: 'ORD202412060002',
      orderName: '小金额订单',
      resourceName: '模型推理服务 - ChatGLM-6B',
      orderType: 'inference',
      resourceType: 'inference',
      totalCost: 320.0,
      paidAmount: 0,
      unpaidAmount: 320.0,
      paymentStatus: 'unpaid',
      status: 'pending',
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'order-test-003',
      orderNo: 'ORD202412060003',
      orderName: '大金额订单',
      resourceName: 'GPU集群训练 - NVIDIA A100 40GB × 8',
      orderType: 'training',
      resourceType: 'gpu',
      totalCost: 8520.0,
      paidAmount: 0,
      unpaidAmount: 8520.0,
      paymentStatus: 'unpaid',
      status: 'pending',
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'order-test-004',
      orderNo: 'ORD202412060004',
      orderName: '超小金额订单',
      resourceName: 'CPU实例 - 4核8GB',
      orderType: 'instance',
      resourceType: 'instance',
      totalCost: 50.0,
      paidAmount: 0,
      unpaidAmount: 50.0,
      paymentStatus: 'unpaid',
      status: 'pending',
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const handleOpenPayment = (order: Order) => {
    setSelectedOrder(order);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-slate-900">支付对话框测试</h1>
            <p className="text-slate-600">演示支付功能的各种场景和优化特性</p>
          </div>
        </div>
      </div>

      {/* 功能说明 */}
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <AlertCircle className="w-4 h-4 text-blue-600" />
        <AlertDescription>
          <strong className="text-blue-900">P0级优化功能演示</strong>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>✅ 一键全额抵扣 + 一键重新智能推荐</li>
            <li>✅ 余额 + 算力券自动混合支付</li>
            <li>✅ 券快到期自动置顶 + 橙色高亮 + 弹窗提醒</li>
            <li>✅ 实时费用预估 + 可用算力券抵扣展示</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* 测试场景卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              推荐测试场景
            </CardTitle>
            <CardDescription>
              这些场景能充分展示所有优化功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-900">场景1: 完全抵扣</p>
                <Badge className="bg-green-100 text-green-700">推荐</Badge>
              </div>
              <p className="text-xs text-green-700 mb-2">
                券余额充足，可实现完全抵扣（实付¥0）
              </p>
              <p className="text-xs text-slate-600">
                使用"中等金额订单"或"小金额订单"测试
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">场景2: 部分抵扣</p>
                <Badge className="bg-blue-100 text-blue-700">推荐</Badge>
              </div>
              <p className="text-xs text-blue-700 mb-2">
                券+余额不足，需要第三方支付补充
              </p>
              <p className="text-xs text-slate-600">
                使用"大金额订单"测试
              </p>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-orange-900">场景3: 券到期提醒</p>
                <Badge className="bg-orange-100 text-orange-700">推荐</Badge>
              </div>
              <p className="text-xs text-orange-700 mb-2">
                查看即将到期券的橙色高亮和置顶效果
              </p>
              <p className="text-xs text-slate-600">
                任意订单均可看到（模拟数据包含即将到期券）
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-600" />
              功能测试要点
            </CardTitle>
            <CardDescription>
              打开支付对话框后，请注意测试这些功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">1. 智能推荐</p>
              <p className="text-xs text-slate-600">
                • 对话框打开时自动选中最优券组合<br />
                • 查看"智能推荐已抵扣"提示信息
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">2. 一键操作</p>
              <p className="text-xs text-slate-600">
                • 点击"一键全额抵扣"尝试覆盖订单金额<br />
                • 点击"一键重新推荐"清空并重新计算
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">3. 券高亮</p>
              <p className="text-xs text-slate-600">
                • 7天内到期：橙色背景高亮<br />
                • 3天内到期：红色背景 + 闪烁动画
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">4. 混合支付</p>
              <p className="text-xs text-slate-600">
                • 查看"智能混合支付"卡片<br />
                • 查看券、余额、第三方的抵扣明细
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 测试订单列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            测试订单
          </CardTitle>
          <CardDescription>
            点击"立即支付"按钮打开支付对话框
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-900">{order.orderName}</p>
                    <Badge variant="outline" className="text-xs">
                      {order.orderNo}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{order.resourceName}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>订单类型: {order.orderType}</span>
                    <span>•</span>
                    <span>创建时间: {new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-600 mb-1">待支付金额</p>
                    <p className="text-2xl font-semibold text-purple-600">
                      {formatCurrency(order.unpaidAmount)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleOpenPayment(order)}
                    className="min-w-[120px]"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    立即支付
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 支付对话框 */}
      {selectedOrder && (
        <PaymentDialog
          order={selectedOrder}
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* 底部说明 */}
      <Alert className="mt-6">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          <strong>提示：</strong>这是测试页面，订单数据为模拟数据。实际支付不会扣费。
          算力券数据来自 voucherService 的模拟数据，包含即将到期券以演示高亮功能。
        </AlertDescription>
      </Alert>
    </div>
  );
}
