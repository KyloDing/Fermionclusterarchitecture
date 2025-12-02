// 政府算力券服务

export interface Voucher {
  id: string;
  voucherCode: string;
  programName: string;
  issuer: string;
  category: 'national' | 'provincial' | 'municipal' | 'special';
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'used' | 'frozen';
  applicableScopes: string[];
  restrictions: string;
  appliedDate: string;
  approvedDate?: string;
  notes?: string;
}

export interface VoucherUsageRecord {
  id: string;
  voucherId: string;
  voucherCode: string;
  programName: string;
  amount: number;
  resourceType: string;
  orderNo: string;
  usageDate: string;
  description: string;
}

// 获取用户可用的算力券（用于支付）
export async function getAvailableVouchers(orderType: string): Promise<Voucher[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allVouchers: Voucher[] = [
        {
          id: 'voucher-001',
          voucherCode: 'GC2024001',
          programName: '国家东数西算算力券项目',
          issuer: '国家发展改革委',
          category: 'national',
          totalAmount: 100000,
          usedAmount: 25000,
          remainingAmount: 75000,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
          status: 'active',
          applicableScopes: ['training', 'inference', 'instance', 'gpu'],
          restrictions: '仅限AI训练和推理任务',
          appliedDate: '2023-12-15T00:00:00Z',
          approvedDate: '2024-01-01T00:00:00Z',
          notes: '国家级算力券，适用于大规模AI计算任务',
        },
        {
          id: 'voucher-002',
          voucherCode: 'SC2024015',
          programName: '四川省智算中心补贴',
          issuer: '四川省科技厅',
          category: 'provincial',
          totalAmount: 50000,
          usedAmount: 12000,
          remainingAmount: 38000,
          startDate: '2024-03-01T00:00:00Z',
          endDate: '2024-11-30T23:59:59Z',
          status: 'active',
          applicableScopes: ['training', 'inference', 'instance'],
          restrictions: '仅限省内企业使用',
          appliedDate: '2024-02-10T00:00:00Z',
          approvedDate: '2024-03-01T00:00:00Z',
        },
        {
          id: 'voucher-003',
          voucherCode: 'CD2024032',
          programName: '成都市AI产业发展专项',
          issuer: '成都市经信局',
          category: 'municipal',
          totalAmount: 30000,
          usedAmount: 8500,
          remainingAmount: 21500,
          startDate: '2024-04-01T00:00:00Z',
          endDate: '2024-12-15T23:59:59Z',
          status: 'active',
          applicableScopes: ['training', 'inference', 'instance', 'gpu', 'storage'],
          restrictions: '成都市注册企业专享',
          appliedDate: '2024-03-20T00:00:00Z',
          approvedDate: '2024-04-01T00:00:00Z',
        },
        {
          id: 'voucher-004',
          voucherCode: 'AI2024088',
          programName: '人工智能创新应用试点',
          issuer: '工业和信息化部',
          category: 'special',
          totalAmount: 80000,
          usedAmount: 35000,
          remainingAmount: 45000,
          startDate: '2024-02-01T00:00:00Z',
          endDate: '2024-11-20T23:59:59Z',
          status: 'active',
          applicableScopes: ['training', 'inference'],
          restrictions: '限AI创新应用项目',
          appliedDate: '2024-01-15T00:00:00Z',
          approvedDate: '2024-02-01T00:00:00Z',
        },
        {
          id: 'voucher-005',
          voucherCode: 'SC2024028',
          programName: '算力普惠工程',
          issuer: '四川省经信厅',
          category: 'provincial',
          totalAmount: 20000,
          usedAmount: 5000,
          remainingAmount: 15000,
          startDate: '2024-05-01T00:00:00Z',
          endDate: '2024-11-18T23:59:59Z',
          status: 'active',
          applicableScopes: ['training', 'inference', 'instance', 'gpu'],
          restrictions: '中小企业专项',
          appliedDate: '2024-04-10T00:00:00Z',
          approvedDate: '2024-05-01T00:00:00Z',
          notes: '优先支持中小企业AI应用',
        },
      ];

      // 筛选可用的算力券（状态为active，余额>0，适用范围匹配，未过期）
      const now = new Date();
      const availableVouchers = allVouchers.filter((v) => {
        const endDate = new Date(v.endDate);
        return (
          v.status === 'active' &&
          v.remainingAmount > 0 &&
          v.applicableScopes.includes(orderType) &&
          endDate > now
        );
      });

      // 按到期时间排序（快到期的排前面）和余额排序
      availableVouchers.sort((a, b) => {
        const aEndDate = new Date(a.endDate).getTime();
        const bEndDate = new Date(b.endDate).getTime();
        
        // 如果到期时间在30天内，优先使用
        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const aExpiringSoon = aEndDate - now < thirtyDays;
        const bExpiringSoon = bEndDate - now < thirtyDays;
        
        if (aExpiringSoon && !bExpiringSoon) return -1;
        if (!aExpiringSoon && bExpiringSoon) return 1;
        
        // 都快到期或都不快到期，按到期时间排序
        if (aExpiringSoon && bExpiringSoon) {
          return aEndDate - bEndDate;
        }
        
        // 都不快到期，按余额从大到小排序
        return b.remainingAmount - a.remainingAmount;
      });

      resolve(availableVouchers);
    }, 300);
  });
}

// 计算算力券可抵扣金额
export function calculateVoucherDeduction(
  vouchers: Voucher[],
  orderAmount: number
): {
  totalDeduction: number;
  voucherUsages: { voucherId: string; amount: number }[];
  remainingAmount: number;
} {
  let remainingAmount = orderAmount;
  const voucherUsages: { voucherId: string; amount: number }[] = [];
  let totalDeduction = 0;

  for (const voucher of vouchers) {
    if (remainingAmount <= 0) break;

    const deductAmount = Math.min(voucher.remainingAmount, remainingAmount);
    
    if (deductAmount > 0) {
      voucherUsages.push({
        voucherId: voucher.id,
        amount: deductAmount,
      });
      totalDeduction += deductAmount;
      remainingAmount -= deductAmount;
    }
  }

  return {
    totalDeduction,
    voucherUsages,
    remainingAmount: Math.max(0, remainingAmount),
  };
}

// 使用算力券支付订单
export async function payWithVouchers(
  orderId: string,
  voucherUsages: { voucherId: string; amount: number }[]
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟支付成功
      resolve({
        success: true,
        message: '支付成功',
      });
    }, 1000);
  });
}

// 获取算力券使用记录
export async function getVoucherUsageRecords(voucherId?: string): Promise<VoucherUsageRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const records: VoucherUsageRecord[] = [
        {
          id: 'usage-001',
          voucherId: 'voucher-001',
          voucherCode: 'GC2024001',
          programName: '国家东数西算算力券项目',
          amount: 8520.0,
          resourceType: 'training',
          orderNo: 'ORD202411110032',
          usageDate: '2024-11-11T00:30:00Z',
          description: 'GPT-3预训练任务',
        },
        {
          id: 'usage-002',
          voucherId: 'voucher-001',
          voucherCode: 'GC2024001',
          programName: '国家东数西算算力券项目',
          amount: 10000.0,
          resourceType: 'training',
          orderNo: 'ORD202411050012',
          usageDate: '2024-11-05T14:20:00Z',
          description: 'BERT大规模预训练',
        },
        {
          id: 'usage-003',
          voucherId: 'voucher-002',
          voucherCode: 'SC2024015',
          programName: '四川省智算中心补贴',
          amount: 4320.0,
          resourceType: 'inference',
          orderNo: 'ORD202411070045',
          usageDate: '2024-11-07T15:00:00Z',
          description: 'ChatGLM对话服务',
        },
        {
          id: 'usage-004',
          voucherId: 'voucher-003',
          voucherCode: 'CD2024032',
          programName: '成都市AI产业发展专项',
          amount: 3625.0,
          resourceType: 'instance',
          orderNo: 'ORD202411120001',
          usageDate: '2024-11-12T08:00:00Z',
          description: 'PyTorch开发环境',
        },
      ];

      if (voucherId) {
        resolve(records.filter((r) => r.voucherId === voucherId));
      } else {
        resolve(records);
      }
    }, 300);
  });
}
