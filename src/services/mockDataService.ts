/**
 * 模拟数据服务层
 * 所有数据都有明确的来源和生成逻辑，模拟真实的后端API
 */

// ============= 集群数据来源 =============
export interface Cluster {
  id: string;
  name: string;
  region: string;
  zone: string;
  status: 'healthy' | 'warning' | 'error';
  kubeVersion: string;
  nodes: number;
  createdAt: string;
}

// 集群数据来源：从 Karmada 多集群管理系统同步
export const getClusters = async (): Promise<Cluster[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'cluster-bj-a-001',
          name: '北京可用区A',
          region: 'beijing',
          zone: 'beijing-a',
          status: 'healthy',
          kubeVersion: 'v1.28.3',
          nodes: 32,
          createdAt: '2024-08-15T10:00:00Z',
        },
        {
          id: 'cluster-sh-a-002',
          name: '上海可用区A',
          region: 'shanghai',
          zone: 'shanghai-a',
          status: 'healthy',
          kubeVersion: 'v1.28.3',
          nodes: 24,
          createdAt: '2024-09-01T10:00:00Z',
        },
        {
          id: 'cluster-sz-a-003',
          name: '深圳可用区A',
          region: 'shenzhen',
          zone: 'shenzhen-a',
          status: 'healthy',
          kubeVersion: 'v1.28.2',
          nodes: 16,
          createdAt: '2024-10-10T10:00:00Z',
        },
      ]);
    }, 300);
  });
};

// ============= GPU节点数据来源 =============
export interface GpuCard {
  id: string;
  index: number;
  uuid: string;
  status: 'idle' | 'in-use' | 'error';
  temperature: number;
  powerUsage: number;
  powerLimit: number;
  memoryTotal: number;
  memoryUsed: number;
  utilization: number;
  // 使用信息
  allocatedTo?: {
    userId: string;
    userName: string;
    workloadId: string;
    workloadName: string;
    workloadType: 'training' | 'inference' | 'development';
    startTime: string;
  };
  // 共享切分信息
  partitions?: {
    partitionId: string;
    memoryMB: number;
    allocatedTo?: {
      userId: string;
      userName: string;
      workloadId: string;
      workloadName: string;
      workloadType: 'training' | 'inference' | 'development';
    };
  }[];
}

export interface GpuNode {
  id: string;
  name: string;
  clusterId: string;
  clusterName: string;
  gpuModel: string;
  gpuCount: number;
  gpuUsed: number;
  cpuCores: number;
  cpuUsed: number;
  memoryGB: number;
  memoryUsed: number;
  status: 'ready' | 'idle' | 'in-use' | 'maintenance' | 'offline';
  nodeType: 'dedicated' | 'shared';
  ipAddress: string;
  labels: Record<string, string>;
  uptime: string;
  poolId?: string;
  poolName?: string;
  // 共享切分相关信息
  gpuPartitions?: {
    total: number;
    allocated: number;
    free: number;
  };
  // 温度和健康状态
  temperature?: number;
  health: 'healthy' | 'warning' | 'critical';
  lastHeartbeat: string;
  // 详细的GPU卡信息
  gpuCards?: GpuCard[];
  // 系统信息
  kernelVersion?: string;
  osVersion?: string;
  dockerVersion?: string;
  kubeletVersion?: string;
  // 磁盘信息
  systemDisk?: {
    total: number;  // 总容量 GB
    used: number;   // 已使用 GB
    available: number; // 可用 GB
    usagePercent: number; // 使用率百分比
    mountPoint: string; // 挂载点
  };
  dataDisk?: {
    total: number;
    used: number;
    available: number;
    usagePercent: number;
    mountPoint: string;
  };
}

// 节点监控指标
export interface NodeMetrics {
  nodeId: string;
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
  };
  gpus: {
    index: number;
    utilization: number;
    memoryUsed: number;
    memoryTotal: number;
    temperature: number;
    powerUsage: number;
  }[];
  network: {
    rxBytes: number;
    txBytes: number;
  };
  disk: {
    used: number;
    total: number;
  };
}

// 获取节点详细信息（包含GPU卡详情）
export const getNodeDetails = async (nodeId: string): Promise<GpuNode | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟获取节点详细信息
      const nodeIndex = parseInt(nodeId.split('-').pop() || '1');
      const isDedicated = !nodeId.includes('shared');
      const isA100 = nodeId.includes('a100');
      const isV100 = nodeId.includes('v100');
      const isA800 = nodeId.includes('a800');
      
      let gpuModel = 'NVIDIA A100 80GB';
      let gpuCount = 8;
      let memoryPerGpu = 81920; // MB
      
      if (isV100) {
        gpuModel = 'NVIDIA V100 32GB';
        gpuCount = 4;
        memoryPerGpu = 32768;
      } else if (isA800) {
        gpuModel = 'NVIDIA A800 80GB';
        gpuCount = 4;
        memoryPerGpu = 81920;
      }

      // 生成GPU卡详细信息
      const gpuCards: GpuCard[] = Array.from({ length: gpuCount }, (_, i) => {
        const isInUse = isDedicated ? i < nodeIndex : false;
        const utilization = isInUse ? 75 + Math.random() * 20 : 0;
        const memoryUsed = isInUse ? memoryPerGpu * (0.6 + Math.random() * 0.3) : 0;
        
        const card: GpuCard = {
          id: `${nodeId}-gpu-${i}`,
          index: i,
          uuid: `GPU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: isInUse ? 'in-use' : 'idle',
          temperature: isInUse ? 60 + Math.random() * 20 : 35 + Math.random() * 10,
          powerUsage: isInUse ? 250 + Math.random() * 100 : 30 + Math.random() * 20,
          powerLimit: 400,
          memoryTotal: memoryPerGpu,
          memoryUsed: Math.floor(memoryUsed),
          utilization: Math.floor(utilization),
        };

        if (isInUse && isDedicated) {
          const workloadTypes: ('training' | 'inference' | 'development')[] = ['training', 'inference', 'development'];
          const users = [
            { id: 'user-001', name: 'zhangsan' },
            { id: 'user-002', name: 'lisi' },
            { id: 'user-003', name: 'wangwu' },
          ];
          const user = users[i % users.length];
          const workloadType = workloadTypes[i % workloadTypes.length];
          
          card.allocatedTo = {
            userId: user.id,
            userName: user.name,
            workloadId: `${workloadType}-${Date.now()}-${i}`,
            workloadName: workloadType === 'training' 
              ? `llama3-8b-sft-exp${i}`
              : workloadType === 'inference'
              ? `bert-classifier-v${i}`
              : `jupyter-notebook-${user.name}`,
            workloadType,
            startTime: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
          };
        }

        // 共享节点添加分区信息
        if (!isDedicated) {
          const partitionCount = 8;
          card.partitions = Array.from({ length: partitionCount }, (_, pi) => {
            const isPartitionUsed = pi < 4 + Math.floor(Math.random() * 3);
            const partition: GpuCard['partitions'][0] = {
              partitionId: `${card.id}-p${pi}`,
              memoryMB: memoryPerGpu / partitionCount,
              allocatedTo: isPartitionUsed ? {
                userId: `user-00${(pi % 3) + 1}`,
                userName: ['zhangsan', 'lisi', 'wangwu'][pi % 3],
                workloadId: `dev-${Date.now()}-${pi}`,
                workloadName: `dev-env-${pi}`,
                workloadType: 'development',
              } : undefined,
            };
            return partition;
          });
        }

        return card;
      });

      const node: GpuNode = {
        id: nodeId,
        name: nodeId,
        clusterId: nodeId.includes('bj') ? 'cluster-bj-a-001' : nodeId.includes('sh') ? 'cluster-sh-a-002' : 'cluster-sz-a-003',
        clusterName: nodeId.includes('bj') ? '北京可用区A' : nodeId.includes('sh') ? '上海可用区A' : '深圳可用区A',
        gpuModel,
        gpuCount,
        gpuUsed: isDedicated ? gpuCards.filter(c => c.status === 'in-use').length : 0,
        cpuCores: isV100 || isA800 ? 64 : 128,
        cpuUsed: isDedicated ? (isV100 || isA800 ? 50 : 100) : 60,
        memoryGB: isV100 || isA800 ? 512 : 1024,
        memoryUsed: isDedicated ? (isV100 || isA800 ? 400 : 800) : 600,
        status: nodeIndex <= 3 ? 'in-use' : nodeIndex === 4 ? 'idle' : 'ready',
        nodeType: isDedicated ? 'dedicated' : 'shared',
        ipAddress: `10.${nodeId.includes('bj') ? 10 : nodeId.includes('sh') ? 20 : 30}.${isDedicated ? 1 : 2}.${10 + nodeIndex}`,
        labels: {
          'gpu.nvidia.com/model': isA100 ? 'A100' : isV100 ? 'V100' : 'A800',
          'node.kubernetes.io/instance-type': `gpu.${gpuCount}x${isA100 ? 'a100' : isV100 ? 'v100' : 'a800'}`,
          'fermion.ai/node-type': isDedicated ? 'dedicated' : 'shared',
        },
        uptime: `${10 + nodeIndex}天${Math.floor(Math.random() * 24)}小时`,
        poolId: nodeId.includes('bj') ? 'pool-bj-a100-training' : nodeId.includes('sh') ? 'pool-sh-v100-inference' : 'pool-sz-a800-dev',
        poolName: nodeId.includes('bj') ? 'GPU-Pool-训练-A100' : nodeId.includes('sh') ? 'GPU-Pool-推理-V100' : 'GPU-Pool-开发-A800',
        temperature: 45 + Math.random() * 20,
        health: 'healthy',
        lastHeartbeat: new Date().toISOString(),
        gpuCards,
        kernelVersion: '5.15.0-89-generic',
        osVersion: 'Ubuntu 22.04.3 LTS',
        dockerVersion: '24.0.7',
        kubeletVersion: 'v1.28.3',
        gpuPartitions: !isDedicated ? {
          total: gpuCount * 8,
          allocated: Math.floor(gpuCount * 8 * 0.6),
          free: 0,
        } : undefined,
      };

      if (node.gpuPartitions) {
        node.gpuPartitions.free = node.gpuPartitions.total - node.gpuPartitions.allocated;
      }

      resolve(node);
    }, 300);
  });
};

// GPU节点数据来源：从 Kubernetes Node API 获取
export const getGpuNodes = async (clusterId?: string): Promise<GpuNode[]> => {
  const clusters = await getClusters();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const allNodes: GpuNode[] = [
        // 北京集群 - A100 整卡独占节点
        ...Array.from({ length: 6 }, (_, i) => ({
          id: `node-bj-a100-${i + 1}`,
          name: `gpu-node-bj-a100-${String(i + 1).padStart(3, '0')}`,
          clusterId: 'cluster-bj-a-001',
          clusterName: '北京可用区A',
          gpuModel: 'NVIDIA A100 80GB',
          gpuCount: 8,
          gpuUsed: i < 3 ? 8 : i < 5 ? Math.floor(Math.random() * 8) : 0,
          cpuCores: 128,
          cpuUsed: i < 3 ? 120 : i < 5 ? Math.floor(Math.random() * 128) : 0,
          memoryGB: 1024,
          memoryUsed: i < 3 ? 980 : i < 5 ? Math.floor(Math.random() * 1024) : 0,
          status: i < 3 ? 'in-use' : i === 3 ? 'ready' : i === 4 ? 'idle' : 'maintenance',
          nodeType: 'dedicated',
          ipAddress: `10.10.1.${10 + i}`,
          labels: {
            'gpu.nvidia.com/model': 'A100',
            'node.kubernetes.io/instance-type': 'gpu.8xa100.128c1024g',
            'topology.kubernetes.io/zone': 'beijing-a',
            'fermion.ai/node-type': 'dedicated',
          },
          uptime: `${15 + i}天${Math.floor(Math.random() * 24)}小时`,
          poolId: 'pool-bj-a100-training',
          poolName: 'GPU-Pool-训练-A100',
          temperature: 45 + Math.floor(Math.random() * 30),
          health: i < 5 ? 'healthy' : 'warning',
          lastHeartbeat: new Date(Date.now() - Math.random() * 60000).toISOString(),
          systemDisk: {
            total: 500,
            used: 120 + Math.floor(Math.random() * 80),
            available: 0, // 计算得出
            usagePercent: 0, // 计算得出
            mountPoint: '/'
          },
          dataDisk: {
            total: 4000,
            used: 800 + Math.floor(Math.random() * 1200),
            available: 0,
            usagePercent: 0,
            mountPoint: '/data'
          },
        })),
        
        // 北京集群 - A100 共享切分节点
        ...Array.from({ length: 4 }, (_, i) => ({
          id: `node-bj-a100-shared-${i + 1}`,
          name: `gpu-node-bj-a100-shared-${String(i + 1).padStart(3, '0')}`,
          clusterId: 'cluster-bj-a-001',
          clusterName: '北京可用区A',
          gpuModel: 'NVIDIA A100 80GB',
          gpuCount: 8,
          gpuUsed: 0, // 共享节点不计整卡
          cpuCores: 128,
          cpuUsed: 80 + Math.floor(Math.random() * 30),
          memoryGB: 1024,
          memoryUsed: 600 + Math.floor(Math.random() * 200),
          status: i < 3 ? 'in-use' : 'idle',
          nodeType: 'shared',
          ipAddress: `10.10.2.${10 + i}`,
          labels: {
            'gpu.nvidia.com/model': 'A100',
            'node.kubernetes.io/instance-type': 'gpu.8xa100.128c1024g',
            'topology.kubernetes.io/zone': 'beijing-a',
            'fermion.ai/node-type': 'shared',
            'fermion.ai/gpu-partition': 'enabled',
          },
          uptime: `${10 + i}天${Math.floor(Math.random() * 24)}小时`,
          poolId: 'pool-bj-a100-training',
          poolName: 'GPU-Pool-训练-A100',
          gpuPartitions: {
            total: 64, // 每个GPU切分为8个分区，8个GPU共64个分区
            allocated: 32 + Math.floor(Math.random() * 20),
            free: 0, // 计算得出
          },
          temperature: 50 + Math.floor(Math.random() * 20),
          health: 'healthy',
          lastHeartbeat: new Date(Date.now() - Math.random() * 30000).toISOString(),
          systemDisk: {
            total: 500,
            used: 150 + Math.floor(Math.random() * 50),
            available: 0,
            usagePercent: 0,
            mountPoint: '/'
          },
          dataDisk: {
            total: 4000,
            used: 1200 + Math.floor(Math.random() * 1000),
            available: 0,
            usagePercent: 0,
            mountPoint: '/data'
          },
        })),
        
        // 上海集群 - V100 整卡独占节点
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `node-sh-v100-${i + 1}`,
          name: `gpu-node-sh-v100-${String(i + 1).padStart(3, '0')}`,
          clusterId: 'cluster-sh-a-002',
          clusterName: '上海可用区A',
          gpuModel: 'NVIDIA V100 32GB',
          gpuCount: 4,
          gpuUsed: i < 3 ? 4 : i === 3 ? 2 : 0,
          cpuCores: 64,
          cpuUsed: i < 3 ? 60 : i === 3 ? 30 : 0,
          memoryGB: 512,
          memoryUsed: i < 3 ? 480 : i === 3 ? 250 : 0,
          status: i < 3 ? 'in-use' : i === 3 ? 'in-use' : 'ready',
          nodeType: 'dedicated',
          ipAddress: `10.20.1.${10 + i}`,
          labels: {
            'gpu.nvidia.com/model': 'V100',
            'node.kubernetes.io/instance-type': 'gpu.4xv100.64c512g',
            'topology.kubernetes.io/zone': 'shanghai-a',
            'fermion.ai/node-type': 'dedicated',
          },
          uptime: `${8 + i}天${Math.floor(Math.random() * 24)}小时`,
          poolId: 'pool-sh-v100-inference',
          poolName: 'GPU-Pool-推理-V100',
          temperature: 42 + Math.floor(Math.random() * 25),
          health: 'healthy',
          lastHeartbeat: new Date(Date.now() - Math.random() * 45000).toISOString(),
          systemDisk: {
            total: 500,
            used: 180 + Math.floor(Math.random() * 60),
            available: 0,
            usagePercent: 0,
            mountPoint: '/'
          },
          dataDisk: {
            total: 2000,
            used: 600 + Math.floor(Math.random() * 800),
            available: 0,
            usagePercent: 0,
            mountPoint: '/data'
          },
        })),
        
        // 上海集群 - V100 共享切分节点
        ...Array.from({ length: 3 }, (_, i) => ({
          id: `node-sh-v100-shared-${i + 1}`,
          name: `gpu-node-sh-v100-shared-${String(i + 1).padStart(3, '0')}`,
          clusterId: 'cluster-sh-a-002',
          clusterName: '上海可用区A',
          gpuModel: 'NVIDIA V100 32GB',
          gpuCount: 4,
          gpuUsed: 0,
          cpuCores: 64,
          cpuUsed: 40 + Math.floor(Math.random() * 20),
          memoryGB: 512,
          memoryUsed: 300 + Math.floor(Math.random() * 150),
          status: i < 2 ? 'in-use' : 'idle',
          nodeType: 'shared',
          ipAddress: `10.20.2.${10 + i}`,
          labels: {
            'gpu.nvidia.com/model': 'V100',
            'node.kubernetes.io/instance-type': 'gpu.4xv100.64c512g',
            'topology.kubernetes.io/zone': 'shanghai-a',
            'fermion.ai/node-type': 'shared',
            'fermion.ai/gpu-partition': 'enabled',
          },
          uptime: `${6 + i}天${Math.floor(Math.random() * 24)}小时`,
          poolId: 'pool-sh-v100-inference',
          poolName: 'GPU-Pool-推理-V100',
          gpuPartitions: {
            total: 32, // 每个GPU切分为8个分区，4个GPU共32个分区
            allocated: 16 + Math.floor(Math.random() * 12),
            free: 0,
          },
          temperature: 48 + Math.floor(Math.random() * 18),
          health: 'healthy',
          lastHeartbeat: new Date(Date.now() - Math.random() * 30000).toISOString(),
          systemDisk: {
            total: 500,
            used: 160 + Math.floor(Math.random() * 70),
            available: 0,
            usagePercent: 0,
            mountPoint: '/'
          },
          dataDisk: {
            total: 2000,
            used: 700 + Math.floor(Math.random() * 600),
            available: 0,
            usagePercent: 0,
            mountPoint: '/data'
          },
        })),
        
        // 深圳集群 - A800 整卡独占节点
        ...Array.from({ length: 3 }, (_, i) => ({
          id: `node-sz-a800-${i + 1}`,
          name: `gpu-node-sz-a800-${String(i + 1).padStart(3, '0')}`,
          clusterId: 'cluster-sz-a-003',
          clusterName: '深圳可用区A',
          gpuModel: 'NVIDIA A800 80GB',
          gpuCount: 4,
          gpuUsed: i === 0 ? 4 : i === 1 ? 2 : 0,
          cpuCores: 64,
          cpuUsed: i === 0 ? 60 : i === 1 ? 32 : 5,
          memoryGB: 512,
          memoryUsed: i === 0 ? 490 : i === 1 ? 280 : 20,
          status: i === 0 ? 'in-use' : i === 1 ? 'in-use' : 'ready',
          nodeType: 'dedicated',
          ipAddress: `10.30.1.${10 + i}`,
          labels: {
            'gpu.nvidia.com/model': 'A800',
            'node.kubernetes.io/instance-type': 'gpu.4xa800.64c512g',
            'topology.kubernetes.io/zone': 'shenzhen-a',
            'fermion.ai/node-type': 'dedicated',
          },
          uptime: `${4 + i}天${Math.floor(Math.random() * 24)}小时`,
          poolId: 'pool-sz-a800-dev',
          poolName: 'GPU-Pool-开发-A800',
          temperature: 40 + Math.floor(Math.random() * 28),
          health: 'healthy',
          lastHeartbeat: new Date(Date.now() - Math.random() * 60000).toISOString(),
          systemDisk: {
            total: 500,
            used: 140 + Math.floor(Math.random() * 80),
            available: 0,
            usagePercent: 0,
            mountPoint: '/'
          },
          dataDisk: {
            total: 2000,
            used: 500 + Math.floor(Math.random() * 700),
            available: 0,
            usagePercent: 0,
            mountPoint: '/data'
          },
        })),
        
        // 深圳集群 - 离线节点示例
        {
          id: 'node-sz-a800-004',
          name: 'gpu-node-sz-a800-004',
          clusterId: 'cluster-sz-a-003',
          clusterName: '深圳可用区A',
          gpuModel: 'NVIDIA A800 80GB',
          gpuCount: 4,
          gpuUsed: 0,
          cpuCores: 64,
          cpuUsed: 0,
          memoryGB: 512,
          memoryUsed: 0,
          status: 'offline',
          nodeType: 'dedicated',
          ipAddress: '10.30.1.14',
          labels: {
            'gpu.nvidia.com/model': 'A800',
            'node.kubernetes.io/instance-type': 'gpu.4xa800.64c512g',
            'topology.kubernetes.io/zone': 'shenzhen-a',
            'fermion.ai/node-type': 'dedicated',
          },
          uptime: '离线',
          poolId: 'pool-sz-a800-dev',
          poolName: 'GPU-Pool-开发-A800',
          temperature: 0,
          health: 'critical',
          lastHeartbeat: new Date(Date.now() - 3600000 * 2).toISOString(),
          systemDisk: {
            total: 500,
            used: 0,
            available: 0,
            usagePercent: 0,
            mountPoint: '/'
          },
          dataDisk: {
            total: 2000,
            used: 0,
            available: 0,
            usagePercent: 0,
            mountPoint: '/data'
          },
        },
      ];

      // 计算共享节点的free分区和磁盘使用率
      allNodes.forEach(node => {
        if (node.gpuPartitions) {
          node.gpuPartitions.free = node.gpuPartitions.total - node.gpuPartitions.allocated;
        }
        
        // 计算系统盘使用率
        if (node.systemDisk) {
          node.systemDisk.available = node.systemDisk.total - node.systemDisk.used;
          node.systemDisk.usagePercent = Math.round((node.systemDisk.used / node.systemDisk.total) * 100);
        }
        
        // 计算数据盘使用率
        if (node.dataDisk) {
          node.dataDisk.available = node.dataDisk.total - node.dataDisk.used;
          node.dataDisk.usagePercent = Math.round((node.dataDisk.used / node.dataDisk.total) * 100);
        }
      });

      const filtered = clusterId
        ? allNodes.filter((n) => n.clusterId === clusterId)
        : allNodes;
      resolve(filtered);
    }, 300);
  });
};

// 获取节点监控数据（时间序列）
export const getNodeMetrics = async (nodeId: string, hours: number = 1): Promise<NodeMetrics[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = Date.now();
      const interval = 60000; // 1分钟间隔
      const points = Math.min((hours * 60), 60); // 最多60个数据点
      
      const metrics: NodeMetrics[] = Array.from({ length: points }, (_, i) => {
        const timestamp = new Date(now - (points - i - 1) * interval).toISOString();
        const baseUtilization = 50 + Math.sin(i / 10) * 20;
        
        return {
          nodeId,
          timestamp,
          cpu: {
            usage: Math.max(10, Math.min(95, baseUtilization + Math.random() * 10 - 5)),
            cores: 128,
          },
          memory: {
            used: Math.floor(700 + Math.random() * 100),
            total: 1024,
          },
          gpus: Array.from({ length: 8 }, (_, gi) => ({
            index: gi,
            utilization: gi < 5 ? Math.max(60, Math.min(100, baseUtilization + Math.random() * 20)) : 0,
            memoryUsed: gi < 5 ? Math.floor(60000 + Math.random() * 15000) : 0,
            memoryTotal: 81920,
            temperature: gi < 5 ? Math.floor(65 + Math.random() * 15) : Math.floor(35 + Math.random() * 10),
            powerUsage: gi < 5 ? Math.floor(280 + Math.random() * 80) : Math.floor(30 + Math.random() * 20),
          })),
          network: {
            rxBytes: Math.floor(1000000000 + Math.random() * 100000000),
            txBytes: Math.floor(500000000 + Math.random() * 50000000),
          },
          disk: {
            used: 450 + Math.floor(Math.random() * 50),
            total: 1000,
          },
        };
      });

      resolve(metrics);
    }, 300);
  });
};

// 更新节点标签
export const updateNodeLabels = async (
  nodeId: string,
  labels: Record<string, string>
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟更新标签
      resolve({
        success: true,
        message: '节点标签更新成功',
      });
    }, 500);
  });
};

// ============= GPU资源池数据来源 =============
export interface GpuPool {
  id: string;
  name: string;
  description: string;
  clusterId: string;
  clusterName: string;
  gpuModel: string;
  nodeSelector: Record<string, string>;
  totalNodes: number;
  totalGpus: number;
  allocatedGpus: number;
  usedGpus: number;
  tags: string[];
  createdAt: string;
  createdBy: string;
  quotas: {
    maxGpusPerUser: number;
    maxGpusPerJob: number;
  };
}

// GPU资源池数据来源：通过节点标签聚合计算得出
export const getGpuPools = async (): Promise<GpuPool[]> => {
  const nodes = await getGpuNodes();
  const clusters = await getClusters();

  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据集群和GPU型号聚合节点生成资源池
      const pools: GpuPool[] = [];

      // 北京A100资源池
      const bjA100Nodes = nodes.filter(
        (n) => n.clusterId === 'cluster-bj-a-001' && n.gpuModel.includes('A100')
      );
      pools.push({
        id: 'pool-bj-a100-training',
        name: 'GPU-Pool-训练-A100',
        description: '北京A100高性能训练资源池，适用于大规模模型训练',
        clusterId: 'cluster-bj-a-001',
        clusterName: '北京可用区A',
        gpuModel: 'NVIDIA A100 80GB',
        nodeSelector: {
          'gpu.nvidia.com/model': 'A100',
          'topology.kubernetes.io/zone': 'beijing-a',
        },
        totalNodes: bjA100Nodes.length,
        totalGpus: bjA100Nodes.reduce((sum, n) => sum + n.gpuCount, 0),
        allocatedGpus: 48, // 已分配给任务的GPU数
        usedGpus: 42, // 实际正在使用的GPU数
        tags: ['训练', '高性能', 'A100'],
        createdAt: '2024-08-20T10:00:00Z',
        createdBy: 'admin',
        quotas: {
          maxGpusPerUser: 16,
          maxGpusPerJob: 64,
        },
      });

      // 上海V100资源池
      const shV100Nodes = nodes.filter(
        (n) => n.clusterId === 'cluster-sh-a-002' && n.gpuModel.includes('V100')
      );
      pools.push({
        id: 'pool-sh-v100-inference',
        name: 'GPU-Pool-推理-V100',
        description: '上海V100推理服务资源池，适用于在线推理服务',
        clusterId: 'cluster-sh-a-002',
        clusterName: '上海可用区A',
        gpuModel: 'NVIDIA V100 32GB',
        nodeSelector: {
          'gpu.nvidia.com/model': 'V100',
          'topology.kubernetes.io/zone': 'shanghai-a',
        },
        totalNodes: shV100Nodes.length,
        totalGpus: shV100Nodes.reduce((sum, n) => sum + n.gpuCount, 0),
        allocatedGpus: 20,
        usedGpus: 18,
        tags: ['推理', 'V100'],
        createdAt: '2024-09-05T10:00:00Z',
        createdBy: 'admin',
        quotas: {
          maxGpusPerUser: 8,
          maxGpusPerJob: 16,
        },
      });

      // 深圳A800资源池
      const szA800Nodes = nodes.filter(
        (n) => n.clusterId === 'cluster-sz-a-003' && n.gpuModel.includes('A800')
      );
      pools.push({
        id: 'pool-sz-a800-dev',
        name: 'GPU-Pool-开发-A800',
        description: '深圳A800开发测试资源池，适用于开发环境和小规模实验',
        clusterId: 'cluster-sz-a-003',
        clusterName: '深圳可用区A',
        gpuModel: 'NVIDIA A800 80GB',
        nodeSelector: {
          'gpu.nvidia.com/model': 'A800',
          'topology.kubernetes.io/zone': 'shenzhen-a',
        },
        totalNodes: szA800Nodes.length,
        totalGpus: szA800Nodes.reduce((sum, n) => sum + n.gpuCount, 0),
        allocatedGpus: 6,
        usedGpus: 5,
        tags: ['开发', '测试', 'A800'],
        createdAt: '2024-10-15T10:00:00Z',
        createdBy: 'admin',
        quotas: {
          maxGpusPerUser: 4,
          maxGpusPerJob: 8,
        },
      });

      resolve(pools);
    }, 300);
  });
};

// ============= 容器镜像数据来源 =============
export type ImageAvailabilityZone = 'cn-north-1a' | 'cn-north-1b' | 'cn-east-1a' | 'cn-east-1b' | 'cn-south-1a';
export type ImageVisibility = 'private' | 'public' | 'team';
export type ImageSyncStatus = 'synced' | 'syncing' | 'not-synced' | 'failed';

export interface ContainerImage {
  id: string;
  name: string;
  tag: string;
  fullPath: string;
  category: 'official' | 'custom' | 'community';
  registry: string;
  framework?: string;
  sizeBytes: number;
  digest: string;
  pullCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  description: string;
  verified: boolean;
  featured: boolean;
  gpuSupport: boolean;
  cudaVersion?: string;
  pythonVersion?: string;
  frameworks: string[];
  includesJupyter: boolean;
  sourceType?: 'registry' | 'dockerfile';
  buildLogs?: string;
  availabilityZone: ImageAvailabilityZone;
  visibility: ImageVisibility;
  syncStatus?: ImageSyncStatus;
  syncedZones?: ImageAvailabilityZone[];
}

// 镜像数据来源：从容器镜像仓库API同步
export const getContainerImages = async (): Promise<ContainerImage[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'img-pytorch-2.1-cuda12.1',
          name: 'pytorch',
          tag: '2.1.0-cuda12.1-cudnn8-runtime',
          fullPath: 'docker.io/pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime',
          category: 'official',
          registry: 'docker.io',
          framework: 'PyTorch',
          sizeBytes: 8500 * 1024 * 1024, // 8.5GB
          digest: 'sha256:a1b2c3d4e5f6...',
          pullCount: 15234,
          createdAt: '2024-10-15T08:30:00Z',
          updatedAt: '2024-11-01T10:15:00Z',
          description: 'PyTorch 2.1.0 官方镜像，包含 CUDA 12.1 和 cuDNN 8',
          verified: true,
          featured: true,
          gpuSupport: true,
          cudaVersion: '12.1',
          pythonVersion: '3.10',
          frameworks: ['PyTorch 2.1.0', 'torchvision 0.16.0', 'torchaudio 2.1.0'],
          includesJupyter: false,
          availabilityZone: 'cn-north-1a' as ImageAvailabilityZone,
          visibility: 'public' as ImageVisibility,
          syncStatus: 'synced' as ImageSyncStatus,
          syncedZones: ['cn-north-1a', 'cn-north-1b', 'cn-east-1a'] as ImageAvailabilityZone[],
        },
        {
          id: 'img-tensorflow-2.14-gpu',
          name: 'tensorflow',
          tag: '2.14.0-gpu',
          fullPath: 'docker.io/tensorflow/tensorflow:2.14.0-gpu',
          category: 'official',
          registry: 'docker.io',
          framework: 'TensorFlow',
          sizeBytes: 7200 * 1024 * 1024,
          digest: 'sha256:b2c3d4e5f6a7...',
          pullCount: 12456,
          createdAt: '2024-10-10T09:00:00Z',
          updatedAt: '2024-10-28T14:20:00Z',
          description: 'TensorFlow 2.14.0 GPU 版本，内置 Keras',
          verified: true,
          featured: true,
          gpuSupport: true,
          cudaVersion: '11.8',
          pythonVersion: '3.11',
          frameworks: ['TensorFlow 2.14.0', 'Keras'],
          includesJupyter: false,
          availabilityZone: 'cn-north-1a' as ImageAvailabilityZone,
          visibility: 'public' as ImageVisibility,
          syncStatus: 'synced' as ImageSyncStatus,
          syncedZones: ['cn-north-1a', 'cn-east-1a'] as ImageAvailabilityZone[],
        },
        {
          id: 'img-jupyter-pytorch',
          name: 'jupyter-pytorch-notebook',
          tag: 'latest',
          fullPath: 'fermi-registry.io/official/jupyter-pytorch-notebook:latest',
          category: 'official',
          registry: 'fermi-registry.io',
          framework: 'PyTorch',
          sizeBytes: 9800 * 1024 * 1024,
          digest: 'sha256:c3d4e5f6a7b8...',
          pullCount: 8934,
          createdAt: '2024-11-01T10:00:00Z',
          updatedAt: '2024-11-08T16:30:00Z',
          description: 'Jupyter Notebook 环境，预装 PyTorch、NumPy、Pandas',
          verified: true,
          featured: true,
          gpuSupport: true,
          cudaVersion: '12.1',
          pythonVersion: '3.11',
          frameworks: ['PyTorch 2.1.0', 'Jupyter Lab 4.0', 'NumPy', 'Pandas'],
          includesJupyter: true,
          availabilityZone: 'cn-north-1b' as ImageAvailabilityZone,
          visibility: 'public' as ImageVisibility,
          syncStatus: 'synced' as ImageSyncStatus,
          syncedZones: ['cn-north-1a', 'cn-north-1b'] as ImageAvailabilityZone[],
        },
        {
          id: 'img-triton-23.10',
          name: 'triton-inference-server',
          tag: '23.10-py3',
          fullPath: 'nvcr.io/nvidia/tritonserver:23.10-py3',
          category: 'official',
          registry: 'nvcr.io',
          framework: 'Triton',
          sizeBytes: 12300 * 1024 * 1024,
          digest: 'sha256:d4e5f6a7b8c9...',
          pullCount: 5678,
          createdAt: '2024-10-20T11:00:00Z',
          updatedAt: '2024-11-05T09:45:00Z',
          description: 'NVIDIA Triton 推理服务器，支持多种深度学习框架',
          verified: true,
          featured: true,
          gpuSupport: true,
          cudaVersion: '12.2',
          pythonVersion: '3.10',
          frameworks: ['Triton Server', 'TensorRT', 'ONNX Runtime', 'PyTorch', 'TensorFlow'],
          includesJupyter: false,
          availabilityZone: 'cn-east-1a' as ImageAvailabilityZone,
          visibility: 'public' as ImageVisibility,
          syncStatus: 'not-synced' as ImageSyncStatus,
          syncedZones: ['cn-east-1a'] as ImageAvailabilityZone[],
        },
        {
          id: 'img-vllm-0.2.1',
          name: 'vllm-openai',
          tag: 'v0.2.1',
          fullPath: 'docker.io/vllm/vllm-openai:v0.2.1',
          category: 'official',
          registry: 'docker.io',
          framework: 'vLLM',
          sizeBytes: 11500 * 1024 * 1024,
          digest: 'sha256:e5f6a7b8c9d0...',
          pullCount: 4521,
          createdAt: '2024-11-01T08:00:00Z',
          updatedAt: '2024-11-09T11:20:00Z',
          description: 'vLLM 高性能 LLM 推理引擎，兼容 OpenAI API',
          verified: true,
          featured: true,
          gpuSupport: true,
          cudaVersion: '12.1',
          pythonVersion: '3.11',
          frameworks: ['vLLM 0.2.1', 'FastAPI', 'Transformers'],
          includesJupyter: false,
          availabilityZone: 'cn-north-1a' as ImageAvailabilityZone,
          visibility: 'public' as ImageVisibility,
          syncStatus: 'syncing' as ImageSyncStatus,
          syncedZones: ['cn-north-1a'] as ImageAvailabilityZone[],
        },
        {
          id: 'img-custom-llama-finetune',
          name: 'llama-finetune-env',
          tag: 'v1.0',
          fullPath: 'fermi-registry.io/user-zhangsan/llama-finetune-env:v1.0',
          category: 'custom',
          registry: 'fermi-registry.io',
          framework: 'PyTorch',
          sizeBytes: 13200 * 1024 * 1024,
          digest: 'sha256:f6a7b8c9d0e1...',
          pullCount: 156,
          createdAt: '2024-11-05T14:30:00Z',
          updatedAt: '2024-11-08T10:00:00Z',
          createdBy: 'zhangsan',
          description: '自定义 LLaMA 微调环境，包含 LoRA、QLoRA、DeepSpeed',
          verified: false,
          featured: false,
          gpuSupport: true,
          cudaVersion: '12.1',
          pythonVersion: '3.10',
          frameworks: ['PyTorch 2.1.0', 'Transformers 4.35', 'PEFT', 'DeepSpeed'],
          includesJupyter: true,
          sourceType: 'dockerfile',
          availabilityZone: 'cn-south-1a' as ImageAvailabilityZone,
          visibility: 'private' as ImageVisibility,
          syncStatus: 'not-synced' as ImageSyncStatus,
          syncedZones: ['cn-south-1a'] as ImageAvailabilityZone[],
        },
      ]);
    }, 300);
  });
};

// ============= 训练任务数据来源 =============
export interface TrainingJob {
  id: string;
  name: string;
  description: string;
  framework: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  poolId: string;
  poolName: string;
  clusterId: string;
  imageId: string;
  imageName: string;
  gpuCount: number;
  gpuModel: string;
  cpuCores: number;
  memoryGB: number;
  distributed: boolean;
  workerCount?: number;
  datasetIds: string[];
  gitRepo: string;
  gitBranch: string;
  entrypoint: string;
  hyperparameters: Record<string, any>;
  currentEpoch?: number;
  totalEpochs?: number;
  progress: number;
  metrics?: {
    loss?: number;
    accuracy?: number;
    [key: string]: any;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  priority: 'low' | 'normal' | 'high';
  outputModelPath?: string;
  logPath: string;
  checkpointPath: string;
}

// 训练任务数据来源：从Kubernetes Job API和自定义CRD获取
export const getTrainingJobs = async (): Promise<TrainingJob[]> => {
  const pools = await getGpuPools();
  const images = await getContainerImages();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'job-20241110-001',
          name: 'llama3-8b-sft-cn',
          description: 'LLaMA3-8B 中文指令微调实验',
          framework: 'PyTorch',
          status: 'running',
          poolId: 'pool-bj-a100-training',
          poolName: 'GPU-Pool-训练-A100',
          clusterId: 'cluster-bj-a-001',
          imageId: 'img-custom-llama-finetune',
          imageName: 'llama-finetune-env:v1.0',
          gpuCount: 16,
          gpuModel: 'NVIDIA A100 80GB',
          cpuCores: 128,
          memoryGB: 1024,
          distributed: true,
          workerCount: 2,
          datasetIds: ['dataset-cn-instruct-50k'],
          gitRepo: 'https://github.com/fermion/llama-finetune',
          gitBranch: 'main',
          entrypoint: 'python train.py --config configs/llama3_8b_sft.yaml',
          hyperparameters: {
            learning_rate: 2e-5,
            batch_size: 4,
            gradient_accumulation_steps: 4,
            max_seq_length: 2048,
            lora_r: 16,
            lora_alpha: 32,
          },
          currentEpoch: 2,
          totalEpochs: 3,
          progress: 65,
          metrics: {
            loss: 0.542,
            learning_rate: 1.8e-5,
            perplexity: 1.72,
          },
          createdAt: '2024-11-10T08:30:00Z',
          startedAt: '2024-11-10T08:35:00Z',
          createdBy: 'zhangsan',
          priority: 'high',
          logPath: '/mnt/logs/job-20241110-001',
          checkpointPath: '/mnt/checkpoints/job-20241110-001',
        },
        {
          id: 'job-20241109-042',
          name: 'resnet50-imagenet-pretrain',
          description: 'ResNet50 ImageNet预训练',
          framework: 'PyTorch',
          status: 'completed',
          poolId: 'pool-bj-a100-training',
          poolName: 'GPU-Pool-训练-A100',
          clusterId: 'cluster-bj-a-001',
          imageId: 'img-pytorch-2.1-cuda12.1',
          imageName: 'pytorch:2.1.0-cuda12.1-cudnn8-runtime',
          gpuCount: 8,
          gpuModel: 'NVIDIA A100 80GB',
          cpuCores: 64,
          memoryGB: 512,
          distributed: true,
          workerCount: 1,
          datasetIds: ['dataset-imagenet-1k'],
          gitRepo: 'https://github.com/fermion/vision-training',
          gitBranch: 'main',
          entrypoint: 'python -m torch.distributed.launch train.py',
          hyperparameters: {
            learning_rate: 0.1,
            batch_size: 256,
            epochs: 90,
            momentum: 0.9,
            weight_decay: 1e-4,
          },
          currentEpoch: 90,
          totalEpochs: 90,
          progress: 100,
          metrics: {
            train_acc: 76.8,
            val_acc: 76.1,
            final_loss: 0.912,
          },
          createdAt: '2024-11-09T10:00:00Z',
          startedAt: '2024-11-09T10:05:00Z',
          completedAt: '2024-11-09T22:15:00Z',
          createdBy: 'lisi',
          priority: 'normal',
          outputModelPath: '/mnt/models/resnet50-imagenet-20241109.pth',
          logPath: '/mnt/logs/job-20241109-042',
          checkpointPath: '/mnt/checkpoints/job-20241109-042',
        },
        {
          id: 'job-20241110-003',
          name: 'bert-base-chinese-mlm',
          description: 'BERT中文预训练任务',
          framework: 'PyTorch',
          status: 'pending',
          poolId: 'pool-bj-a100-training',
          poolName: 'GPU-Pool-训练-A100',
          clusterId: 'cluster-bj-a-001',
          imageId: 'img-pytorch-2.1-cuda12.1',
          imageName: 'pytorch:2.1.0-cuda12.1-cudnn8-runtime',
          gpuCount: 32,
          gpuModel: 'NVIDIA A100 80GB',
          cpuCores: 256,
          memoryGB: 2048,
          distributed: true,
          workerCount: 4,
          datasetIds: ['dataset-chinese-wiki-100g'],
          gitRepo: 'https://github.com/fermion/bert-pretrain',
          gitBranch: 'main',
          entrypoint: 'deepspeed train_mlm.py --deepspeed_config ds_config.json',
          hyperparameters: {
            learning_rate: 1e-4,
            batch_size: 32,
            max_steps: 1000000,
            warmup_steps: 10000,
            gradient_checkpointing: true,
          },
          progress: 0,
          createdAt: '2024-11-10T14:20:00Z',
          createdBy: 'wangwu',
          priority: 'high',
          logPath: '/mnt/logs/job-20241110-003',
          checkpointPath: '/mnt/checkpoints/job-20241110-003',
        },
      ]);
    }, 300);
  });
};

// ============= 推理服务数据来源 =============
export interface InferenceService {
  id: string;
  name: string;
  description: string;
  modelPath: string;
  modelName: string;
  modelVersion: string;
  framework: string;
  status: 'deploying' | 'running' | 'degraded' | 'stopped' | 'failed';
  health: 'healthy' | 'unhealthy' | 'unknown';
  poolId: string;
  poolName: string;
  clusterId: string;
  imageId: string;
  imageName: string;
  endpoint: string;
  apiType: 'rest' | 'grpc' | 'websocket';
  replicas: {
    desired: number;
    current: number;
    ready: number;
  };
  autoscaling: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetMetric: 'cpu' | 'gpu' | 'qps';
    targetValue: number;
  };
  resources: {
    gpuCount: number;
    gpuModel: string;
    cpuCores: number;
    memoryGB: number;
  };
  metrics: {
    qps: number;
    avgLatencyMs: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    successRate: number;
    errorRate: number;
    totalRequests24h: number;
  };
  traffic?: {
    canary?: {
      enabled: boolean;
      weight: number;
      version: string;
    };
  };
  createdAt: string;
  deployedAt?: string;
  createdBy: string;
  lastUpdated: string;
}

// 推理服务数据来源：从Kubernetes Service/Deployment API和Istio VirtualService获取
export const getInferenceServices = async (): Promise<InferenceService[]> => {
  const pools = await getGpuPools();
  const images = await getContainerImages();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'inf-llama3-8b-chat-001',
          name: 'llama3-8b-chat-api',
          description: 'LLaMA3-8B 对话服务，兼容OpenAI API格式',
          modelPath: '/mnt/models/llama3-8b-chat-sft-v2',
          modelName: 'llama3-8b-chat',
          modelVersion: 'v2.0',
          framework: 'vLLM',
          status: 'running',
          health: 'healthy',
          poolId: 'pool-sh-v100-inference',
          poolName: 'GPU-Pool-推理-V100',
          clusterId: 'cluster-sh-a-002',
          imageId: 'img-vllm-0.2.1',
          imageName: 'vllm-openai:v0.2.1',
          endpoint: 'https://api.fermion.ai/v1/llama3-8b-chat',
          apiType: 'rest',
          replicas: {
            desired: 3,
            current: 3,
            ready: 3,
          },
          autoscaling: {
            enabled: true,
            minReplicas: 2,
            maxReplicas: 10,
            targetMetric: 'qps',
            targetValue: 50,
          },
          resources: {
            gpuCount: 2,
            gpuModel: 'NVIDIA V100 32GB',
            cpuCores: 16,
            memoryGB: 128,
          },
          metrics: {
            qps: 127,
            avgLatencyMs: 348,
            p50LatencyMs: 285,
            p95LatencyMs: 612,
            p99LatencyMs: 1250,
            successRate: 99.2,
            errorRate: 0.8,
            totalRequests24h: 10584320,
          },
          createdAt: '2024-11-05T10:00:00Z',
          deployedAt: '2024-11-05T10:08:00Z',
          createdBy: 'zhangsan',
          lastUpdated: '2024-11-10T15:30:00Z',
        },
        {
          id: 'inf-stable-diffusion-xl-001',
          name: 'sdxl-image-generation',
          description: 'Stable Diffusion XL 图像生成服务',
          modelPath: '/mnt/models/stable-diffusion-xl-base-1.0',
          modelName: 'stable-diffusion-xl',
          modelVersion: '1.0',
          framework: 'Triton',
          status: 'running',
          health: 'healthy',
          poolId: 'pool-sh-v100-inference',
          poolName: 'GPU-Pool-推理-V100',
          clusterId: 'cluster-sh-a-002',
          imageId: 'img-triton-23.10',
          imageName: 'tritonserver:23.10-py3',
          endpoint: 'https://api.fermion.ai/v1/sdxl',
          apiType: 'rest',
          replicas: {
            desired: 4,
            current: 4,
            ready: 4,
          },
          autoscaling: {
            enabled: true,
            minReplicas: 2,
            maxReplicas: 8,
            targetMetric: 'gpu',
            targetValue: 70,
          },
          resources: {
            gpuCount: 1,
            gpuModel: 'NVIDIA V100 32GB',
            cpuCores: 8,
            memoryGB: 64,
          },
          metrics: {
            qps: 28,
            avgLatencyMs: 2845,
            p50LatencyMs: 2650,
            p95LatencyMs: 4120,
            p99LatencyMs: 5890,
            successRate: 98.5,
            errorRate: 1.5,
            totalRequests24h: 2419200,
          },
          createdAt: '2024-11-08T14:00:00Z',
          deployedAt: '2024-11-08T14:12:00Z',
          createdBy: 'lisi',
          lastUpdated: '2024-11-10T15:30:00Z',
        },
        {
          id: 'inf-bert-classification-001',
          name: 'bert-text-classification',
          description: 'BERT文本分类服务',
          modelPath: '/mnt/models/bert-base-chinese-classification',
          modelName: 'bert-classification',
          modelVersion: '1.2',
          framework: 'TensorFlow',
          status: 'running',
          health: 'healthy',
          poolId: 'pool-sh-v100-inference',
          poolName: 'GPU-Pool-推理-V100',
          clusterId: 'cluster-sh-a-002',
          imageId: 'img-triton-23.10',
          imageName: 'tritonserver:23.10-py3',
          endpoint: 'https://api.fermion.ai/v1/bert-classifier',
          apiType: 'rest',
          replicas: {
            desired: 2,
            current: 2,
            ready: 2,
          },
          autoscaling: {
            enabled: false,
            minReplicas: 2,
            maxReplicas: 6,
            targetMetric: 'cpu',
            targetValue: 70,
          },
          resources: {
            gpuCount: 1,
            gpuModel: 'NVIDIA V100 32GB',
            cpuCores: 8,
            memoryGB: 32,
          },
          metrics: {
            qps: 456,
            avgLatencyMs: 45,
            p50LatencyMs: 38,
            p95LatencyMs: 82,
            p99LatencyMs: 125,
            successRate: 99.8,
            errorRate: 0.2,
            totalRequests24h: 39398400,
          },
          traffic: {
            canary: {
              enabled: true,
              weight: 10,
              version: 'v1.3-beta',
            },
          },
          createdAt: '2024-10-25T09:00:00Z',
          deployedAt: '2024-10-25T09:05:00Z',
          createdBy: 'wangwu',
          lastUpdated: '2024-11-10T10:20:00Z',
        },
      ]);
    }, 300);
  });
};

// 工具函数：格式化字节数
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 工具函数：格式化时间
export const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
};

// 工具函数：计算利用率
export const calculateUtilization = (used: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((used / total) * 100 * 10) / 10;
};

// 镜像可用区相关辅助函数
export function getImageAvailabilityZoneLabel(zone: ImageAvailabilityZone): string {
  const labels: Record<ImageAvailabilityZone, string> = {
    'cn-north-1a': '华北可用区A',
    'cn-north-1b': '华北可用区B',
    'cn-east-1a': '华东可用区A',
    'cn-east-1b': '华东可用区B',
    'cn-south-1a': '华南可用区A'
  };
  return labels[zone];
}

export function getImageVisibilityLabel(visibility: ImageVisibility): string {
  const labels: Record<ImageVisibility, string> = {
    private: '私有',
    public: '公开',
    team: '团队'
  };
  return labels[visibility];
}

export function getImageSyncStatusLabel(status: ImageSyncStatus): string {
  const labels: Record<ImageSyncStatus, string> = {
    synced: '已同步',
    syncing: '同步中',
    'not-synced': '未同步',
    failed: '同步失败'
  };
  return labels[status];
}