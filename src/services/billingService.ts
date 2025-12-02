// 计费服务

export interface BillingSummary {
  currentMonthCost: number;
  lastMonthCost: number;
  accountBalance: number;
  unpaidAmount: number;
  estimatedCost: number; // 本月预估费用
  dailyAverage: number;
}

export interface ResourceCost {
  resourceType: 'instance' | 'storage' | 'gpu' | 'network' | 'snapshot' | 'inference';
  resourceName: string;
  resourceId: string;
  cost: number;
  percentage: number;
  usage: string;
  status: 'running' | 'stopped' | 'deleted';
}

export interface BillingRecord {
  id: string;
  date: string;
  resourceType: 'instance' | 'storage' | 'gpu' | 'network' | 'snapshot' | 'inference';
  resourceName: string;
  resourceId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  billingCycle: 'hourly' | 'daily' | 'monthly';
  startTime: string;
  endTime: string;
  status: 'billed' | 'pending' | 'refunded';
}

export interface DailyCost {
  date: string;
  totalCost: number;
  instanceCost: number;
  storageCost: number;
  gpuCost: number;
  networkCost: number;
  otherCost: number;
}

export interface AccountInfo {
  userId: string;
  userName: string;
  email: string;
  phone: string;
  accountType: 'personal' | 'enterprise';
  balance: number;
  creditLimit: number; // 信用额度
  availableBalance: number; // 可用余额 = 余额 + 信用额度
  frozenAmount: number; // 冻结金额
  totalRecharge: number; // 累计充值
  totalConsumption: number; // 累计消费
  createdAt: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface RechargeRecord {
  id: string;
  amount: number;
  paymentMethod: 'alipay' | 'wechat' | 'bank' | 'creditcard' | 'invoice';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  orderId: string;
  createdAt: string;
  completedAt?: string;
  remark?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  type: 'vat-normal' | 'vat-special';
  title: string;
  taxNo: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'issued' | 'rejected';
  billingPeriod: string;
  appliedAt: string;
  issuedAt?: string;
  downloadUrl?: string;
}

export interface PricingRule {
  id: string;
  resourceType: string;
  name: string;
  unit: string;
  price: number;
  description: string;
  billingCycle: 'hourly' | 'daily' | 'monthly';
  discountRules?: {
    level: string;
    discount: number;
  }[];
}

// 获取计费概览
export async function getBillingSummary(): Promise<BillingSummary> {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        currentMonthCost: 15847.63,
        lastMonthCost: 12456.89,
        accountBalance: 50000.00,
        unpaidAmount: 0,
        estimatedCost: 18500.00,
        dailyAverage: 528.25,
      });
    }, 500);
  });
}

// 获取资源费用分布
export async function getResourceCosts(): Promise<ResourceCost[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          resourceType: 'gpu',
          resourceName: 'GPU 算力',
          resourceId: 'gpu-pool-001',
          cost: 8945.32,
          percentage: 56.5,
          usage: '2456 GPU小时',
          status: 'running',
        },
        {
          resourceType: 'instance',
          resourceName: '容器实例',
          resourceId: 'instances',
          cost: 3821.45,
          percentage: 24.1,
          usage: '15 个实例',
          status: 'running',
        },
        {
          resourceType: 'storage',
          resourceName: '存储卷',
          resourceId: 'storage',
          cost: 2145.67,
          percentage: 13.5,
          usage: '5.2 TB',
          status: 'running',
        },
        {
          resourceType: 'inference',
          resourceName: '推理服务',
          resourceId: 'inference',
          cost: 634.89,
          percentage: 4.0,
          usage: '125万次调用',
          status: 'running',
        },
        {
          resourceType: 'network',
          resourceName: '网络流量',
          resourceId: 'network',
          cost: 200.30,
          percentage: 1.3,
          usage: '850 GB',
          status: 'running',
        },
        {
          resourceType: 'snapshot',
          resourceName: '快照备份',
          resourceId: 'snapshot',
          cost: 100.00,
          percentage: 0.6,
          usage: '120 GB',
          status: 'running',
        },
      ]);
    }, 500);
  });
}

// 获取计费明细
export async function getBillingRecords(
  startDate: string,
  endDate: string,
  resourceType?: string
): Promise<BillingRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const records: BillingRecord[] = [];
      
      // 生成模拟数据
      for (let i = 0; i < 50; i++) {
        const types: Array<BillingRecord['resourceType']> = ['instance', 'storage', 'gpu', 'network', 'inference'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        records.push({
          id: `bill-${1000 + i}`,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          resourceType: type,
          resourceName: `${type}-resource-${i}`,
          resourceId: `res-${1000 + i}`,
          description: getResourceDescription(type),
          quantity: Math.random() * 24,
          unit: type === 'storage' ? 'GB·天' : type === 'network' ? 'GB' : '小时',
          unitPrice: getUnitPrice(type),
          totalCost: Math.random() * 500,
          billingCycle: 'hourly',
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - (i - 1) * 24 * 60 * 60 * 1000).toISOString(),
          status: 'billed',
        });
      }
      
      resolve(records);
    }, 500);
  });
}

// 获取每日费用趋势
export async function getDailyCosts(days: number = 30): Promise<DailyCost[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const costs: DailyCost[] = [];
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        costs.push({
          date: date.toISOString().split('T')[0],
          totalCost: 400 + Math.random() * 300,
          instanceCost: 120 + Math.random() * 80,
          storageCost: 60 + Math.random() * 40,
          gpuCost: 180 + Math.random() * 150,
          networkCost: 20 + Math.random() * 20,
          otherCost: 20 + Math.random() * 10,
        });
      }
      
      resolve(costs);
    }, 500);
  });
}

// 获取账户信息
export async function getAccountInfo(): Promise<AccountInfo> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        userId: 'user-001',
        userName: 'zhangsan',
        email: 'zhangsan@fermicluster.com',
        phone: '138****5678',
        accountType: 'enterprise',
        balance: 50000.00,
        creditLimit: 10000.00,
        availableBalance: 60000.00,
        frozenAmount: 500.00,
        totalRecharge: 200000.00,
        totalConsumption: 150000.00,
        createdAt: '2023-06-15T08:00:00Z',
        level: 'gold',
      });
    }, 500);
  });
}

// 获取充值记录
export async function getRechargeRecords(): Promise<RechargeRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'rech-001',
          amount: 10000.00,
          paymentMethod: 'alipay',
          status: 'success',
          orderId: 'ORD202411120001',
          createdAt: '2024-11-12T10:30:00Z',
          completedAt: '2024-11-12T10:30:15Z',
        },
        {
          id: 'rech-002',
          amount: 20000.00,
          paymentMethod: 'bank',
          status: 'success',
          orderId: 'ORD202411050001',
          createdAt: '2024-11-05T14:20:00Z',
          completedAt: '2024-11-05T16:45:00Z',
          remark: '对公转账',
        },
        {
          id: 'rech-003',
          amount: 5000.00,
          paymentMethod: 'wechat',
          status: 'success',
          orderId: 'ORD202410280001',
          createdAt: '2024-10-28T09:15:00Z',
          completedAt: '2024-10-28T09:15:08Z',
        },
      ]);
    }, 500);
  });
}

// 获取发票列表
export async function getInvoices(): Promise<Invoice[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'inv-001',
          invoiceNo: 'INV202411001',
          type: 'vat-special',
          title: '北京某某科技有限公司',
          taxNo: '91110000XXXXXXXXXX',
          amount: 12456.89,
          taxAmount: 1619.40,
          totalAmount: 14076.29,
          status: 'issued',
          billingPeriod: '2024-10',
          appliedAt: '2024-11-01T10:00:00Z',
          issuedAt: '2024-11-03T15:30:00Z',
          downloadUrl: '/invoices/INV202411001.pdf',
        },
        {
          id: 'inv-002',
          invoiceNo: 'INV202410001',
          type: 'vat-special',
          title: '北京某某科技有限公司',
          taxNo: '91110000XXXXXXXXXX',
          amount: 10234.56,
          taxAmount: 1330.49,
          totalAmount: 11565.05,
          status: 'issued',
          billingPeriod: '2024-09',
          appliedAt: '2024-10-01T10:00:00Z',
          issuedAt: '2024-10-03T14:20:00Z',
          downloadUrl: '/invoices/INV202410001.pdf',
        },
        {
          id: 'inv-003',
          invoiceNo: '',
          type: 'vat-special',
          title: '北京某某科技有限公司',
          taxNo: '91110000XXXXXXXXXX',
          amount: 15847.63,
          taxAmount: 2060.19,
          totalAmount: 17907.82,
          status: 'processing',
          billingPeriod: '2024-11',
          appliedAt: '2024-11-10T09:00:00Z',
        },
      ]);
    }, 500);
  });
}

// 获取价格规则
export async function getPricingRules(): Promise<PricingRule[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'price-001',
          resourceType: 'gpu',
          name: 'NVIDIA A100 40GB',
          unit: '卡·小时',
          price: 15.00,
          description: '高性能GPU算力，适用于大规模深度学习训练',
          billingCycle: 'hourly',
          discountRules: [
            { level: 'gold', discount: 0.9 },
            { level: 'platinum', discount: 0.85 },
          ],
        },
        {
          id: 'price-002',
          resourceType: 'gpu',
          name: 'NVIDIA V100 32GB',
          unit: '卡·小时',
          price: 12.00,
          description: '经典GPU算力，性价比高',
          billingCycle: 'hourly',
        },
        {
          id: 'price-003',
          resourceType: 'cpu',
          name: 'CPU 核心',
          unit: '核·小时',
          price: 0.50,
          description: '通用CPU算力',
          billingCycle: 'hourly',
        },
        {
          id: 'price-004',
          resourceType: 'memory',
          name: '内存',
          unit: 'GB·小时',
          price: 0.10,
          description: '容器实例内存',
          billingCycle: 'hourly',
        },
        {
          id: 'price-005',
          resourceType: 'storage',
          name: '文件存储',
          unit: 'GB·月',
          price: 0.35,
          description: 'NFS文件存储',
          billingCycle: 'monthly',
        },
        {
          id: 'price-006',
          resourceType: 'storage',
          name: '对象存储',
          unit: 'GB·月',
          price: 0.25,
          description: 'S3兼容对象存储',
          billingCycle: 'monthly',
        },
        {
          id: 'price-007',
          resourceType: 'network',
          name: '公网出流量',
          unit: 'GB',
          price: 0.80,
          description: '公网数据传输流量',
          billingCycle: 'daily',
        },
        {
          id: 'price-008',
          resourceType: 'inference',
          name: '推理服务调用',
          unit: '千次',
          price: 2.00,
          description: 'API推理服务调用次数',
          billingCycle: 'daily',
        },
      ]);
    }, 500);
  });
}

// 创建充值订单
export async function createRechargeOrder(
  amount: number,
  paymentMethod: RechargeRecord['paymentMethod']
): Promise<{ orderId: string; paymentUrl?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        orderId: `ORD${Date.now()}`,
        paymentUrl: paymentMethod === 'alipay' || paymentMethod === 'wechat' 
          ? `https://pay.example.com/${Date.now()}` 
          : undefined,
      });
    }, 500);
  });
}

// 申请发票
export async function applyInvoice(data: {
  type: 'vat-normal' | 'vat-special';
  title: string;
  taxNo: string;
  amount: number;
  billingPeriod: string;
}): Promise<{ success: boolean; invoiceId: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        invoiceId: `inv-${Date.now()}`,
      });
    }, 500);
  });
}

// 辅助函数
function getResourceDescription(type: string): string {
  const descriptions: Record<string, string> = {
    instance: '容器实例运行费用',
    storage: '存储卷占用费用',
    gpu: 'GPU算力使用费用',
    network: '网络流量费用',
    inference: '推理服务调用费用',
    snapshot: '快照存储费用',
  };
  return descriptions[type] || '资源使用费用';
}

function getUnitPrice(type: string): number {
  const prices: Record<string, number> = {
    instance: 0.5,
    storage: 0.35,
    gpu: 15.0,
    network: 0.8,
    inference: 0.002,
    snapshot: 0.3,
  };
  return prices[type] || 1.0;
}
