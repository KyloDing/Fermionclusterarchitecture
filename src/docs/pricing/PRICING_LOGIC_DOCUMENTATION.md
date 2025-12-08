# 费米集群资源定价管理逻辑文档 📊

## 📋 目录

1. [定价系统架构](#1-定价系统架构)
2. [定价继承规则](#2-定价继承规则)
3. [资源类型定价逻辑](#3-资源类型定价逻辑)
4. [定价查询算法](#4-定价查询算法)
5. [费用计算逻辑](#5-费用计算逻辑)
6. [缓存策略](#6-缓存策略)
7. [特殊场景处理](#7-特殊场景处理)

---

## 1. 定价系统架构

### 1.1 系统层次结构

```
┌─────────────────────────────────────────────────────────┐
│                    定价系统架构                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  前端层 (Presentation Layer)                      │  │
│  │  - FlexiblePricingManagementPage                  │  │
│  │  - PaymentDialog                                  │  │
│  │  - BillingPage                                    │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↕                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  业务逻辑层 (Business Logic Layer)                │  │
│  │  - pricingService.ts                              │  │
│  │  - billingService.ts                              │  │
│  │  - voucherService.ts                              │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↕                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  数据访问层 (Data Access Layer)                   │  │
│  │  - REST API                                       │  │
│  │  - GraphQL API (可选)                             │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↕                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  数据库层 (Database Layer)                        │  │
│  │  - pricing_rules (定价规则表)                     │  │
│  │  - pricing_history (历史记录表)                   │  │
│  │  - pricing_cache (缓存表)                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心组件

#### 1.2.1 定价服务 (pricingService)

**职责**：
- 管理定价规则的增删改查
- 实现定价继承算法
- 提供定价查询接口
- 计算资源费用

**核心方法**：
```typescript
// 查询单个资源价格
queryPricing(query: PricingQuery): Promise<PricingResult>

// 批量查询资源价格
batchQueryPricing(queries: PricingQuery[]): Promise<BatchPricingResult>

// 计算资源费用
calculateResourceCost(...): Promise<CostResult>

// CRUD操作
getAllPricingRules(): Promise<PricingRule[]>
savePricingRule(rule: PricingRule): Promise<PricingRule>
deletePricingRule(ruleId: string): Promise<boolean>
```

#### 1.2.2 计费服务 (billingService)

**职责**：
- 创建计费订单
- 生成账单
- 处理支付
- 集成定价服务

#### 1.2.3 前端管理页面

**职责**：
- 定价规则可视化管理
- 定价测试工具
- 费用预估展示

---

## 2. 定价继承规则

### 2.1 继承优先级

```
优先级（从高到低）：
  节点定价 (node) > 资源池定价 (pool) > 可用区定价 (zone) > 默认定价 (default)
```

### 2.2 继承算法流程

```
┌─────────────────────────────────────────────────────────┐
│             定价查询继承算法                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  输入: {                                                 │
│    resourceType: 'gpu',                                 │
│    resourceSpec: 'A100-40GB',                           │
│    zoneId: 'zone-001',                                  │
│    poolId: 'pool-001',                                  │
│    nodeId: 'node-001'                                   │
│  }                                                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 1: 查询节点级定价                          │   │
│  │   WHERE scope='node' AND scope_id='node-001'    │   │
│  │     AND resource_type='gpu'                     │   │
│  │     AND resource_spec='A100-40GB'               │   │
│  │     AND enabled=1                               │   │
│  │     AND effective_date <= NOW()                 │   │
│  │     AND (expiry_date IS NULL OR expiry > NOW()) │   │
│  └─────────────────────────────────────────────────┘   │
│             ↓ (如果找到)                                 │
│         返回节点价格 ✓                                   │
│             ↓ (如果未找到)                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 2: 查询资源池级定价                        │   │
│  │   WHERE scope='pool' AND scope_id='pool-001'    │   │
│  │     AND resource_type='gpu'                     │   │
│  │     AND resource_spec='A100-40GB'               │   │
│  │     AND enabled=1                               │   │
│  │     AND effective_date <= NOW()                 │   │
│  │     AND (expiry_date IS NULL OR expiry > NOW()) │   │
│  └─────────────────────────────────────────────────┘   │
│             ↓ (如果找到)                                 │
│       返回资源池价格 ✓                                   │
│             ↓ (如果未找到)                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 3: 查询可用区级定价                        │   │
│  │   WHERE scope='zone' AND scope_id='zone-001'    │   │
│  │     AND resource_type='gpu'                     │   │
│  │     AND resource_spec='A100-40GB'               │   │
│  │     AND enabled=1                               │   │
│  │     AND effective_date <= NOW()                 │   │
│  │     AND (expiry_date IS NULL OR expiry > NOW()) │   │
│  └─────────────────────────────────────────────────┘   │
│             ↓ (如果找到)                                 │
│       返回可用区价格 ✓                                   │
│             ↓ (如果未找到)                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 4: 查询默认定价                            │   │
│  │   WHERE scope='default'                         │   │
│  │     AND resource_type='gpu'                     │   │
│  │     AND resource_spec='A100-40GB'               │   │
│  │     AND enabled=1                               │   │
│  │     AND effective_date <= NOW()                 │   │
│  │     AND (expiry_date IS NULL OR expiry > NOW()) │   │
│  └─────────────────────────────────────────────────┘   │
│             ↓ (如果找到)                                 │
│        返回默认价格 ✓                                    │
│             ↓ (如果未找到)                               │
│        抛出异常：未找到定价规则                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.3 继承示例

#### 示例1：完整继承链

```typescript
// 场景：成都可用区 → 高性能GPU资源池 → GPU-Node-001
const query = {
  resourceType: 'gpu',
  resourceSpec: 'A100-40GB',
  zoneId: 'zone-001',     // 成都可用区A
  poolId: 'pool-001',     // 高性能GPU资源池
  nodeId: 'node-001',     // GPU-Node-001
};

// 定价数据：
// - 默认价格: ¥25.0/卡·小时
// - 可用区价格: ¥23.0/卡·小时 (成都电力便宜)
// - 资源池价格: 未配置
// - 节点价格: ¥22.0/卡·小时 (新设备测试优惠)

// 查询过程：
// 1. 查找节点价格 → 找到 ¥22.0 ✓
// 2. 不再继续查找

// 结果：
{
  pricePerUnit: 22.0,
  unit: '卡·小时',
  scopeChain: ['default', 'zone:zone-001', 'node:node-001'],
  appliedRule: { id: 'node-gpu-a100-node001', ... }
}
```

#### 示例2：跳跃继承

```typescript
// 场景：成都可用区 → 标准GPU资源池 → GPU-Node-050
const query = {
  resourceType: 'gpu',
  resourceSpec: 'V100-32GB',
  zoneId: 'zone-001',     // 成都可用区A
  poolId: 'pool-002',     // 标准GPU资源池
  nodeId: 'node-050',     // GPU-Node-050
};

// 定价数据：
// - 默认价格: ¥18.0/卡·小时
// - 可用区价格: 未配置
// - 资源池价格: 未配置
// - 节点价格: 未配置

// 查询过程：
// 1. 查找节点价格 → 未找到
// 2. 查找资源池价格 → 未找到
// 3. 查找可用区价格 → 未找到
// 4. 查找默认价格 → 找到 ¥18.0 ✓

// 结果：
{
  pricePerUnit: 18.0,
  unit: '卡·小时',
  scopeChain: ['default'],
  appliedRule: { id: 'default-gpu-v100', ... }
}
```

---

## 3. 资源类型定价逻辑

### 3.1 GPU资源定价

#### 3.1.1 定价维度

| 维度 | 说明 | 示例 |
|------|------|------|
| GPU型号 | 不同型号GPU性能差异大 | A100, V100, T4 |
| 显存大小 | 影响训练任务规模 | 40GB, 80GB |
| 使用场景 | 训练、推理、图形渲染 | 训练优化, 推理优化 |
| 地理位置 | 不同机房成本不同 | 成都, 北京, 上海 |
| 设备状态 | 新设备、老设备 | 新上线, 即将下线 |

#### 3.1.2 定价策略

**策略1：性能分级定价**
```typescript
// 高性能GPU (A100-80GB)
{
  resourceSpec: 'A100-80GB',
  pricePerUnit: 35.0,  // 最高价格
  description: '大显存训练GPU，适合大规模模型'
}

// 中等性能GPU (A100-40GB)
{
  resourceSpec: 'A100-40GB',
  pricePerUnit: 25.0,  // 中等价格
  description: '高性能训练GPU，适合一般训练任务'
}

// 推理优化GPU (T4-16GB)
{
  resourceSpec: 'T4-16GB',
  pricePerUnit: 8.0,   // 较低价格
  description: '推理优化GPU，性价比高'
}
```

**策略2：区域差异定价**
```typescript
// 成都可用区（电力成本低）
{
  scope: 'zone',
  scopeId: 'zone-001',
  resourceSpec: 'A100-40GB',
  pricePerUnit: 23.0,  // 比默认便宜 ¥2
}

// 北京可用区（机房等级高）
{
  scope: 'zone',
  scopeId: 'zone-002',
  resourceSpec: 'A100-40GB',
  pricePerUnit: 26.0,  // 比默认贵 ¥1
}
```

**策略3：设备生命周期定价**
```typescript
// 新设备测试期（吸引用户）
{
  scope: 'node',
  scopeId: 'node-new-001',
  pricePerUnit: 20.0,  // 优惠价
  expiryDate: '2025-01-31T23:59:59Z',  // 测试期结束
}

// 即将下线设备（清库存）
{
  scope: 'node',
  scopeId: 'node-old-099',
  pricePerUnit: 15.0,  // 低价促销
  description: '设备老化，计划下线'
}
```

#### 3.1.3 计费公式

```typescript
GPU费用 = GPU单价 × GPU卡数 × 使用时长

示例：
  2张 A100-40GB × 24小时 × ¥23.0/卡·小时
  = 2 × 24 × 23.0
  = ¥1,104.0
```

---

### 3.2 CPU资源定价

#### 3.2.1 定价维度

| 维度 | 说明 | 示例 |
|------|------|------|
| CPU型号 | Intel, AMD | Xeon, EPYC |
| 核心数 | 影响并行能力 | 8核, 16核, 32核 |
| 主频 | 影响单核性能 | 2.5GHz, 3.0GHz |
| CPU代数 | 新老架构 | 第3代, 第4代 |

#### 3.2.2 定价策略

**统一定价（简化管理）**
```typescript
// CPU核心默认定价
{
  resourceType: 'cpu',
  pricePerUnit: 0.5,  // 每核每小时
  unit: '核·小时',
  description: '通用CPU核心价格'
}
```

**差异化定价（高性能场景）**
```typescript
// 高性能CPU资源池
{
  scope: 'pool',
  scopeId: 'pool-cpu-high',
  resourceType: 'cpu',
  pricePerUnit: 0.8,  // 高性能溢价
  description: '最新一代CPU，主频更高'
}

// 开发测试资源池
{
  scope: 'pool',
  scopeId: 'pool-cpu-dev',
  resourceType: 'cpu',
  pricePerUnit: 0.3,  // 优惠价
  description: '老旧CPU，适合开发测试'
}
```

#### 3.2.3 计费公式

```typescript
CPU费用 = CPU单价 × CPU核数 × 使用时长

示例：
  8核 × 24小时 × ¥0.5/核·小时
  = 8 × 24 × 0.5
  = ¥96.0
```

---

### 3.3 内存资源定价

#### 3.3.1 定价维度

| 维度 | 说明 | 示例 |
|------|------|------|
| 内存大小 | 按GB计费 | 8GB, 16GB, 32GB |
| 内存类型 | DDR4, DDR5 | DDR4-3200, DDR5-4800 |
| 内存速度 | 影响访问速度 | 3200MHz, 4800MHz |

#### 3.3.2 定价策略

**统一定价**
```typescript
// 内存默认定价
{
  resourceType: 'memory',
  pricePerUnit: 0.1,  // 每GB每小时
  unit: 'GB·小时',
}
```

#### 3.3.3 计费公式

```typescript
内存费用 = 内存单价 × 内存大小(GB) × 使用时长

示例：
  32GB × 24小时 × ¥0.1/GB·小时
  = 32 × 24 × 0.1
  = ¥76.8
```

---

### 3.4 存储资源定价

#### 3.4.1 定价维度

| 维度 | 说明 | 示例 |
|------|------|------|
| 存储���型 | 性能差异 | SSD, HDD, NVMe |
| 存储容量 | 阶梯定价 | 0-1TB, 1-10TB, 10TB+ |
| 读写性能 | IOPS, 吞吐量 | 高性能, 标准, 归档 |
| 冗余级别 | 数据安全 | 单副本, 三副本 |

#### 3.4.2 定价策略

**按类型定价**
```typescript
// SSD存储
{
  resourceType: 'storage',
  resourceSpec: 'SSD',
  pricePerUnit: 0.5,  // 每GB每月
  unit: 'GB·月',
  billingCycle: 'monthly',
  description: '高性能SSD存储'
}

// HDD存储
{
  resourceType: 'storage',
  resourceSpec: 'HDD',
  pricePerUnit: 0.2,  // 每GB每月
  unit: 'GB·月',
  billingCycle: 'monthly',
  description: '经济型HDD存储'
}

// NVMe存储（高性能资源池）
{
  scope: 'pool',
  scopeId: 'pool-storage-nvme',
  resourceType: 'storage',
  resourceSpec: 'NVMe',
  pricePerUnit: 0.8,  // 每GB每月
  description: '超高性能NVMe存储'
}
```

**阶梯定价（可选）**
```typescript
// 实现方式：使用折扣系统
if (storageSize >= 10 * 1024) {  // 10TB+
  discount = 0.9;  // 9折
} else if (storageSize >= 1 * 1024) {  // 1TB+
  discount = 0.95;  // 95折
}

finalPrice = basePrice * storageSize * discount;
```

#### 3.4.3 计费公式

```typescript
存储费用 = 存储单价 × 存储容量(GB) × 时长系数

// 按月计费
月度费用 = 存储单价 × 存储容量

// 按天计费（日均价格）
日均费用 = (存储单价 × 存储容量) / 30

// 按小时计费（小时均价）
小时费用 = (存储单价 × 存储容量) / 30 / 24

示例：
  500GB SSD × 1个月 × ¥0.5/GB·月
  = 500 × 1 × 0.5
  = ¥250.0/月
```

---

### 3.5 网络资源定价

#### 3.5.1 定价维度

| 维度 | 说明 | 示例 |
|------|------|------|
| 流量方向 | 入网、出网 | ingress, egress |
| 流量类型 | 公网、内网 | internet, intranet |
| 流量大小 | 阶梯定价 | 0-10TB, 10-50TB, 50TB+ |
| 目标区域 | 跨地域费用 | 同城, 同省, 跨省 |

#### 3.5.2 定价策略

**按流量方向定价**
```typescript
// 出网流量（收费）
{
  resourceType: 'network',
  resourceSpec: 'egress',
  pricePerUnit: 0.8,  // 每GB
  unit: 'GB',
  description: '公网出网流量'
}

// 入网流量（免费）
{
  resourceType: 'network',
  resourceSpec: 'ingress',
  pricePerUnit: 0.0,  // 免费
  unit: 'GB',
  description: '公网入网流量（免费）'
}
```

**跨可用区流量**
```typescript
// 同可用区内（免费）
{
  resourceType: 'network',
  resourceSpec: 'intrazone',
  pricePerUnit: 0.0,
  description: '同可用区内流量（免费）'
}

// 跨可用区（收费）
{
  resourceType: 'network',
  resourceSpec: 'interzone',
  pricePerUnit: 0.1,  // 每GB
  description: '跨可用区流量'
}
```

#### 3.5.3 计费公式

```typescript
网络费用 = 流量单价 × 流量大小(GB)

示例：
  出网流量 100GB × ¥0.8/GB
  = 100 × 0.8
  = ¥80.0
```

---

## 4. 定价查询算法

### 4.1 查询算法伪代码

```typescript
function queryPricing(query: PricingQuery): PricingResult {
  const { resourceType, resourceSpec, zoneId, poolId, nodeId, date } = query;
  
  // 1. 构建查询条件
  const baseConditions = {
    resourceType,
    resourceSpec: resourceSpec || null,
    enabled: true,
    effectiveDate: { $lte: date },
    expiryDate: { $or: [{ $gt: date }, { $eq: null }] }
  };
  
  // 2. 按优先级查询
  let rule: PricingRule | null = null;
  
  // 2.1 节点级
  if (nodeId && !rule) {
    rule = findOne({
      ...baseConditions,
      scope: 'node',
      scopeId: nodeId
    });
  }
  
  // 2.2 资源池级
  if (poolId && !rule) {
    rule = findOne({
      ...baseConditions,
      scope: 'pool',
      scopeId: poolId
    });
  }
  
  // 2.3 可用区级
  if (zoneId && !rule) {
    rule = findOne({
      ...baseConditions,
      scope: 'zone',
      scopeId: zoneId
    });
  }
  
  // 2.4 默认级
  if (!rule) {
    rule = findOne({
      ...baseConditions,
      scope: 'default'
    });
  }
  
  // 3. 未找到则抛出异常
  if (!rule) {
    throw new Error('未找到定价规则');
  }
  
  // 4. 构建继承链
  const scopeChain = buildScopeChain(rule, zoneId, poolId, nodeId);
  
  // 5. 返回结果
  return {
    pricePerUnit: rule.pricePerUnit,
    unit: rule.unit,
    billingCycle: rule.billingCycle,
    currency: rule.currency,
    appliedRule: rule,
    scopeChain
  };
}
```

### 4.2 SQL查询优化

```sql
-- 使用CASE语句实现优先级查询（单次查询）
SELECT 
    id,
    scope,
    price_per_unit,
    unit,
    billing_cycle,
    currency,
    CASE 
        WHEN scope = 'node' THEN 1
        WHEN scope = 'pool' THEN 2
        WHEN scope = 'zone' THEN 3
        WHEN scope = 'default' THEN 4
    END AS priority
FROM pricing_rules
WHERE resource_type = ?
  AND (resource_spec = ? OR resource_spec IS NULL)
  AND enabled = 1
  AND effective_date <= ?
  AND (expiry_date IS NULL OR expiry_date > ?)
  AND (
      (scope = 'node' AND scope_id = ?)
      OR (scope = 'pool' AND scope_id = ?)
      OR (scope = 'zone' AND scope_id = ?)
      OR (scope = 'default' AND scope_id IS NULL)
  )
ORDER BY priority ASC, resource_spec IS NOT NULL DESC
LIMIT 1;
```

---

## 5. 费用计算逻辑

### 5.1 单资源费用计算

```typescript
/**
 * 计算单个资源的费用
 */
async function calculateResourceCost(
  resourceType: ResourceType,
  resourceSpec: string | undefined,
  quantity: number,          // 资源数量
  duration: number,          // 使用时长（小时）
  context: {
    zoneId?: string,
    poolId?: string,
    nodeId?: string
  }
): Promise<CostResult> {
  // 1. 查询定价
  const pricing = await queryPricing({
    resourceType,
    resourceSpec,
    ...context
  });
  
  // 2. 计算基础费用
  let baseCost = pricing.pricePerUnit * quantity * duration;
  
  // 3. 根据计费周期调整
  if (pricing.billingCycle === 'daily') {
    // 按天计费，转换为天数
    baseCost = pricing.pricePerUnit * quantity * (duration / 24);
  } else if (pricing.billingCycle === 'monthly') {
    // 按月计费，转换为月数
    baseCost = pricing.pricePerUnit * quantity * (duration / 24 / 30);
  }
  
  // 4. 返回结果
  return {
    totalCost: baseCost,
    pricePerUnit: pricing.pricePerUnit,
    quantity,
    duration,
    unit: pricing.unit,
    appliedRule: pricing.appliedRule,
    scopeChain: pricing.scopeChain
  };
}
```

### 5.2 综合费用计算

```typescript
/**
 * 计算AI工作负载的综合费用
 */
async function calculateWorkloadCost(
  workload: {
    gpuType: string,
    gpuCount: number,
    cpuCores: number,
    memoryGB: number,
    storageGB: number,
    duration: number,  // 小时
    zoneId: string,
    poolId?: string,
    nodeId?: string
  }
): Promise<ComprehensiveCost> {
  const { gpuType, gpuCount, cpuCores, memoryGB, storageGB, duration, ...context } = workload;
  
  // 1. 计算GPU费用
  const gpuCost = await calculateResourceCost(
    'gpu',
    gpuType,
    gpuCount,
    duration,
    context
  );
  
  // 2. 计算CPU费用
  const cpuCost = await calculateResourceCost(
    'cpu',
    undefined,
    cpuCores,
    duration,
    context
  );
  
  // 3. 计算内存费用
  const memoryCost = await calculateResourceCost(
    'memory',
    undefined,
    memoryGB,
    duration,
    context
  );
  
  // 4. 计算存储费用（按月）
  const storageCost = await calculateResourceCost(
    'storage',
    'SSD',
    storageGB,
    1,  // 按月计费
    context
  );
  
  // 5. 计算总费用
  const totalCost = 
    gpuCost.totalCost +
    cpuCost.totalCost +
    memoryCost.totalCost +
    storageCost.totalCost;
  
  // 6. 返回详细费用明细
  return {
    totalCost,
    breakdown: {
      gpu: gpuCost.totalCost,
      cpu: cpuCost.totalCost,
      memory: memoryCost.totalCost,
      storage: storageCost.totalCost
    },
    details: {
      gpuCost,
      cpuCost,
      memoryCost,
      storageCost
    }
  };
}
```

### 5.3 费用预估

```typescript
/**
 * 预估未来费用
 */
async function estimateFutureCost(
  workload: Workload,
  futureDays: number
): Promise<CostEstimate> {
  // 1. 计算当前配置的小时费用
  const hourlyRate = await calculateWorkloadCost({
    ...workload,
    duration: 1  // 1小时
  });
  
  // 2. 计算日均费用
  const dailyRate = hourlyRate.totalCost * 24;
  
  // 3. 计算月均费用
  const monthlyRate = dailyRate * 30;
  
  // 4. 计算预估总费用
  const estimatedTotal = dailyRate * futureDays;
  
  return {
    hourlyRate: hourlyRate.totalCost,
    dailyRate,
    monthlyRate,
    estimatedTotal,
    estimatedDays: futureDays,
    breakdown: hourlyRate.breakdown
  };
}
```

---

## 6. 缓存策略

### 6.1 缓存层次

```
┌─────────────────────────────────────────┐
│           缓存层次结构                   │
├─────────────────────────────────────────┤
│                                          │
│  L1: 内存缓存 (TTL: 5分钟)               │
│      - 热点定价规则                      │
│      - 常用查询结果                      │
│                                          │
│  L2: Redis缓存 (TTL: 1小时)             │
│      - 定价规则列表                      │
│      - 查询结果缓存                      │
│                                          │
│  L3: 数据库缓存表 (TTL: 1天)            │
│      - pricing_cache表                   │
│      - 历史查询记录                      │
│                                          │
└─────────────────────────────────────────┘
```

### 6.2 缓存键设计

```typescript
// 定价规则缓存键
const rulesCacheKey = `pricing:rules:${scope}:${scopeId}:${resourceType}`;

// 查询结果缓存键
const queryCacheKey = `pricing:query:${hashCode(queryParams)}`;

// 示例
'pricing:rules:zone:zone-001:gpu'
'pricing:query:fb7c8a9d4e3f2a1b'
```

### 6.3 缓存失效策略

```typescript
/**
 * 缓存失效触发条件
 */
const CACHE_INVALIDATION_TRIGGERS = [
  'CREATE_PRICING_RULE',   // 创建新规则
  'UPDATE_PRICING_RULE',   // 更新规则
  'DELETE_PRICING_RULE',   // 删除规则
  'ENABLE_PRICING_RULE',   // 启用规则
  'DISABLE_PRICING_RULE',  // 禁用规则
];

/**
 * 缓存失效逻辑
 */
async function invalidateCache(trigger: string, ruleId: string) {
  const rule = await getPricingRule(ruleId);
  
  // 1. 清除规则缓存
  await cache.delete(`pricing:rules:${rule.scope}:${rule.scopeId}:*`);
  
  // 2. 清除查询缓存
  await cache.delete(`pricing:query:*`);
  
  // 3. 发布缓存失效事件（集群环境）
  await pubsub.publish('pricing:cache:invalidate', { ruleId });
}
```

---

## 7. 特殊场景处理

### 7.1 临时促销定价

```typescript
/**
 * 场景：双十一活动，A100-40GB 打8折
 */
const promotionRule = {
  id: 'promo-2024-1111',
  scope: 'default',
  resourceType: 'gpu',
  resourceSpec: 'A100-40GB',
  pricePerUnit: 20.0,  // 原价 ¥25.0，促销价 ¥20.0
  unit: '卡·小时',
  billingCycle: 'hourly',
  currency: 'CNY',
  enabled: true,
  effectiveDate: '2024-11-11T00:00:00Z',
  expiryDate: '2024-11-11T23:59:59Z',  // 仅当天有效
  description: '双十一促销活动'
};

// 活动结束后自动失效，恢复原价
```

### 7.2 新设备测试定价

```typescript
/**
 * 场景：新上线的A100设备，提供测试优惠
 */
const testingRule = {
  id: 'test-node-new-001',
  scope: 'node',
  scopeId: 'node-new-001',
  resourceType: 'gpu',
  resourceSpec: 'A100-40GB',
  pricePerUnit: 20.0,  // 测试价
  effectiveDate: '2024-12-01T00:00:00Z',
  expiryDate: '2025-01-31T23:59:59Z',  // 2个月测试期
  description: '新设备测试期优惠价'
};
```

### 7.3 设备下线清库存

```typescript
/**
 * 场景：老旧V100设备即将下线，低价促销
 */
const deprecatedRule = {
  id: 'deprecated-node-099',
  scope: 'node',
  scopeId: 'node-099',
  resourceType: 'gpu',
  resourceSpec: 'V100-32GB',
  pricePerUnit: 12.0,  // 原价 ¥18.0，清库存价 ¥12.0
  effectiveDate: '2024-12-01T00:00:00Z',
  expiryDate: '2024-12-31T23:59:59Z',  // 年底下线
  description: '设备即将下线，清库存优惠'
};
```

### 7.4 批量定价调整

```typescript
/**
 * 场景：成都可用区所有GPU价格统一下调10%
 */
async function bulkPriceAdjustment() {
  // 1. 查询所有相关规则
  const rules = await getPricingRulesByScope('zone', 'zone-001');
  const gpuRules = rules.filter(r => r.resourceType === 'gpu');
  
  // 2. 批量更新
  for (const rule of gpuRules) {
    await savePricingRule({
      ...rule,
      pricePerUnit: rule.pricePerUnit * 0.9,  // 下调10%
      description: `${rule.description} (调价: -10%)`
    });
  }
  
  // 3. 记录变更
  await logPriceChange({
    scope: 'zone',
    scopeId: 'zone-001',
    changeType: 'bulk_adjustment',
    changeRate: -0.1,
    reason: '成都可用区电力成本下降'
  });
}
```

### 7.5 用户等级定价（结合折扣）

```typescript
/**
 * 场景：VIP用户享受额外折扣
 * 注意：这部分逻辑在折扣系统中实现，不在定价系统
 */
async function calculateVIPCost(userId: string, baseCost: number) {
  // 1. 查询用户等级
  const user = await getUser(userId);
  
  // 2. 查询用户折扣
  let discount = 1.0;
  if (user.level === 'VIP') {
    discount = 0.9;  // 9折
  } else if (user.level === 'SVIP') {
    discount = 0.85;  // 85折
  }
  
  // 3. 应用折扣
  const finalCost = baseCost * discount;
  
  return {
    baseCost,
    discount,
    finalCost,
    saved: baseCost - finalCost
  };
}
```

---

## 📝 总结

### 核心要点

1. **四级分层定价**：default → zone → pool → node
2. **自动继承机制**：简化配置，降低运维成本
3. **灵活差异化**：支持各种定价策略
4. **高性能查询**：缓存 + 索引优化
5. **完整审计**：记录所有变更历史

### 最佳实践

- ✅ 优先配置默认定价，作为基准
- ✅ 仅在有差异时配置上层定价
- ✅ 定期审查和清理过期规则
- ✅ 使用描述字段记录定价原因
- ✅ 重大调价前做好备份和通知

### 扩展方向

- 🔄 支持动态定价（基于负载、时段）
- 📊 价格趋势分析和优化建议
- 🎯 智能定价推荐
- 💰 成本预测和预警

---

**文档版本**: v1.0.0  
**最后更新**: 2024-12-06  
**维护团队**: 费米集群开发团队
