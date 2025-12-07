# 费米集群计费与算力券优化 - 完整设计文档

## 📋 文档概述

本文档基于原有计费系统设计（资源计量、定价引擎、账单生成、账户管理、订单管理、发票管理、政府算力券），整合20+条优化点，形成完整的功能增强方案。

**优化目标**：
- 🎯 提升用户体验：一键操作、智能推荐、实时反馈
- 💡 优化支付流程：混合支付、批量处理、自动抵扣
- 🏢 支持企业场景：默认方案、OA对接、权限管理
- 📊 增强可见性：节省展示、预警提醒、使用看板

---

## 📊 优化点优先级总览

### P0 级别（5星，立即实施）
1. 一键全额抵扣 + 一键重新智能推荐
2. 订单创建页直接展示预估费用 + 可用算力券抵扣
3. 余额 + 算力券自动混合支付
4. 券快到期/余额不足 7天内自动置顶 + 橙色高亮 + 弹窗提醒

### P1 级别（4星，优先实施）
5. 支持单张券拆分使用
6. 支付页增加"保存为默认券选择方案"
7. 订单列表直接展示"已抵扣券金额"和"实付金额"
8. 支持批量支付
9. 手机端支付流程极简版
10. 欠费/余额不足时"一键充值刚好够当前订单的金额"

### P2 级别（3星，后续实施）
11. 企业管理员可设置"项目默认券"
12. 券使用记录支持导出 Excel
13. 费用中心首页增加"本月已省券金额"展示
14. 支持"券+余额+微信/支付宝"混搭
15. 订单支付成功后自动跳转回资源列表
16. 增加"券即将到期日历提醒"订阅

### P3 级别（2星，长期规划）
17. 费用预估器小程序/公众号版
18. 对接企业微信/钉钉审批流
19. 支持"券转赠"给同一组织子账号
20. 增加"券使用进度看板"大屏

---

## 🎯 P0级优化详细设计（立即实施）

### 优化1：一键全额抵扣 + 一键重新智能推荐

#### 功能文档

**需求描述**
- 在支付弹窗中，默认应用智能推荐的算力券组合，实现一键全额抵扣
- 支持"一键重新推荐"按钮，重新计算最优组合（优先快到期券）
- 系统自动选择最优券组合，用户可手动调整

**业务价值**
- ✅ 减少用户手动操作，降低决策成本
- ✅ 避免算力券浪费，提升使用率
- ✅ 提高支付转化率，优化用户体验

**业务规则**
```typescript
智能推荐规则（按优先级）：
1. 优先使用7天内到期的券
2. 其次使用30天内到期的券
3. 匹配订单类型（GPU/实例/存储）
4. 按券余额从小到大使用（避免大额券浪费）
5. 尽量覆盖订单金额，实现全额抵扣

边界条件：
- 券余额不足时，提示"部分抵扣，需支付 ¥X"
- 完全抵扣时显示"实付 ¥0"
- 无可用券时，显示"暂无可用算力券"
```

**依赖关系**
- 依赖：原有 `voucherService.calculateVoucherDeduction()` 逻辑
- 依赖：原有 `PaymentDialog.tsx` 组件
- 影响：支付流程、用户体验

#### 交互设计

**UI/UX流程**

```
┌────────────────────────────────────────────────────────┐
│  支付对话框（PaymentDialog）                           │
├────────────────────────────────────────────────────────┤
│                                                         │
│  订单金额：¥1,280.00                                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 🎯 智能推荐已抵扣 ¥1,000.00                      │  │
│  │                                                   │  │
│  │ [🔄 一键重新推荐]  [✨ 一键全额抵扣]             │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  已选算力券（2张）：                                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │ ✓ GOV-2024-AI-001 (剩余 ¥65,000)                │  │
│  │   使用金额：¥500.00                              │  │
│  │   📅 7天后到期                                   │  │
│  │                                                   │  │
│  │ ✓ GOV-2024-EDU-023 (剩余 ¥2,000)                │  │
│  │   使用金额：¥500.00                              │  │
│  │   📅 15天后到期                                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  可用算力券（3张）：                                    │
│  │ ☐ GOV-2024-TECH-001 (剩余 ¥30,000)              │  │
│  │                                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  抵扣明细：                                             │
│  算力券抵扣：-¥1,000.00                                │
│  ───────────────────────────────                       │
│  实付金额：¥280.00                                      │
│                                                         │
│  [取消]                    [确认支付 ¥280.00]          │
│                                                         │
└────────────────────────────────────────────────────────┘
```

**交互状态机**

```
[初始状态] 
    ↓ 打开支付对话框
    ↓
[自动智能推荐]
    │ → 调用 voucherService.getRecommendedVouchers()
    │ → 自动勾选推荐券
    │ → 计算抵扣金额
    │ → 更新实付金额
    ↓
[显示推荐结果]
    │
    ├──→ [用户点击"一键全额抵扣"]
    │        ↓
    │    [尝试全额抵扣]
    │        │ → 如果券足够：实付 = ¥0
    │        │ → 如果券不足：显示提示"券不足，建议充值"
    │        ↓
    │    [更新显示]
    │
    ├──→ [用户点击"一键重新推荐"]
    │        ↓
    │    [清空当前选择]
    │        ↓
    │    [重新计算最优组合]
    │        ↓
    │    [更新显示]
    │
    └──→ [用户手动调整]
             ↓
         [实时计算抵扣]
             ↓
         [更新实付金额]
```

**伪代码实现**

```typescript
// PaymentDialog.tsx

const PaymentDialog = ({ orderId, orderAmount, onSuccess }) => {
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [deduction, setDeduction] = useState(0);
  const [finalAmount, setFinalAmount] = useState(orderAmount);
  const [loading, setLoading] = useState(false);

  // 初始加载：自动智能推荐
  useEffect(() => {
    loadAndRecommend();
  }, [orderAmount]);

  const loadAndRecommend = async () => {
    const vouchers = await voucherService.getAvailableVouchers(orderAmount);
    setAvailableVouchers(vouchers);
    
    // 自动智能推荐
    const recommended = voucherService.getRecommendedVouchers(
      vouchers,
      orderAmount
    );
    setSelectedVouchers(recommended);
    updateDeduction(recommended);
  };

  // 更新抵扣金额
  const updateDeduction = (vouchers: Voucher[]) => {
    const result = voucherService.calculateVoucherDeduction(
      vouchers,
      orderAmount
    );
    setDeduction(result.totalDeduction);
    setFinalAmount(orderAmount - result.totalDeduction);
  };

  // 一键全额抵扣
  const handleOneClickFullDeduct = async () => {
    setLoading(true);
    try {
      const result = await voucherService.calculateFullDeduction(
        availableVouchers,
        orderAmount
      );
      
      if (result.canFullDeduct) {
        setSelectedVouchers(result.vouchers);
        setDeduction(orderAmount);
        setFinalAmount(0);
        toast.success('已实现全额抵扣！');
      } else {
        setSelectedVouchers(result.vouchers);
        setDeduction(result.maxDeduction);
        setFinalAmount(orderAmount - result.maxDeduction);
        toast.warning(
          `券余额不足，最多可抵扣 ¥${result.maxDeduction.toFixed(2)}，` +
          `还需支付 ¥${(orderAmount - result.maxDeduction).toFixed(2)}`
        );
      }
    } catch (error) {
      toast.error('计算失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 一键重新推荐
  const handleReRecommend = async () => {
    setLoading(true);
    try {
      // 清空当前选择
      setSelectedVouchers([]);
      
      // 重新获取最新券列表（可能有新券或状态变化）
      const vouchers = await voucherService.getAvailableVouchers(orderAmount);
      setAvailableVouchers(vouchers);
      
      // 重新推荐
      const recommended = voucherService.getRecommendedVouchers(
        vouchers,
        orderAmount
      );
      
      setSelectedVouchers(recommended);
      updateDeduction(recommended);
      
      toast.success('已重新智能推荐');
    } catch (error) {
      toast.error('推荐失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 手动选择/取消券
  const handleToggleVoucher = (voucher: Voucher) => {
    const isSelected = selectedVouchers.find(v => v.id === voucher.id);
    let newSelected: Voucher[];
    
    if (isSelected) {
      newSelected = selectedVouchers.filter(v => v.id !== voucher.id);
    } else {
      newSelected = [...selectedVouchers, voucher];
    }
    
    setSelectedVouchers(newSelected);
    updateDeduction(newSelected);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>确认支付</DialogTitle>
        </DialogHeader>

        {/* 订单金额 */}
        <div className="mb-4">
          <p className="text-slate-600">订单金额</p>
          <p className="text-2xl text-slate-900">
            ¥{orderAmount.toFixed(2)}
          </p>
        </div>

        {/* 智能推荐提示 */}
        {selectedVouchers.length > 0 && (
          <Alert className="bg-purple-50 border-purple-200">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <AlertDescription>
              <strong className="text-purple-900">
                🎯 智能推荐已抵扣 ¥{deduction.toFixed(2)}
              </strong>
              <p className="text-sm text-slate-700 mt-1">
                已自动选择 {selectedVouchers.length} 张券，
                优先使用快到期的券避免浪费
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* 一键操作按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReRecommend}
            disabled={loading}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            一键重新推荐
          </Button>
          <Button
            onClick={handleOneClickFullDeduct}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            一键全额抵扣
          </Button>
        </div>

        {/* 已选算力券列表 */}
        {selectedVouchers.length > 0 && (
          <div className="space-y-2">
            <Label>已选算力券（{selectedVouchers.length}张）</Label>
            {selectedVouchers.map(voucher => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                selected
                onToggle={handleToggleVoucher}
              />
            ))}
          </div>
        )}

        {/* 可用算力券列表 */}
        <div className="space-y-2">
          <Label>
            可用算力券（{availableVouchers.length - selectedVouchers.length}张）
          </Label>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableVouchers
              .filter(v => !selectedVouchers.find(s => s.id === v.id))
              .map(voucher => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  selected={false}
                  onToggle={handleToggleVoucher}
                />
              ))}
          </div>
        </div>

        {/* 抵扣明细 */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">算力券抵扣</span>
            <span className="text-green-600">-¥{deduction.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>实付金额</span>
            <span className={finalAmount === 0 ? 'text-green-600' : 'text-slate-900'}>
              ¥{finalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleConfirmPay} disabled={loading}>
            确认支付 ¥{finalAmount.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### API改动

**修改现有接口**

```typescript
// GET /api/vouchers/my
// 新增返回字段

interface VoucherResponse {
  // ... 原有字段
  daysToExpire: number;        // 距离到期天数
  priority: number;            // 推荐优先级（越小越优先）
  isRecommended: boolean;      // 是否智能推荐
}

// POST /api/vouchers/calculateDeduction
// 新增参数

interface CalculateDeductionRequest {
  vouchers: string[];          // 券ID列表
  orderAmount: number;         // 订单金额
  autoFullDeduct?: boolean;    // 是否尝试全额抵扣（新增）
  orderType?: string;          // 订单类型（新增）
}

interface CalculateDeductionResponse {
  totalDeduction: number;      // 总抵扣金额
  remainingAmount: number;     // 剩余需支付金额
  canFullDeduct: boolean;      // 是否可以全额抵扣（新增）
  voucherUsage: Array<{        // 券使用明细
    voucherId: string;
    useAmount: number;
    remainingAfter: number;
  }>;
}
```

**新增接口**

```typescript
// POST /api/vouchers/getRecommended
// 获取智能推荐券组合

interface GetRecommendedRequest {
  orderAmount: number;         // 订单金额
  orderType?: string;          // 订单类型
  tryFullDeduct?: boolean;     // 是否尝试全额抵扣
}

interface GetRecommendedResponse {
  recommended: string[];       // 推荐的券ID列表
  totalDeduction: number;      // 预计抵扣金额
  canFullDeduct: boolean;      // 是否可全额抵扣
  reason: string;              // 推荐理由
}
```

**后端逻辑变化**

```typescript
// voucherService.ts

class VoucherService {
  /**
   * 智能推荐券组合
   */
  async getRecommendedVouchers(
    orderAmount: number,
    orderType?: string,
    tryFullDeduct: boolean = true
  ): Promise<RecommendedResult> {
    // 1. 获取所有可用券
    const vouchers = await this.getAvailableVouchers(orderType);
    
    // 2. 按优先级排序
    const sorted = this.sortByPriority(vouchers, orderAmount);
    
    // 3. 选择最优组合
    const selected: Voucher[] = [];
    let totalDeduction = 0;
    
    for (const voucher of sorted) {
      if (totalDeduction >= orderAmount && !tryFullDeduct) {
        break; // 已够支付，不需要更多券
      }
      
      const useAmount = Math.min(
        voucher.remainingAmount,
        orderAmount - totalDeduction
      );
      
      selected.push({
        ...voucher,
        useAmount
      });
      
      totalDeduction += useAmount;
      
      if (totalDeduction >= orderAmount && tryFullDeduct) {
        break; // 达到全额抵扣
      }
    }
    
    return {
      recommended: selected.map(v => v.id),
      vouchers: selected,
      totalDeduction,
      canFullDeduct: totalDeduction >= orderAmount,
      reason: this.generateReason(selected, totalDeduction, orderAmount)
    };
  }

  /**
   * 按优先级排序券
   * 规则：
   * 1. 7天内到期 > 30天内到期 > 其他
   * 2. 匹配订单类型优先
   * 3. 余额从小到大（避免浪费大额券）
   */
  private sortByPriority(
    vouchers: Voucher[],
    orderAmount: number
  ): Voucher[] {
    return vouchers.sort((a, b) => {
      // 计算到期天数
      const daysA = this.getDaysToExpire(a.endDate);
      const daysB = this.getDaysToExpire(b.endDate);
      
      // 7天内到期的最优先
      if (daysA <= 7 && daysB > 7) return -1;
      if (daysA > 7 && daysB <= 7) return 1;
      
      // 30天内到期的次优先
      if (daysA <= 30 && daysB > 30) return -1;
      if (daysA > 30 && daysB <= 30) return 1;
      
      // 同样到期范围内，按余额从小到大
      // 优先用完小额券，避免浪费大额券
      return a.remainingAmount - b.remainingAmount;
    });
  }

  /**
   * 计算全额抵扣方案
   */
  async calculateFullDeduction(
    vouchers: Voucher[],
    orderAmount: number
  ): Promise<FullDeductionResult> {
    const sorted = this.sortByPriority(vouchers, orderAmount);
    const selected: Voucher[] = [];
    let totalDeduction = 0;
    
    for (const voucher of sorted) {
      const useAmount = Math.min(
        voucher.remainingAmount,
        orderAmount - totalDeduction
      );
      
      selected.push({
        ...voucher,
        useAmount
      });
      
      totalDeduction += useAmount;
      
      if (totalDeduction >= orderAmount) {
        break; // 达到全额抵扣
      }
    }
    
    return {
      canFullDeduct: totalDeduction >= orderAmount,
      vouchers: selected,
      maxDeduction: totalDeduction,
      shortfall: totalDeduction < orderAmount 
        ? orderAmount - totalDeduction 
        : 0
    };
  }

  private getDaysToExpire(endDate: string): number {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private generateReason(
    vouchers: Voucher[],
    totalDeduction: number,
    orderAmount: number
  ): string {
    const expiringSoon = vouchers.filter(v => 
      this.getDaysToExpire(v.endDate) <= 7
    );
    
    if (expiringSoon.length > 0) {
      return `已优先使用 ${expiringSoon.length} 张即将到期的券，避免浪费`;
    }
    
    if (totalDeduction >= orderAmount) {
      return `已实现全额抵扣，实付 ¥0`;
    }
    
    return `已选择最优组合，共抵扣 ¥${totalDeduction.toFixed(2)}`;
  }
}
```

---

### 优化2：订单创建页直接展示预估费用 + 可用算力券抵扣

#### 功能文档

**需求描述**
- 在订单创建界面（OrderDetailsDialog.tsx）实时预估费用
- 显示可用算力券的最大抵扣金额
- 让用户在下单前就知道实际支出

**业务价值**
- ✅ 提升价格透明度，减少用户疑虑
- ✅ 降低订单放弃率，提高转化
- ✅ 结合原有定价服务，无缝集成

**业务规则**
```typescript
预估显示规则：
1. 实时计算：用户配置变化时立即更新
2. 显示三个金额：
   - 原价（定价规则计算）
   - 券可抵（智能推荐最大抵扣）
   - 预估实付（原价 - 券抵扣）
3. 券不适用时隐藏抵扣信息
4. 显示折扣信息（用户等级折扣等）

边界条件：
- 配置不完整时显示"请完善配置"
- 无可用券时显示"暂无可用券"
- 预估≠最终，提示"实际以支付时为准"
```

#### 交互设计

**UI/UX流程**

```
┌─────────────────────────────────────────────────────────┐
│  创建订单对话框（OrderDetailsDialog）                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  资源配置：                                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GPU类型：[NVIDIA A100 40GB ▼]                      │ │
│  │ GPU数量：[2 ▼]                                      │ │
│  │ CPU核心：[8核 ▼]                                    │ │
│  │ 内存：[32GB ▼]                                      │ │
│  │ 运行时长：[24小时 ▼]                                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  💰 费用预估（实时更新）                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                     │ │
│  │  原价：¥720.00                                      │ │
│  │    ├─ GPU (2卡×24h×¥15)      ¥720.00              │ │
│  │    ├─ CPU (8核×24h×¥0.50)    ¥96.00               │ │
│  │    └─ 内存 (32GB×24h×¥0.10)  ¥76.80               │ │
│  │                              ─────────              │ │
│  │  小计：¥892.80                                      │ │
│  │                                                     │ │
│  │  折扣：                                             │ │
│  │    └─ 黄金会员9折            -¥89.28              │ │
│  │                              ─────────              │ │
│  │  折后：¥803.52                                      │ │
│  │                                                     │ │
│  │  🎁 算力券可抵：¥500.00  [查看券详情 →]            │ │
│  │                              ─────────              │ │
│  │  预估实付：¥303.52                                  │ │
│  │                                                     │ │
│  │  💡 实际金额以支付时为准                           │ │
│  │                                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [取消]                           [确认创建订单]         │
│                                                          │
└─────────────────────────────────────────────────────────┘

点击"查看券详情"：
┌─────────────────────────────────────────────────────────┐
│  可用算力券预览                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  根据智能推荐，以下券可用于抵扣本订单：                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GOV-2024-AI-001                                    │ │
│  │ 剩余 ¥65,000  |  7天后到期                         │ │
│  │ 可抵扣：¥303.52（全额）                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GOV-2024-EDU-023                                   │ │
│  │ 剩余 ¥2,000  |  15天后到期                         │ │
│  │ 可抵扣：¥196.48（部分）                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  💡 支付时可选择券组合方式                              │
│                                                          │
│  [关闭]                                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**实时预估流程**

```
[用户打开创建对话框]
        ↓
[显示默认配置]
        ↓
[实时监听配置变化]
        │
        ├─→ GPU类型变化
        ├─→ GPU数量变化
        ├─→ CPU/内存变化
        ├─→ 时长变化
        │
        ↓
[触发预估计算] (防抖300ms)
        │
        ├─→ [调用定价服务]
        │      ├─ 计算原价
        │      ├─ 应用折扣
        │      └─ 返回折后价
        │
        └─→ [调用券服务]
               ├─ 获取可用券
               ├─ 计算最大抵扣
               └─ 返回可抵金额
        ↓
[更新显示]
        │
        ├─ 原价
        ├─ 折扣明细
        ├─ 券可抵
        └─ 预估实付
        ↓
[等待用户下一步操作]
```

**伪代码实现**

```typescript
// OrderDetailsDialog.tsx

const OrderDetailsDialog = ({ onSuccess }) => {
  const [config, setConfig] = useState<OrderConfig>({
    gpuType: 'A100',
    gpuCount: 2,
    cpuCores: 8,
    memory: 32,
    duration: 24
  });

  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVoucherDetail, setShowVoucherDetail] = useState(false);

  // 实时计算预估（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateEstimate();
    }, 300); // 300ms防抖

    return () => clearTimeout(timer);
  }, [config]);

  const calculateEstimate = async () => {
    if (!isConfigValid(config)) {
      setEstimate(null);
      return;
    }

    setLoading(true);
    try {
      // 1. 调用定价服务计算原价和折扣
      const priceResult = await pricingService.estimate({
        resourceType: 'gpu-instance',
        config: {
          gpuType: config.gpuType,
          gpuCount: config.gpuCount,
          cpuCores: config.cpuCores,
          memory: config.memory,
        },
        duration: config.duration,
        userLevel: currentUser.level
      });

      // 2. 调用券服务计算最大抵扣
      const voucherResult = await voucherService.calculateMaxDeduction({
        orderAmount: priceResult.finalPrice,
        orderType: 'gpu-instance',
        config: config
      });

      // 3. 合并结果
      setEstimate({
        originalPrice: priceResult.originalPrice,
        breakdown: priceResult.breakdown,
        discount: priceResult.discount,
        discountAmount: priceResult.discountAmount,
        priceAfterDiscount: priceResult.finalPrice,
        maxVoucherDeduct: voucherResult.maxDeduction,
        availableVouchers: voucherResult.vouchers,
        estimatedFinalAmount: priceResult.finalPrice - voucherResult.maxDeduction
      });
    } catch (error) {
      toast.error('预估失败，请稍后重试');
      setEstimate(null);
    } finally {
      setLoading(false);
    }
  };

  const isConfigValid = (config: OrderConfig): boolean => {
    return config.gpuCount > 0 && config.duration > 0;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>创建GPU训练任务</DialogTitle>
        </DialogHeader>

        {/* 资源配置表单 */}
        <div className="space-y-4">
          <Label>资源配置</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>GPU类型</Label>
              <Select
                value={config.gpuType}
                onValueChange={(value) => 
                  setConfig({ ...config, gpuType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A100">NVIDIA A100 40GB</SelectItem>
                  <SelectItem value="V100">NVIDIA V100 32GB</SelectItem>
                  <SelectItem value="T4">NVIDIA T4 16GB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>GPU数量</Label>
              <Select
                value={config.gpuCount.toString()}
                onValueChange={(value) => 
                  setConfig({ ...config, gpuCount: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1卡</SelectItem>
                  <SelectItem value="2">2卡</SelectItem>
                  <SelectItem value="4">4卡</SelectItem>
                  <SelectItem value="8">8卡</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>CPU核心</Label>
              <Select
                value={config.cpuCores.toString()}
                onValueChange={(value) => 
                  setConfig({ ...config, cpuCores: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4核</SelectItem>
                  <SelectItem value="8">8核</SelectItem>
                  <SelectItem value="16">16核</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>内存</Label>
              <Select
                value={config.memory.toString()}
                onValueChange={(value) => 
                  setConfig({ ...config, memory: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16">16GB</SelectItem>
                  <SelectItem value="32">32GB</SelectItem>
                  <SelectItem value="64">64GB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>运行时长</Label>
            <Select
              value={config.duration.toString()}
              onValueChange={(value) => 
                setConfig({ ...config, duration: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1小时</SelectItem>
                <SelectItem value="6">6小时</SelectItem>
                <SelectItem value="12">12小时</SelectItem>
                <SelectItem value="24">24小时</SelectItem>
                <SelectItem value="72">3天</SelectItem>
                <SelectItem value="168">7天</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 费用预估卡片 */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              💰 费用预估（实时更新）
              {loading && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {estimate ? (
              <div className="space-y-3">
                {/* 原价明细 */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">原价</span>
                    <span className="text-slate-900">
                      ¥{estimate.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  {estimate.breakdown && (
                    <div className="ml-4 space-y-1 text-xs text-slate-600">
                      {estimate.breakdown.gpu > 0 && (
                        <div className="flex justify-between">
                          <span>
                            ├─ GPU ({config.gpuCount}卡×{config.duration}h×¥15)
                          </span>
                          <span>¥{estimate.breakdown.gpu.toFixed(2)}</span>
                        </div>
                      )}
                      {estimate.breakdown.cpu > 0 && (
                        <div className="flex justify-between">
                          <span>
                            ├─ CPU ({config.cpuCores}核×{config.duration}h×¥0.50)
                          </span>
                          <span>¥{estimate.breakdown.cpu.toFixed(2)}</span>
                        </div>
                      )}
                      {estimate.breakdown.memory > 0 && (
                        <div className="flex justify-between">
                          <span>
                            └─ 内存 ({config.memory}GB×{config.duration}h×¥0.10)
                          </span>
                          <span>¥{estimate.breakdown.memory.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* 小计 */}
                <div className="flex justify-between">
                  <span className="text-slate-600">小计</span>
                  <span className="text-slate-900">
                    ¥{estimate.originalPrice.toFixed(2)}
                  </span>
                </div>

                {/* 折扣 */}
                {estimate.discountAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        折扣（{currentUser.level}会员{estimate.discount * 100}折）
                      </span>
                      <span className="text-orange-600">
                        -¥{estimate.discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">折后价</span>
                      <span className="text-slate-900">
                        ¥{estimate.priceAfterDiscount.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {/* 算力券可抵 */}
                {estimate.maxVoucherDeduct > 0 ? (
                  <>
                    <div className="flex justify-between items-center bg-green-50 -mx-4 px-4 py-2 rounded">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">🎁 算力券可抵</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-700">
                          ¥{estimate.maxVoucherDeduct.toFixed(2)}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setShowVoucherDetail(true)}
                          className="text-green-600 h-auto p-0"
                        >
                          查看券详情 →
                        </Button>
                      </div>
                    </div>
                    <Separator />
                  </>
                ) : (
                  <div className="text-sm text-slate-500 text-center py-2">
                    暂无可用算力券
                  </div>
                )}

                {/* 预估实付 */}
                <div className="flex justify-between items-center bg-purple-50 -mx-4 px-4 py-3 rounded">
                  <span className="text-lg text-slate-900">预估实付</span>
                  <span className="text-2xl font-semibold text-purple-600">
                    ¥{estimate.estimatedFinalAmount.toFixed(2)}
                  </span>
                </div>

                {/* 提示 */}
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-xs text-slate-700">
                    💡 实际金额以支付时为准，券使用情况可能会有变化
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p>请完善资源配置以查看费用预估</p>
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleCreateOrder}
            disabled={!estimate || loading}
          >
            确认创建订单
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* 券详情对话框 */}
      <VoucherDetailDialog
        open={showVoucherDetail}
        onOpenChange={setShowVoucherDetail}
        vouchers={estimate?.availableVouchers || []}
        orderAmount={estimate?.priceAfterDiscount || 0}
      />
    </Dialog>
  );
};

// 券详情对话框
const VoucherDetailDialog = ({ open, onOpenChange, vouchers, orderAmount }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>可用算力券预览</DialogTitle>
          <DialogDescription>
            根据智能推荐，以下券可用于抵扣本订单
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {vouchers.map((voucher, index) => (
            <Card key={voucher.id} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-100 text-purple-700">
                        {voucher.voucherCode}
                      </Badge>
                      {voucher.daysToExpire <= 7 && (
                        <Badge className="bg-orange-100 text-orange-700">
                          {voucher.daysToExpire}天后到期
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      {voucher.programName}
                    </p>
                    <p className="text-xs text-slate-500">
                      剩余 ¥{voucher.remainingAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 mb-1">可抵扣</p>
                    <p className="text-lg font-semibold text-green-600">
                      ¥{Math.min(voucher.remainingAmount, orderAmount).toFixed(2)}
                    </p>
                    {voucher.remainingAmount >= orderAmount ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        可全额
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                        部分
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription className="text-sm">
            💡 支付时可选择具体的券组合方式，系统会自动智能推荐最优方案
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### API改动

**修改现有接口**

```typescript
// POST /api/pricing/estimate
// 新增返回字段

interface EstimateRequest {
  resourceType: string;        // 资源类型
  config: any;                 // 资源配置
  duration: number;            // 时长（小时）
  userLevel?: string;          // 用户等级
}

interface EstimateResponse {
  originalPrice: number;       // 原价
  breakdown: {                 // 价格明细
    gpu?: number;
    cpu?: number;
    memory?: number;
    storage?: number;
  };
  discount: number;            // 折扣率
  discountAmount: number;      // 折扣金额
  finalPrice: number;          // 折后价
  maxVoucherDeduct: number;    // 最大券抵扣（新增）
  availableVouchers: Voucher[]; // 可用券列表（新增）
}
```

**新增接口**

```typescript
// POST /api/vouchers/calculateMaxDeduction
// 计算最大券抵扣金额

interface MaxDeductionRequest {
  orderAmount: number;         // 订单金额
  orderType?: string;          // 订单类型
  config?: any;                // 资源配置（用于匹配券范围）
}

interface MaxDeductionResponse {
  maxDeduction: number;        // 最大抵扣金额
  canFullDeduct: boolean;      // 是否可全额抵扣
  vouchers: Array<{            // 可用券列表
    id: string;
    voucherCode: string;
    programName: string;
    remainingAmount: number;
    daysToExpire: number;
    canDeductAmount: number;   // 本券可抵金额
  }>;
  reason: string;              // 说明
}
```

**后端逻辑变化**

```typescript
// pricingService.ts

class PricingService {
  async estimate(request: EstimateRequest): Promise<EstimateResponse> {
    // 1. 计算原价和明细
    const { originalPrice, breakdown } = this.calculateBasePrice(request);
    
    // 2. 应用折扣
    const discount = this.getDiscount(request.userLevel);
    const discountAmount = originalPrice * (1 - discount);
    const finalPrice = originalPrice - discountAmount;
    
    // 3. 计算券抵扣（新增）
    const voucherResult = await voucherService.calculateMaxDeduction({
      orderAmount: finalPrice,
      orderType: request.resourceType,
      config: request.config
    });
    
    return {
      originalPrice,
      breakdown,
      discount,
      discountAmount,
      finalPrice,
      maxVoucherDeduct: voucherResult.maxDeduction,
      availableVouchers: voucherResult.vouchers
    };
  }

  private calculateBasePrice(request: EstimateRequest) {
    const breakdown: any = {};
    let total = 0;
    
    // GPU价格
    if (request.config.gpuType && request.config.gpuCount) {
      const gpuPrice = this.getGpuPrice(request.config.gpuType);
      breakdown.gpu = gpuPrice * request.config.gpuCount * request.duration;
      total += breakdown.gpu;
    }
    
    // CPU价格
    if (request.config.cpuCores) {
      breakdown.cpu = 0.5 * request.config.cpuCores * request.duration;
      total += breakdown.cpu;
    }
    
    // 内存价格
    if (request.config.memory) {
      breakdown.memory = 0.1 * request.config.memory * request.duration;
      total += breakdown.memory;
    }
    
    return { originalPrice: total, breakdown };
  }

  private getDiscount(userLevel?: string): number {
    const discounts = {
      bronze: 1.0,
      silver: 0.95,
      gold: 0.9,
      platinum: 0.85
    };
    return discounts[userLevel as keyof typeof discounts] || 1.0;
  }

  private getGpuPrice(gpuType: string): number {
    const prices = {
      'A100': 15.0,
      'V100': 12.0,
      'T4': 8.0,
      'A10': 10.0
    };
    return prices[gpuType as keyof typeof prices] || 15.0;
  }
}

// voucherService.ts

class VoucherService {
  async calculateMaxDeduction(
    request: MaxDeductionRequest
  ): Promise<MaxDeductionResponse> {
    // 1. 获取可用券
    const vouchers = await this.getAvailableVouchers(
      request.orderType,
      request.config
    );
    
    // 2. 过滤适用券
    const applicable = vouchers.filter(v => 
      this.isApplicable(v, request.orderType, request.config)
    );
    
    // 3. 计算每张券可抵金额
    const withDeduction = applicable.map(v => ({
      ...v,
      canDeductAmount: Math.min(v.remainingAmount, request.orderAmount)
    }));
    
    // 4. 计算总抵扣
    const maxDeduction = withDeduction.reduce(
      (sum, v) => sum + v.canDeductAmount,
      0
    );
    
    // 5. 判断是否可全额抵扣
    const canFullDeduct = maxDeduction >= request.orderAmount;
    
    return {
      maxDeduction: Math.min(maxDeduction, request.orderAmount),
      canFullDeduct,
      vouchers: withDeduction,
      reason: this.generateDeductionReason(
        withDeduction,
        maxDeduction,
        request.orderAmount
      )
    };
  }

  private isApplicable(
    voucher: Voucher,
    orderType?: string,
    config?: any
  ): boolean {
    // 检查状态
    if (voucher.status !== 'active') return false;
    
    // 检查有效期
    if (new Date(voucher.endDate) < new Date()) return false;
    
    // 检查余额
    if (voucher.remainingAmount <= 0) return false;
    
    // 检查适用范围
    if (orderType && voucher.applicableScopes.length > 0) {
      const isApplicable = voucher.applicableScopes.some(scope => 
        this.matchScope(scope, orderType, config)
      );
      if (!isApplicable) return false;
    }
    
    return true;
  }

  private matchScope(
    scope: string,
    orderType: string,
    config: any
  ): boolean {
    // 匹配逻辑
    // 例如：scope="AI训练", orderType="gpu-instance" → true
    // 例如：scope="存储", orderType="storage" → true
    const mapping = {
      'AI训练': ['gpu-instance', 'training'],
      '模型推理': ['inference'],
      '数据处理': ['cpu-instance'],
      '存储': ['storage']
    };
    
    const types = mapping[scope as keyof typeof mapping] || [];
    return types.includes(orderType);
  }

  private generateDeductionReason(
    vouchers: any[],
    maxDeduction: number,
    orderAmount: number
  ): string {
    if (vouchers.length === 0) {
      return '暂无可用算力券';
    }
    
    if (maxDeduction >= orderAmount) {
      return `可用 ${vouchers.length} 张券实现全额抵扣`;
    }
    
    return `可用 ${vouchers.length} 张券，最多抵扣 ¥${maxDeduction.toFixed(2)}`;
  }
}
```

---

### 优化3：余额 + 算力券自动混合支付

#### 功能文档

**需求描述**
- 支付时自动组合算力券 + 账户余额
- 优先使用算力券抵扣，余额自动补足差额
- 支持完全抵扣提示（券+余额 = 订单金额）

**业务价值**
- ✅ 消除"券不够需手动充值"的痛点
- ✅ 简化支付流程，提升用户体验
- ✅ 符合原有账户管理逻辑

**业务规则**
```typescript
混合支付规则：
1. 支付优先级：算力券 > 账户余额 > 第三方支付
2. 自动计算：
   - 券抵扣金额 = min(券总额, 订单金额)
   - 余额使用 = min(余额, 订单金额 - 券抵扣)
   - 第三方支付 = 订单金额 - 券抵扣 - 余额使用
3. 完全抵扣：券 + 余额 >= 订单金额时，显示"实付 ¥0"
4. 部分抵扣：提示需补充的金额

边界条件：
- 券/余额不足时，显示第三方支付选项
- 券过期/冻结时自动排除
- 余额冻结部分不可用
```

**依赖关系**
- 依赖：原有 Account 聚合根
- 依赖：原有 Voucher 聚合根
- 依赖：原有 SettlementService
- 影响：支付流程、资金流转

#### 交互设计

**UI/UX流程**

```
┌─────────────────────────────────────────────────────────┐
│  混合支付对话框（PaymentDialog）                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  订单金额：¥1,280.00                                     │
│                                                          │
│  💰 支付方式                                             │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ✅ 智能混合支付（推荐）                             │ │
│  │                                                     │ │
│  │ 支付明细：                                          │ │
│  │ ┌─────────────────────────────────────────────┐   │ │
│  │ │ 算力券抵扣                                   │   │ │
│  │ │ GOV-2024-AI-001      ¥500.00               │   │ │
│  │ │ GOV-2024-EDU-023     ¥280.00               │   │ │
│  │ │                              ─────────      │   │ │
│  │ │ 小计                         ¥780.00       │   │ │
│  │ └─────────────────────────────────────────────┘   │ │
│  │                                                     │ │
│  │ ┌─────────────────────────────────────────────┐   │ │
│  │ │ 账户余额抵扣                                 │   │ │
│  │ │ 当前余额 ¥50,000.00                          │   │ │
│  │ │ 本次使用             ¥500.00               │   │ │
│  │ │ 使用后余额           ¥49,500.00            │   │ │
│  │ └─────────────────────────────────────────────┘   │ │
│  │                                                     │ │
│  │ ┌─────────────────────────────────────────────┐   │ │
│  │ │ 合计抵扣             ¥1,280.00             │   │ │
│  │ │ ✓ 已完全抵扣，无需额外支付                  │   │ │
│  │ └─────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  实付金额：¥0.00                                         │
│                                                          │
│  [取消]                      [确认支付]                  │
│                                                          │
└─────────────────────────────────────────────────────────┘

场景2：券+余额不足
┌─────────────────────────────────────────────────────────┐
│  订单金额：¥5,280.00                                     │
│                                                          │
│  💰 支付方式                                             │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ✅ 智能混合支付                                      │ │
│  │                                                     │ │
│  │ 算力券抵扣：            ¥1,000.00                  │ │
│  │ 账户余额：              ¥2,000.00                  │ │
│  │                        ──────────                  │ │
│  │ 已抵扣：                ¥3,000.00                  │ │
│  │                                                     │ │
│  │ ⚠️ 还需支付：            ¥2,280.00                 │ │
│  │                                                     │ │
│  │ 请选择补充支付方式：                                │ │
│  │ ○ 支付宝                                           │ │
│  │ ○ 微信支付                                         │ │
│  │ ○ 银行卡                                           │ │
│  │                                                     │ │
│  │ [一键充值 ¥2,280.00]                               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  实付金额：¥2,280.00                                     │
│                                                          │
│  [取消]                      [确认支付]                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**混合支付流程**

```
[用户点击支付]
        ↓
[打开支付对话框]
        ↓
[自动计算混合方案]
        │
        ├─→ [1. 计算券抵扣]
        │      ├─ 获取可用券
        │      ├─ 智能推荐组合
        │      └─ 计算总抵扣
        │
        ├─→ [2. 计算余额抵扣]
        │      ├─ 获取账户余额
        │      ├─ 计算剩余金额
        │      └─ 确定使用金额
        │
        └─→ [3. 计算剩余]
               ├─ 订单金额 - 券 - 余额
               └─ 判断是否需要第三方支付
        ↓
[显示支付明细]
        │
        ├─→ [完全抵扣] → 显示"实付¥0"
        │
        └─→ [部分抵扣] → 显示第三方支付选项
        ↓
[用户确认]
        ↓
[执行支付]
        │
        ├─→ [1. 扣减券额度]
        ├─→ [2. 扣减账户余额]
        └─→ [3. 调用第三方支付]（如需要）
        ↓
[更新订单状态]
        ↓
[生成支付记录]
        ↓
[通知用户]
```

**伪代码实现**

```typescript
// PaymentDialog.tsx

interface MixedPaymentResult {
  voucherDeduction: number;    // 券抵扣
  balanceDeduction: number;    // 余额抵扣
  thirdPartyAmount: number;    // 第三方支付
  canFullDeduct: boolean;      // 是否完全抵扣
  selectedVouchers: Voucher[]; // 选中的券
}

const PaymentDialog = ({ orderId, orderAmount, onSuccess }) => {
  const [paymentPlan, setPaymentPlan] = useState<MixedPaymentResult | null>(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateMixedPayment();
  }, [orderAmount]);

  // 计算混合支付方案
  const calculateMixedPayment = async () => {
    setLoading(true);
    try {
      // 1. 获取账户信息
      const account = await accountService.getAccountInfo();
      setAccountBalance(account.availableBalance);

      // 2. 获取智能推荐券
      const voucherResult = await voucherService.getRecommendedVouchers(
        orderAmount,
        'auto' // 自动类型匹配
      );

      // 3. 计算券抵扣
      const voucherDeduction = Math.min(
        voucherResult.totalDeduction,
        orderAmount
      );

      // 4. 计算余额抵扣
      const remaining = orderAmount - voucherDeduction;
      const balanceDeduction = Math.min(
        account.availableBalance,
        remaining
      );

      // 5. 计算第三方支付
      const thirdPartyAmount = orderAmount - voucherDeduction - balanceDeduction;

      setPaymentPlan({
        voucherDeduction,
        balanceDeduction,
        thirdPartyAmount,
        canFullDeduct: thirdPartyAmount === 0,
        selectedVouchers: voucherResult.vouchers
      });
    } catch (error) {
      toast.error('计算失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 确认混合支付
  const handleConfirmPay = async () => {
    if (!paymentPlan) return;

    setLoading(true);
    try {
      // 完全抵扣或部分抵扣
      if (paymentPlan.canFullDeduct) {
        // 无需第三方支付
        await paymentService.payWithMix({
          orderId,
          vouchers: paymentPlan.selectedVouchers.map(v => ({
            voucherId: v.id,
            useAmount: v.useAmount
          })),
          useBalance: paymentPlan.balanceDeduction
        });

        toast.success('支付成功！');
        onSuccess?.();
      } else {
        // 需要第三方支付
        if (!selectedPaymentMethod) {
          toast.error('请选择支付方式');
          return;
        }

        // 先使用券和余额
        const mixResult = await paymentService.payWithMix({
          orderId,
          vouchers: paymentPlan.selectedVouchers.map(v => ({
            voucherId: v.id,
            useAmount: v.useAmount
          })),
          useBalance: paymentPlan.balanceDeduction
        });

        // 再调用第三方支付
        const thirdPartyResult = await paymentService.createThirdPartyOrder({
          orderId,
          amount: paymentPlan.thirdPartyAmount,
          method: selectedPaymentMethod
        });

        // 跳转支付
        window.location.href = thirdPartyResult.paymentUrl;
      }
    } catch (error) {
      toast.error('支付失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 一键充值
  const handleQuickRecharge = () => {
    if (!paymentPlan) return;
    
    // 跳转充值页，预填充值金额
    navigate('/account-balance', {
      state: {
        suggestedAmount: paymentPlan.thirdPartyAmount,
        returnToOrder: orderId
      }
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>确认支付</DialogTitle>
        </DialogHeader>

        {/* 订单金额 */}
        <div className="mb-4">
          <p className="text-slate-600">订单金额</p>
          <p className="text-2xl text-slate-900">
            ¥{orderAmount.toFixed(2)}
          </p>
        </div>

        {paymentPlan && (
          <>
            {/* 支付方式 */}
            <div className="space-y-4">
              <Label>💰 支付方式</Label>
              
              <Card className="border-2 border-purple-200 bg-purple-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      智能混合支付（推荐）
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* 券抵扣明细 */}
                    {paymentPlan.voucherDeduction > 0 && (
                      <div className="bg-white rounded-lg p-3 space-y-2">
                        <p className="text-sm text-slate-700 font-medium">
                          算力券抵扣
                        </p>
                        {paymentPlan.selectedVouchers.map(v => (
                          <div key={v.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">{v.voucherCode}</span>
                            <span className="text-purple-600">
                              ¥{v.useAmount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>小计</span>
                          <span className="text-purple-600">
                            ¥{paymentPlan.voucherDeduction.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 余额抵扣明细 */}
                    {paymentPlan.balanceDeduction > 0 && (
                      <div className="bg-white rounded-lg p-3 space-y-2">
                        <p className="text-sm text-slate-700 font-medium">
                          账户余额抵扣
                        </p>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-600">当前余额</span>
                            <span className="text-blue-600">
                              ¥{accountBalance.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">本次使用</span>
                            <span className="text-blue-600">
                              ¥{paymentPlan.balanceDeduction.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>使用后余额</span>
                            <span>
                              ¥{(accountBalance - paymentPlan.balanceDeduction).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 合计抵扣 */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">合计抵扣</span>
                        <span className="text-xl font-semibold text-green-600">
                          ¥{(paymentPlan.voucherDeduction + paymentPlan.balanceDeduction).toFixed(2)}
                        </span>
                      </div>
                      {paymentPlan.canFullDeduct && (
                        <p className="text-sm text-green-700 mt-2">
                          ✓ 已完全抵扣，无需额外支付
                        </p>
                      )}
                    </div>

                    {/* 第三方支付 */}
                    {!paymentPlan.canFullDeduct && (
                      <div className="bg-orange-50 rounded-lg p-3 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-orange-900">
                            ⚠️ 还需支付
                          </span>
                          <span className="text-xl font-semibold text-orange-600">
                            ¥{paymentPlan.thirdPartyAmount.toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">请选择补充支付方式：</Label>
                          <RadioGroup
                            value={selectedPaymentMethod}
                            onValueChange={setSelectedPaymentMethod}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="alipay" id="alipay" />
                              <Label htmlFor="alipay" className="flex items-center gap-2">
                                <img src="/icons/alipay.svg" className="w-5 h-5" />
                                支付宝
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wechat" id="wechat" />
                              <Label htmlFor="wechat" className="flex items-center gap-2">
                                <img src="/icons/wechat.svg" className="w-5 h-5" />
                                微信支付
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bank" id="bank" />
                              <Label htmlFor="bank" className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                银行卡
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleQuickRecharge}
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          一键充值 ¥{paymentPlan.thirdPartyAmount.toFixed(2)}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 实付金额 */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg">实付金额</span>
                <span className={`text-2xl font-semibold ${
                  paymentPlan.canFullDeduct ? 'text-green-600' : 'text-slate-900'
                }`}>
                  ¥{paymentPlan.thirdPartyAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleConfirmPay}
            disabled={loading || (!paymentPlan?.canFullDeduct && !selectedPaymentMethod)}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            确认支付
            {paymentPlan && !paymentPlan.canFullDeduct && 
              ` ¥${paymentPlan.thirdPartyAmount.toFixed(2)}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### API改动

**新增接口**

```typescript
// POST /api/payment/mixCalculate
// 预计算混合支付方案

interface MixCalculateRequest {
  orderAmount: number;         // 订单金额
  orderType?: string;          // 订单类型
}

interface MixCalculateResponse {
  voucherDeduction: number;    // 券抵扣
  balanceDeduction: number;    // 余额抵扣
  thirdPartyAmount: number;    // 第三方支付
  canFullDeduct: boolean;      // 是否完全抵扣
  vouchers: Array<{            // 推荐券列表
    voucherId: string;
    useAmount: number;
  }>;
  accountBalance: number;      // 当前余额
}

// POST /api/payment/payWithMix
// 执行混合支付

interface PayWithMixRequest {
  orderId: string;             // 订单ID
  vouchers: Array<{            // 使用的券
    voucherId: string;
    useAmount: number;
  }>;
  useBalance: number;          // 使用的余额
}

interface PayWithMixResponse {
  success: boolean;
  paymentId: string;           // 支付ID
  voucherDeducted: number;     // 券实际抵扣
  balanceDeducted: number;     // 余额实际抵扣
  remainingAmount: number;     // 剩余需支付
  message: string;
}
```

**后端逻辑变化**

```typescript
// paymentService.ts

class PaymentService {
  /**
   * 计算混合支付方案
   */
  async calculateMixPayment(
    orderAmount: number,
    userId: string,
    orderType?: string
  ): Promise<MixCalculateResponse> {
    // 1. 获取账户信息
    const account = await accountService.getAccountInfo(userId);
    
    // 2. 获取推荐券
    const voucherResult = await voucherService.getRecommendedVouchers(
      orderAmount,
      orderType
    );
    
    // 3. 计算券抵扣
    const voucherDeduction = Math.min(
      voucherResult.totalDeduction,
      orderAmount
    );
    
    // 4. 计算余额抵扣
    const remaining = orderAmount - voucherDeduction;
    const balanceDeduction = Math.min(
      account.availableBalance,
      Math.max(0, remaining)
    );
    
    // 5. 计算第三方支付
    const thirdPartyAmount = Math.max(
      0,
      orderAmount - voucherDeduction - balanceDeduction
    );
    
    return {
      voucherDeduction,
      balanceDeduction,
      thirdPartyAmount,
      canFullDeduct: thirdPartyAmount === 0,
      vouchers: voucherResult.vouchers.map(v => ({
        voucherId: v.id,
        useAmount: v.useAmount
      })),
      accountBalance: account.availableBalance
    };
  }

  /**
   * 执行混合支付
   */
  async payWithMix(
    request: PayWithMixRequest
  ): Promise<PayWithMixResponse> {
    // 开启事务
    return await this.transaction(async (trx) => {
      let totalDeducted = 0;
      
      // 1. 扣减券额度
      let voucherDeducted = 0;
      for (const v of request.vouchers) {
        const result = await voucherService.deduct(
          v.voucherId,
          v.useAmount,
          request.orderId,
          trx
        );
        voucherDeducted += result.deductedAmount;
        totalDeducted += result.deductedAmount;
      }
      
      // 2. 扣减账户余额
      let balanceDeducted = 0;
      if (request.useBalance > 0) {
        const result = await accountService.deduct(
          request.userId,
          request.useBalance,
          request.orderId,
          '订单支付',
          trx
        );
        balanceDeducted = result.deductedAmount;
        totalDeducted += result.deductedAmount;
      }
      
      // 3. 获取订单信息
      const order = await orderService.getOrder(request.orderId, trx);
      const remainingAmount = order.totalAmount - totalDeducted;
      
      // 4. 更新订单状态
      if (remainingAmount <= 0) {
        // 完全支付
        await orderService.updateStatus(
          request.orderId,
          'paid',
          trx
        );
      } else {
        // 部分支付
        await orderService.updatePartialPayment(
          request.orderId,
          totalDeducted,
          trx
        );
      }
      
      // 5. 生成支付记录
      const paymentId = await this.createPaymentRecord({
        orderId: request.orderId,
        voucherAmount: voucherDeducted,
        balanceAmount: balanceDeducted,
        totalAmount: totalDeducted,
        remainingAmount
      }, trx);
      
      return {
        success: true,
        paymentId,
        voucherDeducted,
        balanceDeducted,
        remainingAmount,
        message: remainingAmount === 0 
          ? '支付成功' 
          : `已抵扣 ¥${totalDeducted.toFixed(2)}，还需支付 ¥${remainingAmount.toFixed(2)}`
      };
    });
  }

  private async transaction<T>(
    callback: (trx: Transaction) => Promise<T>
  ): Promise<T> {
    const trx = await db.transaction();
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  private async createPaymentRecord(
    data: any,
    trx: Transaction
  ): Promise<string> {
    const paymentId = `pay-${Date.now()}`;
    await trx('payments').insert({
      id: paymentId,
      orderId: data.orderId,
      voucherAmount: data.voucherAmount,
      balanceAmount: data.balanceAmount,
      totalAmount: data.totalAmount,
      remainingAmount: data.remainingAmount,
      status: data.remainingAmount === 0 ? 'completed' : 'partial',
      createdAt: new Date()
    });
    return paymentId;
  }
}

// voucherService.ts

class VoucherService {
  /**
   * 扣减券额度
   */
  async deduct(
    voucherId: string,
    amount: number,
    orderId: string,
    trx: Transaction
  ): Promise<{ deductedAmount: number }> {
    // 1. 锁定券记录
    const voucher = await trx('vouchers')
      .where({ id: voucherId })
      .forUpdate()
      .first();
    
    if (!voucher) {
      throw new Error('券不存在');
    }
    
    if (voucher.status !== 'active') {
      throw new Error('券不可用');
    }
    
    if (voucher.remainingAmount < amount) {
      throw new Error('券余额不足');
    }
    
    // 2. 扣减余额
    const deductedAmount = Math.min(amount, voucher.remainingAmount);
    const newRemaining = voucher.remainingAmount - deductedAmount;
    const newUsed = voucher.usedAmount + deductedAmount;
    
    await trx('vouchers')
      .where({ id: voucherId })
      .update({
        remainingAmount: newRemaining,
        usedAmount: newUsed,
        status: newRemaining === 0 ? 'used' : 'active',
        updatedAt: new Date()
      });
    
    // 3. 记录使用明细
    await trx('voucher_usage').insert({
      id: `usage-${Date.now()}-${Math.random()}`,
      voucherId,
      orderId,
      amount: deductedAmount,
      beforeAmount: voucher.remainingAmount,
      afterAmount: newRemaining,
      createdAt: new Date()
    });
    
    return { deductedAmount };
  }
}

// accountService.ts

class AccountService {
  /**
   * 扣减账户余额
   */
  async deduct(
    userId: string,
    amount: number,
    orderId: string,
    description: string,
    trx: Transaction
  ): Promise<{ deductedAmount: number }> {
    // 1. 锁定账户记录
    const account = await trx('accounts')
      .where({ userId })
      .forUpdate()
      .first();
    
    if (!account) {
      throw new Error('账户不存在');
    }
    
    const availableBalance = account.balance - account.frozenAmount;
    
    if (availableBalance < amount) {
      throw new Error('余额不足');
    }
    
    // 2. 扣减余额
    const deductedAmount = Math.min(amount, availableBalance);
    const newBalance = account.balance - deductedAmount;
    const newConsumption = account.totalConsumption + deductedAmount;
    
    await trx('accounts')
      .where({ userId })
      .update({
        balance: newBalance,
        totalConsumption: newConsumption,
        updatedAt: new Date()
      });
    
    // 3. 记录流水
    await trx('account_transactions').insert({
      id: `txn-${Date.now()}-${Math.random()}`,
      userId,
      type: 'deduct',
      amount: deductedAmount,
      beforeBalance: account.balance,
      afterBalance: newBalance,
      orderId,
      description,
      createdAt: new Date()
    });
    
    return { deductedAmount };
  }
}
```

---

### 优化4：券快到期/余额不足 7天内自动置顶 + 橙色高亮 + 弹窗提醒

#### 功能文档

**需求描述**
- 券列表中，快到期券（7天内）自动置顶、橙色高亮
- 余额预计不足7天时弹窗提醒用户充值
- 结合智能推荐，优先使用快到期券

**业务价值**
- ✅ 防止算力券过期浪费
- ✅ 提前预警余额不足
- ✅ 提升券使用率和用户满意度

**业务规则**
```typescript
到期预警规则：
1. 券到期预警：
   - 7天内到期：橙色标签"即将到期（剩X天）"
   - 3天内到期：红色标签"紧急到期（剩X天）"
   - 已过期：灰色标签"已过期"
   
2. 余额预警：
   - 基于日均消费计算：预计可用天数 = 余额 / 日均消费
   - 7天内不足：弹窗提醒
   - 3天内不足：紧急提醒（红色）
   
3. 排序优先级：
   - 即将到期券 > 正常券
   - 同类型按余额从小到大

边界条件：
- 新用户无消费历史时，不显示余额预警
- 券冻结/失效时，不显示到期提醒
- 预警可关闭，24小时内不再提示
```

**依赖关系**
- 依赖：原有智能排序算法
- 依赖：原有账单统计服务
- 影响：券列表展示、用户通知

#### 交互设计

**UI/UX流程**

```
┌─────────────────────────────────────────────────────────┐
│  算力券列表（自动排序和高亮）                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  我的算力券（5张）                    [筛选 ▼] [排序 ▼] │
│                                                          │
│  💡 您有 2 张券即将到期，请尽快使用                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🔴 GOV-2024-EDU-023                [即将到期]       │ │
│  │ 高校科研算力补贴项目                                 │ │
│  │ 剩余 ¥2,000  |  ⚠️ 剩余 3 天                       │ │
│  │ 适用范围：科研计算、数据分析                         │ │
│  │                                                      │ │
│  │ [立即使用]                                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🟠 GOV-2024-AI-001                [即将到期]        │ │
│  │ 国家人工智能算力支持计划                             │ │
│  │ 剩余 ¥65,000  |  ⚠️ 剩余 7 天                       │ │
│  │ 适用范围：AI训练、模型推理、数据处理                 │ │
│  │                                                      │ │
│  │ [立即使用]                                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GOV-2024-TECH-001                                   │ │
│  │ 科技创新企业扶持计划                                 │ │
│  │ 剩余 ¥30,000  |  60 天后到期                        │ │
│  │ 适用范围：技术研发、AI训练                           │ │
│  │                                                      │ │
│  │ [使用]                                               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘

余额预警弹窗（自动弹出）：
┌─────────────────────────────────────────────────────────┐
│  ⚠️ 余额预警                                 [今日不再提示]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  您的账户余额即将不足                                    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 当前余额：      ¥1,500.00                           │ │
│  │ 日均消费：      ¥500.00                             │ │
│  │ 预计可用：      约 3 天                             │ │
│  │                                                      │ │
│  │ ⚠️ 余额不足可能导致服务中断                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  建议充值金额：                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ○ ¥3,500.00  （7天）                                │ │
│  │ ○ ¥15,000.00 （30天）                               │ │
│  │ ● ¥50,000.00 （100天） [推荐]                       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [稍后充值]              [立即充值]                      │
│                                                          │
└─────────────────────────────────────────────────────────┘

打开任何支付页时的提醒：
┌─────────────────────────────────────────────────────────┐
│  💡 温馨提示                                             │
│                                                          │
│  您有 2 张算力券即将到期：                               │
│  • GOV-2024-EDU-023（剩余3天，¥2,000）                 │
│  • GOV-2024-AI-001（剩余7天，¥65,000）                 │
│                                                          │
│  系统已自动优先使用这些券进行抵扣                        │
│                                                          │
│  [我知道了]                                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**预警触发流程**

```
[系统定时检查]（每小时）
        │
        ├─→ [检查券到期情况]
        │      ├─ 获取所有活跃券
        │      ├─ 计算距离到期天数
        │      └─ 标记7天内到期券
        │
        └─→ [检查余额预警]
               ├─ 获取账户余额
               ├─ 计算日均消费
               ├─ 预估可用天数
               └─ 判断是否需要预警
        ↓
[触发预警]
        │
        ├─→ [券到期预警]
        │      ├─ 更新券列表排序
        │      ├─ 添加橙色/红色标签
        │      └─ 发送站内消息
        │
        └─→ [余额预警]
               ├─ 弹出预警对话框
               ├─ 发送邮件/短信
               └─ 记录预警日志
        ↓
[用户交互]
        │
        ├─→ [点击"立即使用"]
        │      └─ 跳转创建订单页
        │
        ├─→ [点击"立即充值"]
        │      └─ 跳转充值页（预填金额）
        │
        └─→ [点击"今日不再提示"]
               └─ 设置24小时内不提示
```

**伪代码实现**

```typescript
// VoucherListPage.tsx

const VoucherListPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [balanceWarning, setBalanceWarning] = useState<BalanceWarning | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVouchers();
    checkBalanceWarning();
  }, []);

  // 加载券列表
  const loadVouchers = async () => {
    setLoading(true);
    try {
      const data = await voucherService.getMyVouchers();
      
      // 自动排序：即将到期券置顶
      const sorted = sortVouchersByExpiry(data);
      
      // 标记即将到期券
      const withWarning = sorted.map(v => ({
        ...v,
        daysToExpire: getDaysToExpire(v.endDate),
        warningLevel: getWarningLevel(getDaysToExpire(v.endDate))
      }));
      
      setVouchers(withWarning);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查余额预警
  const checkBalanceWarning = async () => {
    try {
      // 检查今日是否已提示
      const hasWarned = localStorage.getItem('balanceWarningDate');
      const today = new Date().toDateString();
      
      if (hasWarned === today) {
        return; // 今日已提示，跳过
      }
      
      // 获取余额预警信息
      const warning = await accountService.getBalanceWarning();
      
      if (warning.shouldWarn) {
        setBalanceWarning(warning);
        setShowBalanceWarning(true);
      }
    } catch (error) {
      console.error('检查余额预警失败:', error);
    }
  };

  // 按到期日期排序
  const sortVouchersByExpiry = (vouchers: Voucher[]): Voucher[] => {
    return vouchers.sort((a, b) => {
      const daysA = getDaysToExpire(a.endDate);
      const daysB = getDaysToExpire(b.endDate);
      
      // 7天内到期的优先
      const isUrgentA = daysA <= 7;
      const isUrgentB = daysB <= 7;
      
      if (isUrgentA && !isUrgentB) return -1;
      if (!isUrgentA && isUrgentB) return 1;
      
      // 同样紧急程度，按天数从小到大
      if (isUrgentA && isUrgentB) {
        return daysA - daysB;
      }
      
      // 都不紧急，按余额从小到大
      return a.remainingAmount - b.remainingAmount;
    });
  };

  // 计算距离到期天数
  const getDaysToExpire = (endDate: string): number => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // 获取预警级别
  const getWarningLevel = (days: number): 'none' | 'warning' | 'urgent' | 'expired' => {
    if (days < 0) return 'expired';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'warning';
    return 'none';
  };

  // 关闭余额预警（今日不再提示）
  const handleDismissWarning = () => {
    const today = new Date().toDateString();
    localStorage.setItem('balanceWarningDate', today);
    setShowBalanceWarning(false);
  };

  // 立即充值
  const handleQuickRecharge = () => {
    navigate('/account-balance', {
      state: {
        suggestedAmount: balanceWarning?.recommendedAmount
      }
    });
    setShowBalanceWarning(false);
  };

  // 立即使用券
  const handleUseVoucher = (voucher: Voucher) => {
    navigate('/create-order', {
      state: {
        preferredVoucher: voucher.id
      }
    });
  };

  // 获取券卡片样式
  const getVoucherCardClass = (warningLevel: string): string => {
    switch (warningLevel) {
      case 'urgent':
        return 'border-2 border-red-300 bg-red-50';
      case 'warning':
        return 'border-2 border-orange-300 bg-orange-50';
      case 'expired':
        return 'border border-slate-300 bg-slate-50 opacity-60';
      default:
        return 'border border-slate-200';
    }
  };

  // 获取预警标签
  const getWarningBadge = (voucher: any) => {
    const { daysToExpire, warningLevel } = voucher;
    
    if (warningLevel === 'expired') {
      return (
        <Badge className="bg-slate-100 text-slate-700">
          <XCircle className="w-3 h-3 mr-1" />
          已过期
        </Badge>
      );
    }
    
    if (warningLevel === 'urgent') {
      return (
        <Badge className="bg-red-100 text-red-700 animate-pulse">
          <AlertCircle className="w-3 h-3 mr-1" />
          紧急到期（剩{daysToExpire}天）
        </Badge>
      );
    }
    
    if (warningLevel === 'warning') {
      return (
        <Badge className="bg-orange-100 text-orange-700">
          <Clock className="w-3 h-3 mr-1" />
          即将到期（剩{daysToExpire}天）
        </Badge>
      );
    }
    
    return null;
  };

  // 统计即将到期券
  const expiringVouchers = vouchers.filter(v => 
    v.warningLevel === 'urgent' || v.warningLevel === 'warning'
  );

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl text-slate-900 mb-2">我的算力券</h1>
        <p className="text-slate-600">查看和管理您的政府算力券</p>
      </div>

      {/* 到期提醒 */}
      {expiringVouchers.length > 0 && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <AlertDescription>
            <strong className="text-orange-900">
              💡 您有 {expiringVouchers.length} 张券即将到期，请尽快使用
            </strong>
            <div className="mt-2 space-y-1">
              {expiringVouchers.slice(0, 3).map(v => (
                <p key={v.id} className="text-sm text-slate-700">
                  • {v.voucherCode}（剩余{v.daysToExpire}天，¥{v.remainingAmount.toFixed(2)}）
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 券列表 */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
          <p className="mt-4 text-slate-600">加载中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vouchers.map(voucher => (
            <Card
              key={voucher.id}
              className={getVoucherCardClass(voucher.warningLevel)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">
                        {voucher.voucherCode}
                      </CardTitle>
                      {getWarningBadge(voucher)}
                      <Badge variant="outline" className="text-sm">
                        {voucher.category === 'national' && '国家级'}
                        {voucher.category === 'provincial' && '省级'}
                        {voucher.category === 'municipal' && '市级'}
                        {voucher.category === 'special' && '专项'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {voucher.programName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Wallet className="w-4 h-4" />
                        剩余 ¥{voucher.remainingAmount.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {voucher.warningLevel === 'expired' 
                          ? '已过期' 
                          : `${voucher.daysToExpire}天后到期`
                        }
                      </span>
                    </div>
                  </div>
                  {voucher.warningLevel !== 'expired' && (
                    <Button
                      onClick={() => handleUseVoucher(voucher)}
                      className={
                        voucher.warningLevel === 'urgent' || voucher.warningLevel === 'warning'
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : ''
                      }
                    >
                      {voucher.warningLevel === 'urgent' || voucher.warningLevel === 'warning'
                        ? '立即使用'
                        : '使用'
                      }
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Tag className="w-4 h-4" />
                  <span>适用范围：{voucher.applicableScopes.join('、')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 余额预警对话框 */}
      <Dialog open={showBalanceWarning} onOpenChange={setShowBalanceWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              ⚠️ 余额预警
            </DialogTitle>
          </DialogHeader>

          {balanceWarning && (
            <div className="space-y-4">
              <p className="text-slate-700">
                您的账户余额即将不足
              </p>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">当前余额</span>
                    <span className="font-semibold text-orange-900">
                      ¥{balanceWarning.currentBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">日均消费</span>
                    <span className="text-slate-900">
                      ¥{balanceWarning.dailyAverage.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-slate-600">预计可用</span>
                    <span className="font-semibold text-orange-600">
                      约 {balanceWarning.estimatedDays} 天
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-sm text-red-800">
                  ⚠️ 余额不足可能导致服务中断
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>建议充值金额</Label>
                <RadioGroup
                  defaultValue={balanceWarning.recommendedAmount.toString()}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={balanceWarning.options[0].amount.toString()} />
                    <Label className="flex-1">
                      ¥{balanceWarning.options[0].amount.toFixed(2)} 
                      （{balanceWarning.options[0].days}天）
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={balanceWarning.options[1].amount.toString()} />
                    <Label className="flex-1">
                      ¥{balanceWarning.options[1].amount.toFixed(2)} 
                      （{balanceWarning.options[1].days}天）
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={balanceWarning.options[2].amount.toString()} />
                    <Label className="flex-1 flex items-center gap-2">
                      ¥{balanceWarning.options[2].amount.toFixed(2)} 
                      （{balanceWarning.options[2].days}天）
                      <Badge className="bg-green-100 text-green-700">
                        推荐
                      </Badge>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handleDismissWarning}
              className="text-slate-600"
            >
              今日不再提示
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBalanceWarning(false)}
              >
                稍后充值
              </Button>
              <Button onClick={handleQuickRecharge}>
                立即充值
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

#### API改动

**修改现有接口**

```typescript
// GET /api/vouchers/my
// 新增返回字段

interface VoucherResponse {
  // ... 原有字段
  daysToExpire: number;        // 距离到期天数
  warningLevel: 'none' | 'warning' | 'urgent' | 'expired'; // 预警级别
  shouldHighlight: boolean;    // 是否需要高亮
}
```

**新增接口**

```typescript
// GET /api/account/balanceWarning
// 获取余额预警信息

interface BalanceWarningResponse {
  shouldWarn: boolean;         // 是否需要预警
  currentBalance: number;      // 当前余额
  dailyAverage: number;        // 日均消费
  estimatedDays: number;       // 预计可用天数
  warningLevel: 'normal' | 'warning' | 'urgent'; // 预警级别
  recommendedAmount: number;   // 推荐充值金额
  options: Array<{             // 充值选项
    amount: number;            // 金额
    days: number;              // 可用天数
    description: string;       // 描述
  }>;
}
```

**后端逻辑变化**

```typescript
// voucherService.ts

class VoucherService {
  async getMyVouchers(userId: string): Promise<VoucherResponse[]> {
    // 1. 获取券列表
    const vouchers = await db('vouchers')
      .where({ userId, status: 'active' })
      .orWhere({ userId, status: 'used' });
    
    // 2. 计算到期天数和预警级别
    const now = new Date();
    const withWarning = vouchers.map(v => {
      const endDate = new Date(v.endDate);
      const diff = endDate.getTime() - now.getTime();
      const daysToExpire = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      let warningLevel: string;
      if (daysToExpire < 0) {
        warningLevel = 'expired';
      } else if (daysToExpire <= 3) {
        warningLevel = 'urgent';
      } else if (daysToExpire <= 7) {
        warningLevel = 'warning';
      } else {
        warningLevel = 'none';
      }
      
      return {
        ...v,
        daysToExpire,
        warningLevel,
        shouldHighlight: warningLevel === 'urgent' || warningLevel === 'warning'
      };
    });
    
    // 3. 排序：即将到期优先
    withWarning.sort((a, b) => {
      // 紧急的排最前
      if (a.warningLevel === 'urgent' && b.warningLevel !== 'urgent') return -1;
      if (a.warningLevel !== 'urgent' && b.warningLevel === 'urgent') return 1;
      
      // 预警的排前面
      if (a.warningLevel === 'warning' && b.warningLevel === 'none') return -1;
      if (a.warningLevel === 'none' && b.warningLevel === 'warning') return 1;
      
      // 同级别按天数从小到大
      if (a.warningLevel === b.warningLevel) {
        return a.daysToExpire - b.daysToExpire;
      }
      
      return 0;
    });
    
    return withWarning;
  }
}

// accountService.ts

class AccountService {
  async getBalanceWarning(userId: string): Promise<BalanceWarningResponse> {
    // 1. 获取账户信息
    const account = await db('accounts')
      .where({ userId })
      .first();
    
    // 2. 计算日均消费（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCosts = await db('billing_records')
      .where({ userId })
      .where('date', '>=', thirtyDaysAgo)
      .sum('totalCost as total');
    
    const totalCost = recentCosts[0]?.total || 0;
    const dailyAverage = totalCost / 30;
    
    // 3. 如果日均消费为0（新用户），不预警
    if (dailyAverage === 0) {
      return {
        shouldWarn: false,
        currentBalance: account.availableBalance,
        dailyAverage: 0,
        estimatedDays: 999,
        warningLevel: 'normal',
        recommendedAmount: 0,
        options: []
      };
    }
    
    // 4. 计算预计可用天数
    const estimatedDays = Math.floor(account.availableBalance / dailyAverage);
    
    // 5. 判断是否需要预警
    const shouldWarn = estimatedDays <= 7;
    const warningLevel = estimatedDays <= 3 ? 'urgent' : 
                        estimatedDays <= 7 ? 'warning' : 'normal';
    
    // 6. 生成充值建议
    const options = [
      {
        amount: dailyAverage * 7,
        days: 7,
        description: '7天用量'
      },
      {
        amount: dailyAverage * 30,
        days: 30,
        description: '30天用量'
      },
      {
        amount: dailyAverage * 100,
        days: 100,
        description: '100天用量（推荐）'
      }
    ];
    
    return {
      shouldWarn,
      currentBalance: account.availableBalance,
      dailyAverage,
      estimatedDays,
      warningLevel,
      recommendedAmount: dailyAverage * 30, // 默认推荐30天
      options
    };
  }
}
```

---

由于文档篇幅较长，我将分成多个部分继续完成。您想让我继续完成剩余的P1-P3级优化详细设计，还是先查看当前已完成的P0级优化设计？