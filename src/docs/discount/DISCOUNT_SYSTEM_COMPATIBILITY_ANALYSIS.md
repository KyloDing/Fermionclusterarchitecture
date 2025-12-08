# 折扣系统兼容性分析与改造方案 🔄

## 📋 文档概述

本文档对比现有折扣管理系统与新设计方案，梳理兼容性问题并提出改造建议。

---

## 一、现有系统 vs 新设计方案对比

### 1.1 数据模型对比

#### 现有模型（DiscountManagementPage.tsx）

```typescript
interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'coupon' | 'time-based' | 'volume-based';
  value: number;
  description: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
  appliesTo: string[];          // 资源类型列表
  conditions?: string;          // 自由文本描述
  usageCount?: number;
  maxUsage?: number;
}
```

#### 新设计方案（DiscountRule）

```typescript
interface DiscountRule {
  // 基础信息
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  priority: number;
  effectiveDate: datetime;
  expiryDate?: datetime;
  
  // 触发条件（结构化）
  conditions: {
    targetUserTypes?: string[];       // ['INDIVIDUAL', 'ENTERPRISE']
    firstOrderOnly?: boolean;
    targetResourceTypes?: string[];
    targetResourceSpecs?: string[];
    minAmount?: number;
    minUsageHours?: number;
    targetZones?: string[];
  };
  
  // 折扣动作（结构化）
  action: {
    type: 'PERCENTAGE' | 'FIXED' | 'CAPPED';
    discountRate?: number;
    fixedDeduction?: number;
    maxDeduction?: number;
    exclusive?: boolean;
  };
  
  // 统计信息
  usageCount?: number;
  maxUsage?: number;
}
```

### 1.2 差异对比表

| 维度 | 现有系统 | 新设计方案 | 兼容性 |
|------|----------|------------|--------|
| **基础字段** | ✅ id, name, description | ✅ id, name, description | ✅ 完全兼容 |
| **时间管理** | startDate, endDate | effectiveDate, expiryDate | ⚠️ 字段名不同 |
| **状态管理** | enabled: boolean | status: enum (DRAFT/ACTIVE/INACTIVE) | ⚠️ 需扩展 |
| **折扣类型** | type: string (5种类型) | 分离为 conditions + action | ❌ 结构性差异 |
| **折扣值** | value: number (单一字段) | action.{rate/deduction/cap} | ❌ 需重构 |
| **适用范围** | appliesTo: string[] | conditions.targetResourceTypes | ⚠️ 字段位置不同 |
| **条件定义** | conditions: string (自由文本) | conditions: object (结构化) | ❌ 需重构 |
| **优先级** | ❌ 无 | priority: number | ❌ 新增功能 |
| **用户筛选** | ❌ 无 | conditions.targetUserTypes | ❌ 新增功能 |
| **首单限制** | ❌ 无（在 conditions 文本中） | conditions.firstOrderOnly | ❌ 新增功能 |
| **用量门槛** | ❌ 无 | conditions.minAmount/minUsageHours | ❌ 新增功能 |
| **地域限制** | ❌ 无 | conditions.targetZones | ❌ 新增功能 |
| **互斥策略** | ❌ 无 | action.exclusive | ❌ 新增功能 |

---

## 二、兼容性分析

### 2.1 完全兼容的部分 ✅

| 功能 | 说明 |
|------|------|
| 规则列表 | 基础 CRUD 操作逻辑一致 |
| 启用/禁用 | 现有 `enabled` 可映射为 `status: ACTIVE/INACTIVE` |
| 基础信息 | id、name、description 完全兼容 |
| 统计功能 | usageCount、maxUsage 保留 |

### 2.2 需要适配的部分 ⚠️

#### 1. **时间字段映射**

**现有**:
```typescript
startDate: string  // '2024-01-01'
endDate: string    // '2024-12-31'
```

**新方案**:
```typescript
effectiveDate: datetime  // '2024-01-01T00:00:00Z'
expiryDate?: datetime    // '2024-12-31T23:59:59Z'
```

**改造方案**:
- 数据迁移时转换日期格式
- UI 组件使用日期时间选择器（支持到秒）

---

#### 2. **状态管理扩展**

**现有**:
```typescript
enabled: boolean  // true/false
```

**新方案**:
```typescript
status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
```

**映射规则**:
```typescript
// 迁移逻辑
if (enabled === true) {
  status = 'ACTIVE';
} else {
  status = 'INACTIVE';
}
// 新增状态: DRAFT（草稿）
```

---

#### 3. **适用范围重构**

**现有**:
```typescript
appliesTo: ['gpu', 'cpu', 'memory']
```

**新方案**:
```typescript
conditions: {
  targetResourceTypes: ['gpu', 'cpu', 'memory'],
  targetResourceSpecs: ['A100-80GB', 'V100-32GB']  // 新增：细化到规格
}
```

**改造方案**:
- 保留 `targetResourceTypes` 映射到 `appliesTo`
- 新增 `targetResourceSpecs` 字段（可选）

---

### 2.3 需要重构的部分 ❌

#### 1. **折扣类型重构** （核心变更）

**现有设计**（混合模式）:
```typescript
type: 'percentage' | 'fixed' | 'coupon' | 'time-based' | 'volume-based'
value: number
```

**问题**:
- `type` 混合了折扣方式和触发条件
- `time-based` 和 `volume-based` 实际是触发条件，不是折扣类型
- 无法表达"时段+比例折扣"或"批量+固定减免"的组合

**新设计**（分离模式）:

```typescript
// 触发条件（Condition）
conditions: {
  // 时段条件（原 time-based）
  timeRange?: {
    startHour: 0,   // 00:00
    endHour: 6      // 06:00
  },
  
  // 用量条件（原 volume-based）
  minQuantity?: 10,  // ≥10卡
  
  // 用户条件（新增）
  targetUserTypes?: ['INDIVIDUAL'],
  firstOrderOnly?: true
}

// 折扣动作（Action）
action: {
  type: 'PERCENTAGE' | 'FIXED' | 'CAPPED',
  discountRate?: 0.8,        // 8折
  fixedDeduction?: 100,      // 减100元
  maxDeduction?: 200,        // 最多减200元
  exclusive?: false          // 是否互斥
}
```

**迁移映射表**:

| 现有 type | 新 conditions | 新 action | 示例 |
|-----------|---------------|-----------|------|
| percentage | - | type: PERCENTAGE<br>discountRate: 0.8 | 8折 |
| fixed | - | type: FIXED<br>fixedDeduction: 100 | 减100元 |
| coupon | firstOrderOnly: true | type: PERCENTAGE<br>discountRate: 0.9 | 新用户9折券 |
| time-based | timeRange: {0-6} | type: PERCENTAGE<br>discountRate: 0.7 | 夜间7折 |
| volume-based | minQuantity: 10 | type: PERCENTAGE<br>discountRate: 0.85 | 批量85折 |

---

#### 2. **条件系统重构**

**现有**:
```typescript
conditions: "仅限新用户首单"  // 自由文本，无法程序判断
```

**新方案**:
```typescript
conditions: {
  targetUserTypes: ['INDIVIDUAL'],  // 结构化，可程序判断
  firstOrderOnly: true,
  targetResourceTypes: ['gpu'],
  targetResourceSpecs: ['A100-80GB'],
  minAmount: 1000,              // 消费满1000
  minUsageHours: 100,           // 使用≥100小时
  targetZones: ['zone-cd-01']   // 限成都可用区
}
```

**改造价值**:
- ✅ 可程序化判断
- ✅ 支持复杂条件组合
- ✅ 便于前端动态表单渲染
- ✅ 便于后端规则引擎执行

---

## 三、改造方案

### 3.1 渐进式改造路线

#### **阶段 1：数据模型扩展**（向后兼容）

```typescript
interface DiscountRule {
  // === 保留现有字段（兼容旧数据）===
  id: string;
  name: string;
  description: string;
  enabled: boolean;              // 保留
  appliesTo: string[];           // 保留
  
  // === 新增字段 ===
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';  // 逐步替代 enabled
  priority?: number;
  
  // === 时间字段升级 ===
  startDate: string;             // 保留（兼容）
  endDate: string;               // 保留
  effectiveDate?: string;        // 新增（ISO 8601格式）
  expiryDate?: string;           // 新增
  
  // === 结构化条件（新增）===
  conditions?: {
    targetUserTypes?: string[];
    firstOrderOnly?: boolean;
    targetResourceTypes?: string[];
    targetResourceSpecs?: string[];
    minAmount?: number;
    minUsageHours?: number;
    targetZones?: string[];
    timeRange?: { startHour: number; endHour: number };
    minQuantity?: number;
  };
  
  // === 结构化动作（新增）===
  action?: {
    type: 'PERCENTAGE' | 'FIXED' | 'CAPPED';
    discountRate?: number;
    fixedDeduction?: number;
    maxDeduction?: number;
    exclusive?: boolean;
  };
  
  // === 旧字段（保留作为降级）===
  type?: 'percentage' | 'fixed' | 'coupon' | 'time-based' | 'volume-based';
  value?: number;
}
```

**兼容性策略**:
```typescript
// 读取时优先使用新字段
function getDiscountStatus(rule: DiscountRule) {
  return rule.status || (rule.enabled ? 'ACTIVE' : 'INACTIVE');
}

// 保存时同时更新新旧字段
function saveDiscount(rule: DiscountRule) {
  rule.enabled = (rule.status === 'ACTIVE');
  rule.effectiveDate = rule.startDate;
  rule.expiryDate = rule.endDate;
  // ...
}
```

---

#### **阶段 2：UI 改造**

**2.1 列表页增强**

```typescript
// 新增状态筛选
<Select>
  <SelectItem value="all">全部状态</SelectItem>
  <SelectItem value="ACTIVE">进行中</SelectItem>
  <SelectItem value="DRAFT">草稿</SelectItem>
  <SelectItem value="INACTIVE">已停用</SelectItem>
</Select>

// 新增优先级列
<TableHead>优先级</TableHead>
<TableCell>{rule.priority || '-'}</TableCell>
```

**2.2 表单页重构**

**Tab 1: 基础信息**（保持不变）
```typescript
- 规则名称
- 描述
- 生效时间（升级为 datetime-local）
- 失效时间
- 优先级（新增）
```

**Tab 2: 触发条件**（重构）
```typescript
// 用户条件（新增）
☑ 用户类型: [个人] [企业] [教育]
☑ 仅限首单: Switch

// 资源条件（增强）
☑ 资源类型: [GPU] [CPU] [存储]
☑ 资源规格: <MultiSelect options={specs} />  // 新增

// 时段条件（从 type 迁移）
☑ 时段限制: 00:00 - 06:00

// 用量条件（从 type 迁移）
☑ 最低数量: ___ 卡
☑ 最低金额: ¥ ___
☑ 最低时长: ___ 小时

// 地域条件（新增）
☑ 可用区: [成都A] [北京B]
```

**Tab 3: 折扣动作**（重构）
```typescript
// 折扣方式（从 type/value 迁移）
○ 比例折扣: 打 [8] 折
○ 固定减免: 减 ¥ [100]
○ 封顶优惠: 减 ¥ [___], 最多减 ¥ [200]

// 叠加策略（新增）
☑ 不可与其他优惠叠加
```

---

#### **阶段 3：业务逻辑改造**

**3.1 折扣匹配引擎**

```typescript
// 旧版（简单匹配）
function matchDiscount(order: Order): Discount | null {
  const discounts = allDiscounts.filter(d => d.enabled);
  return discounts.find(d => {
    return d.appliesTo.includes(order.resourceType);
  });
}

// 新版（条件引擎）
function matchDiscounts(order: Order, user: User): DiscountRule[] {
  const activeRules = allRules.filter(r => r.status === 'ACTIVE');
  
  return activeRules
    .filter(rule => checkConditions(rule.conditions, order, user))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

function checkConditions(
  conditions: Conditions,
  order: Order,
  user: User
): boolean {
  // 用户类型检查
  if (conditions.targetUserTypes) {
    if (!conditions.targetUserTypes.includes(user.type)) {
      return false;
    }
  }
  
  // 首单检查
  if (conditions.firstOrderOnly && user.orderCount > 0) {
    return false;
  }
  
  // 资源类型检查
  if (conditions.targetResourceTypes) {
    if (!conditions.targetResourceTypes.includes(order.resourceType)) {
      return false;
    }
  }
  
  // 资源规格检查
  if (conditions.targetResourceSpecs) {
    if (!conditions.targetResourceSpecs.includes(order.resourceSpec)) {
      return false;
    }
  }
  
  // 金额门槛检查
  if (conditions.minAmount && order.amount < conditions.minAmount) {
    return false;
  }
  
  // 用量门槛检查
  if (conditions.minUsageHours && order.hours < conditions.minUsageHours) {
    return false;
  }
  
  // 地域检查
  if (conditions.targetZones) {
    if (!conditions.targetZones.includes(order.zoneId)) {
      return false;
    }
  }
  
  // 时段检查
  if (conditions.timeRange) {
    const hour = new Date().getHours();
    if (hour < conditions.timeRange.startHour || 
        hour >= conditions.timeRange.endHour) {
      return false;
    }
  }
  
  // 数量检查
  if (conditions.minQuantity && order.quantity < conditions.minQuantity) {
    return false;
  }
  
  return true;
}
```

**3.2 折扣计算引擎**

```typescript
// 旧版（单一计算）
function calculateDiscount(amount: number, discount: Discount): number {
  if (discount.type === 'percentage') {
    return amount * (1 - discount.value / 100);
  } else if (discount.type === 'fixed') {
    return Math.max(0, amount - discount.value);
  }
  return amount;
}

// 新版（支持叠加和互斥）
function applyDiscounts(
  amount: number,
  matchedRules: DiscountRule[]
): {
  finalAmount: number;
  appliedRules: DiscountRule[];
  totalSaved: number;
} {
  let currentAmount = amount;
  const appliedRules: DiscountRule[] = [];
  
  for (const rule of matchedRules) {
    // 检查互斥策略
    if (rule.action.exclusive && appliedRules.length > 0) {
      break;  // 遇到互斥规则且已有折扣，停止
    }
    
    const beforeAmount = currentAmount;
    
    // 应用折扣
    if (rule.action.type === 'PERCENTAGE') {
      currentAmount = currentAmount * (rule.action.discountRate || 1);
    } else if (rule.action.type === 'FIXED') {
      currentAmount = Math.max(0, currentAmount - (rule.action.fixedDeduction || 0));
    } else if (rule.action.type === 'CAPPED') {
      const saved = currentAmount * (1 - (rule.action.discountRate || 1));
      const actualSaved = Math.min(saved, rule.action.maxDeduction || 0);
      currentAmount = currentAmount - actualSaved;
    }
    
    appliedRules.push(rule);
    
    // 如果本规则是互斥的，停止后续折扣
    if (rule.action.exclusive) {
      break;
    }
  }
  
  return {
    finalAmount: currentAmount,
    appliedRules,
    totalSaved: amount - currentAmount
  };
}
```

---

### 3.2 数据库迁移脚本

```sql
-- 1. 添加新字段
ALTER TABLE discount_rules ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE discount_rules ADD COLUMN priority INT DEFAULT 100;
ALTER TABLE discount_rules ADD COLUMN effective_date TIMESTAMP;
ALTER TABLE discount_rules ADD COLUMN expiry_date TIMESTAMP;
ALTER TABLE discount_rules ADD COLUMN conditions JSON;
ALTER TABLE discount_rules ADD COLUMN action JSON;

-- 2. 数据迁移
UPDATE discount_rules SET
  status = CASE WHEN enabled = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END,
  effective_date = CONCAT(start_date, ' 00:00:00'),
  expiry_date = CONCAT(end_date, ' 23:59:59'),
  conditions = JSON_OBJECT(
    'targetResourceTypes', JSON_ARRAY(applies_to)
  ),
  action = CASE type
    WHEN 'percentage' THEN JSON_OBJECT(
      'type', 'PERCENTAGE',
      'discountRate', 1 - (value / 100)
    )
    WHEN 'fixed' THEN JSON_OBJECT(
      'type', 'FIXED',
      'fixedDeduction', value
    )
    WHEN 'time-based' THEN JSON_OBJECT(
      'type', 'PERCENTAGE',
      'discountRate', 1 - (value / 100)
    )
    WHEN 'volume-based' THEN JSON_OBJECT(
      'type', 'PERCENTAGE',
      'discountRate', 1 - (value / 100)
    )
  END;

-- 3. 从 conditions 文本中提取结构化数据（需手动）
-- 示例：conditions = "仅限新用户首单"
UPDATE discount_rules 
SET conditions = JSON_SET(
  conditions,
  '$.firstOrderOnly', true,
  '$.targetUserTypes', JSON_ARRAY('INDIVIDUAL')
)
WHERE conditions_text LIKE '%新用户%';

-- 4. 提取时段条件
-- 示例：conditions = "每日00:00-06:00"
UPDATE discount_rules
SET conditions = JSON_SET(
  conditions,
  '$.timeRange', JSON_OBJECT('startHour', 0, 'endHour', 6)
)
WHERE type = 'time-based' AND conditions_text LIKE '%00:00-06:00%';

-- 5. 提取用量条件
-- 示例：conditions = "≥10卡"
UPDATE discount_rules
SET conditions = JSON_SET(
  conditions,
  '$.minQuantity', 10
)
WHERE type = 'volume-based' AND conditions_text LIKE '%≥10%';
```

---

## 四、与定价系统的集成改造

### 4.1 现有集成点

**当前流程**（简单）:
```typescript
// 1. 查询定价
const pricing = await queryPricing({ resourceType, resourceSpec, ... });

// 2. 计算费用
const baseCost = pricing.pricePerUnit * quantity * duration;

// 3. 应用折扣（简单）
const discount = findDiscount(resourceType);
const finalCost = applyDiscount(baseCost, discount);
```

---

### 4.2 新集成方案

#### **方案 A：定价优先模式**（推荐）

```typescript
// Step 1: 定价服务（不变）
const pricingResult = await pricingService.queryPricing({
  resourceType: 'gpu',
  resourceSpec: 'A100-80GB',
  zoneId: 'zone-cd-01',
  poolId: 'pool-001',
  nodeId: 'node-001'
});

// Step 2: 计算基础费用（不变）
const baseCost = pricingResult.pricePerUnit * quantity * duration;

// Step 3: 折扣匹配（增强）
const matchedDiscounts = await discountService.matchDiscounts({
  userId: 'user-001',
  resourceType: 'gpu',
  resourceSpec: 'A100-80GB',
  zoneId: 'zone-cd-01',
  quantity: 8,
  duration: 24,
  amount: baseCost
});

// Step 4: 应用折扣（增强）
const discountResult = await discountService.applyDiscounts(
  baseCost,
  matchedDiscounts
);

// Step 5: 生成账单
const bill = {
  originalAmount: baseCost,
  discountAmount: discountResult.totalSaved,
  finalAmount: discountResult.finalAmount,
  appliedPricing: pricingResult.appliedRule,
  appliedDiscounts: discountResult.appliedRules,
  breakdown: {
    pricing: {
      pricePerUnit: pricingResult.pricePerUnit,
      quantity: quantity,
      duration: duration
    },
    discounts: discountResult.appliedRules.map(r => ({
      ruleId: r.id,
      ruleName: r.name,
      savedAmount: r.savedAmount
    }))
  }
};
```

---

#### **方案 B：统一计费API**

```typescript
// 单一入口
const billResult = await billingService.calculate({
  // 用户信息
  userId: 'user-001',
  userType: 'INDIVIDUAL',
  isFirstOrder: true,
  
  // 资源信息
  resourceType: 'gpu',
  resourceSpec: 'A100-80GB',
  quantity: 8,
  duration: 24,
  
  // 位置信息
  zoneId: 'zone-cd-01',
  poolId: 'pool-001',
  nodeId: 'node-001',
  
  // 时间信息
  orderTime: new Date()
});

// 返回完整计费结果
{
  // 原价信息
  pricing: {
    pricePerUnit: 23.0,
    scopeChain: ['default', 'zone:zone-cd-01'],
    appliedRule: { id: 'zone-gpu-a100-cd', ... }
  },
  
  // 折扣信息
  discounts: {
    matchedRules: [
      { id: 'disc-newuser', name: '新用户9折', saved: 35.2 },
      { id: 'disc-volume', name: '批量折扣', saved: 18.4 }
    ],
    totalSaved: 53.6
  },
  
  // 费用汇总
  summary: {
    originalAmount: 4416.0,   // 23 * 8 * 24
    discountAmount: 53.6,
    finalAmount: 4362.4,
    currency: 'CNY'
  }
}
```

---

### 4.3 API 设计

#### **新增折扣服务 API**

```typescript
// API 1: 匹配折扣规则
POST /api/v1/discounts/match
Request:
{
  "userId": "user-001",
  "resourceType": "gpu",
  "resourceSpec": "A100-80GB",
  "zoneId": "zone-cd-01",
  "quantity": 8,
  "duration": 24,
  "amount": 4416.0
}

Response:
{
  "matchedRules": [
    {
      "id": "disc-newuser-2025",
      "name": "新用户首单9折",
      "priority": 10,
      "action": {
        "type": "PERCENTAGE",
        "discountRate": 0.9
      }
    }
  ]
}

// API 2: 应用折扣计算
POST /api/v1/discounts/apply
Request:
{
  "amount": 4416.0,
  "ruleIds": ["disc-newuser-2025", "disc-volume-10"]
}

Response:
{
  "finalAmount": 4362.4,
  "totalSaved": 53.6,
  "appliedRules": [
    {
      "ruleId": "disc-newuser-2025",
      "ruleName": "新用户首单9折",
      "savedAmount": 35.2
    }
  ]
}

// API 3: 预览折扣效果（测试工具）
POST /api/v1/discounts/preview
Request:
{
  "ruleId": "disc-newuser-2025",
  "testCase": {
    "userId": "user-test-001",
    "resourceType": "gpu",
    "resourceSpec": "A100-80GB",
    "amount": 1000.0
  }
}

Response:
{
  "matched": true,
  "originalAmount": 1000.0,
  "finalAmount": 900.0,
  "savedAmount": 100.0,
  "matchDetails": {
    "userTypeMatched": true,
    "firstOrderMatched": true,
    "resourceMatched": true
  }
}
```

---

## 五、改造优先级建议

### P0（核心功能）- 第1-2周

- [x] 数据模型扩展（兼容旧数据）
- [x] 状态管理升级（DRAFT/ACTIVE/INACTIVE）
- [x] 条件系统重构（结构化）
- [x] 折扣动作重构（分离 action）
- [x] 基础 CRUD API

### P1（增强功能）- 第3-4周

- [ ] 优先级机制
- [ ] 用户类型筛选
- [ ] 首单限制
- [ ] 用量门槛
- [ ] 地域限制
- [ ] 折扣预览工具

### P2（高级功能）- 第5-6周

- [ ] 互斥策略
- [ ] 审批流
- [ ] 版本快照
- [ ] 批量导入/导出
- [ ] 折扣效果分析

---

## 六、风险与建议

### 6.1 风险点

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 旧数据迁移失败 | ⚠️ 高 | 1. 充分测试迁移脚本<br>2. 保留旧字段作为降级<br>3. 分批迁移 |
| 前后端接口不一致 | ⚠️ 中 | 1. API 版本控制<br>2. 同时支持新旧字段<br>3. 文档同步更新 |
| 业务逻辑复杂度增加 | ⚠️ 中 | 1. 单元测试覆盖<br>2. 预览工具辅助验证<br>3. 灰度发布 |

### 6.2 改造建议

1. **向后兼容优先**
   - 新增字段而非替换
   - 保留旧字段作为降级路径
   - 读取时优先使用新字段

2. **渐进式改造**
   - 先扩展数据模型
   - 再重构 UI
   - 最后优化算法

3. **充分测试**
   - 旧数据迁移测试
   - 新旧接口兼容性测试
   - 折扣计算正确性测试

4. **文档先行**
   - 迁移方案文档
   - API 变更文档
   - 用户使用指南

---

## 七、总结

### 兼容性评估

| 维度 | 兼容性 | 说明 |
|------|--------|------|
| 数据模型 | ⚠️ 60% | 基础字段兼容，需扩展结构化条件和动作 |
| UI 界面 | ⚠️ 70% | 基础 CRUD 兼容，需增强条件配置表单 |
| 业务逻辑 | ❌ 40% | 需重构匹配引擎和计算引擎 |
| API 接口 | ⚠️ 50% | 基础 API 兼容，需新增预览和匹配接口 |

### 改造工作量估算

| 模块 | 工作量 | 说明 |
|------|--------|------|
| 数据模型 | 2天 | 扩展字段、迁移脚本 |
| UI 重构 | 5天 | 表单改造、预览工具 |
| 业务逻辑 | 8天 | 匹配引擎、计算引擎 |
| API 开发 | 3天 | 新增接口、文档 |
| 测试 | 5天 | 单元测试、集成测试 |
| **总计** | **23天** | 约1个月（含联调） |

### 关键改造点

1. ✅ **结构化条件** - 从自由文本到结构化对象
2. ✅ **分离动作** - 条件和折扣方式解耦
3. ✅ **优先级机制** - 支持复杂折扣组合
4. ✅ **互斥策略** - 控制折扣叠加
5. ✅ **预览工具** - 可视化测试折扣效果

---

**文档版本**: v1.0.0  
**编写日期**: 2024-12-07  
**维护团队**: 费米集群开发团队
