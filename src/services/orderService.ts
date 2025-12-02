// 订单服务

export interface Order {
  id: string;
  orderNo: string;
  orderType: 'instance' | 'training' | 'inference' | 'storage' | 'gpu' | 'snapshot';
  orderName: string;
  resourceId: string;
  resourceName: string;
  status: 'running' | 'completed' | 'cancelled' | 'pending' | 'failed';
  billingType: 'hourly' | 'daily' | 'monthly' | 'package';
  createdAt: string;
  startTime: string;
  endTime?: string;
  duration: number; // 运行时长（小时）
  totalCost: number;
  paidAmount: number;
  unpaidAmount: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'overdue';
  specs: {
    cpu?: number;
    memory?: number;
    gpu?: {
      type: string;
      count: number;
    };
    storage?: {
      type: string;
      size: number;
    };
    bandwidth?: number;
  };
  breakdown: OrderCostBreakdown[];
  userId: string;
  userName: string;
  tags?: string[];
  description?: string;
}

export interface OrderCostBreakdown {
  item: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  description?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  runningOrders: number;
  completedOrders: number;
  totalCost: number;
  totalPaid: number;
  totalUnpaid: number;
  ordersByType: {
    type: string;
    count: number;
    cost: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
  }[];
}

export interface OrderFilter {
  orderType?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

// 获取订单列表
export async function getOrders(filter?: OrderFilter): Promise<Order[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders: Order[] = [
        // 容器实例订单
        {
          id: 'order-001',
          orderNo: 'ORD202411120001',
          orderType: 'instance',
          orderName: 'PyTorch开发环境',
          resourceId: 'instance-001',
          resourceName: 'pytorch-dev-001',
          status: 'running',
          billingType: 'hourly',
          createdAt: '2024-11-12T08:00:00Z',
          startTime: '2024-11-12T08:00:00Z',
          duration: 72.5,
          totalCost: 3625.00,
          paidAmount: 3625.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            cpu: 16,
            memory: 64,
            gpu: {
              type: 'NVIDIA A100 40GB',
              count: 2,
            },
          },
          breakdown: [
            {
              item: 'GPU 算力',
              quantity: 145,
              unit: '卡·小时',
              unitPrice: 15.0,
              subtotal: 2175.00,
              description: 'NVIDIA A100 40GB × 2',
            },
            {
              item: 'CPU 算力',
              quantity: 1160,
              unit: '核·小时',
              unitPrice: 0.5,
              subtotal: 580.00,
              description: '16核心',
            },
            {
              item: '内存',
              quantity: 4640,
              unit: 'GB·小时',
              unitPrice: 0.1,
              subtotal: 464.00,
              description: '64GB',
            },
            {
              item: '系统盘',
              quantity: 72.5,
              unit: 'GB·小时',
              unitPrice: 0.001,
              subtotal: 6.00,
              description: '100GB SSD',
            },
            {
              item: '公网流量',
              quantity: 50,
              unit: 'GB',
              unitPrice: 0.8,
              subtotal: 400.00,
            },
          ],
          userId: 'user-001',
          userName: 'zhangsan',
          tags: ['开发', 'PyTorch'],
        },
        {
          id: 'order-002',
          orderNo: 'ORD202411100023',
          orderType: 'instance',
          orderName: 'TensorFlow训练集群',
          resourceId: 'instance-002',
          resourceName: 'tf-cluster-prod',
          status: 'completed',
          billingType: 'hourly',
          createdAt: '2024-11-10T10:00:00Z',
          startTime: '2024-11-10T10:00:00Z',
          endTime: '2024-11-11T18:00:00Z',
          duration: 32,
          totalCost: 1920.00,
          paidAmount: 1920.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            cpu: 32,
            memory: 128,
            gpu: {
              type: 'NVIDIA V100 32GB',
              count: 4,
            },
          },
          breakdown: [
            {
              item: 'GPU 算力',
              quantity: 128,
              unit: '卡·小时',
              unitPrice: 12.0,
              subtotal: 1536.00,
              description: 'NVIDIA V100 32GB × 4',
            },
            {
              item: 'CPU 算力',
              quantity: 1024,
              unit: '核·小时',
              unitPrice: 0.5,
              subtotal: 256.00,
            },
            {
              item: '内存',
              quantity: 4096,
              unit: 'GB·小时',
              unitPrice: 0.1,
              subtotal: 128.00,
            },
          ],
          userId: 'user-002',
          userName: 'lisi',
          tags: ['生产', 'TensorFlow'],
        },

        // 训练任务订单
        {
          id: 'order-003',
          orderNo: 'ORD202411090015',
          orderType: 'training',
          orderName: 'BERT模型微调任务',
          resourceId: 'job-001',
          resourceName: 'bert-finetune-job',
          status: 'completed',
          billingType: 'hourly',
          createdAt: '2024-11-09T14:00:00Z',
          startTime: '2024-11-09T14:30:00Z',
          endTime: '2024-11-10T08:30:00Z',
          duration: 18,
          totalCost: 2160.00,
          paidAmount: 2160.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            gpu: {
              type: 'NVIDIA A100 80GB',
              count: 8,
            },
            storage: {
              type: '数据集存储',
              size: 500,
            },
          },
          breakdown: [
            {
              item: 'GPU 算力',
              quantity: 144,
              unit: '卡·小时',
              unitPrice: 18.0,
              subtotal: 2592.00,
              description: 'NVIDIA A100 80GB × 8',
            },
            {
              item: '数据集存储',
              quantity: 9000,
              unit: 'GB·小时',
              unitPrice: 0.0005,
              subtotal: 4.50,
              description: '500GB',
            },
            {
              item: '模型输出存储',
              quantity: 1800,
              unit: 'GB·小时',
              unitPrice: 0.0005,
              subtotal: 0.90,
              description: '100GB',
            },
          ],
          userId: 'user-001',
          userName: 'zhangsan',
          tags: ['NLP', 'BERT', '微调'],
          description: '基于BERT的文本分类任务微调',
        },
        {
          id: 'order-004',
          orderNo: 'ORD202411110032',
          orderType: 'training',
          orderName: 'GPT-3预训练',
          resourceId: 'job-002',
          resourceName: 'gpt3-pretrain',
          status: 'running',
          billingType: 'hourly',
          createdAt: '2024-11-11T00:00:00Z',
          startTime: '2024-11-11T00:30:00Z',
          duration: 35.5,
          totalCost: 8520.00,
          paidAmount: 8520.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            gpu: {
              type: 'NVIDIA A100 80GB',
              count: 16,
            },
          },
          breakdown: [
            {
              item: 'GPU 算力',
              quantity: 568,
              unit: '卡·小时',
              unitPrice: 18.0,
              subtotal: 10224.00,
              description: 'NVIDIA A100 80GB × 16',
            },
          ],
          userId: 'user-003',
          userName: 'wangwu',
          tags: ['LLM', 'GPT', '预训练'],
          description: '大规模语言模型预训练任务',
        },

        // 推理服务订单
        {
          id: 'order-005',
          orderNo: 'ORD202411080008',
          orderType: 'inference',
          orderName: 'YOLOv8目标检测API',
          resourceId: 'inf-001',
          resourceName: 'yolov8-api',
          status: 'running',
          billingType: 'daily',
          createdAt: '2024-11-08T10:00:00Z',
          startTime: '2024-11-08T10:00:00Z',
          duration: 96,
          totalCost: 1920.00,
          paidAmount: 1920.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            gpu: {
              type: 'NVIDIA T4',
              count: 2,
            },
          },
          breakdown: [
            {
              item: 'GPU 推理',
              quantity: 192,
              unit: '卡·小时',
              unitPrice: 8.0,
              subtotal: 1536.00,
              description: 'NVIDIA T4 × 2',
            },
            {
              item: 'API 调用',
              quantity: 125000,
              unit: '千次',
              unitPrice: 2.0,
              subtotal: 250.00,
            },
            {
              item: '公网流量',
              quantity: 168,
              unit: 'GB',
              unitPrice: 0.8,
              subtotal: 134.40,
            },
          ],
          userId: 'user-002',
          userName: 'lisi',
          tags: ['推理', 'YOLO', '目标检测'],
        },
        {
          id: 'order-006',
          orderNo: 'ORD202411070045',
          orderType: 'inference',
          orderName: 'ChatGLM对话服务',
          resourceId: 'inf-002',
          resourceName: 'chatglm-service',
          status: 'running',
          billingType: 'hourly',
          createdAt: '2024-11-07T15:00:00Z',
          startTime: '2024-11-07T15:00:00Z',
          duration: 120,
          totalCost: 4320.00,
          paidAmount: 4320.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            gpu: {
              type: 'NVIDIA A100 40GB',
              count: 4,
            },
          },
          breakdown: [
            {
              item: 'GPU 推理',
              quantity: 480,
              unit: '卡·小时',
              unitPrice: 12.0,
              subtotal: 5760.00,
              description: 'NVIDIA A100 40GB × 4',
            },
            {
              item: 'API 调用',
              quantity: 280000,
              unit: '千次',
              unitPrice: 2.0,
              subtotal: 560.00,
            },
          ],
          userId: 'user-001',
          userName: 'zhangsan',
          tags: ['推理', 'ChatGLM', 'LLM'],
        },

        // 存储订单
        {
          id: 'order-007',
          orderNo: 'ORD202411010012',
          orderType: 'storage',
          orderName: '数据集存储卷',
          resourceId: 'vol-001',
          resourceName: 'dataset-storage-vol',
          status: 'running',
          billingType: 'monthly',
          createdAt: '2024-11-01T00:00:00Z',
          startTime: '2024-11-01T00:00:00Z',
          duration: 264,
          totalCost: 875.00,
          paidAmount: 875.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            storage: {
              type: 'NFS 文件存储',
              size: 2000,
            },
          },
          breakdown: [
            {
              item: 'NFS 存储',
              quantity: 2000,
              unit: 'GB·月',
              unitPrice: 0.35,
              subtotal: 700.00,
              description: '2TB 文件存储',
            },
            {
              item: '快照备份',
              quantity: 500,
              unit: 'GB·月',
              unitPrice: 0.30,
              subtotal: 150.00,
              description: '500GB 快照',
            },
            {
              item: '数据传输',
              quantity: 31.25,
              unit: 'GB',
              unitPrice: 0.8,
              subtotal: 25.00,
            },
          ],
          userId: 'user-003',
          userName: 'wangwu',
          tags: ['存储', 'NFS', '数据集'],
        },
        {
          id: 'order-008',
          orderNo: 'ORD202410280034',
          orderType: 'storage',
          orderName: '对象存储包月',
          resourceId: 'oss-001',
          resourceName: 'model-oss-bucket',
          status: 'running',
          billingType: 'monthly',
          createdAt: '2024-10-28T00:00:00Z',
          startTime: '2024-10-28T00:00:00Z',
          duration: 360,
          totalCost: 625.00,
          paidAmount: 625.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            storage: {
              type: 'S3 对象存储',
              size: 2500,
            },
          },
          breakdown: [
            {
              item: 'S3 存储',
              quantity: 2500,
              unit: 'GB·月',
              unitPrice: 0.25,
              subtotal: 625.00,
              description: '2.5TB 对象存储',
            },
          ],
          userId: 'user-002',
          userName: 'lisi',
          tags: ['存储', 'S3', '模型仓库'],
        },

        // GPU 算力包订单
        {
          id: 'order-009',
          orderNo: 'ORD202411050019',
          orderType: 'gpu',
          orderName: 'A100算力包月套餐',
          resourceId: 'pkg-001',
          resourceName: 'a100-monthly-package',
          status: 'running',
          billingType: 'package',
          createdAt: '2024-11-05T00:00:00Z',
          startTime: '2024-11-05T00:00:00Z',
          duration: 168,
          totalCost: 21600.00,
          paidAmount: 21600.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            gpu: {
              type: 'NVIDIA A100 40GB',
              count: 4,
            },
          },
          breakdown: [
            {
              item: 'A100 算力包',
              quantity: 1,
              unit: '月',
              unitPrice: 21600.00,
              subtotal: 21600.00,
              description: '4卡 × 30天包月',
            },
          ],
          userId: 'user-003',
          userName: 'wangwu',
          tags: ['GPU', 'A100', '包月'],
          description: '按月付费，享受85折优惠',
        },

        // 快照订单
        {
          id: 'order-010',
          orderNo: 'ORD202411060027',
          orderType: 'snapshot',
          orderName: '系统快照备份',
          resourceId: 'snap-001',
          resourceName: 'system-backup-snap',
          status: 'completed',
          billingType: 'monthly',
          createdAt: '2024-11-06T02:00:00Z',
          startTime: '2024-11-06T02:00:00Z',
          endTime: '2024-11-12T02:00:00Z',
          duration: 144,
          totalCost: 90.00,
          paidAmount: 90.00,
          unpaidAmount: 0,
          paymentStatus: 'paid',
          specs: {
            storage: {
              type: '快照存储',
              size: 300,
            },
          },
          breakdown: [
            {
              item: '快照存储',
              quantity: 300,
              unit: 'GB·月',
              unitPrice: 0.30,
              subtotal: 90.00,
              description: '300GB 快照',
            },
          ],
          userId: 'user-001',
          userName: 'zhangsan',
          tags: ['快照', '备份'],
        },
        
        // 未支付订单 - 用于测试支付功能
        {
          id: 'order-011',
          orderNo: 'ORD202411270001',
          orderType: 'training',
          orderName: 'ResNet-50图像分类训练',
          resourceId: 'job-003',
          resourceName: 'resnet50-training',
          status: 'running',
          billingType: 'hourly',
          createdAt: '2024-11-27T10:00:00Z',
          startTime: '2024-11-27T10:30:00Z',
          duration: 8.5,
          totalCost: 2550.00,
          paidAmount: 0,
          unpaidAmount: 2550.00,
          paymentStatus: 'unpaid',
          specs: {
            gpu: {
              type: 'NVIDIA A100 40GB',
              count: 4,
            },
            storage: {
              type: '数据集存储',
              size: 200,
            },
          },
          breakdown: [
            {
              item: 'GPU 算力',
              quantity: 34,
              unit: '卡·小时',
              unitPrice: 15.0,
              subtotal: 510.00,
              description: 'NVIDIA A100 40GB × 4',
            },
            {
              item: '数据集存储',
              quantity: 1700,
              unit: 'GB·小时',
              unitPrice: 0.0005,
              subtotal: 0.85,
              description: '200GB',
            },
            {
              item: '模型输出存储',
              quantity: 425,
              unit: 'GB·小时',
              unitPrice: 0.0005,
              subtotal: 0.21,
              description: '50GB',
            },
          ],
          userId: 'user-001',
          userName: 'zhangsan',
          tags: ['计算机视觉', 'ResNet', '图像分类'],
          description: 'ResNet-50模型在ImageNet数据集上的训练任务',
        },
        {
          id: 'order-012',
          orderNo: 'ORD202411270002',
          orderType: 'instance',
          orderName: 'Jupyter数据分析环境',
          resourceId: 'instance-003',
          resourceName: 'jupyter-analytics',
          status: 'pending',
          billingType: 'hourly',
          createdAt: '2024-11-27T12:00:00Z',
          startTime: '2024-11-27T12:00:00Z',
          duration: 0,
          totalCost: 1280.00,
          paidAmount: 0,
          unpaidAmount: 1280.00,
          paymentStatus: 'unpaid',
          specs: {
            cpu: 8,
            memory: 32,
            gpu: {
              type: 'NVIDIA T4',
              count: 1,
            },
          },
          breakdown: [
            {
              item: 'GPU 算力',
              quantity: 0,
              unit: '卡·小时',
              unitPrice: 8.0,
              subtotal: 0,
              description: 'NVIDIA T4 × 1',
            },
            {
              item: 'CPU 算力',
              quantity: 0,
              unit: '核·小时',
              unitPrice: 0.5,
              subtotal: 0,
              description: '8核心',
            },
            {
              item: '内存',
              quantity: 0,
              unit: 'GB·小时',
              unitPrice: 0.1,
              subtotal: 0,
              description: '32GB',
            },
          ],
          userId: 'user-002',
          userName: 'lisi',
          tags: ['开发', 'Jupyter'],
          description: '预付费实例，需支付首期费用',
        },
        {
          id: 'order-013',
          orderNo: 'ORD202411260005',
          orderType: 'gpu',
          orderName: 'V100算力包周套餐',
          resourceId: 'pkg-002',
          resourceName: 'v100-weekly-package',
          status: 'pending',
          billingType: 'package',
          createdAt: '2024-11-26T00:00:00Z',
          startTime: '2024-11-26T00:00:00Z',
          duration: 0,
          totalCost: 6720.00,
          paidAmount: 0,
          unpaidAmount: 6720.00,
          paymentStatus: 'unpaid',
          specs: {
            gpu: {
              type: 'NVIDIA V100 32GB',
              count: 2,
            },
          },
          breakdown: [
            {
              item: 'V100 算力包',
              quantity: 1,
              unit: '周',
              unitPrice: 6720.00,
              subtotal: 6720.00,
              description: '2卡 × 7天包周',
            },
          ],
          userId: 'user-003',
          userName: 'wangwu',
          tags: ['GPU', 'V100', '包周'],
          description: '按周付费，享受9折优惠',
        },
      ];

      // 应用筛选
      let filtered = orders;

      if (filter) {
        if (filter.orderType && filter.orderType !== 'all') {
          filtered = filtered.filter((o) => o.orderType === filter.orderType);
        }
        if (filter.status && filter.status !== 'all') {
          filtered = filtered.filter((o) => o.status === filter.status);
        }
        if (filter.paymentStatus && filter.paymentStatus !== 'all') {
          filtered = filtered.filter((o) => o.paymentStatus === filter.paymentStatus);
        }
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          filtered = filtered.filter(
            (o) =>
              o.orderNo.toLowerCase().includes(term) ||
              o.orderName.toLowerCase().includes(term) ||
              o.resourceName.toLowerCase().includes(term)
          );
        }
      }

      resolve(filtered);
    }, 500);
  });
}

// 获取订单详情
export async function getOrderDetails(orderId: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.id === orderId) || null;
}

// 获取订单统计
export async function getOrderStatistics(): Promise<OrderStatistics> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const orders = await getOrders();

      const stats: OrderStatistics = {
        totalOrders: orders.length,
        runningOrders: orders.filter((o) => o.status === 'running').length,
        completedOrders: orders.filter((o) => o.status === 'completed').length,
        totalCost: orders.reduce((sum, o) => sum + o.totalCost, 0),
        totalPaid: orders.reduce((sum, o) => sum + o.paidAmount, 0),
        totalUnpaid: orders.reduce((sum, o) => sum + o.unpaidAmount, 0),
        ordersByType: [
          {
            type: 'instance',
            count: orders.filter((o) => o.orderType === 'instance').length,
            cost: orders
              .filter((o) => o.orderType === 'instance')
              .reduce((sum, o) => sum + o.totalCost, 0),
          },
          {
            type: 'training',
            count: orders.filter((o) => o.orderType === 'training').length,
            cost: orders
              .filter((o) => o.orderType === 'training')
              .reduce((sum, o) => sum + o.totalCost, 0),
          },
          {
            type: 'inference',
            count: orders.filter((o) => o.orderType === 'inference').length,
            cost: orders
              .filter((o) => o.orderType === 'inference')
              .reduce((sum, o) => sum + o.totalCost, 0),
          },
          {
            type: 'storage',
            count: orders.filter((o) => o.orderType === 'storage').length,
            cost: orders
              .filter((o) => o.orderType === 'storage')
              .reduce((sum, o) => sum + o.totalCost, 0),
          },
          {
            type: 'gpu',
            count: orders.filter((o) => o.orderType === 'gpu').length,
            cost: orders
              .filter((o) => o.orderType === 'gpu')
              .reduce((sum, o) => sum + o.totalCost, 0),
          },
        ],
        ordersByStatus: [
          {
            status: 'running',
            count: orders.filter((o) => o.status === 'running').length,
          },
          {
            status: 'completed',
            count: orders.filter((o) => o.status === 'completed').length,
          },
          {
            status: 'cancelled',
            count: orders.filter((o) => o.status === 'cancelled').length,
          },
        ],
      };

      resolve(stats);
    }, 500);
  });
}

// 取消订单
export async function cancelOrder(orderId: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
}

// 导出订单
export async function exportOrders(filter?: OrderFilter): Promise<{ success: boolean; url: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        url: '/exports/orders_export.xlsx',
      });
    }, 1000);
  });
}