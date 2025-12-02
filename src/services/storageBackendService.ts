// 存储后端服务管理

export type StorageBackendType = 
  | 'local'        // 本地存储
  | 'nfs'          // NFS
  | 'ceph'         // Ceph RBD
  | 'cephfs'       // CephFS
  | 'glusterfs'    // GlusterFS
  | 's3'           // 对象存储 (S3兼容)
  | 'minio'        // MinIO
  | 'iscsi'        // iSCSI
  | 'fc'           // 光纤通道
  | 'beegfs'       // BeeGFS
  | 'cubefs';      // CubeFS

export type StorageBackendStatus = 'connected' | 'disconnected' | 'error' | 'configuring';

export interface StorageBackendConfig {
  id: string;
  name: string;
  type: StorageBackendType;
  description?: string;
  status: StorageBackendStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  
  // 连接配置（不同类型有不同的配置项）
  config: Record<string, any>;
  
  // 统计信息
  stats?: {
    totalCapacity: number;
    usedCapacity: number;
    poolCount: number;
    volumeCount: number;
  };
}

// NFS 配置
export interface NFSConfig {
  server: string;           // NFS服务器地址
  exportPath: string;       // 导出路径
  version: '3' | '4' | '4.1'; // NFS版本
  mountOptions?: string;    // 挂载选项
}

// Ceph RBD 配置
export interface CephRBDConfig {
  monitors: string[];       // Monitor地址列表
  user: string;            // 认证用户
  secret: string;          // 认证密钥
  pool: string;            // Ceph池名称
}

// CephFS 配置
export interface CephFSConfig {
  monitors: string[];       // Monitor地址列表
  user: string;            // 认证用户
  secret: string;          // 认证密钥
  filesystem: string;      // 文件系统名称
}

// S3/MinIO 配置
export interface S3Config {
  endpoint: string;         // 端点地址
  accessKey: string;        // Access Key
  secretKey: string;        // Secret Key
  region?: string;          // 区域
  bucket?: string;          // 默认桶名
  useSSL: boolean;          // 是否使用SSL
}

// GlusterFS 配置
export interface GlusterFSConfig {
  servers: string[];        // GlusterFS服务器列表
  volume: string;           // 卷名称
  mountOptions?: string;    // 挂载选项
}

// iSCSI 配置
export interface ISCSIConfig {
  portal: string;           // iSCSI Portal
  iqn: string;              // IQN (iSCSI Qualified Name)
  lun: number;              // LUN编号
  chapAuth?: {              // CHAP认证
    username: string;
    password: string;
  };
}

// 本地存储配置
export interface LocalStorageConfig {
  path: string;             // 存储路径
  maxSize?: number;         // 最大容量限制（字节）
}

// BeeGFS 配置
export interface BeeGFSConfig {
  managementHost: string;   // 管理服务器地址
  port?: number;            // 管理服务器端口（默认8008）
  mountOptions?: string;    // 挂载选项
  clientConfig?: string;    // 客户端配置路径
}

// CubeFS 配置
export interface CubeFSConfig {
  masterAddr: string[];     // Master节点地址列表
  volName: string;          // 卷名称
  owner: string;            // 所有者
  accessKey?: string;       // 访问密钥
  secretKey?: string;       // 私密密钥
  mountPoint?: string;      // 挂载点
}

// 存储后端类型元数据
export interface StorageBackendTypeMeta {
  type: StorageBackendType;
  label: string;
  description: string;
  icon: string;
  features: string[];
  supportedVolumeTypes: ('block' | 'file' | 'object')[];
  requiresAuth: boolean;
  configSchema: any; // JSON Schema for validation
}

// 存储后端类型元数据
export const storageBackendTypes: StorageBackendTypeMeta[] = [
  {
    type: 'local',
    label: '本地存储',
    description: '使用主机本地磁盘存储',
    icon: 'HardDrive',
    features: ['快速访问', '零网络延迟', '适合测试'],
    supportedVolumeTypes: ['block', 'file'],
    requiresAuth: false,
    configSchema: {},
  },
  {
    type: 'nfs',
    label: 'NFS',
    description: 'Network File System 网络文件系统',
    icon: 'Network',
    features: ['文件共享', '跨平台', 'POSIX兼容'],
    supportedVolumeTypes: ['file'],
    requiresAuth: false,
    configSchema: {},
  },
  {
    type: 'ceph',
    label: 'Ceph RBD',
    description: 'Ceph块设备存储',
    icon: 'Database',
    features: ['高可用', '分布式', '块存储'],
    supportedVolumeTypes: ['block'],
    requiresAuth: true,
    configSchema: {},
  },
  {
    type: 'cephfs',
    label: 'CephFS',
    description: 'Ceph文件系统',
    icon: 'FolderTree',
    features: ['高可用', '分布式', '文件系统'],
    supportedVolumeTypes: ['file'],
    requiresAuth: true,
    configSchema: {},
  },
  {
    type: 'glusterfs',
    label: 'GlusterFS',
    description: '分布式文件系统',
    icon: 'GitBranch',
    features: ['横向扩展', '高可用', '文件系统'],
    supportedVolumeTypes: ['file'],
    requiresAuth: false,
    configSchema: {},
  },
  {
    type: 's3',
    label: 'S3对象存储',
    description: 'S3兼容对象存储',
    icon: 'Cloud',
    features: ['对象存储', 'RESTful API', '无限扩展'],
    supportedVolumeTypes: ['object'],
    requiresAuth: true,
    configSchema: {},
  },
  {
    type: 'minio',
    label: 'MinIO',
    description: '高性能对象存储',
    icon: 'Box',
    features: ['S3兼容', '高性能', '私有云'],
    supportedVolumeTypes: ['object'],
    requiresAuth: true,
    configSchema: {},
  },
  {
    type: 'iscsi',
    label: 'iSCSI',
    description: 'iSCSI块存储',
    icon: 'Link',
    features: ['块存储', 'SAN', '企业级'],
    supportedVolumeTypes: ['block'],
    requiresAuth: true,
    configSchema: {},
  },
  {
    type: 'fc',
    label: '光纤通道',
    description: 'Fibre Channel存储',
    icon: 'Cable',
    features: ['高性能', '低延迟', '企业级'],
    supportedVolumeTypes: ['block'],
    requiresAuth: false,
    configSchema: {},
  },
  {
    type: 'beegfs',
    label: 'BeeGFS',
    description: '高性能并行文件系统',
    icon: 'FolderTree',
    features: ['高性能', '并行访问', '分布式'],
    supportedVolumeTypes: ['file'],
    requiresAuth: false,
    configSchema: {},
  },
  {
    type: 'cubefs',
    label: 'CubeFS',
    description: '分布式文件系统',
    icon: 'GitBranch',
    features: ['分布式', '高可用', '文件系统'],
    supportedVolumeTypes: ['file'],
    requiresAuth: false,
    configSchema: {},
  },
];

// 获取所有存储后端配置
export async function getStorageBackends(): Promise<StorageBackendConfig[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'backend-1',
          name: '本地存储',
          type: 'local',
          description: '主机本地磁盘',
          status: 'connected',
          enabled: true,
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z',
          config: {
            path: '/var/lib/fermi/storage',
            maxSize: 1099511627776, // 1TB
          },
          stats: {
            totalCapacity: 1099511627776,
            usedCapacity: 549755813888,
            poolCount: 2,
            volumeCount: 15,
          },
        },
        {
          id: 'backend-2',
          name: 'Ceph集群',
          type: 'ceph',
          description: '生产环境Ceph RBD',
          status: 'connected',
          enabled: true,
          createdAt: '2024-01-10T10:30:00Z',
          updatedAt: '2024-01-20T14:20:00Z',
          config: {
            monitors: ['192.168.1.10:6789', '192.168.1.11:6789', '192.168.1.12:6789'],
            user: 'admin',
            secret: '***',
            pool: 'fermi-rbd',
          },
          stats: {
            totalCapacity: 10995116277760, // 10TB
            usedCapacity: 5497558138880,
            poolCount: 5,
            volumeCount: 42,
          },
        },
        {
          id: 'backend-3',
          name: 'MinIO对象存储',
          type: 'minio',
          description: '开发测试环境',
          status: 'connected',
          enabled: true,
          createdAt: '2024-01-12T09:15:00Z',
          updatedAt: '2024-01-18T16:45:00Z',
          config: {
            endpoint: 'minio.fermi-cluster.local:9000',
            accessKey: 'minioadmin',
            secretKey: '***',
            region: 'us-east-1',
            useSSL: false,
          },
          stats: {
            totalCapacity: 5497558138880, // 5TB
            usedCapacity: 1099511627776,
            poolCount: 3,
            volumeCount: 28,
          },
        },
        {
          id: 'backend-4',
          name: 'NFS共享存储',
          type: 'nfs',
          description: '文件共享服务',
          status: 'disconnected',
          enabled: false,
          createdAt: '2024-01-08T11:00:00Z',
          updatedAt: '2024-01-08T11:00:00Z',
          config: {
            server: '192.168.1.100',
            exportPath: '/export/fermi',
            version: '4.1',
            mountOptions: 'rw,sync,hard',
          },
        },
      ]);
    }, 300);
  });
}

// 获取单个存储后端配置
export async function getStorageBackend(id: string): Promise<StorageBackendConfig | null> {
  const backends = await getStorageBackends();
  return backends.find((b) => b.id === id) || null;
}

// 创建存储后端配置
export async function createStorageBackend(
  data: Omit<StorageBackendConfig, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<StorageBackendConfig> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBackend: StorageBackendConfig = {
        ...data,
        id: `backend-${Date.now()}`,
        status: 'configuring',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      resolve(newBackend);
    }, 500);
  });
}

// 更新存储后端配置
export async function updateStorageBackend(
  id: string,
  data: Partial<StorageBackendConfig>
): Promise<StorageBackendConfig> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const backend = {
        id,
        ...data,
        updatedAt: new Date().toISOString(),
      } as StorageBackendConfig;
      resolve(backend);
    }, 500);
  });
}

// 删除存储后端配置
export async function deleteStorageBackend(id: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
}

// 测试存储后端连接
export async function testStorageBackendConnection(
  type: StorageBackendType,
  config: Record<string, any>
): Promise<{ success: boolean; message?: string; stats?: any }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟连接测试
      const success = Math.random() > 0.2; // 80%成功率
      resolve({
        success,
        message: success ? '连接成功' : '连接失败：无法访问服务器',
        stats: success
          ? {
              totalCapacity: Math.floor(Math.random() * 10000000000000),
              availableCapacity: Math.floor(Math.random() * 5000000000000),
            }
          : undefined,
      });
    }, 1500);
  });
}

// 启用/禁用存储后端
export async function toggleStorageBackend(
  id: string,
  enabled: boolean
): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
}

// 获取已启用的存储后端类型列表
export async function getEnabledStorageBackendTypes(): Promise<StorageBackendType[]> {
  const backends = await getStorageBackends();
  const enabledBackends = backends.filter((b) => b.enabled && b.status === 'connected');
  return enabledBackends.map((b) => b.type);
}

// 根据存储类型获取可用的后端列表
export async function getBackendsByType(type: StorageBackendType): Promise<StorageBackendConfig[]> {
  const backends = await getStorageBackends();
  return backends.filter((b) => b.type === type && b.enabled && b.status === 'connected');
}

// 获取存储后端的元数据
export function getStorageBackendTypeMeta(type: StorageBackendType): StorageBackendTypeMeta | undefined {
  return storageBackendTypes.find((t) => t.type === type);
}

// 获取所有存储后端类型元数据
export function getAllStorageBackendTypes(): StorageBackendTypeMeta[] {
  return storageBackendTypes;
}