/**
 * 折扣服务 - 支持结构化条件和优先级机制
 * @version 2.0.0
 * @description 支持复杂条件组合、折扣叠加和互斥策略
 */

// ============================================
// 类型定义
// ============================================

/**
 * 折扣规则状态
 */
export type DiscountStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

/**
 * 折扣动作类型
 */
export type DiscountActionType = 'PERCENTAGE' | 'FIXED' | 'CAPPED';

/**
 * 用户类型
 */
export type UserType = 'INDIVIDUAL' | 'ENTERPRISE' | 'EDUCATIONAL' | 'GOVERNMENT';

/**
 * 时段范围
 */
export interface TimeRange {
  startHour: number;  // 0-23
  endHour: number;    // 0-23
}

/**
 * 折扣触发条件（结构化）
 */
export interface DiscountConditions {
  // 用户条件
  targetUserTypes?: UserType[];        // 目标用户类型
  firstOrderOnly?: boolean;            // 仅限首单
  
  // 资源条件
  targetResourceTypes?: string[];      // 目标资源类型 ['gpu', 'cpu', 'memory']
  targetResourceSpecs?: string[];      // 目标资源规格 ['A100-80GB', 'V100-32GB']
  
  // 用量条件
  minAmount?: number;                  // 最低消费金额
  minUsageHours?: number;              // 最低使用时长（小时）
  minQuantity?: number;                // 最低数量（如：最少10卡）
  
  // 地域条件
  targetZones?: string[];              // 目标可用区
  
  // 时段条件
  timeRange?: TimeRange;               // 时段范围（如：夜间00:00-06:00）
}

/**
 * 折扣动作（结构化）
 */
export interface DiscountAction {
  type: DiscountActionType;
  
  // PERCENTAGE 类型参数
  discountRate?: number;               // 折扣率（如：0.9表示9折）
  
  // FIXED 类型参数
  fixedDeduction?: number;             // 固定减免金额
  
  // CAPPED 类型参数
  maxDeduction?: number;               // 最大减免金额（封顶）
  
  // 互斥策略
  exclusive?: boolean;                 // 是否互斥（不可与其他折扣叠加）
}

/**
 * 折扣规则
 */
export interface DiscountRule {
  // 基础信息
  id: string;
  name: string;
  description?: string;
  
  // 状态管理
  status: DiscountStatus;
  priority: number;                    // 优先级（数字越小优先级越高）
  
  // 时间管理
  effectiveDate: string;               // ISO 8601 格式
  expiryDate?: string;                 // ISO 8601 格式
  
  // 触发条件（结构化）
  conditions: DiscountConditions;
  
  // 折扣动作（结构化）
  action: DiscountAction;
  
  // 使用统计
  usageCount?: number;
  maxUsage?: number;
  
  // 审计字段
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  
  // 兼容旧版（可选）
  enabled?: boolean;
  type?: string;
  value?: number;
  appliesTo?: string[];
}

/**
 * 折扣匹配查询参数
 */
export interface DiscountMatchQuery {
  // 用户信息
  userId: string;
  userType: UserType;
  isFirstOrder: boolean;
  
  // 资源信息
  resourceType: string;
  resourceSpec?: string;
  quantity: number;
  duration: number;                    // 使用时长（小时）
  
  // 位置信息
  zoneId?: string;
  
  // 金额信息
  amount: number;
  
  // 时间信息（可选，默认为当前时间）
  orderTime?: Date;
}

/**
 * 折扣应用结果
 */
export interface DiscountApplyResult {
  originalAmount: number;
  finalAmount: number;
  totalSaved: number;
  appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    savedAmount: number;
    action: DiscountAction;
  }>;
}

/**
 * 折扣预览结果
 */
export interface DiscountPreviewResult {
  matched: boolean;
  matchDetails: {
    userTypeMatched: boolean;
    firstOrderMatched: boolean;
    resourceMatched: boolean;
    specMatched: boolean;
    amountMatched: boolean;
    usageMatched: boolean;
    zoneMatched: boolean;
    timeMatched: boolean;
    quantityMatched: boolean;
  };
  estimatedSaving?: {
    originalAmount: number;
    finalAmount: number;
    savedAmount: number;
    savingRate: number;  // 节省比例
  };
}

// ============================================
// 模拟数据
// ============================================

const mockDiscountRules: DiscountRule[] = [
  {
    id: 'disc-newuser-2025',
    name: '新用户首单9折',
    description: '新注册用户首次下单可享受9折优惠',
    status: 'ACTIVE',
    priority: 10,
    effectiveDate: '2025-01-01T00:00:00Z',
    expiryDate: '2025-12-31T23:59:59Z',
    conditions: {
      targetUserTypes: ['INDIVIDUAL', 'ENTERPRISE'],
      firstOrderOnly: true,
    },
    action: {
      type: 'PERCENTAGE',
      discountRate: 0.9,
      exclusive: false,
    },
    usageCount: 156,
    maxUsage: 1000,
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'disc-night-2025',
    name: '夜间时段7折',
    description: '凌晨00:00-06:00使用GPU享7折优惠',
    status: 'ACTIVE',
    priority: 20,
    effectiveDate: '2025-01-01T00:00:00Z',
    conditions: {
      targetResourceTypes: ['gpu'],
      timeRange: {
        startHour: 0,
        endHour: 6,
      },
    },
    action: {
      type: 'PERCENTAGE',
      discountRate: 0.7,
      exclusive: false,
    },
    usageCount: 2345,
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'disc-volume-2025',
    name: '批量使用85折',
    description: '单次使用10卡以上GPU享85折',
    status: 'ACTIVE',
    priority: 30,
    effectiveDate: '2025-01-01T00:00:00Z',
    conditions: {
      targetResourceTypes: ['gpu'],
      minQuantity: 10,
    },
    action: {
      type: 'PERCENTAGE',
      discountRate: 0.85,
      exclusive: false,
    },
    usageCount: 89,
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'disc-enterprise-2025',
    name: '企业用户满1000减100',
    description: '企业用户单笔消费满1000元减100元',
    status: 'ACTIVE',
    priority: 40,
    effectiveDate: '2025-01-01T00:00:00Z',
    expiryDate: '2025-06-30T23:59:59Z',
    conditions: {
      targetUserTypes: ['ENTERPRISE'],
      minAmount: 1000,
    },
    action: {
      type: 'FIXED',
      fixedDeduction: 100,
      exclusive: false,
    },
    usageCount: 45,
    maxUsage: 1000,
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'disc-zone-cd-2025',
    name: '成都可用区A100优惠',
    description: '成都可用区A100-80GB 9折，最多减免200元',
    status: 'ACTIVE',
    priority: 50,
    effectiveDate: '2025-01-01T00:00:00Z',
    conditions: {
      targetResourceTypes: ['gpu'],
      targetResourceSpecs: ['A100-80GB'],
      targetZones: ['zone-cd-01'],
    },
    action: {
      type: 'CAPPED',
      discountRate: 0.9,
      maxDeduction: 200,
      exclusive: false,
    },
    usageCount: 23,
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'disc-draft-example',
    name: '双十二活动（草稿）',
    description: '双十二全场8折活动',
    status: 'DRAFT',
    priority: 5,
    effectiveDate: '2025-12-12T00:00:00Z',
    expiryDate: '2025-12-12T23:59:59Z',
    conditions: {},
    action: {
      type: 'PERCENTAGE',
      discountRate: 0.8,
      exclusive: true,
    },
    createdAt: '2025-12-01T00:00:00Z',
    createdBy: 'admin',
  },
];

// ============================================
// 核心服务方法
// ============================================

/**
 * 获取所有折扣规则
 */
export async function getAllDiscountRules(): Promise<DiscountRule[]> {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockDiscountRules];
}

/**
 * 按状态获取折扣规则
 */
export async function getDiscountRulesByStatus(
  status: DiscountStatus
): Promise<DiscountRule[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockDiscountRules.filter((rule) => rule.status === status);
}

/**
 * 获取有效的折扣规则（ACTIVE状态且在有效期内）
 */
export async function getActiveDiscountRules(): Promise<DiscountRule[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const now = new Date();
  
  return mockDiscountRules.filter((rule) => {
    if (rule.status !== 'ACTIVE') return false;
    
    const effectiveDate = new Date(rule.effectiveDate);
    if (effectiveDate > now) return false;
    
    if (rule.expiryDate) {
      const expiryDate = new Date(rule.expiryDate);
      if (expiryDate < now) return false;
    }
    
    if (rule.maxUsage && rule.usageCount && rule.usageCount >= rule.maxUsage) {
      return false;
    }
    
    return true;
  });
}

/**
 * 根据ID获取折扣规则
 */
export async function getDiscountRuleById(id: string): Promise<DiscountRule | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockDiscountRules.find((rule) => rule.id === id) || null;
}

/**
 * 保存折扣规则（创建或更新）
 */
export async function saveDiscountRule(rule: DiscountRule): Promise<DiscountRule> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const index = mockDiscountRules.findIndex((r) => r.id === rule.id);
  
  if (index >= 0) {
    // 更新
    mockDiscountRules[index] = {
      ...rule,
      updatedAt: new Date().toISOString(),
    };
    return mockDiscountRules[index];
  } else {
    // 创建
    const newRule = {
      ...rule,
      createdAt: new Date().toISOString(),
    };
    mockDiscountRules.push(newRule);
    return newRule;
  }
}

/**
 * 删除折扣规则
 */
export async function deleteDiscountRule(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const index = mockDiscountRules.findIndex((rule) => rule.id === id);
  if (index >= 0) {
    mockDiscountRules.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * 更新折扣规则状态
 */
export async function updateDiscountRuleStatus(
  id: string,
  status: DiscountStatus
): Promise<DiscountRule | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const rule = mockDiscountRules.find((r) => r.id === id);
  if (rule) {
    rule.status = status;
    rule.updatedAt = new Date().toISOString();
    return rule;
  }
  return null;
}

// ============================================
// 条件匹配引擎
// ============================================

/**
 * 检查用户类型是否匹配
 */
function checkUserType(conditions: DiscountConditions, userType: UserType): boolean {
  if (!conditions.targetUserTypes || conditions.targetUserTypes.length === 0) {
    return true;  // 未设置则表示所有用户类型都适用
  }
  return conditions.targetUserTypes.includes(userType);
}

/**
 * 检查首单条件是否匹配
 */
function checkFirstOrder(
  conditions: DiscountConditions,
  isFirstOrder: boolean
): boolean {
  if (conditions.firstOrderOnly === undefined) {
    return true;  // 未设置则不限制
  }
  return conditions.firstOrderOnly === isFirstOrder;
}

/**
 * 检查资源类型是否匹配
 */
function checkResourceType(
  conditions: DiscountConditions,
  resourceType: string
): boolean {
  if (!conditions.targetResourceTypes || conditions.targetResourceTypes.length === 0) {
    return true;
  }
  return conditions.targetResourceTypes.includes(resourceType);
}

/**
 * 检查资源规格是否匹配
 */
function checkResourceSpec(
  conditions: DiscountConditions,
  resourceSpec?: string
): boolean {
  if (!conditions.targetResourceSpecs || conditions.targetResourceSpecs.length === 0) {
    return true;
  }
  if (!resourceSpec) return false;
  return conditions.targetResourceSpecs.includes(resourceSpec);
}

/**
 * 检查金额门槛是否匹配
 */
function checkMinAmount(conditions: DiscountConditions, amount: number): boolean {
  if (conditions.minAmount === undefined) {
    return true;
  }
  return amount >= conditions.minAmount;
}

/**
 * 检查使用时长是否匹配
 */
function checkMinUsageHours(
  conditions: DiscountConditions,
  usageHours: number
): boolean {
  if (conditions.minUsageHours === undefined) {
    return true;
  }
  return usageHours >= conditions.minUsageHours;
}

/**
 * 检查数量门槛是否匹配
 */
function checkMinQuantity(conditions: DiscountConditions, quantity: number): boolean {
  if (conditions.minQuantity === undefined) {
    return true;
  }
  return quantity >= conditions.minQuantity;
}

/**
 * 检查地域是否匹配
 */
function checkZone(conditions: DiscountConditions, zoneId?: string): boolean {
  if (!conditions.targetZones || conditions.targetZones.length === 0) {
    return true;
  }
  if (!zoneId) return false;
  return conditions.targetZones.includes(zoneId);
}

/**
 * 检查时段是否匹配
 */
function checkTimeRange(conditions: DiscountConditions, orderTime: Date): boolean {
  if (!conditions.timeRange) {
    return true;
  }
  
  const hour = orderTime.getHours();
  const { startHour, endHour } = conditions.timeRange;
  
  if (startHour <= endHour) {
    // 正常时段（如：9-18）
    return hour >= startHour && hour < endHour;
  } else {
    // 跨天时段（如：22-6，即22:00-次日06:00）
    return hour >= startHour || hour < endHour;
  }
}

/**
 * 检查所有条件是否匹配
 */
function checkAllConditions(
  rule: DiscountRule,
  query: DiscountMatchQuery
): boolean {
  const { conditions } = rule;
  const orderTime = query.orderTime || new Date();
  
  // 逐个检查条件
  if (!checkUserType(conditions, query.userType)) return false;
  if (!checkFirstOrder(conditions, query.isFirstOrder)) return false;
  if (!checkResourceType(conditions, query.resourceType)) return false;
  if (!checkResourceSpec(conditions, query.resourceSpec)) return false;
  if (!checkMinAmount(conditions, query.amount)) return false;
  if (!checkMinUsageHours(conditions, query.duration)) return false;
  if (!checkMinQuantity(conditions, query.quantity)) return false;
  if (!checkZone(conditions, query.zoneId)) return false;
  if (!checkTimeRange(conditions, orderTime)) return false;
  
  return true;
}

/**
 * 匹配折扣规则
 * @param query 匹配查询参数
 * @returns 匹配的折扣规则（按优先级排序）
 */
export async function matchDiscountRules(
  query: DiscountMatchQuery
): Promise<DiscountRule[]> {
  // 1. 获取所有有效规则
  const activeRules = await getActiveDiscountRules();
  
  // 2. 过滤匹配的规则
  const matchedRules = activeRules.filter((rule) =>
    checkAllConditions(rule, query)
  );
  
  // 3. 按优先级排序（数字越小优先级越高）
  matchedRules.sort((a, b) => a.priority - b.priority);
  
  return matchedRules;
}

// ============================================
// 折扣计算引擎
// ============================================

/**
 * 计算单个折扣的减免金额
 */
function calculateDiscount(amount: number, action: DiscountAction): number {
  switch (action.type) {
    case 'PERCENTAGE':
      // 比例折扣
      const rate = action.discountRate || 1.0;
      return amount * (1 - rate);
      
    case 'FIXED':
      // 固定减免
      const deduction = action.fixedDeduction || 0;
      return Math.min(amount, deduction);
      
    case 'CAPPED':
      // 封顶优惠
      const cappedRate = action.discountRate || 1.0;
      const maxDeduction = action.maxDeduction || 0;
      const calculatedSaving = amount * (1 - cappedRate);
      return Math.min(calculatedSaving, maxDeduction);
      
    default:
      return 0;
  }
}

/**
 * 应用折扣规则
 * @param amount 原价
 * @param matchedRules 匹配的折扣规则（已排序）
 * @returns 折扣应用结果
 */
export async function applyDiscounts(
  amount: number,
  matchedRules: DiscountRule[]
): Promise<DiscountApplyResult> {
  let currentAmount = amount;
  const appliedRules: DiscountApplyResult['appliedRules'] = [];
  
  for (const rule of matchedRules) {
    // 检查互斥策略
    if (rule.action.exclusive && appliedRules.length > 0) {
      break;  // 遇到互斥规则且已有折扣，停止
    }
    
    // 计算折扣
    const savedAmount = calculateDiscount(currentAmount, rule.action);
    currentAmount = Math.max(0, currentAmount - savedAmount);
    
    appliedRules.push({
      ruleId: rule.id,
      ruleName: rule.name,
      savedAmount,
      action: rule.action,
    });
    
    // 如果本规则是互斥的，停止后续折扣
    if (rule.action.exclusive) {
      break;
    }
  }
  
  return {
    originalAmount: amount,
    finalAmount: currentAmount,
    totalSaved: amount - currentAmount,
    appliedRules,
  };
}

/**
 * 预览折扣效果（测试工具）
 * @param ruleId 规则ID
 * @param query 测试查询参数
 * @returns 预览结果
 */
export async function previewDiscount(
  ruleId: string,
  query: DiscountMatchQuery
): Promise<DiscountPreviewResult> {
  const rule = await getDiscountRuleById(ruleId);
  
  if (!rule) {
    throw new Error('折扣规则不存在');
  }
  
  const { conditions } = rule;
  const orderTime = query.orderTime || new Date();
  
  // 详细匹配结果
  const matchDetails = {
    userTypeMatched: checkUserType(conditions, query.userType),
    firstOrderMatched: checkFirstOrder(conditions, query.isFirstOrder),
    resourceMatched: checkResourceType(conditions, query.resourceType),
    specMatched: checkResourceSpec(conditions, query.resourceSpec),
    amountMatched: checkMinAmount(conditions, query.amount),
    usageMatched: checkMinUsageHours(conditions, query.duration),
    zoneMatched: checkZone(conditions, query.zoneId),
    timeMatched: checkTimeRange(conditions, orderTime),
    quantityMatched: checkMinQuantity(conditions, query.quantity),
  };
  
  const matched = Object.values(matchDetails).every((v) => v);
  
  let estimatedSaving;
  if (matched) {
    const savedAmount = calculateDiscount(query.amount, rule.action);
    const finalAmount = query.amount - savedAmount;
    estimatedSaving = {
      originalAmount: query.amount,
      finalAmount,
      savedAmount,
      savingRate: savedAmount / query.amount,
    };
  }
  
  return {
    matched,
    matchDetails,
    estimatedSaving,
  };
}

// ============================================
// 辅助方法
// ============================================

/**
 * 获取用户类型列表
 */
export function getUserTypes(): Array<{ value: UserType; label: string }> {
  return [
    { value: 'INDIVIDUAL', label: '个人用户' },
    { value: 'ENTERPRISE', label: '企业用户' },
    { value: 'EDUCATIONAL', label: '教育用户' },
    { value: 'GOVERNMENT', label: '政府用户' },
  ];
}

/**
 * 获取折扣状态列表
 */
export function getDiscountStatuses(): Array<{ value: DiscountStatus; label: string }> {
  return [
    { value: 'DRAFT', label: '草稿' },
    { value: 'ACTIVE', label: '生效中' },
    { value: 'INACTIVE', label: '已停用' },
  ];
}

/**
 * 获取折扣动作类型列表
 */
export function getDiscountActionTypes(): Array<{
  value: DiscountActionType;
  label: string;
  description: string;
}> {
  return [
    { value: 'PERCENTAGE', label: '比例折扣', description: '按百分比折扣（如：9折）' },
    { value: 'FIXED', label: '固定减免', description: '减免固定金额（如：减100元）' },
    { value: 'CAPPED', label: '封顶优惠', description: '按比例折扣但设置上限（如：9折，最多减200）' },
  ];
}

/**
 * 格式化折扣描述
 */
export function formatDiscountAction(action: DiscountAction): string {
  switch (action.type) {
    case 'PERCENTAGE':
      const discount = ((1 - (action.discountRate || 1)) * 100).toFixed(0);
      return `打${(action.discountRate || 1) * 10}折（省${discount}%）`;
      
    case 'FIXED':
      return `减¥${action.fixedDeduction?.toFixed(2) || 0}`;
      
    case 'CAPPED':
      const cappedDiscount = ((1 - (action.discountRate || 1)) * 100).toFixed(0);
      return `打${(action.discountRate || 1) * 10}折，最多减¥${action.maxDeduction?.toFixed(2) || 0}`;
      
    default:
      return '未知折扣';
  }
}

/**
 * 格式化条件摘要
 */
export function formatConditionsSummary(conditions: DiscountConditions): string[] {
  const summary: string[] = [];
  
  if (conditions.targetUserTypes && conditions.targetUserTypes.length > 0) {
    const userTypes = getUserTypes();
    const labels = conditions.targetUserTypes.map(
      (t) => userTypes.find((ut) => ut.value === t)?.label || t
    );
    summary.push(`限${labels.join('、')}`);
  }
  
  if (conditions.firstOrderOnly) {
    summary.push('限首单');
  }
  
  if (conditions.targetResourceTypes && conditions.targetResourceTypes.length > 0) {
    summary.push(`限${conditions.targetResourceTypes.join('、')}`);
  }
  
  if (conditions.targetResourceSpecs && conditions.targetResourceSpecs.length > 0) {
    summary.push(`限${conditions.targetResourceSpecs.join('、')}`);
  }
  
  if (conditions.minAmount) {
    summary.push(`满¥${conditions.minAmount}`);
  }
  
  if (conditions.minQuantity) {
    summary.push(`≥${conditions.minQuantity}卡`);
  }
  
  if (conditions.minUsageHours) {
    summary.push(`≥${conditions.minUsageHours}小时`);
  }
  
  if (conditions.timeRange) {
    summary.push(
      `${conditions.timeRange.startHour}:00-${conditions.timeRange.endHour}:00`
    );
  }
  
  if (conditions.targetZones && conditions.targetZones.length > 0) {
    summary.push(`限${conditions.targetZones.join('、')}`);
  }
  
  return summary.length > 0 ? summary : ['无限制'];
}
