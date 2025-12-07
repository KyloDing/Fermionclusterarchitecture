/**
 * 资源定价服务
 * 支持分层定价：默认价格 -> 可用区价格 -> 资源池价格 -> 节点价格
 */

// 资源类型
export type ResourceType = 'gpu' | 'cpu' | 'memory' | 'storage' | 'network';

// 计费周期
export type BillingCycle = 'hourly' | 'daily' | 'monthly';

// 定价范围（层级）
export type PricingScope = 'default' | 'zone' | 'pool' | 'node';

// 基础定价规则
export interface PricingRule {
  id: string;
  scope: PricingScope;
  scopeId?: string; // zone_id, pool_id, or node_id
  scopeName?: string; // 范围名称，用于显示
  resourceType: ResourceType;
  resourceSpec?: string; // 资源规格，如 'A100-40GB', 'V100', '通用CPU'
  unit: string; // 计费单位，如 '卡·小时', '核·小时', 'GB·小时'
  pricePerUnit: number; // 单价
  billingCycle: BillingCycle;
  currency: string; // 货币单位
  enabled: boolean;
  effectiveDate: string; // 生效日期
  expiryDate?: string; // 失效日期
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// 定价查询条件
export interface PricingQuery {
  resourceType: ResourceType;
  resourceSpec?: string;
  zoneId?: string;
  poolId?: string;
  nodeId?: string;
  date?: string; // 查询指定日期的价格
}

// 定价计算结果
export interface PricingResult {
  resourceType: ResourceType;
  resourceSpec?: string;
  pricePerUnit: number;
  unit: string;
  billingCycle: BillingCycle;
  currency: string;
  appliedRule: PricingRule; // 实际应用的定价规则
  scopeChain: string[]; // 定价继承链，如 ['default', 'zone:zone-001', 'pool:pool-002']
}

// 批量定价查询结果
export interface BatchPricingResult {
  [key: string]: PricingResult; // key = resourceType:resourceSpec
}

// 模拟数据：默认定价规则
const mockDefaultPricing: PricingRule[] = [
  // GPU定价
  {
    id: 'default-gpu-a100-40',
    scope: 'default',
    resourceType: 'gpu',
    resourceSpec: 'A100-40GB',
    unit: '卡·小时',
    pricePerUnit: 25.0,
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: 'NVIDIA A100 40GB默认价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'default-gpu-a100-80',
    scope: 'default',
    resourceType: 'gpu',
    resourceSpec: 'A100-80GB',
    unit: '卡·小时',
    pricePerUnit: 35.0,
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: 'NVIDIA A100 80GB默认价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'default-gpu-v100',
    scope: 'default',
    resourceType: 'gpu',
    resourceSpec: 'V100-32GB',
    unit: '卡·小时',
    pricePerUnit: 18.0,
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: 'NVIDIA V100 32GB默认价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'default-gpu-t4',
    scope: 'default',
    resourceType: 'gpu',
    resourceSpec: 'T4-16GB',
    unit: '卡·小时',
    pricePerUnit: 8.0,
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: 'NVIDIA T4 16GB默认价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  // CPU定价
  {
    id: 'default-cpu',
    scope: 'default',
    resourceType: 'cpu',
    unit: '核·小时',
    pricePerUnit: 0.5,
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: 'CPU核心默认价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  // 内存定价
  {
    id: 'default-memory',
    scope: 'default',
    resourceType: 'memory',
    unit: 'GB·小时',
    pricePerUnit: 0.1,
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: '内存默认价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  // 存储定价
  {
    id: 'default-storage-ssd',
    scope: 'default',
    resourceType: 'storage',
    resourceSpec: 'SSD',
    unit: 'GB·月',
    pricePerUnit: 0.5,
    billingCycle: 'monthly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: 'SSD存储默认价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'default-storage-hdd',
    scope: 'default',
    resourceType: 'storage',
    resourceSpec: 'HDD',
    unit: 'GB·月',
    pricePerUnit: 0.2,
    billingCycle: 'monthly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: 'HDD存储默认价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  // 网络定价
  {
    id: 'default-network-egress',
    scope: 'default',
    resourceType: 'network',
    resourceSpec: 'egress',
    unit: 'GB',
    pricePerUnit: 0.8,
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: '出网流量默认价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'default-network-ingress',
    scope: 'default',
    resourceType: 'network',
    resourceSpec: 'ingress',
    unit: 'GB',
    pricePerUnit: 0.0,
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: '入网流量默认价格（免费）',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
];

// 模拟数据：可用区定价（覆盖默认价格）
const mockZonePricing: PricingRule[] = [
  {
    id: 'zone-gpu-a100-40-zone001',
    scope: 'zone',
    scopeId: 'zone-001',
    scopeName: '成都可用区A',
    resourceType: 'gpu',
    resourceSpec: 'A100-40GB',
    unit: '卡·小时',
    pricePerUnit: 23.0, // 比默认价格便宜2元
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: '成都可用区A100优惠价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  },
  {
    id: 'zone-storage-ssd-zone002',
    scope: 'zone',
    scopeId: 'zone-002',
    scopeName: '北京可用区A',
    resourceType: 'storage',
    resourceSpec: 'SSD',
    unit: 'GB·月',
    pricePerUnit: 0.6, // 比默认价格贵0.1元
    billingCycle: 'monthly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: '北京可用区SSD存储价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  },
];

// 模拟数据：资源池定价（覆盖可用区和默认价格）
const mockPoolPricing: PricingRule[] = [
  {
    id: 'pool-gpu-v100-pool001',
    scope: 'pool',
    scopeId: 'pool-001',
    scopeName: '高性能GPU资源池',
    resourceType: 'gpu',
    resourceSpec: 'V100-32GB',
    unit: '卡·小时',
    pricePerUnit: 20.0, // 比默认价格贵2元
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: '高性能GPU资源池V100价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  },
];

// 模拟数据：节点定价（覆盖资源池、可用区和默认价格）
const mockNodePricing: PricingRule[] = [
  {
    id: 'node-gpu-a100-node001',
    scope: 'node',
    scopeId: 'node-001',
    scopeName: 'GPU-Node-001',
    resourceType: 'gpu',
    resourceSpec: 'A100-40GB',
    unit: '卡·小时',
    pricePerUnit: 22.0, // 特殊节点价格
    billingCycle: 'hourly',
    currency: 'CNY',
    enabled: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    description: '节点001的A100特殊价格',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  },
];

// 合并所有定价规则
const allPricingRules = [
  ...mockDefaultPricing,
  ...mockZonePricing,
  ...mockPoolPricing,
  ...mockNodePricing,
];

/**
 * 获取所有定价规则
 */
export async function getAllPricingRules(): Promise<PricingRule[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...allPricingRules]);
    }, 300);
  });
}

/**
 * 根据范围获取定价规则
 */
export async function getPricingRulesByScope(
  scope: PricingScope,
  scopeId?: string
): Promise<PricingRule[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = allPricingRules.filter((rule) => rule.scope === scope);
      if (scopeId) {
        filtered = filtered.filter((rule) => rule.scopeId === scopeId);
      }
      resolve(filtered);
    }, 300);
  });
}

/**
 * 查询资源价格（支持分层定价继承）
 * 优先级：节点价格 > 资源池价格 > 可用区价格 > 默认价格
 */
export async function queryPricing(query: PricingQuery): Promise<PricingResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const {
        resourceType,
        resourceSpec,
        zoneId,
        poolId,
        nodeId,
        date = new Date().toISOString(),
      } = query;

      // 定价继承链
      const scopeChain: string[] = [];
      let appliedRule: PricingRule | null = null;

      // 筛选启用且有效的规则
      const getValidRules = (rules: PricingRule[]) => {
        return rules.filter((rule) => {
          if (!rule.enabled) return false;
          if (new Date(rule.effectiveDate) > new Date(date)) return false;
          if (rule.expiryDate && new Date(rule.expiryDate) < new Date(date)) return false;
          return true;
        });
      };

      // 1. 尝试查找节点级别价格
      if (nodeId) {
        const nodeRules = getValidRules(
          allPricingRules.filter(
            (r) =>
              r.scope === 'node' &&
              r.scopeId === nodeId &&
              r.resourceType === resourceType &&
              (!resourceSpec || r.resourceSpec === resourceSpec)
          )
        );
        if (nodeRules.length > 0) {
          appliedRule = nodeRules[0];
          scopeChain.push(`node:${nodeId}`);
        }
      }

      // 2. 尝试查找资源池级别价格
      if (!appliedRule && poolId) {
        const poolRules = getValidRules(
          allPricingRules.filter(
            (r) =>
              r.scope === 'pool' &&
              r.scopeId === poolId &&
              r.resourceType === resourceType &&
              (!resourceSpec || r.resourceSpec === resourceSpec)
          )
        );
        if (poolRules.length > 0) {
          appliedRule = poolRules[0];
          scopeChain.push(`pool:${poolId}`);
        }
      }

      // 3. 尝试查找可用区级别价格
      if (!appliedRule && zoneId) {
        const zoneRules = getValidRules(
          allPricingRules.filter(
            (r) =>
              r.scope === 'zone' &&
              r.scopeId === zoneId &&
              r.resourceType === resourceType &&
              (!resourceSpec || r.resourceSpec === resourceSpec)
          )
        );
        if (zoneRules.length > 0) {
          appliedRule = zoneRules[0];
          scopeChain.push(`zone:${zoneId}`);
        }
      }

      // 4. 使用默认价格
      if (!appliedRule) {
        const defaultRules = getValidRules(
          allPricingRules.filter(
            (r) =>
              r.scope === 'default' &&
              r.resourceType === resourceType &&
              (!resourceSpec || r.resourceSpec === resourceSpec)
          )
        );
        if (defaultRules.length > 0) {
          appliedRule = defaultRules[0];
          scopeChain.push('default');
        }
      }

      // 如果找不到任何规则，返回错误
      if (!appliedRule) {
        throw new Error(
          `找不到资源定价规则: ${resourceType}${resourceSpec ? `:${resourceSpec}` : ''}`
        );
      }

      resolve({
        resourceType,
        resourceSpec,
        pricePerUnit: appliedRule.pricePerUnit,
        unit: appliedRule.unit,
        billingCycle: appliedRule.billingCycle,
        currency: appliedRule.currency,
        appliedRule,
        scopeChain,
      });
    }, 300);
  });
}

/**
 * 批量查询资源价格
 */
export async function batchQueryPricing(
  queries: PricingQuery[]
): Promise<BatchPricingResult> {
  const results: BatchPricingResult = {};

  for (const query of queries) {
    try {
      const result = await queryPricing(query);
      const key = `${query.resourceType}${query.resourceSpec ? `:${query.resourceSpec}` : ''}`;
      results[key] = result;
    } catch (error) {
      console.error('批量查询定价失败:', error);
    }
  }

  return results;
}

/**
 * 创建或更新定价规则
 */
export async function savePricingRule(rule: Partial<PricingRule>): Promise<PricingRule> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const savedRule: PricingRule = {
        id: rule.id || `price-${Date.now()}`,
        scope: rule.scope || 'default',
        scopeId: rule.scopeId,
        scopeName: rule.scopeName,
        resourceType: rule.resourceType!,
        resourceSpec: rule.resourceSpec,
        unit: rule.unit!,
        pricePerUnit: rule.pricePerUnit!,
        billingCycle: rule.billingCycle || 'hourly',
        currency: rule.currency || 'CNY',
        enabled: rule.enabled !== undefined ? rule.enabled : true,
        effectiveDate: rule.effectiveDate || now,
        expiryDate: rule.expiryDate,
        description: rule.description,
        createdAt: rule.createdAt || now,
        updatedAt: now,
        createdBy: rule.createdBy || 'current-user',
      };

      // 如果是更新，从列表中移除旧规则
      const index = allPricingRules.findIndex((r) => r.id === savedRule.id);
      if (index >= 0) {
        allPricingRules[index] = savedRule;
      } else {
        allPricingRules.push(savedRule);
      }

      resolve(savedRule);
    }, 500);
  });
}

/**
 * 删除定价规则
 */
export async function deletePricingRule(ruleId: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = allPricingRules.findIndex((r) => r.id === ruleId);
      if (index >= 0) {
        allPricingRules.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
}

/**
 * 计算资源费用
 * @param resourceType 资源类型
 * @param resourceSpec 资源规格
 * @param quantity 数量
 * @param duration 时长（小时）
 * @param query 定价查询条件
 */
export async function calculateResourceCost(
  resourceType: ResourceType,
  resourceSpec: string | undefined,
  quantity: number,
  duration: number,
  query: Omit<PricingQuery, 'resourceType' | 'resourceSpec'>
): Promise<{
  totalCost: number;
  pricePerUnit: number;
  unit: string;
  appliedRule: PricingRule;
  scopeChain: string[];
}> {
  const pricingResult = await queryPricing({
    resourceType,
    resourceSpec,
    ...query,
  });

  // 计算总费用
  const totalCost = pricingResult.pricePerUnit * quantity * duration;

  return {
    totalCost,
    pricePerUnit: pricingResult.pricePerUnit,
    unit: pricingResult.unit,
    appliedRule: pricingResult.appliedRule,
    scopeChain: pricingResult.scopeChain,
  };
}

/**
 * 获取资源类型列表
 */
export function getResourceTypes(): Array<{ value: ResourceType; label: string; icon: string }> {
  return [
    { value: 'gpu', label: 'GPU', icon: 'Zap' },
    { value: 'cpu', label: 'CPU', icon: 'Cpu' },
    { value: 'memory', label: '内存', icon: 'HardDrive' },
    { value: 'storage', label: '存储', icon: 'Database' },
    { value: 'network', label: '网络', icon: 'Network' },
  ];
}

/**
 * 获取计费周期列表
 */
export function getBillingCycles(): Array<{ value: BillingCycle; label: string }> {
  return [
    { value: 'hourly', label: '按小时' },
    { value: 'daily', label: '按天' },
    { value: 'monthly', label: '按月' },
  ];
}

/**
 * 获取定价范围列表
 */
export function getPricingScopes(): Array<{ value: PricingScope; label: string; description: string }> {
  return [
    { value: 'default', label: '默认定价', description: '全局默认价格，优先级最低' },
    { value: 'zone', label: '可用区定价', description: '特定可用区价格，覆盖默认价格' },
    { value: 'pool', label: '资源池定价', description: '特定资源池价格，覆盖可用区价格' },
    { value: 'node', label: '节点定价', description: '特定节点价格，优先级最高' },
  ];
}
