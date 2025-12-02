import { Permission } from './permissions';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any; // LucideIcon type
  description?: string;
  requiredPermissions?: Permission[]; // 任意一个权限即可访问
  requireAllPermissions?: Permission[]; // 需要全部权限才能访问
}

export interface MenuGroup {
  group: string;
  items: MenuItem[];
  requiredPermissions?: Permission[]; // 如果设置，则需要权限才显示整个组
}

/**
 * 菜单配置
 * 根据权限动态显示菜单项
 */
export const menuConfig: MenuGroup[] = [
  // ========== 总览 ==========
  {
    group: '总览',
    items: [
      {
        id: 'dashboard',
        label: '仪表盘',
        icon: 'LayoutDashboard',
        requiredPermissions: [Permission.VIEW_DASHBOARD],
      },
    ],
  },
  
  // ========== 算力资源（管理员和运维可见） ==========
  {
    group: '算力资源',
    requiredPermissions: [
      Permission.VIEW_COMPUTE_NODES,
      Permission.VIEW_GPU_POOLS,
      Permission.VIEW_CLUSTERS,
    ],
    items: [
      {
        id: 'clusters',
        label: '集群管理',
        icon: 'Layers',
        requiredPermissions: [Permission.VIEW_CLUSTERS],
      },
      {
        id: 'compute-nodes',
        label: '计算节点',
        icon: 'Server',
        requiredPermissions: [Permission.VIEW_COMPUTE_NODES],
      },
      {
        id: 'gpu-pools',
        label: 'GPU资源池',
        icon: 'Cpu',
        requiredPermissions: [Permission.VIEW_GPU_POOLS],
      },
    ],
  },
  
  // ========== AI工作负载（所有用户可见） ==========
  {
    group: 'AI工作负载',
    items: [
      {
        id: 'instances',
        label: '开发环境',
        icon: 'Terminal',
        description: '交互式容器实例',
        requiredPermissions: [Permission.VIEW_INSTANCES],
      },
      {
        id: 'training-jobs',
        label: '训练任务',
        icon: 'Zap',
        description: '批处理训练作业',
        requiredPermissions: [Permission.VIEW_TRAINING_JOBS],
      },
      {
        id: 'inference-services',
        label: '推理服务',
        icon: 'Rocket',
        description: '在线API服务',
        requiredPermissions: [Permission.VIEW_INFERENCE_SERVICES],
      },
      {
        id: 'model-evaluation',
        label: '模型评测',
        icon: 'TrendingUp',
        description: '模型能力评估',
        requiredPermissions: [Permission.VIEW_EVALUATIONS],
      },
      {
        id: 'pipeline-orchestration',
        label: 'Pipeline编排',
        icon: 'GitBranch',
        description: '端到端流程',
        requiredPermissions: [Permission.VIEW_PIPELINES],
      },
    ],
  },
  
  // ========== 数据资产（所有用户可见） ==========
  {
    group: '数据资产',
    items: [
      {
        id: 'images',
        label: '镜像管理',
        icon: 'Package',
        requiredPermissions: [Permission.VIEW_IMAGES],
      },
      {
        id: 'datasets',
        label: '数据集',
        icon: 'Database',
        requiredPermissions: [Permission.VIEW_DATASETS],
      },
      {
        id: 'models',
        label: '模型仓库',
        icon: 'Box',
        requiredPermissions: [Permission.VIEW_MODELS],
      },
    ],
  },
  
  // ========== 存储管理 ==========
  {
    group: '存储管理',
    items: [
      {
        id: 'storage-volumes',
        label: '存储卷',
        icon: 'FolderOpen',
        requiredPermissions: [Permission.VIEW_STORAGE_VOLUMES],
      },
      {
        id: 'smb-shares',
        label: 'SMB共享',
        icon: 'Share2',
        requiredPermissions: [Permission.VIEW_SMB_SHARES],
      },
      {
        id: 'storage-pools',
        label: '存储池',
        icon: 'HardDrive',
        requiredPermissions: [Permission.VIEW_STORAGE_POOLS],
      },
      {
        id: 'storage-backends',
        label: '存储后端',
        icon: 'Server',
        requiredPermissions: [Permission.VIEW_STORAGE_BACKENDS],
      },
      {
        id: 'file-browser',
        label: '文件浏览器',
        icon: 'FolderOpen',
        requiredPermissions: [Permission.VIEW_FILES],
      },
    ],
  },
  
  // ========== 资源调度（管理员和运维可见） ==========
  {
    group: '资源调度',
    requiredPermissions: [
      Permission.VIEW_TASK_QUEUES,
      Permission.VIEW_SCHEDULING,
      Permission.VIEW_ALL_TASKS,
    ],
    items: [
      {
        id: 'scheduling',
        label: '调度中心',
        icon: 'Calendar',
        requiredPermissions: [Permission.VIEW_SCHEDULING],
      },
      {
        id: 'task-queues',
        label: '任务队列',
        icon: 'List',
        description: '队列管理与策略',
        requiredPermissions: [Permission.VIEW_TASK_QUEUES],
      },
      {
        id: 'compute-tasks',
        label: '计算任务',
        icon: 'Play',
        description: '任务监控与操作',
        requiredPermissions: [Permission.VIEW_OWN_TASKS, Permission.VIEW_ALL_TASKS],
      },
      {
        id: 'task-monitoring',
        label: '任务监控',
        icon: 'Activity',
        requiredPermissions: [Permission.VIEW_OWN_TASKS, Permission.VIEW_ALL_TASKS],
      },
    ],
  },
  
  // ========== 费用中心（所有用户可见） ==========
  {
    group: '费用中心',
    items: [
      {
        id: 'account-balance',
        label: '账户余额',
        icon: 'Wallet',
        requiredPermissions: [Permission.VIEW_OWN_BALANCE, Permission.VIEW_ALL_BALANCE],
      },
      {
        id: 'orders',
        label: '订单管理',
        icon: 'ShoppingCart',
        requiredPermissions: [Permission.VIEW_OWN_ORDERS, Permission.VIEW_ALL_ORDERS],
      },
      {
        id: 'billing',
        label: '账单详情',
        icon: 'Receipt',
        requiredPermissions: [Permission.VIEW_OWN_BILLING, Permission.VIEW_ALL_BILLING],
      },
      {
        id: 'invoice-management',
        label: '发票管理',
        icon: 'FileText',
        requiredPermissions: [Permission.VIEW_OWN_INVOICES, Permission.VIEW_ALL_INVOICES],
      },
      {
        id: 'government-vouchers',
        label: '政府算力券',
        icon: 'Ticket',
        requiredPermissions: [Permission.VIEW_OWN_VOUCHERS, Permission.VIEW_ALL_VOUCHERS],
      },
      {
        id: 'billing-config',
        label: '计费配置',
        icon: 'Settings',
        requiredPermissions: [Permission.VIEW_BILLING_CONFIG],
      },
      {
        id: 'pricing-management',
        label: '定价管理',
        icon: 'DollarSign',
        requiredPermissions: [Permission.VIEW_PRICING],
      },
      {
        id: 'discount-management',
        label: '折扣管理',
        icon: 'Percent',
        requiredPermissions: [Permission.VIEW_DISCOUNTS],
      },
    ],
  },
  
  // ========== 监控中心 ==========
  {
    group: '监控中心',
    items: [
      {
        id: 'monitoring',
        label: '系统监控',
        icon: 'Activity',
        requiredPermissions: [Permission.VIEW_MONITORING],
      },
    ],
  },
  
  // ========== 用户与权限（仅管理员可见） ==========
  {
    group: '用户与权限',
    requiredPermissions: [
      Permission.VIEW_USERS,
      Permission.VIEW_ROLES,
      Permission.VIEW_USER_GROUPS,
      Permission.VIEW_ACCESS_CONTROL,
    ],
    items: [
      {
        id: 'users',
        label: '用户管理',
        icon: 'Users',
        requiredPermissions: [Permission.VIEW_USERS],
      },
      {
        id: 'roles',
        label: '角色管理',
        icon: 'Shield',
        requiredPermissions: [Permission.VIEW_ROLES],
      },
      {
        id: 'user-groups',
        label: '用户组',
        icon: 'Users',
        requiredPermissions: [Permission.VIEW_USER_GROUPS],
      },
      {
        id: 'access-control',
        label: '访问控制',
        icon: 'Lock',
        requiredPermissions: [Permission.VIEW_ACCESS_CONTROL],
      },
      {
        id: 'menu-management',
        label: '菜单管理',
        icon: 'Menu',
        requiredPermissions: [Permission.VIEW_MENUS],
      },
      {
        id: 'audit-logs',
        label: '审计日志',
        icon: 'FileText',
        requiredPermissions: [Permission.VIEW_AUDIT_LOGS],
      },
    ],
  },
];