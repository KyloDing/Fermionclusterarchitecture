/**
 * 存储服务数据层
 * 基于Kubernetes生态，支持CephFS（文件存储）和MinIO（对象存储）
 */

// ============= 存储池数据来源 =============
export interface StoragePool {
  id: string;
  name: string;
  description: string;
  type: 'file' | 'object';
  storageClass: 'ssd' | 'hdd' | 'hybrid';
  backend: 'ceph-fs' | 'minio' | 'juicefs';
  clusterId: string;
  clusterName: string;
  totalCapacityGB: number;
  usedCapacityGB: number;
  availableCapacityGB: number;
  quotaGB?: number;
  performance: {
    iops: number;
    throughputMBps: number;
    latencyMs: number;
  };
  pricing: {
    pricePerGBPerMonth: number;
  };
  status: 'active' | 'expanding' | 'maintenance' | 'error';
  volumeCount: number;
  createdAt: string;
  createdBy: string;
}

// 存储池数据来源：从Kubernetes StorageClass和Rook/Ceph/MinIO operator获取
export const getStoragePools = async (): Promise<StoragePool[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'pool-cephfs-ssd-001',
          name: '高性能文件存储池',
          description: 'SSD存储，适用于高IOPS场景，如模型训练数据集',
          type: 'file',
          storageClass: 'ssd',
          backend: 'ceph-fs',
          clusterId: 'cluster-bj-a-001',
          clusterName: '北京可用区A',
          totalCapacityGB: 50000,
          usedCapacityGB: 32450,
          availableCapacityGB: 17550,
          performance: {
            iops: 50000,
            throughputMBps: 2000,
            latencyMs: 1.2,
          },
          pricing: {
            pricePerGBPerMonth: 0.35,
          },
          status: 'active',
          volumeCount: 156,
          createdAt: '2024-08-15T10:00:00Z',
          createdBy: 'admin',
        },
        {
          id: 'pool-cephfs-hdd-001',
          name: '标准文件存储池',
          description: 'HDD存储，适用于日志、归档等场景',
          type: 'file',
          storageClass: 'hdd',
          backend: 'ceph-fs',
          clusterId: 'cluster-bj-a-001',
          clusterName: '北京可用区A',
          totalCapacityGB: 100000,
          usedCapacityGB: 45600,
          availableCapacityGB: 54400,
          performance: {
            iops: 5000,
            throughputMBps: 500,
            latencyMs: 5.8,
          },
          pricing: {
            pricePerGBPerMonth: 0.15,
          },
          status: 'active',
          volumeCount: 289,
          createdAt: '2024-08-15T10:00:00Z',
          createdBy: 'admin',
        },
        {
          id: 'pool-minio-001',
          name: '对象存储池',
          description: 'S3兼容对象存储，适用于大文件、模型权重、数据集归档',
          type: 'object',
          storageClass: 'hdd',
          backend: 'minio',
          clusterId: 'cluster-sh-a-002',
          clusterName: '上海可用区A',
          totalCapacityGB: 200000,
          usedCapacityGB: 128000,
          availableCapacityGB: 72000,
          performance: {
            iops: 3000,
            throughputMBps: 1000,
            latencyMs: 8.5,
          },
          pricing: {
            pricePerGBPerMonth: 0.15,
          },
          status: 'active',
          volumeCount: 412,
          createdAt: '2024-09-01T10:00:00Z',
          createdBy: 'admin',
        },
      ]);
    }, 300);
  });
};

// ============= 存储卷数据来源 =============
export interface StorageVolume {
  id: string;
  name: string;
  description?: string;
  poolId: string;
  poolName: string;
  poolType: 'file' | 'object';
  capacityGB: number;
  usedGB: number;
  accessMode: 'RWO' | 'RWX' | 'ROX';
  storageClass: string;
  mountedTo: {
    type: 'jupyter' | 'training-job' | 'inference-service' | 'container';
    resourceId: string;
    resourceName: string;
    mountPath: string;
  }[];
  owner: {
    userId: string;
    userName: string;
    groupId?: string;
    groupName?: string;
  };
  permissions: {
    userId: string;
    userName: string;
    permission: 'owner' | 'read-write' | 'read-only' | 'upload-only';
  }[];
  usage: {
    filesCount: number;
    directoriesCount: number;
    usedGB: number;
  };
  quota: {
    capacityGB: number;
    warningThreshold: number; // 80%
  };
  billing: {
    pricePerGBPerMonth: number;
    currentMonthCost: number;
    projectedMonthlyCost: number;
    prepaidBalance: number;
  };
  createdAt: string;
  lastAccessedAt: string;
  status: 'creating' | 'available' | 'bound' | 'expanding' | 'deleting';
  pvName?: string; // Kubernetes PV name
  pvcName?: string; // Kubernetes PVC name
}

// 存储卷数据来源：从Kubernetes PVC/PV API获取
export const getStorageVolumes = async (filters?: {
  poolId?: string;
  userId?: string;
  groupId?: string;
}): Promise<StorageVolume[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allVolumes: StorageVolume[] = [
        {
          id: 'vol-001',
          name: 'zhangsan-datasets',
          description: '个人数据集存储',
          poolId: 'pool-cephfs-ssd-001',
          poolName: '高性能文件存储池',
          poolType: 'file',
          capacityGB: 500,
          usedGB: 342,
          accessMode: 'RWX',
          storageClass: 'cephfs-ssd',
          mountedTo: [
            {
              type: 'jupyter',
              resourceId: 'jupyter-zhangsan-001',
              resourceName: 'zhangsan的Jupyter环境',
              mountPath: '/workspace/data',
            },
            {
              type: 'training-job',
              resourceId: 'job-20241110-001',
              resourceName: 'llama3-8b-sft-cn',
              mountPath: '/data',
            },
          ],
          owner: {
            userId: 'user-001',
            userName: 'zhangsan',
            groupId: 'group-ai-team',
            groupName: 'AI算法团队',
          },
          permissions: [
            {
              userId: 'user-001',
              userName: 'zhangsan',
              permission: 'owner',
            },
            {
              userId: 'user-002',
              userName: 'lisi',
              permission: 'read-only',
            },
          ],
          usage: {
            filesCount: 1542,
            directoriesCount: 68,
            usedGB: 342,
          },
          quota: {
            capacityGB: 500,
            warningThreshold: 80,
          },
          billing: {
            pricePerGBPerMonth: 0.35,
            currentMonthCost: 42.5,
            projectedMonthlyCost: 175,
            prepaidBalance: 500,
          },
          createdAt: '2024-10-01T10:00:00Z',
          lastAccessedAt: new Date().toISOString(),
          status: 'bound',
          pvName: 'pv-zhangsan-datasets',
          pvcName: 'pvc-zhangsan-datasets',
        },
        {
          id: 'vol-002',
          name: 'ai-team-shared',
          description: 'AI团队共享数据',
          poolId: 'pool-cephfs-hdd-001',
          poolName: '标准文件存储池',
          poolType: 'file',
          capacityGB: 2000,
          usedGB: 1256,
          accessMode: 'RWX',
          storageClass: 'cephfs-hdd',
          mountedTo: [
            {
              type: 'jupyter',
              resourceId: 'jupyter-lisi-002',
              resourceName: 'lisi的Jupyter环境',
              mountPath: '/workspace/shared',
            },
          ],
          owner: {
            userId: 'user-002',
            userName: 'lisi',
            groupId: 'group-ai-team',
            groupName: 'AI算法团队',
          },
          permissions: [
            {
              userId: 'user-002',
              userName: 'lisi',
              permission: 'owner',
            },
            {
              userId: 'user-001',
              userName: 'zhangsan',
              permission: 'read-write',
            },
            {
              userId: 'user-003',
              userName: 'wangwu',
              permission: 'read-write',
            },
          ],
          usage: {
            filesCount: 3845,
            directoriesCount: 142,
            usedGB: 1256,
          },
          quota: {
            capacityGB: 2000,
            warningThreshold: 80,
          },
          billing: {
            pricePerGBPerMonth: 0.15,
            currentMonthCost: 94.2,
            projectedMonthlyCost: 300,
            prepaidBalance: 1000,
          },
          createdAt: '2024-09-15T10:00:00Z',
          lastAccessedAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'bound',
          pvName: 'pv-ai-team-shared',
          pvcName: 'pvc-ai-team-shared',
        },
        {
          id: 'vol-003',
          name: 'model-weights-archive',
          description: '模型权重归档',
          poolId: 'pool-minio-001',
          poolName: '对象存储池',
          poolType: 'object',
          capacityGB: 5000,
          usedGB: 3420,
          accessMode: 'RWX',
          storageClass: 'minio-standard',
          mountedTo: [],
          owner: {
            userId: 'user-001',
            userName: 'zhangsan',
            groupId: 'group-ai-team',
            groupName: 'AI算法团队',
          },
          permissions: [
            {
              userId: 'user-001',
              userName: 'zhangsan',
              permission: 'owner',
            },
          ],
          usage: {
            filesCount: 286,
            directoriesCount: 24,
            usedGB: 3420,
          },
          quota: {
            capacityGB: 5000,
            warningThreshold: 80,
          },
          billing: {
            pricePerGBPerMonth: 0.15,
            currentMonthCost: 256.5,
            projectedMonthlyCost: 750,
            prepaidBalance: 2000,
          },
          createdAt: '2024-08-20T10:00:00Z',
          lastAccessedAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'available',
        },
      ];

      let filtered = allVolumes;
      if (filters?.poolId) {
        filtered = filtered.filter((v) => v.poolId === filters.poolId);
      }
      if (filters?.userId) {
        filtered = filtered.filter((v) => v.owner.userId === filters.userId);
      }
      if (filters?.groupId) {
        filtered = filtered.filter((v) => v.owner.groupId === filters.groupId);
      }

      resolve(filtered);
    }, 300);
  });
};

// ============= 文件/文件夹数据来源 =============
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string; // 完整路径
  parentPath: string;
  size: number; // bytes
  mimeType?: string;
  extension?: string;
  owner: {
    userId: string;
    userName: string;
  };
  permissions: {
    userId: string;
    userName: string;
    permission: 'owner' | 'read-write' | 'read-only';
  }[];
  createdAt: string;
  modifiedAt: string;
  accessedAt: string;
  isShared: boolean;
  isCompressed?: boolean;
  // 如果是图片，包含缩略图信息
  thumbnail?: string;
  imageMetadata?: {
    width: number;
    height: number;
    format: string;
  };
}

// 文件数据来源：从存储后端API获取（CephFS通过MDS，MinIO通过S3 API）
export const getFiles = async (
  volumeId: string,
  path: string = '/'
): Promise<FileItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟不同路径下的文件
      const mockFiles: Record<string, FileItem[]> = {
        '/': [
          {
            id: 'dir-001',
            name: 'datasets',
            type: 'directory',
            path: '/datasets',
            parentPath: '/',
            size: 0,
            owner: { userId: 'user-001', userName: 'zhangsan' },
            permissions: [
              { userId: 'user-001', userName: 'zhangsan', permission: 'owner' },
            ],
            createdAt: '2024-10-01T10:00:00Z',
            modifiedAt: '2024-11-10T15:30:00Z',
            accessedAt: new Date().toISOString(),
            isShared: false,
          },
          {
            id: 'dir-002',
            name: 'models',
            type: 'directory',
            path: '/models',
            parentPath: '/',
            size: 0,
            owner: { userId: 'user-001', userName: 'zhangsan' },
            permissions: [
              { userId: 'user-001', userName: 'zhangsan', permission: 'owner' },
            ],
            createdAt: '2024-10-01T10:00:00Z',
            modifiedAt: '2024-11-08T12:20:00Z',
            accessedAt: new Date().toISOString(),
            isShared: true,
          },
          {
            id: 'dir-003',
            name: 'notebooks',
            type: 'directory',
            path: '/notebooks',
            parentPath: '/',
            size: 0,
            owner: { userId: 'user-001', userName: 'zhangsan' },
            permissions: [
              { userId: 'user-001', userName: 'zhangsan', permission: 'owner' },
            ],
            createdAt: '2024-10-05T14:00:00Z',
            modifiedAt: '2024-11-10T09:15:00Z',
            accessedAt: new Date().toISOString(),
            isShared: false,
          },
          {
            id: 'file-001',
            name: 'README.md',
            type: 'file',
            path: '/README.md',
            parentPath: '/',
            size: 2048,
            mimeType: 'text/markdown',
            extension: 'md',
            owner: { userId: 'user-001', userName: 'zhangsan' },
            permissions: [
              { userId: 'user-001', userName: 'zhangsan', permission: 'owner' },
            ],
            createdAt: '2024-10-01T10:05:00Z',
            modifiedAt: '2024-10-01T10:05:00Z',
            accessedAt: new Date(Date.now() - 86400000).toISOString(),
            isShared: false,
          },
        ],
        '/datasets': [
          {
            id: 'dir-004',
            name: 'imagenet',
            type: 'directory',
            path: '/datasets/imagenet',
            parentPath: '/datasets',
            size: 0,
            owner: { userId: 'user-001', userName: 'zhangsan' },
            permissions: [
              { userId: 'user-001', userName: 'zhangsan', permission: 'owner' },
            ],
            createdAt: '2024-10-02T10:00:00Z',
            modifiedAt: '2024-10-02T18:30:00Z',
            accessedAt: new Date().toISOString(),
            isShared: false,
          },
          {
            id: 'file-002',
            name: 'train_data.csv',
            type: 'file',
            path: '/datasets/train_data.csv',
            parentPath: '/datasets',
            size: 2684354560, // 2.5GB
            mimeType: 'text/csv',
            extension: 'csv',
            owner: { userId: 'user-001', userName: 'zhangsan' },
            permissions: [
              { userId: 'user-001', userName: 'zhangsan', permission: 'owner' },
              { userId: 'user-002', userName: 'lisi', permission: 'read-only' },
            ],
            createdAt: '2024-10-05T14:20:00Z',
            modifiedAt: '2024-10-05T16:45:00Z',
            accessedAt: new Date(Date.now() - 3600000).toISOString(),
            isShared: true,
          },
          {
            id: 'file-003',
            name: 'dataset_info.json',
            type: 'file',
            path: '/datasets/dataset_info.json',
            parentPath: '/datasets',
            size: 4096,
            mimeType: 'application/json',
            extension: 'json',
            owner: { userId: 'user-001', userName: 'zhangsan' },
            permissions: [
              { userId: 'user-001', userName: 'zhangsan', permission: 'owner' },
            ],
            createdAt: '2024-10-05T14:25:00Z',
            modifiedAt: '2024-10-05T14:25:00Z',
            accessedAt: new Date(Date.now() - 7200000).toISOString(),
            isShared: false,
          },
          {
            id: 'file-004',
            name: 'sample_image.jpg',
            type: 'file',
            path: '/datasets/sample_image.jpg',
            parentPath: '/datasets',
            size: 1258291, // 1.2MB
            mimeType: 'image/jpeg',
            extension: 'jpg',
            owner: { userId: 'user-001', userName: 'zhangsan' },
            permissions: [
              { userId: 'user-001', userName: 'zhangsan', permission: 'owner' },
            ],
            createdAt: '2024-10-06T09:00:00Z',
            modifiedAt: '2024-10-06T09:00:00Z',
            accessedAt: new Date(Date.now() - 1800000).toISOString(),
            isShared: false,
            thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
            imageMetadata: {
              width: 1920,
              height: 1080,
              format: 'JPEG',
            },
          },
        ],
      };

      resolve(mockFiles[path] || []);
    }, 300);
  });
};

// ============= SMB分享数据来源 =============
export interface SMBShare {
  id: string;
  volumeId: string;
  volumeName: string;
  sharePath: string;
  shareName: string;
  description?: string;
  accessUrl: string;
  username: string;
  password: string;
  permissions: 'read-only' | 'read-write';
  allowedUsers: { userId: string; userName: string }[];
  allowedGroups: { groupId: string; groupName: string }[];
  ipWhitelist?: string[];
  maxConnections?: number;
  activeConnections: number;
  totalAccesses: number;
  lastAccessedAt?: string;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  status: 'active' | 'disabled' | 'expired';
}

// SMB分享数据来源：从Samba服务配置和活动连接状态获取
export const getSMBShares = async (volumeId?: string): Promise<SMBShare[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allShares: SMBShare[] = [
        {
          id: 'smb-001',
          volumeId: 'vol-001',
          volumeName: 'zhangsan-datasets',
          sharePath: '/datasets',
          shareName: 'zhangsan-datasets-share',
          description: '训练数据集共享给团队成员',
          accessUrl: 'smb://10.10.1.100:445/zhangsan-datasets-share',
          username: 'zhangsan',
          password: 'share_pwd_a1b2c3',
          permissions: 'read-only',
          allowedUsers: [
            { userId: 'user-002', userName: 'lisi' },
            { userId: 'user-003', userName: 'wangwu' },
          ],
          allowedGroups: [{ groupId: 'group-ai-team', groupName: 'AI算法团队' }],
          ipWhitelist: ['10.10.0.0/16', '10.20.0.0/16'],
          maxConnections: 10,
          activeConnections: 2,
          totalAccesses: 1543,
          lastAccessedAt: new Date(Date.now() - 1800000).toISOString(),
          createdAt: '2024-10-15T10:00:00Z',
          createdBy: 'zhangsan',
          status: 'active',
        },
        {
          id: 'smb-002',
          volumeId: 'vol-002',
          volumeName: 'ai-team-shared',
          sharePath: '/',
          shareName: 'ai-team-share',
          description: 'AI团队共享文件夹',
          accessUrl: 'smb://10.10.1.101:445/ai-team-share',
          username: 'ai-team',
          password: 'share_pwd_x9y8z7',
          permissions: 'read-write',
          allowedUsers: [],
          allowedGroups: [{ groupId: 'group-ai-team', groupName: 'AI算法团队' }],
          maxConnections: 20,
          activeConnections: 5,
          totalAccesses: 8456,
          lastAccessedAt: new Date(Date.now() - 600000).toISOString(),
          createdAt: '2024-09-20T14:00:00Z',
          createdBy: 'lisi',
          status: 'active',
        },
      ];

      const filtered = volumeId
        ? allShares.filter((s) => s.volumeId === volumeId)
        : allShares;
      resolve(filtered);
    }, 300);
  });
};

// ============= 回收站数据来源 =============
export interface RecycleBinItem {
  id: string;
  originalItem: FileItem;
  volumeId: string;
  volumeName: string;
  deletedBy: string;
  deletedAt: string;
  expiresAt: string; // 30天后过期
  canRestore: boolean;
}

export const getRecycleBinItems = async (
  volumeId: string
): Promise<RecycleBinItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'recycle-001',
          originalItem: {
            id: 'file-deleted-001',
            name: 'old_model.pth',
            type: 'file',
            path: '/models/old_model.pth',
            parentPath: '/models',
            size: 5368709120, // 5GB
            mimeType: 'application/octet-stream',
            extension: 'pth',
            owner: { userId: 'user-001', userName: 'zhangsan' },
            permissions: [
              { userId: 'user-001', userName: 'zhangsan', permission: 'owner' },
            ],
            createdAt: '2024-09-01T10:00:00Z',
            modifiedAt: '2024-09-15T14:30:00Z',
            accessedAt: '2024-10-20T09:15:00Z',
            isShared: false,
          },
          volumeId: 'vol-001',
          volumeName: 'zhangsan-datasets',
          deletedBy: 'zhangsan',
          deletedAt: '2024-11-05T16:30:00Z',
          expiresAt: '2024-12-05T16:30:00Z',
          canRestore: true,
        },
      ]);
    }, 300);
  });
};

// ============= API操作函数 =============

// 创建存储池
export const createStoragePool = async (
  pool: Omit<StoragePool, 'id' | 'usedCapacityGB' | 'availableCapacityGB' | 'volumeCount' | 'createdAt'>
): Promise<{ success: boolean; poolId?: string; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        poolId: `pool-${Date.now()}`,
        message: '存储池创建成功，正在初始化...',
      });
    }, 1000);
  });
};

// 创建存储卷
export const createStorageVolume = async (
  volume: Omit<StorageVolume, 'id' | 'usedGB' | 'usage' | 'billing' | 'createdAt' | 'lastAccessedAt' | 'status'>
): Promise<{ success: boolean; volumeId?: string; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        volumeId: `vol-${Date.now()}`,
        message: '存储卷创建成功',
      });
    }, 1000);
  });
};

// 上传文件
export const uploadFile = async (
  volumeId: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; fileId?: string; message: string }> => {
  return new Promise((resolve) => {
    // 模拟上传进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onProgress?.(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve({
          success: true,
          fileId: `file-${Date.now()}`,
          message: '文件上传成功',
        });
      }
    }, 300);
  });
};

// 创建文件夹
export const createDirectory = async (
  volumeId: string,
  parentPath: string,
  name: string
): Promise<{ success: boolean; dirId?: string; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        dirId: `dir-${Date.now()}`,
        message: '文件夹创建成功',
      });
    }, 300);
  });
};

// 重命名文件/文件夹
export const renameItem = async (
  volumeId: string,
  itemId: string,
  newName: string
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '重命名成功',
      });
    }, 300);
  });
};

// 删除文件/文件夹（移到回收站）
export const deleteItem = async (
  volumeId: string,
  itemIds: string[]
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `已删除 ${itemIds.length} 项，可在回收站中恢复`,
      });
    }, 500);
  });
};

// 移动文件/文件夹
export const moveItems = async (
  volumeId: string,
  itemIds: string[],
  targetPath: string
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `已移动 ${itemIds.length} 项到 ${targetPath}`,
      });
    }, 500);
  });
};

// 压缩文件
export const compressItems = async (
  volumeId: string,
  itemIds: string[],
  archiveName: string,
  format: 'zip' | 'tar' | 'tar.gz'
): Promise<{ success: boolean; archiveId?: string; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        archiveId: `file-${Date.now()}`,
        message: `压缩完成：${archiveName}.${format}`,
      });
    }, 2000);
  });
};

// 解压文件
export const decompressArchive = async (
  volumeId: string,
  archiveId: string,
  targetPath: string
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `解压完成到 ${targetPath}`,
      });
    }, 2000);
  });
};

// 创建SMB分享
export const createSMBShare = async (
  share: Omit<SMBShare, 'id' | 'accessUrl' | 'activeConnections' | 'totalAccesses' | 'createdAt' | 'status'>
): Promise<{ success: boolean; shareId?: string; accessUrl?: string; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const accessUrl = `smb://10.10.1.100:445/${share.shareName}`;
      resolve({
        success: true,
        shareId: `smb-${Date.now()}`,
        accessUrl,
        message: 'SMB分享创建成功',
      });
    }, 500);
  });
};

// 更新SMB分享
export const updateSMBShare = async (
  shareId: string,
  updates: Partial<SMBShare>
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'SMB分享更新成功',
      });
    }, 300);
  });
};

// 删除SMB分享
export const deleteSMBShare = async (
  shareId: string
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'SMB分享已删除',
      });
    }, 300);
  });
};

// 恢复回收站项目
export const restoreFromRecycleBin = async (
  itemId: string
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '文件已恢复',
      });
    }, 500);
  });
};

// 永久删除回收站项目
export const permanentlyDelete = async (
  itemId: string
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '文件已永久删除',
      });
    }, 500);
  });
};

// 存储卷扩容
export const expandVolume = async (
  volumeId: string,
  newCapacityGB: number
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `存储卷已扩容至 ${newCapacityGB}GB`,
      });
    }, 1000);
  });
};

// 工具函数：格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 工具函数：根据文件扩展名获取图标
export const getFileIcon = (item: FileItem): string => {
  if (item.type === 'directory') return '📁';
  
  const extension = item.extension?.toLowerCase();
  const iconMap: Record<string, string> = {
    // 图片
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    // 文档
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📝',
    md: '📝',
    // 数据
    csv: '📊',
    xlsx: '📊',
    json: '📋',
    xml: '📋',
    // 代码
    py: '🐍',
    js: '📜',
    ts: '📜',
    jsx: '⚛️',
    tsx: '⚛️',
    // 压缩包
    zip: '📦',
    tar: '📦',
    gz: '📦',
    // 模型
    pth: '🧠',
    ckpt: '🧠',
    h5: '🧠',
    pb: '🧠',
  };

  return iconMap[extension || ''] || '📄';
};
