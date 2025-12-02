// 角色定义
export enum UserRole {
  ADMIN = 'admin',           // 系统管理员
  USER = 'user',             // 普通用户
  DEVELOPER = 'developer',   // 开发者
  OPERATOR = 'operator',     // 运维人员
}

// 权限定义
export enum Permission {
  // ========== 平台资源管理 ==========
  // 计算节点
  VIEW_COMPUTE_NODES = 'view_compute_nodes',
  MANAGE_COMPUTE_NODES = 'manage_compute_nodes',
  
  // GPU池管理
  VIEW_GPU_POOLS = 'view_gpu_pools',
  MANAGE_GPU_POOLS = 'manage_gpu_pools',
  
  // 存储池管理
  VIEW_STORAGE_POOLS = 'view_storage_pools',
  MANAGE_STORAGE_POOLS = 'manage_storage_pools',
  
  // 存储后端
  VIEW_STORAGE_BACKENDS = 'view_storage_backends',
  MANAGE_STORAGE_BACKENDS = 'manage_storage_backends',
  
  // 集群管理
  VIEW_CLUSTERS = 'view_clusters',
  MANAGE_CLUSTERS = 'manage_clusters',
  
  // 镜像管理
  VIEW_IMAGES = 'view_images',
  MANAGE_IMAGES = 'manage_images',
  
  // ========== 用户业务资源 ==========
  // 容器实例
  VIEW_INSTANCES = 'view_instances',
  CREATE_INSTANCES = 'create_instances',
  MANAGE_OWN_INSTANCES = 'manage_own_instances',
  MANAGE_ALL_INSTANCES = 'manage_all_instances',
  
  // 训练任务
  VIEW_TRAINING_JOBS = 'view_training_jobs',
  CREATE_TRAINING_JOBS = 'create_training_jobs',
  MANAGE_OWN_TRAINING_JOBS = 'manage_own_training_jobs',
  MANAGE_ALL_TRAINING_JOBS = 'manage_all_training_jobs',
  
  // 推理服务
  VIEW_INFERENCE_SERVICES = 'view_inference_services',
  CREATE_INFERENCE_SERVICES = 'create_inference_services',
  MANAGE_OWN_INFERENCE_SERVICES = 'manage_own_inference_services',
  MANAGE_ALL_INFERENCE_SERVICES = 'manage_all_inference_services',
  
  // 存储卷
  VIEW_STORAGE_VOLUMES = 'view_storage_volumes',
  CREATE_STORAGE_VOLUMES = 'create_storage_volumes',
  MANAGE_OWN_STORAGE_VOLUMES = 'manage_own_storage_volumes',
  MANAGE_ALL_STORAGE_VOLUMES = 'manage_all_storage_volumes',
  
  // SMB共享
  VIEW_SMB_SHARES = 'view_smb_shares',
  CREATE_SMB_SHARES = 'create_smb_shares',
  MANAGE_OWN_SMB_SHARES = 'manage_own_smb_shares',
  MANAGE_ALL_SMB_SHARES = 'manage_all_smb_shares',
  
  // 文件管理
  VIEW_FILES = 'view_files',
  UPLOAD_FILES = 'upload_files',
  MANAGE_OWN_FILES = 'manage_own_files',
  MANAGE_ALL_FILES = 'manage_all_files',
  
  // 数据集
  VIEW_DATASETS = 'view_datasets',
  CREATE_DATASETS = 'create_datasets',
  MANAGE_OWN_DATASETS = 'manage_own_datasets',
  MANAGE_ALL_DATASETS = 'manage_all_datasets',
  
  // 模型
  VIEW_MODELS = 'view_models',
  CREATE_MODELS = 'create_models',
  MANAGE_OWN_MODELS = 'manage_own_models',
  MANAGE_ALL_MODELS = 'manage_all_models',
  
  // 模型评测
  VIEW_EVALUATIONS = 'view_evaluations',
  CREATE_EVALUATIONS = 'create_evaluations',
  MANAGE_OWN_EVALUATIONS = 'manage_own_evaluations',
  MANAGE_ALL_EVALUATIONS = 'manage_all_evaluations',
  
  // Pipeline编排
  VIEW_PIPELINES = 'view_pipelines',
  CREATE_PIPELINES = 'create_pipelines',
  MANAGE_OWN_PIPELINES = 'manage_own_pipelines',
  MANAGE_ALL_PIPELINES = 'manage_all_pipelines',
  
  // ========== 费用中心 ==========
  // 账户余额
  VIEW_OWN_BALANCE = 'view_own_balance',
  VIEW_ALL_BALANCE = 'view_all_balance',
  RECHARGE = 'recharge',
  
  // 订单
  VIEW_OWN_ORDERS = 'view_own_orders',
  VIEW_ALL_ORDERS = 'view_all_orders',
  
  // 账单
  VIEW_OWN_BILLING = 'view_own_billing',
  VIEW_ALL_BILLING = 'view_all_billing',
  
  // 发票
  VIEW_OWN_INVOICES = 'view_own_invoices',
  VIEW_ALL_INVOICES = 'view_all_invoices',
  APPROVE_INVOICES = 'approve_invoices',
  
  // 计费配置
  VIEW_BILLING_CONFIG = 'view_billing_config',
  MANAGE_BILLING_CONFIG = 'manage_billing_config',
  
  // 定价管理
  VIEW_PRICING = 'view_pricing',
  MANAGE_PRICING = 'manage_pricing',
  
  // 折扣管理
  VIEW_DISCOUNTS = 'view_discounts',
  MANAGE_DISCOUNTS = 'manage_discounts',
  
  // 政府算力券
  VIEW_OWN_VOUCHERS = 'view_own_vouchers',
  VIEW_ALL_VOUCHERS = 'view_all_vouchers',
  MANAGE_VOUCHERS = 'manage_vouchers',
  
  // ========== 监控和调度 ==========
  // 监控
  VIEW_MONITORING = 'view_monitoring',
  VIEW_ADVANCED_MONITORING = 'view_advanced_monitoring',
  
  // 任务监控
  VIEW_OWN_TASKS = 'view_own_tasks',
  VIEW_ALL_TASKS = 'view_all_tasks',
  
  // 任务队列
  VIEW_TASK_QUEUES = 'view_task_queues',
  MANAGE_TASK_QUEUES = 'manage_task_queues',
  
  // 资源调度
  VIEW_SCHEDULING = 'view_scheduling',
  MANAGE_SCHEDULING = 'manage_scheduling',
  
  // ========== 用户和权限管理 ==========
  VIEW_USERS = 'view_users',
  MANAGE_USERS = 'manage_users',
  
  VIEW_ROLES = 'view_roles',
  MANAGE_ROLES = 'manage_roles',
  
  VIEW_USER_GROUPS = 'view_user_groups',
  MANAGE_USER_GROUPS = 'manage_user_groups',
  
  VIEW_ACCESS_CONTROL = 'view_access_control',
  MANAGE_ACCESS_CONTROL = 'manage_access_control',
  
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  
  // 菜单管理
  VIEW_MENUS = 'view_menus',
  MANAGE_MENUS = 'manage_menus',
  
  // ========== 系统管理 ==========
  VIEW_SYSTEM_SETTINGS = 'view_system_settings',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  
  // 仪表板
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_ADMIN_DASHBOARD = 'view_admin_dashboard',
}

// 角色权限映射
export const RolePermissions: Record<UserRole, Permission[]> = {
  // ========== 系统管理员权限 ==========
  [UserRole.ADMIN]: [
    // 平台资源管理（完全权限）
    Permission.VIEW_COMPUTE_NODES,
    Permission.MANAGE_COMPUTE_NODES,
    Permission.VIEW_GPU_POOLS,
    Permission.MANAGE_GPU_POOLS,
    Permission.VIEW_STORAGE_POOLS,
    Permission.MANAGE_STORAGE_POOLS,
    Permission.VIEW_STORAGE_BACKENDS,
    Permission.MANAGE_STORAGE_BACKENDS,
    Permission.VIEW_CLUSTERS,
    Permission.MANAGE_CLUSTERS,
    Permission.VIEW_IMAGES,
    Permission.MANAGE_IMAGES,
    
    // 用户业务资源（完全权限）
    Permission.VIEW_INSTANCES,
    Permission.CREATE_INSTANCES,
    Permission.MANAGE_ALL_INSTANCES,
    Permission.VIEW_TRAINING_JOBS,
    Permission.CREATE_TRAINING_JOBS,
    Permission.MANAGE_ALL_TRAINING_JOBS,
    Permission.VIEW_INFERENCE_SERVICES,
    Permission.CREATE_INFERENCE_SERVICES,
    Permission.MANAGE_ALL_INFERENCE_SERVICES,
    Permission.VIEW_STORAGE_VOLUMES,
    Permission.CREATE_STORAGE_VOLUMES,
    Permission.MANAGE_ALL_STORAGE_VOLUMES,
    Permission.VIEW_SMB_SHARES,
    Permission.CREATE_SMB_SHARES,
    Permission.MANAGE_ALL_SMB_SHARES,
    Permission.VIEW_FILES,
    Permission.UPLOAD_FILES,
    Permission.MANAGE_ALL_FILES,
    Permission.VIEW_DATASETS,
    Permission.CREATE_DATASETS,
    Permission.MANAGE_ALL_DATASETS,
    Permission.VIEW_MODELS,
    Permission.CREATE_MODELS,
    Permission.MANAGE_ALL_MODELS,
    Permission.VIEW_EVALUATIONS,
    Permission.CREATE_EVALUATIONS,
    Permission.MANAGE_ALL_EVALUATIONS,
    Permission.VIEW_PIPELINES,
    Permission.CREATE_PIPELINES,
    Permission.MANAGE_ALL_PIPELINES,
    
    // 费用中心（完全权限）
    Permission.VIEW_ALL_BALANCE,
    Permission.RECHARGE,
    Permission.VIEW_ALL_ORDERS,
    Permission.VIEW_ALL_BILLING,
    Permission.VIEW_ALL_INVOICES,
    Permission.APPROVE_INVOICES,
    Permission.VIEW_BILLING_CONFIG,
    Permission.MANAGE_BILLING_CONFIG,
    Permission.VIEW_PRICING,
    Permission.MANAGE_PRICING,
    Permission.VIEW_DISCOUNTS,
    Permission.MANAGE_DISCOUNTS,
    Permission.VIEW_ALL_VOUCHERS,
    Permission.MANAGE_VOUCHERS,
    
    // 监控和调度（完全权限）
    Permission.VIEW_MONITORING,
    Permission.VIEW_ADVANCED_MONITORING,
    Permission.VIEW_ALL_TASKS,
    Permission.VIEW_TASK_QUEUES,
    Permission.MANAGE_TASK_QUEUES,
    Permission.VIEW_SCHEDULING,
    Permission.MANAGE_SCHEDULING,
    
    // 用户和权限管理（完全权限）
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_ROLES,
    Permission.MANAGE_ROLES,
    Permission.VIEW_USER_GROUPS,
    Permission.MANAGE_USER_GROUPS,
    Permission.VIEW_ACCESS_CONTROL,
    Permission.MANAGE_ACCESS_CONTROL,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_MENUS,
    Permission.MANAGE_MENUS,
    
    // 系统管理（完全权限）
    Permission.VIEW_SYSTEM_SETTINGS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ADMIN_DASHBOARD,
  ],
  
  // ========== 普通用户权限 ==========
  [UserRole.USER]: [
    // 平台资源（只读）
    Permission.VIEW_COMPUTE_NODES,
    Permission.VIEW_GPU_POOLS,
    Permission.VIEW_STORAGE_POOLS,
    Permission.VIEW_IMAGES,
    
    // 用户业务资源（仅管理自己的）
    Permission.VIEW_INSTANCES,
    Permission.CREATE_INSTANCES,
    Permission.MANAGE_OWN_INSTANCES,
    Permission.VIEW_TRAINING_JOBS,
    Permission.CREATE_TRAINING_JOBS,
    Permission.MANAGE_OWN_TRAINING_JOBS,
    Permission.VIEW_INFERENCE_SERVICES,
    Permission.CREATE_INFERENCE_SERVICES,
    Permission.MANAGE_OWN_INFERENCE_SERVICES,
    Permission.VIEW_STORAGE_VOLUMES,
    Permission.CREATE_STORAGE_VOLUMES,
    Permission.MANAGE_OWN_STORAGE_VOLUMES,
    Permission.VIEW_SMB_SHARES,
    Permission.CREATE_SMB_SHARES,
    Permission.MANAGE_OWN_SMB_SHARES,
    Permission.VIEW_FILES,
    Permission.UPLOAD_FILES,
    Permission.MANAGE_OWN_FILES,
    Permission.VIEW_DATASETS,
    Permission.CREATE_DATASETS,
    Permission.MANAGE_OWN_DATASETS,
    Permission.VIEW_MODELS,
    Permission.CREATE_MODELS,
    Permission.MANAGE_OWN_MODELS,
    Permission.VIEW_EVALUATIONS,
    Permission.CREATE_EVALUATIONS,
    Permission.MANAGE_OWN_EVALUATIONS,
    Permission.VIEW_PIPELINES,
    Permission.CREATE_PIPELINES,
    Permission.MANAGE_OWN_PIPELINES,
    
    // 费用中心（仅自己的）
    Permission.VIEW_OWN_BALANCE,
    Permission.RECHARGE,
    Permission.VIEW_OWN_ORDERS,
    Permission.VIEW_OWN_BILLING,
    Permission.VIEW_OWN_INVOICES,
    Permission.VIEW_OWN_VOUCHERS,
    
    // 监控（仅自己的）
    Permission.VIEW_MONITORING,
    Permission.VIEW_OWN_TASKS,
    
    // 仪表板
    Permission.VIEW_DASHBOARD,
  ],
  
  // ========== 开发者权限（介于用户和管理员之间） ==========
  [UserRole.DEVELOPER]: [
    // 平台资源（只读）
    Permission.VIEW_COMPUTE_NODES,
    Permission.VIEW_GPU_POOLS,
    Permission.VIEW_STORAGE_POOLS,
    Permission.VIEW_STORAGE_BACKENDS,
    Permission.VIEW_CLUSTERS,
    Permission.VIEW_IMAGES,
    
    // 用户业务资源（仅管理自己的）
    Permission.VIEW_INSTANCES,
    Permission.CREATE_INSTANCES,
    Permission.MANAGE_OWN_INSTANCES,
    Permission.VIEW_TRAINING_JOBS,
    Permission.CREATE_TRAINING_JOBS,
    Permission.MANAGE_OWN_TRAINING_JOBS,
    Permission.VIEW_INFERENCE_SERVICES,
    Permission.CREATE_INFERENCE_SERVICES,
    Permission.MANAGE_OWN_INFERENCE_SERVICES,
    Permission.VIEW_STORAGE_VOLUMES,
    Permission.CREATE_STORAGE_VOLUMES,
    Permission.MANAGE_OWN_STORAGE_VOLUMES,
    Permission.VIEW_SMB_SHARES,
    Permission.CREATE_SMB_SHARES,
    Permission.MANAGE_OWN_SMB_SHARES,
    Permission.VIEW_FILES,
    Permission.UPLOAD_FILES,
    Permission.MANAGE_OWN_FILES,
    Permission.VIEW_DATASETS,
    Permission.CREATE_DATASETS,
    Permission.MANAGE_OWN_DATASETS,
    Permission.VIEW_MODELS,
    Permission.CREATE_MODELS,
    Permission.MANAGE_OWN_MODELS,
    Permission.VIEW_EVALUATIONS,
    Permission.CREATE_EVALUATIONS,
    Permission.MANAGE_OWN_EVALUATIONS,
    Permission.VIEW_PIPELINES,
    Permission.CREATE_PIPELINES,
    Permission.MANAGE_OWN_PIPELINES,
    
    // 费用中心（仅自己的）
    Permission.VIEW_OWN_BALANCE,
    Permission.RECHARGE,
    Permission.VIEW_OWN_ORDERS,
    Permission.VIEW_OWN_BILLING,
    Permission.VIEW_OWN_INVOICES,
    Permission.VIEW_OWN_VOUCHERS,
    
    // 监控（增强的监控权限）
    Permission.VIEW_MONITORING,
    Permission.VIEW_ADVANCED_MONITORING,
    Permission.VIEW_OWN_TASKS,
    Permission.VIEW_TASK_QUEUES,
    
    // 仪表板
    Permission.VIEW_DASHBOARD,
  ],
  
  // ========== 运维人员权限 ==========
  [UserRole.OPERATOR]: [
    // 平台资源管理（完全权限）
    Permission.VIEW_COMPUTE_NODES,
    Permission.MANAGE_COMPUTE_NODES,
    Permission.VIEW_GPU_POOLS,
    Permission.MANAGE_GPU_POOLS,
    Permission.VIEW_STORAGE_POOLS,
    Permission.MANAGE_STORAGE_POOLS,
    Permission.VIEW_STORAGE_BACKENDS,
    Permission.MANAGE_STORAGE_BACKENDS,
    Permission.VIEW_CLUSTERS,
    Permission.MANAGE_CLUSTERS,
    Permission.VIEW_IMAGES,
    Permission.MANAGE_IMAGES,
    
    // 用户业务资源（全部只读）
    Permission.VIEW_INSTANCES,
    Permission.VIEW_TRAINING_JOBS,
    Permission.VIEW_INFERENCE_SERVICES,
    Permission.VIEW_STORAGE_VOLUMES,
    Permission.VIEW_SMB_SHARES,
    Permission.VIEW_FILES,
    Permission.VIEW_DATASETS,
    Permission.VIEW_MODELS,
    Permission.VIEW_EVALUATIONS,
    Permission.VIEW_PIPELINES,
    
    // 监控和调度（完全权限）
    Permission.VIEW_MONITORING,
    Permission.VIEW_ADVANCED_MONITORING,
    Permission.VIEW_ALL_TASKS,
    Permission.VIEW_TASK_QUEUES,
    Permission.MANAGE_TASK_QUEUES,
    Permission.VIEW_SCHEDULING,
    Permission.MANAGE_SCHEDULING,
    
    // 仪表板
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ADMIN_DASHBOARD,
  ],
};

// 页面访问权限配置
export interface PagePermissionConfig {
  path: string;
  requiredPermissions: Permission[];
  requireAll?: boolean; // true表示需要所有权限，false表示只需要任意一个
}

export const PagePermissions: PagePermissionConfig[] = [
  // ========== 仪表板 ==========
  {
    path: '/dashboard',
    requiredPermissions: [Permission.VIEW_DASHBOARD],
  },
  
  // ========== 算力资源 ==========
  {
    path: '/compute-nodes',
    requiredPermissions: [Permission.VIEW_COMPUTE_NODES],
  },
  {
    path: '/gpu-pools',
    requiredPermissions: [Permission.VIEW_GPU_POOLS],
  },
  {
    path: '/instances',
    requiredPermissions: [Permission.VIEW_INSTANCES],
  },
  {
    path: '/clusters',
    requiredPermissions: [Permission.VIEW_CLUSTERS],
  },
  
  // ========== AI工作负载 ==========
  {
    path: '/training-jobs',
    requiredPermissions: [Permission.VIEW_TRAINING_JOBS],
  },
  {
    path: '/inference-services',
    requiredPermissions: [Permission.VIEW_INFERENCE_SERVICES],
  },
  {
    path: '/models',
    requiredPermissions: [Permission.VIEW_MODELS],
  },
  {
    path: '/datasets',
    requiredPermissions: [Permission.VIEW_DATASETS],
  },
  {
    path: '/model-evaluation',
    requiredPermissions: [Permission.VIEW_EVALUATIONS],
  },
  {
    path: '/pipeline-orchestration',
    requiredPermissions: [Permission.VIEW_PIPELINES],
  },
  {
    path: '/images',
    requiredPermissions: [Permission.VIEW_IMAGES],
  },
  
  // ========== 存储资源 ==========
  {
    path: '/storage-volumes',
    requiredPermissions: [Permission.VIEW_STORAGE_VOLUMES],
  },
  {
    path: '/storage-pools',
    requiredPermissions: [Permission.VIEW_STORAGE_POOLS],
  },
  {
    path: '/storage-backends',
    requiredPermissions: [Permission.VIEW_STORAGE_BACKENDS],
  },
  {
    path: '/smb-shares',
    requiredPermissions: [Permission.VIEW_SMB_SHARES],
  },
  {
    path: '/file-browser',
    requiredPermissions: [Permission.VIEW_FILES],
  },
  
  // ========== 费用中心 ==========
  {
    path: '/billing',
    requiredPermissions: [Permission.VIEW_OWN_BILLING, Permission.VIEW_ALL_BILLING],
  },
  {
    path: '/orders',
    requiredPermissions: [Permission.VIEW_OWN_ORDERS, Permission.VIEW_ALL_ORDERS],
  },
  {
    path: '/account-balance',
    requiredPermissions: [Permission.VIEW_OWN_BALANCE, Permission.VIEW_ALL_BALANCE],
  },
  {
    path: '/invoice-management',
    requiredPermissions: [Permission.VIEW_OWN_INVOICES, Permission.VIEW_ALL_INVOICES],
  },
  {
    path: '/government-vouchers',
    requiredPermissions: [Permission.VIEW_OWN_VOUCHERS, Permission.VIEW_ALL_VOUCHERS],
  },
  {
    path: '/billing-config',
    requiredPermissions: [Permission.VIEW_BILLING_CONFIG],
  },
  {
    path: '/pricing-management',
    requiredPermissions: [Permission.VIEW_PRICING],
  },
  {
    path: '/discount-management',
    requiredPermissions: [Permission.VIEW_DISCOUNTS],
  },
  {
    path: '/billing-rules',
    requiredPermissions: [Permission.VIEW_BILLING_CONFIG],
  },
  
  // ========== 监控和调度 ==========
  {
    path: '/monitoring',
    requiredPermissions: [Permission.VIEW_MONITORING],
  },
  {
    path: '/task-monitoring',
    requiredPermissions: [Permission.VIEW_OWN_TASKS, Permission.VIEW_ALL_TASKS],
  },
  {
    path: '/task-queues',
    requiredPermissions: [Permission.VIEW_TASK_QUEUES],
  },
  {
    path: '/scheduling',
    requiredPermissions: [Permission.VIEW_SCHEDULING],
  },
  {
    path: '/compute-tasks',
    requiredPermissions: [Permission.VIEW_OWN_TASKS, Permission.VIEW_ALL_TASKS],
  },
  
  // ========== 用户和权限 ==========
  {
    path: '/users',
    requiredPermissions: [Permission.VIEW_USERS],
  },
  {
    path: '/roles',
    requiredPermissions: [Permission.VIEW_ROLES],
  },
  {
    path: '/user-groups',
    requiredPermissions: [Permission.VIEW_USER_GROUPS],
  },
  {
    path: '/access-control',
    requiredPermissions: [Permission.VIEW_ACCESS_CONTROL],
  },
  {
    path: '/audit-logs',
    requiredPermissions: [Permission.VIEW_AUDIT_LOGS],
  },
  {
    path: '/menus',
    requiredPermissions: [Permission.VIEW_MENUS],
  },
];