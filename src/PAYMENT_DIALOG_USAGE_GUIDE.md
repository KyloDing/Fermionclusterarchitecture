# 支付对话框使用指南

## 📋 支付对话框触发流程

支付对话框（PaymentDialog）在费米集群系统中有多个触发入口，以下是完整的触发流程说明。

---

## 🔄 触发流程图

```
用户操作
    │
    ├─→ 订单列表页 (OrdersPage)
    │       │
    │       ├─ 点击订单行 / "查看详情"按钮
    │       │
    │       ↓
    │   订单详情对话框 (OrderDetailsDialog)
    │       │
    │       ├─ 显示订单信息
    │       ├─ 判断订单状态 (paymentStatus === 'unpaid')
    │       │
    │       └─→ 点击"立即支付"按钮
    │               │
    │               ↓
    │           支付对话框 (PaymentDialog)
    │               │
    │               ├─ 自动加载可用券
    │               ├─ 智能推荐券组合
    │               ├─ 计算混合支付方案
    │               └─ 确认支付
    │
    ├─→ 费用中心页 (BillingPage)
    │       │
    │       ├─ 显示"未支付账单"卡片
    │       │
    │       └─→ 点击"立即支付"按钮
    │               │
    │               └─→ [需要补充：跳转到订单列表]
    │
    └─→ 其他入口（待扩展）
            │
            └─→ 资源创建对话框完成后
                    │
                    └─→ 直接打开支付对话框
```

---

## 💡 主要触发入口

### 入口1：订单列表页 → 订单详情 → 支付对话框

这是**当前系统的主要支付流程**。

#### 步骤说明

**1. 访问订单列表页**
```
路径：费用中心 → 订单管理
组件：/components/pages/OrdersPage.tsx
```

**2. 查看订单详情**
```typescript
// OrdersPage.tsx 中的相关代码

const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

// 点击订单行时触发
const handleViewDetails = (order: Order) => {
  setSelectedOrder(order);
  setDetailsDialogOpen(true);
};

// 渲染订单详情对话框
<OrderDetailsDialog
  order={selectedOrder}
  open={detailsDialogOpen}
  onOpenChange={setDetailsDialogOpen}
/>
```

**3. 订单详情中触发支付**
```typescript
// OrderDetailsDialog.tsx 中的相关代码

const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

// 只有未支付订单显示"立即支付"按钮
{order.paymentStatus === 'unpaid' && (
  <Button onClick={() => setPaymentDialogOpen(true)}>
    立即支付
  </Button>
)}

// 渲染支付对话框
<PaymentDialog
  order={order}
  open={paymentDialogOpen}
  onOpenChange={setPaymentDialogOpen}
  onPaymentSuccess={() => {
    // 支付成功后刷新订单数据
    setPaymentDialogOpen(false);
    setDetailsDialogOpen(false);
    // 刷新订单列表...
  }}
/>
```

#### 实际操作步骤

1. 打开系统，导航到**费用中心** → **订单管理**
2. 在订单列表中找到未支付订单（状态显示为"待支付"）
3. 点击订单行或"查看详情"按钮
4. 在订单详情对话框中，点击**"立即支付"**按钮
5. 支付对话框自动弹出，显示：
   - 订单金额
   - 可用算力券（自动智能推荐）
   - 混合支付方案（券+余额）
   - 一键操作按钮

---

### 入口2：费用中心首页（建议增强）

**当前状态**：
```typescript
// BillingPage.tsx 中有"立即支付"链接，但未完全实现

{summary.unpaidAmount > 0 && (
  <Button variant="link" className="p-0 h-auto text-xs text-red-600 mt-2">
    立即支付 →  {/* ⚠️ 当前只是一个链接，未绑定事件 */}
  </Button>
)}
```

**建议改进**：
```typescript
// 添加导航到订单列表的功能

{summary.unpaidAmount > 0 && (
  <Button 
    variant="link" 
    className="p-0 h-auto text-xs text-red-600 mt-2"
    onClick={onNavigateToOrders}  // ✅ 跳转到订单列表
  >
    立即支付 →
  </Button>
)}
```

或者**直接打开支付对话框**：
```typescript
// 1. 添加状态
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

// 2. 点击"立即支付"时
const handleQuickPay = async () => {
  // 获取第一个未支付订单
  const unpaidOrders = await getUnpaidOrders();
  if (unpaidOrders.length > 0) {
    setSelectedOrder(unpaidOrders[0]);
    setPaymentDialogOpen(true);
  } else {
    toast.info('暂无待支付订单');
  }
};

// 3. 渲染支付对话框
{selectedOrder && (
  <PaymentDialog
    order={selectedOrder}
    open={paymentDialogOpen}
    onOpenChange={setPaymentDialogOpen}
    onPaymentSuccess={() => {
      loadData(); // 刷新数据
    }}
  />
)}
```

---

### 入口3：资源创建完成后（建议实现）

**使用场景**：
用户创建GPU实例、训练任务等资源后，立即弹出支付对话框。

**实现示例**：
```typescript
// CreateInstanceDialog.tsx 或其他资源创建对话框

const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

const handleCreateResource = async () => {
  try {
    // 创建资源并生成订单
    const order = await createInstance(instanceConfig);
    
    // 提示创建成功
    toast.success('资源创建成功！');
    
    // 关闭创建对话框
    setCreateDialogOpen(false);
    
    // 自动打开支付对话框
    setCreatedOrder(order);
    setPaymentDialogOpen(true);
    
  } catch (error) {
    toast.error('创建失败');
  }
};

// 渲染支付对话框
{createdOrder && (
  <PaymentDialog
    order={createdOrder}
    open={paymentDialogOpen}
    onOpenChange={setPaymentDialogOpen}
    onPaymentSuccess={() => {
      // 支付成功后跳转到资源列表
      navigate('/resources');
    }}
  />
)}
```

---

## 🎯 最佳实践：快速测试支付流程

### 方法1：从订单列表测试（推荐）

1. 打开应用：`http://localhost:5173`
2. 导航到：**费用中心** → **订单管理**
3. 筛选未支付订单：
   ```
   支付状态：[待支付]
   ```
4. 点击任意未支付订单行
5. 在订单详情对话框中，点击**"立即支付"**
6. 查看支付对话框的所有功能：
   - ✅ 智能推荐券
   - ✅ 一键全额抵扣
   - ✅ 一键重新推荐
   - ✅ 混合支付方案
   - ✅ 券到期提醒

### 方法2：创建测试订单

如果没有未支付订单，可以创建一个：

```typescript
// 在浏览器控制台执行（仅用于测试）

const testOrder = {
  id: 'order-test-001',
  orderNo: 'ORD202412060001',
  orderName: '测试订单',
  resourceName: 'GPU训练任务',
  orderType: 'training',
  totalCost: 1280.00,
  unpaidAmount: 1280.00,
  paymentStatus: 'unpaid',
  // ... 其他必要字段
};

// 然后在OrdersPage中临时添加此订单到列表
```

### 方法3：使用现有组件状态

如果你能看到代码，可以直接在组件中设置初始状态：

```typescript
// OrderDetailsDialog.tsx 临时修改（测试后记得还原）

const [paymentDialogOpen, setPaymentDialogOpen] = useState(true); // 改为true
```

---

## 📦 支付对话框组件接口

### Props定义

```typescript
interface PaymentDialogProps {
  order: Order;                          // 必需：订单对象
  open: boolean;                         // 必需：对话框打开状态
  onOpenChange: (open: boolean) => void; // 必需：状态变化回调
  onPaymentSuccess?: () => void;         // 可选：支付成功回调
}
```

### Order对象结构

```typescript
interface Order {
  id: string;                  // 订单ID
  orderNo: string;             // 订单号
  orderName: string;           // 订单名称
  resourceName: string;        // 资源名称
  orderType: string;           // 订单类型 (training/inference/instance等)
  totalCost: number;           // 总费用
  unpaidAmount: number;        // 未支付金额
  paymentStatus: string;       // 支付状态 (unpaid/paid/partial)
  // ... 其他字段
}
```

### 使用示例

```typescript
import { useState } from 'react';
import PaymentDialog from './components/PaymentDialog';

function MyComponent() {
  const [order, setOrder] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpenPayment = (selectedOrder: Order) => {
    setOrder(selectedOrder);
    setOpen(true);
  };

  const handlePaymentSuccess = () => {
    // 支付成功后的逻辑
    setOpen(false);
    refreshOrders();
    toast.success('支付成功！');
  };

  return (
    <>
      <Button onClick={() => handleOpenPayment(someOrder)}>
        支付订单
      </Button>

      {order && (
        <PaymentDialog
          order={order}
          open={open}
          onOpenChange={setOpen}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
```

---

## 🔧 支付对话框内部流程

### 1. 打开对话框时
```
[对话框打开]
    ↓
[加载可用券] - getAvailableVouchers()
    ↓
[加载账户信息] - getAccountInfo()
    ↓
[智能排序券] - sortVouchersByPriority()
    │
    ├─ 7天内到期优先
    ├─ 30天内到期次优先
    └─ 按余额从小到大
    ↓
[自动智能推荐] - autoSelectVouchers()
    ↓
[计算混合支付] - calculateMixedPayment()
    │
    ├─ 券抵扣
    ├─ 余额抵扣
    └─ 第三方支付
    ↓
[显示支付方案]
```

### 2. 用户交互
```
[用户操作]
    │
    ├─→ [一键全额抵扣]
    │       └─→ 尽可能覆盖订单金额
    │
    ├─→ [一键重新推荐]
    │       └─→ 清空并重新计算
    │
    ├─→ [手动选择/取消券]
    │       └─→ 实时重新计算
    │
    └─→ [确认支付]
            │
            ├─ 完全抵扣 → 直接完成
            └─ 部分抵扣 → 跳转第三方支付
```

### 3. 支付完成
```
[支付成功]
    ↓
[显示成功提示]
    ↓
[触发onPaymentSuccess回调]
    ↓
[关闭支付对话框]
    ↓
[刷新订单状态]
```

---

## 🚀 建议的增强入口

### 1. 费用中心快捷支付
在BillingPage添加"批量支付"按钮：
```typescript
<Button onClick={handleBatchPayment}>
  批量支付未付订单
</Button>
```

### 2. 消息通知支付
当有欠费订单时，顶部通知栏显示：
```typescript
<Alert>
  您有 3 笔未支付订单，总计 ¥3,840.00
  <Button size="sm" onClick={handleQuickPay}>
    立即支付
  </Button>
</Alert>
```

### 3. 资源详情页支付
在运行中的资源卡片上显示：
```typescript
{resource.unpaidAmount > 0 && (
  <Button variant="outline" onClick={() => payResource(resource.orderId)}>
    支付欠费 ¥{resource.unpaidAmount}
  </Button>
)}
```

### 4. 移动端快捷入口
在移动端底部导航栏添加"待支付"徽章：
```typescript
<BottomNavItem icon={Wallet} badge={unpaidCount}>
  费用
</BottomNavItem>
```

---

## ✅ 检查清单

在集成支付对话框时，确保：

- [ ] 已准备好完整的Order对象
- [ ] Order.paymentStatus === 'unpaid'
- [ ] Order.unpaidAmount > 0
- [ ] 已定义open状态和onOpenChange回调
- [ ] 已处理onPaymentSuccess回调（刷新数据）
- [ ] 测试了完全抵扣和部分抵扣场景
- [ ] 测试了无可用券的场景
- [ ] 验证了支付成功后的页面跳转

---

## 📞 常见问题

### Q1: 为什么点击"立即支付"没有反应？

**可能原因**：
1. 订单状态不是'unpaid'
2. 未正确传递order对象
3. open状态未正确管理

**解决方法**：
```typescript
// 检查订单状态
console.log('Order status:', order.paymentStatus);

// 检查对话框状态
console.log('Dialog open:', paymentDialogOpen);

// 确保正确触发
<Button onClick={() => {
  console.log('Payment button clicked');
  setPaymentDialogOpen(true);
}}>
  立即支付
</Button>
```

### Q2: 如何在其他页面打开支付对话框？

**方法1：使用路由参数**
```typescript
// 跳转时携带订单ID
navigate('/billing/orders?payOrderId=order-001');

// 在订单页检测参数并自动打开
const searchParams = new URLSearchParams(location.search);
const payOrderId = searchParams.get('payOrderId');

if (payOrderId) {
  const order = orders.find(o => o.id === payOrderId);
  if (order) {
    handleOpenPayment(order);
  }
}
```

**方法2：使用全局状态（Zustand/Redux）**
```typescript
// 在任何地方触发
paymentStore.openPayment(order);

// PaymentDialog监听状态
const { isOpen, order } = usePaymentStore();
```

### Q3: 如何测试没有可用券的情况？

在voucherService中临时修改：
```typescript
export async function getAvailableVouchers(orderType: string): Promise<Voucher[]> {
  return Promise.resolve([]); // 返回空数组
}
```

---

## 📚 相关文件

- `/components/PaymentDialog.tsx` - 支付对话框主组件
- `/components/OrderDetailsDialog.tsx` - 订单详情对话框
- `/components/pages/OrdersPage.tsx` - 订单列表页
- `/components/pages/BillingPage.tsx` - 费用中心首页
- `/services/voucherService.ts` - 算力券服务
- `/services/billingService.ts` - 计费服务
- `/services/orderService.ts` - 订单服务

---

**文档版本**: v1.0.0  
**更新日期**: 2024-12-06  
**维护团队**: 费米集群开发团队
