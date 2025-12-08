/**
 * 算力使用监控服务
 * @description 提供算力使用数据的查询、统计和导出功能
 */

// ============================================
// 类型定义
// ============================================

/**
 * 资源类型
 */
export type ResourceType = 'gpu' | 'cpu' | 'storage';

/**
 * 时间粒度
 */
export type TimeGranularity = 'hour' | 'day' | 'week' | 'month';

/**
 * 组织节点类型
 */
export type OrganizationType = 'enterprise' | 'department' | 'user_group' | 'user';

/**
 * 导出格式
 */
export type ExportFormat = 'csv' | 'excel';

/**
 * 算力使用记录
 */
export interface ComputeUsageRecord {
  recordId: string;
  
  // 用户信息
  userId: string;
  userName: string;
  
  // 组织信息
  enterpriseId?: string;
  enterpriseName?: string;
  departmentId?: string;
  departmentName?: string;
  userGroupId?: string;
  userGroupName?: string;
  
  // 资源信息
  resourceType: ResourceType;
  resourceSpec: string;
  instanceId: string;
  zoneId?: string;
  
  // 时间信息
  startTime: string;  // ISO 8601
  endTime: string;
  durationSeconds: number;
  
  // 计算指标
  gpuHours?: number;
  cpuCoreHours?: number;
  storageTbDays?: number;
  
  // 费用信息
  costAmount: number;
  finalAmount: number;
}

/**
 * 聚合统计指标
 */
export interface AggregateMetrics {
  totalGpuHours: number;
  totalCpuCoreHours: number;
  totalStorageTbDays: number;
  totalCost: number;
  totalFinalAmount: number;
  recordCount: number;
  
  // 环比变化
  gpuHoursChange?: number;      // 百分比
  cpuCoreHoursChange?: number;
  storageTbDaysChange?: number;
  costChange?: number;
}

/**
 * 趋势数据点
 */
export interface TrendDataPoint {
  date: string;              // "2024-12-01"
  gpuHours: number;
  cpuCoreHours: number;
  storageTbDays: number;
  cost: number;
}

/**
 * Top N 排行项
 */
export interface RankingItem {
  id: string;
  name: string;
  value: number;
  percentage: number;
  type: OrganizationType;
}

/**
 * 资源分布项
 */
export interface ResourceDistribution {
  resourceType: ResourceType;
  resourceSpec: string;
  value: number;
  percentage: number;
}

/**
 * 组织节点
 */
export interface OrganizationNode {
  id: string;
  name: string;
  type: OrganizationType;
  parentId?: string;
  children?: OrganizationNode[];
  
  // 聚合统计（可选）
  gpuHours?: number;
  cost?: number;
}

/**
 * 查询过滤条件
 */
export interface UsageQueryFilter {
  // 时间范围
  startTime: string;
  endTime: string;
  
  // 组织维度
  enterpriseId?: string;
  departmentId?: string;
  userGroupId?: string;
  userId?: string;
  
  // 资源维度
  resourceType?: ResourceType;
  resourceSpec?: string;
  zoneId?: string;
  
  // 分页
  page?: number;
  pageSize?: number;
  
  // 排序
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}

/**
 * 导出配置
 */
export interface ExportConfig {
  scope: 'current' | 'all';
  format: ExportFormat;
  fields: string[];
  filters?: UsageQueryFilter;
  filename?: string;
}

/**
 * 导出任务
 */
export interface ExportTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;        // 0-100
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

/**
 * 时间范围快捷选项
 */
export interface TimeRangePreset {
  label: string;
  value: string;
  start: Date;
  end: Date;
}

// ============================================
// 模拟数据
// ============================================

/**
 * 生成随机的算力使用记录
 */
function generateMockRecord(index: number, daysAgo: number): ComputeUsageRecord {
  const enterprises = [
    { id: 'ent-001', name: 'XX科技' },
    { id: 'ent-002', name: 'YY研究院' },
    { id: 'ent-003', name: 'ZZ大学' },
    { id: 'ent-004', name: 'AA实验室' },
    { id: 'ent-005', name: 'BB集团' },
  ];
  
  const departments = [
    { id: 'dept-001', name: '算法部' },
    { id: 'dept-002', name: '运维部' },
    { id: 'dept-003', name: '研发部' },
  ];
  
  const userGroups = [
    { id: 'ug-001', name: 'CV实验室' },
    { id: 'ug-002', name: 'NLP组' },
    { id: 'ug-003', name: '推荐算法组' },
  ];
  
  const users = [
    { id: 'user-001', name: '张三' },
    { id: 'user-002', name: '李四' },
    { id: 'user-003', name: '王五' },
    { id: 'user-004', name: '赵六' },
    { id: 'user-005', name: '孙七' },
  ];
  
  const gpuSpecs = ['A100-80GB', 'A100-40GB', 'V100-32GB', 'T4-16GB'];
  const zones = ['zone-cd-01', 'zone-bj-01', 'zone-sh-01'];
  
  const enterprise = enterprises[Math.floor(Math.random() * enterprises.length)];
  const department = departments[Math.floor(Math.random() * departments.length)];
  const userGroup = userGroups[Math.floor(Math.random() * userGroups.length)];
  const user = users[Math.floor(Math.random() * users.length)];
  const resourceSpec = gpuSpecs[Math.floor(Math.random() * gpuSpecs.length)];
  const zone = zones[Math.floor(Math.random() * zones.length)];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);
  startDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
  
  const durationHours = Math.random() * 24 + 1; // 1-25小时
  const durationSeconds = Math.floor(durationHours * 3600);
  
  const endDate = new Date(startDate.getTime() + durationSeconds * 1000);
  
  const gpuHours = parseFloat(durationHours.toFixed(2));
  const pricePerHour = resourceSpec.includes('A100-80') ? 35 : 
                       resourceSpec.includes('A100-40') ? 25 :
                       resourceSpec.includes('V100') ? 18 : 10;
  
  const costAmount = parseFloat((gpuHours * pricePerHour).toFixed(2));
  const finalAmount = parseFloat((costAmount * (0.8 + Math.random() * 0.2)).toFixed(2));
  
  return {
    recordId: `rec-${String(index).padStart(6, '0')}`,
    userId: user.id,
    userName: user.name,
    enterpriseId: enterprise.id,
    enterpriseName: enterprise.name,
    departmentId: department.id,
    departmentName: department.name,
    userGroupId: userGroup.id,
    userGroupName: userGroup.name,
    resourceType: 'gpu',
    resourceSpec,
    instanceId: `pod-${Math.random().toString(36).substr(2, 8)}`,
    zoneId: zone,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    durationSeconds,
    gpuHours,
    cpuCoreHours: 0,
    storageTbDays: 0,
    costAmount,
    finalAmount,
  };
}

// 生成模拟数据（最近7天，每天30-50条）
const mockRecords: ComputeUsageRecord[] = [];
for (let day = 0; day < 7; day++) {
  const recordsPerDay = Math.floor(Math.random() * 20) + 30; // 30-50条
  for (let i = 0; i < recordsPerDay; i++) {
    mockRecords.push(generateMockRecord(mockRecords.length + 1, day));
  }
}

// 按时间倒序排序
mockRecords.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

// ============================================
// 工具函数
// ============================================

/**
 * 获取时间范围快捷选项
 */
export function getTimeRangePresets(): TimeRangePreset[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    {
      label: '今天',
      value: 'today',
      start: today,
      end: now,
    },
    {
      label: '昨天',
      value: 'yesterday',
      start: new Date(today.getTime() - 86400000),
      end: today,
    },
    {
      label: '最近7天',
      value: 'last7days',
      start: new Date(today.getTime() - 6 * 86400000),
      end: now,
    },
    {
      label: '最近30天',
      value: 'last30days',
      start: new Date(today.getTime() - 29 * 86400000),
      end: now,
    },
    {
      label: '本周',
      value: 'thisWeek',
      start: new Date(today.getTime() - (today.getDay() || 7 - 1) * 86400000),
      end: now,
    },
    {
      label: '本月',
      value: 'thisMonth',
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: now,
    },
  ];
}

/**
 * 过滤记录
 */
function filterRecords(records: ComputeUsageRecord[], filter: UsageQueryFilter): ComputeUsageRecord[] {
  return records.filter((record) => {
    // 时间范围
    const recordTime = new Date(record.startTime).getTime();
    const startTime = new Date(filter.startTime).getTime();
    const endTime = new Date(filter.endTime).getTime();
    if (recordTime < startTime || recordTime > endTime) return false;
    
    // 组织维度
    if (filter.enterpriseId && record.enterpriseId !== filter.enterpriseId) return false;
    if (filter.departmentId && record.departmentId !== filter.departmentId) return false;
    if (filter.userGroupId && record.userGroupId !== filter.userGroupId) return false;
    if (filter.userId && record.userId !== filter.userId) return false;
    
    // 资源维度
    if (filter.resourceType && record.resourceType !== filter.resourceType) return false;
    if (filter.resourceSpec && record.resourceSpec !== filter.resourceSpec) return false;
    if (filter.zoneId && record.zoneId !== filter.zoneId) return false;
    
    return true;
  });
}

/**
 * 计算聚合指标
 */
function calculateMetrics(records: ComputeUsageRecord[]): AggregateMetrics {
  const totalGpuHours = records.reduce((sum, r) => sum + (r.gpuHours || 0), 0);
  const totalCpuCoreHours = records.reduce((sum, r) => sum + (r.cpuCoreHours || 0), 0);
  const totalStorageTbDays = records.reduce((sum, r) => sum + (r.storageTbDays || 0), 0);
  const totalCost = records.reduce((sum, r) => sum + r.costAmount, 0);
  const totalFinalAmount = records.reduce((sum, r) => sum + r.finalAmount, 0);
  
  return {
    totalGpuHours: parseFloat(totalGpuHours.toFixed(2)),
    totalCpuCoreHours: parseFloat(totalCpuCoreHours.toFixed(2)),
    totalStorageTbDays: parseFloat(totalStorageTbDays.toFixed(4)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    totalFinalAmount: parseFloat(totalFinalAmount.toFixed(2)),
    recordCount: records.length,
    
    // 模拟环比（随机）
    gpuHoursChange: parseFloat((Math.random() * 30 - 10).toFixed(1)),
    cpuCoreHoursChange: parseFloat((Math.random() * 20 - 10).toFixed(1)),
    storageTbDaysChange: parseFloat((Math.random() * 15 - 5).toFixed(1)),
    costChange: parseFloat((Math.random() * 25 - 5).toFixed(1)),
  };
}

/**
 * 计算趋势数据
 */
function calculateTrend(records: ComputeUsageRecord[], granularity: TimeGranularity = 'day'): TrendDataPoint[] {
  const dataMap = new Map<string, TrendDataPoint>();
  
  records.forEach((record) => {
    const date = record.startTime.split('T')[0]; // "2024-12-01"
    
    if (!dataMap.has(date)) {
      dataMap.set(date, {
        date,
        gpuHours: 0,
        cpuCoreHours: 0,
        storageTbDays: 0,
        cost: 0,
      });
    }
    
    const point = dataMap.get(date)!;
    point.gpuHours += record.gpuHours || 0;
    point.cpuCoreHours += record.cpuCoreHours || 0;
    point.storageTbDays += record.storageTbDays || 0;
    point.cost += record.finalAmount;
  });
  
  // 转换为数组并排序
  const trend = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  
  // 格式化数值
  trend.forEach((point) => {
    point.gpuHours = parseFloat(point.gpuHours.toFixed(2));
    point.cpuCoreHours = parseFloat(point.cpuCoreHours.toFixed(2));
    point.storageTbDays = parseFloat(point.storageTbDays.toFixed(4));
    point.cost = parseFloat(point.cost.toFixed(2));
  });
  
  return trend;
}

// ============================================
// API 方法
// ============================================

/**
 * 查询聚合统计
 */
export async function queryAggregateMetrics(filter: UsageQueryFilter): Promise<{
  metrics: AggregateMetrics;
  trend: TrendDataPoint[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const filtered = filterRecords(mockRecords, filter);
  const metrics = calculateMetrics(filtered);
  const trend = calculateTrend(filtered);
  
  return { metrics, trend };
}

/**
 * 查询使用记录（分页）
 */
export async function queryUsageRecords(
  filter: UsageQueryFilter
): Promise<PaginatedResponse<ComputeUsageRecord>> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const filtered = filterRecords(mockRecords, filter);
  
  // 排序
  let sorted = [...filtered];
  if (filter.sortBy) {
    sorted.sort((a, b) => {
      const aVal = (a as any)[filter.sortBy!];
      const bVal = (b as any)[filter.sortBy!];
      
      if (typeof aVal === 'string') {
        return filter.sortOrder === 'desc' 
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal);
      } else {
        return filter.sortOrder === 'desc' 
          ? bVal - aVal
          : aVal - bVal;
      }
    });
  }
  
  // 分页
  const page = filter.page || 1;
  const pageSize = filter.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = sorted.slice(start, end);
  
  return {
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
    data,
  };
}

/**
 * 查询 Top N 排行
 */
export async function queryTopRankings(
  filter: UsageQueryFilter,
  dimension: 'enterprise' | 'department' | 'user_group' | 'user',
  metric: 'gpuHours' | 'cost' = 'gpuHours',
  limit: number = 5
): Promise<RankingItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const filtered = filterRecords(mockRecords, filter);
  const aggregateMap = new Map<string, { id: string; name: string; value: number }>();
  
  filtered.forEach((record) => {
    let id: string | undefined;
    let name: string | undefined;
    
    switch (dimension) {
      case 'enterprise':
        id = record.enterpriseId;
        name = record.enterpriseName;
        break;
      case 'department':
        id = record.departmentId;
        name = record.departmentName;
        break;
      case 'user_group':
        id = record.userGroupId;
        name = record.userGroupName;
        break;
      case 'user':
        id = record.userId;
        name = record.userName;
        break;
    }
    
    if (!id || !name) return;
    
    if (!aggregateMap.has(id)) {
      aggregateMap.set(id, { id, name, value: 0 });
    }
    
    const item = aggregateMap.get(id)!;
    item.value += metric === 'gpuHours' ? (record.gpuHours || 0) : record.finalAmount;
  });
  
  // 转换为数组并排序
  const rankings = Array.from(aggregateMap.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
  
  // 计算总值
  const totalValue = rankings.reduce((sum, item) => sum + item.value, 0);
  
  // 计算百分比
  return rankings.map((item) => ({
    id: item.id,
    name: item.name,
    value: parseFloat(item.value.toFixed(2)),
    percentage: parseFloat(((item.value / totalValue) * 100).toFixed(1)),
    type: dimension,
  }));
}

/**
 * 查询资源分布
 */
export async function queryResourceDistribution(
  filter: UsageQueryFilter
): Promise<ResourceDistribution[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const filtered = filterRecords(mockRecords, filter);
  const distributionMap = new Map<string, { resourceType: ResourceType; resourceSpec: string; value: number }>();
  
  filtered.forEach((record) => {
    const key = `${record.resourceType}-${record.resourceSpec}`;
    
    if (!distributionMap.has(key)) {
      distributionMap.set(key, {
        resourceType: record.resourceType,
        resourceSpec: record.resourceSpec,
        value: 0,
      });
    }
    
    const item = distributionMap.get(key)!;
    item.value += record.gpuHours || 0;
  });
  
  // 转换为数组并排序
  const distribution = Array.from(distributionMap.values())
    .sort((a, b) => b.value - a.value);
  
  // 计算总值
  const totalValue = distribution.reduce((sum, item) => sum + item.value, 0);
  
  // 计算百分比
  return distribution.map((item) => ({
    ...item,
    value: parseFloat(item.value.toFixed(2)),
    percentage: parseFloat(((item.value / totalValue) * 100).toFixed(1)),
  }));
}

/**
 * 获取组织树
 */
export async function getOrganizationTree(enterpriseId?: string): Promise<OrganizationNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  // 模拟组织树
  const tree: OrganizationNode[] = [
    {
      id: 'ent-001',
      name: 'XX科技',
      type: 'enterprise',
      children: [
        {
          id: 'dept-001',
          name: '算法部',
          type: 'department',
          parentId: 'ent-001',
          children: [
            {
              id: 'ug-001',
              name: 'CV实验室',
              type: 'user_group',
              parentId: 'dept-001',
            },
            {
              id: 'ug-002',
              name: 'NLP组',
              type: 'user_group',
              parentId: 'dept-001',
            },
          ],
        },
        {
          id: 'dept-002',
          name: '运维部',
          type: 'department',
          parentId: 'ent-001',
        },
      ],
    },
    {
      id: 'ent-002',
      name: 'YY研究院',
      type: 'enterprise',
      children: [
        {
          id: 'dept-003',
          name: '研发部',
          type: 'department',
          parentId: 'ent-002',
          children: [
            {
              id: 'ug-003',
              name: '推荐算法组',
              type: 'user_group',
              parentId: 'dept-003',
            },
          ],
        },
      ],
    },
  ];
  
  if (enterpriseId) {
    return tree.filter((node) => node.id === enterpriseId);
  }
  
  return tree;
}

/**
 * 导出数据
 */
export async function exportUsageData(config: ExportConfig): Promise<ExportTask | { downloadUrl: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // 查询数据
  const filter = config.filters || { startTime: '', endTime: '' };
  const filtered = filterRecords(mockRecords, filter);
  
  // 估算数据量
  const recordCount = config.scope === 'all' ? mockRecords.length : filtered.length;
  
  // 同步导出（< 10万行）
  if (recordCount < 100000) {
    // 生成CSV内容
    const csvContent = generateCsv(config.scope === 'all' ? mockRecords : filtered, config.fields);
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    
    return { downloadUrl };
  }
  
  // 异步导出（≥ 10万行）
  const taskId = `task-${Date.now()}`;
  return {
    taskId,
    status: 'processing',
    progress: 0,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 生成CSV内容
 */
function generateCsv(records: ComputeUsageRecord[], fields: string[]): string {
  const fieldMap: Record<string, string> = {
    userName: '用户名',
    enterpriseName: '企业',
    departmentName: '部门',
    userGroupName: '用户组',
    resourceType: '资源类型',
    resourceSpec: '资源规格',
    instanceId: '实例ID',
    zoneId: '可用区',
    startTime: '开始时间',
    endTime: '结束时间',
    gpuHours: 'GPU小时',
    costAmount: '原价(¥)',
    finalAmount: '折后价(¥)',
  };
  
  // 表头
  const headers = fields.map((field) => fieldMap[field] || field).join(',');
  
  // 数据行
  const rows = records.map((record) => {
    return fields.map((field) => {
      const value = (record as any)[field];
      if (value === undefined || value === null) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',');
  });
  
  return [headers, ...rows].join('\n');
}

/**
 * 获取导出任务状态
 */
export async function getExportTaskStatus(taskId: string): Promise<ExportTask> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  // 模拟任务进度
  const progress = Math.min(100, Math.floor(Math.random() * 30) + 70);
  
  return {
    taskId,
    status: progress >= 100 ? 'completed' : 'processing',
    progress,
    downloadUrl: progress >= 100 ? 'https://example.com/download/xxx.csv' : undefined,
    createdAt: new Date(Date.now() - 60000).toISOString(),
    completedAt: progress >= 100 ? new Date().toISOString() : undefined,
  };
}

/**
 * 获取所有企业列表
 */
export async function getAllEnterprises(): Promise<Array<{ id: string; name: string }>> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  return [
    { id: 'ent-001', name: 'XX科技' },
    { id: 'ent-002', name: 'YY研究院' },
    { id: 'ent-003', name: 'ZZ大学' },
    { id: 'ent-004', name: 'AA实验室' },
    { id: 'ent-005', name: 'BB集团' },
  ];
}

/**
 * 格式化大数字
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

/**
 * 格式化货币
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}
