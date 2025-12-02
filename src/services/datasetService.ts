/**
 * 数据集服务层
 * 负责数据集和版本的增删改查，以及文件上传管理
 */

export type AvailabilityZone = 'cn-north-1a' | 'cn-north-1b' | 'cn-east-1a' | 'cn-east-1b' | 'cn-south-1a';
export type DatasetVisibility = 'private' | 'public' | 'team';
export type SyncStatus = 'synced' | 'syncing' | 'not-synced' | 'failed';

export interface Dataset {
  id: string;
  name: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'mixed';
  dataType: 'text' | 'image' | 'audio' | 'video' | 'mixed'; // 别名，兼容旧代码
  status: 'ready' | 'processing' | 'error';
  recordCount: number;
  size: number;
  createTime: string;
  createdAt: string; // 别名，兼容旧代码
  description?: string;
  latestVersion?: string;
  availabilityZone: AvailabilityZone;
  visibility: DatasetVisibility;
  syncStatus?: SyncStatus; // 跨可用区同步状态
  syncedZones?: AvailabilityZone[]; // 已同步到的可用区列表
  owner?: string; // 所有者
  tags?: string[]; // 标签
}

export interface DatasetVersion {
  id: string;
  datasetId: string;
  version: string;
  uploadedAt: string;
  filePath: string; // 对象存储路径
  fileSize: number; // 字节
  description?: string;
  status: 'uploading' | 'completed' | 'failed';
  uploadProgress?: number; // 0-100
}

export interface CreateDatasetRequest {
  name: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'mixed';
  file: File;
  description?: string;
  availabilityZone: AvailabilityZone;
  visibility: DatasetVisibility;
  tags?: string[];
}

export interface AddVersionRequest {
  datasetId: string;
  version: string;
  file: File;
  description?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Mock数据 - 实际应从后端API获取
let mockDatasets: Dataset[] = [
  {
    id: 'ds-001',
    name: 'ImageNet-2024',
    type: 'image',
    dataType: 'image',
    status: 'ready',
    recordCount: 1281167,
    size: 171798691840, // ~160GB
    createTime: '2024-11-01 10:30:00',
    createdAt: '2024-11-01T10:30:00Z',
    description: '大规模图像分类数据集，用于计算机视觉训练',
    latestVersion: 'v3',
    availabilityZone: 'cn-north-1a',
    visibility: 'public',
    syncStatus: 'synced',
    syncedZones: ['cn-north-1a', 'cn-north-1b', 'cn-east-1a'],
    owner: 'admin@fermi.com',
    tags: ['计算机视觉', '分类', '大规模']
  },
  {
    id: 'ds-002',
    name: 'Text-Corpus-CN',
    type: 'text',
    dataType: 'text',
    status: 'ready',
    recordCount: 5000000,
    size: 73400320000, // ~68GB
    createTime: '2024-10-15 08:20:00',
    createdAt: '2024-10-15T08:20:00Z',
    description: '中文文本语料库，涵盖多领域文本数据',
    latestVersion: 'v2',
    availabilityZone: 'cn-north-1a',
    visibility: 'private',
    syncStatus: 'synced',
    syncedZones: ['cn-north-1a', 'cn-east-1a'],
    owner: 'user@fermi.com',
    tags: ['NLP', '中文', '语料库']
  },
  {
    id: 'ds-003',
    name: 'Medical-Images',
    type: 'image',
    dataType: 'image',
    status: 'ready',
    recordCount: 125000,
    size: 31457280000, // ~29GB
    createTime: '2024-11-10 14:45:00',
    createdAt: '2024-11-10T14:45:00Z',
    description: '医疗影像数据集，包含多种医学影像类型',
    latestVersion: 'v1',
    availabilityZone: 'cn-east-1a',
    visibility: 'team',
    syncStatus: 'not-synced',
    syncedZones: ['cn-east-1a'],
    owner: 'medical@fermi.com',
    tags: ['医疗', '影像', '诊断']
  },
  {
    id: 'ds-004',
    name: 'Speech-Dataset-2024',
    type: 'audio',
    dataType: 'audio',
    status: 'processing',
    recordCount: 0,
    size: 0,
    createTime: '2024-11-14 09:00:00',
    createdAt: '2024-11-14T09:00:00Z',
    description: '语音识别数据集（处理中）',
    availabilityZone: 'cn-north-1b',
    visibility: 'private',
    syncStatus: 'syncing',
    syncedZones: ['cn-north-1b'],
    owner: 'user@fermi.com',
    tags: ['语音', '识别']
  },
  {
    id: 'ds-005',
    name: 'COCO-2024',
    type: 'image',
    dataType: 'image',
    status: 'ready',
    recordCount: 328000,
    size: 25769803776, // ~24GB
    createTime: '2024-11-12 15:20:00',
    createdAt: '2024-11-12T15:20:00Z',
    description: 'COCO目标检测数据集，包含丰富的标注信息',
    latestVersion: 'v2',
    availabilityZone: 'cn-north-1a',
    visibility: 'public',
    syncStatus: 'synced',
    syncedZones: ['cn-north-1a', 'cn-north-1b'],
    owner: 'admin@fermi.com',
    tags: ['目标检测', '实例分割', 'COCO']
  },
  {
    id: 'ds-006',
    name: 'Financial-Text-Analysis',
    type: 'text',
    dataType: 'text',
    status: 'ready',
    recordCount: 1500000,
    size: 8589934592, // ~8GB
    createTime: '2024-11-08 11:15:00',
    createdAt: '2024-11-08T11:15:00Z',
    description: '金融文本分析数据集，包含新闻、报告等',
    latestVersion: 'v1',
    availabilityZone: 'cn-south-1a',
    visibility: 'private',
    syncStatus: 'failed',
    syncedZones: ['cn-south-1a'],
    owner: 'finance@fermi.com',
    tags: ['金融', '文本分析', '情感分析']
  },
  {
    id: 'ds-007',
    name: 'Video-Action-Recognition',
    type: 'video',
    dataType: 'video',
    status: 'ready',
    recordCount: 50000,
    size: 107374182400, // ~100GB
    createTime: '2024-11-05 09:30:00',
    createdAt: '2024-11-05T09:30:00Z',
    description: '视频动作识别数据集，用于行为理解任务',
    latestVersion: 'v1',
    availabilityZone: 'cn-east-1a',
    visibility: 'public',
    syncStatus: 'syncing',
    syncedZones: ['cn-east-1a'],
    owner: 'admin@fermi.com',
    tags: ['视频', '动作识别', '行为理解']
  },
  {
    id: 'ds-008',
    name: 'Multi-Modal-Dataset',
    type: 'mixed',
    dataType: 'mixed',
    status: 'ready',
    recordCount: 800000,
    size: 53687091200, // ~50GB
    createTime: '2024-11-13 16:40:00',
    createdAt: '2024-11-13T16:40:00Z',
    description: '多模态数据集，包含图像、文本和音频',
    latestVersion: 'v1',
    availabilityZone: 'cn-north-1b',
    visibility: 'team',
    syncStatus: 'synced',
    syncedZones: ['cn-north-1b', 'cn-north-1a'],
    owner: 'research@fermi.com',
    tags: ['多模态', '图文', '跨模态']
  }
];

let mockVersions: DatasetVersion[] = [
  {
    id: 'v-001',
    datasetId: 'ds-001',
    version: 'v1',
    uploadedAt: '2024-11-01T10:30:00Z',
    filePath: 's3://datasets/imagenet-2024/v1.zip',
    fileSize: 157286400000, // ~150GB
    description: '原始数据集',
    status: 'completed'
  },
  {
    id: 'v-002',
    datasetId: 'ds-001',
    version: 'v2',
    uploadedAt: '2024-11-05T15:20:00Z',
    filePath: 's3://datasets/imagenet-2024/v2.zip',
    fileSize: 165580800000, // ~154GB
    description: '添加标注数据',
    status: 'completed'
  },
  {
    id: 'v-003',
    datasetId: 'ds-001',
    version: 'v3',
    uploadedAt: '2024-11-12T09:15:00Z',
    filePath: 's3://datasets/imagenet-2024/v3.zip',
    fileSize: 171798691840, // ~160GB
    description: '数据清洗和增强',
    status: 'completed'
  },
  {
    id: 'v-004',
    datasetId: 'ds-002',
    version: 'v1',
    uploadedAt: '2024-10-15T08:20:00Z',
    filePath: 's3://datasets/text-corpus/v1.tar.gz',
    fileSize: 52428800000, // ~50GB
    description: '初始语料库',
    status: 'completed'
  },
  {
    id: 'v-005',
    datasetId: 'ds-002',
    version: 'v2',
    uploadedAt: '2024-11-08T16:30:00Z',
    filePath: 's3://datasets/text-corpus/v2.tar.gz',
    fileSize: 73400320000, // ~68GB
    description: '扩充语料并去重',
    status: 'completed'
  },
  {
    id: 'v-006',
    datasetId: 'ds-003',
    version: 'v1',
    uploadedAt: '2024-11-10T14:45:00Z',
    filePath: 's3://datasets/medical-images/v1.zip',
    fileSize: 31457280000, // ~29GB
    description: '医疗影像初始版本',
    status: 'completed'
  }
];

/**
 * 获取数据集列表
 */
export async function getDatasets(): Promise<Dataset[]> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockDatasets].sort((a, b) => {
    const dateA = new Date(a.createTime.replace(' ', 'T'));
    const dateB = new Date(b.createTime.replace(' ', 'T'));
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * 获取数据集详情
 */
export async function getDataset(id: string): Promise<Dataset | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockDatasets.find(d => d.id === id) || null;
}

/**
 * 获取数据集的所有版本
 */
export async function getDatasetVersions(datasetId: string): Promise<DatasetVersion[]> {
  await new Promise(resolve => setTimeout(resolve, 250));
  return mockVersions
    .filter(v => v.datasetId === datasetId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

/**
 * 创建数据集（包含第一个版本v1）
 */
export async function createDataset(
  request: CreateDatasetRequest,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ datasetId: string; versionId: string }> {
  // 模拟文件上传进度
  const fileSize = request.file.size;
  
  // 模拟分片上传
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (onProgress) {
      onProgress({
        loaded: (fileSize * i) / 100,
        total: fileSize,
        percentage: i
      });
    }
  }

  // 创建新数据集
  const now = new Date();
  const newDataset: Dataset = {
    id: `ds-${Date.now()}`,
    name: request.name,
    type: request.type,
    dataType: request.type,
    status: 'ready',
    recordCount: 0,
    size: request.file.size,
    createTime: now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-'),
    createdAt: now.toISOString(),
    description: request.description,
    latestVersion: 'v1',
    availabilityZone: request.availabilityZone,
    visibility: request.visibility,
    syncStatus: 'synced',
    syncedZones: [request.availabilityZone],
    owner: 'current-user@fermi.com',
    tags: request.tags || []
  };

  // 创建第一个版本
  const newVersion: DatasetVersion = {
    id: `v-${Date.now()}`,
    datasetId: newDataset.id,
    version: 'v1',
    uploadedAt: new Date().toISOString(),
    filePath: `s3://datasets/${request.name.toLowerCase()}/v1.zip`,
    fileSize: request.file.size,
    description: request.description,
    status: 'completed'
  };

  mockDatasets.push(newDataset);
  mockVersions.push(newVersion);

  return {
    datasetId: newDataset.id,
    versionId: newVersion.id
  };
}

/**
 * 为数据集添加新版本
 */
export async function addDatasetVersion(
  request: AddVersionRequest,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const fileSize = request.file.size;
  
  // 模拟分片上传
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (onProgress) {
      onProgress({
        loaded: (fileSize * i) / 100,
        total: fileSize,
        percentage: i
      });
    }
  }

  const dataset = mockDatasets.find(d => d.id === request.datasetId);
  if (!dataset) {
    throw new Error('数据集不存在');
  }

  const newVersion: DatasetVersion = {
    id: `v-${Date.now()}`,
    datasetId: request.datasetId,
    version: request.version,
    uploadedAt: new Date().toISOString(),
    filePath: `s3://datasets/${dataset.name.toLowerCase()}/${request.version}.zip`,
    fileSize: request.file.size,
    description: request.description,
    status: 'completed'
  };

  mockVersions.push(newVersion);
  
  // 更新数据集的最新版本
  dataset.latestVersion = request.version;

  return newVersion.id;
}

/**
 * 删除数据集（及其所有版本）
 */
export async function deleteDataset(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  mockDatasets = mockDatasets.filter(d => d.id !== id);
  mockVersions = mockVersions.filter(v => v.datasetId !== id);
}

/**
 * 删除数据集版本
 */
export async function deleteDatasetVersion(versionId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const version = mockVersions.find(v => v.id === versionId);
  if (!version) {
    throw new Error('版本不存在');
  }

  // 检查是否是唯一版本
  const datasetVersions = mockVersions.filter(v => v.datasetId === version.datasetId);
  if (datasetVersions.length === 1) {
    throw new Error('不能删除数据集的唯一版本，请删除整个数据集');
  }

  mockVersions = mockVersions.filter(v => v.id !== versionId);

  // 更新数据集的最新版本
  const dataset = mockDatasets.find(d => d.id === version.datasetId);
  if (dataset) {
    const remainingVersions = mockVersions
      .filter(v => v.datasetId === version.datasetId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    if (remainingVersions.length > 0) {
      dataset.latestVersion = remainingVersions[0].version;
    }
  }
}

/**
 * 下载数据集版本
 */
export async function downloadDatasetVersion(versionId: string): Promise<void> {
  const version = mockVersions.find(v => v.id === versionId);
  if (!version) {
    throw new Error('版本不存在');
  }

  // 实际场景应该从对象存储生成预签名URL并下载
  // 这里模拟下载操作
  console.log(`开始下载: ${version.filePath}`);
  
  // 模拟生成下载链接
  const downloadUrl = `https://minio.example.com/download?path=${encodeURIComponent(version.filePath)}`;
  
  // 触发浏览器下载（实际需要后端返回预签名URL）
  window.open(downloadUrl, '_blank');
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化日期时间
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * 获取数据类型的显示名称
 */
export function getDataTypeLabel(type: Dataset['type']): string {
  const labels: Record<Dataset['type'], string> = {
    text: '文本',
    image: '图像',
    audio: '音频',
    video: '视频',
    mixed: '混合'
  };
  return labels[type];
}

/**
 * 获取可用区的显示名称
 */
export function getAvailabilityZoneLabel(zone: AvailabilityZone): string {
  const labels: Record<AvailabilityZone, string> = {
    'cn-north-1a': '华北可用区A',
    'cn-north-1b': '华北可用区B',
    'cn-east-1a': '华东可用区A',
    'cn-east-1b': '华东可用区B',
    'cn-south-1a': '华南可用区A'
  };
  return labels[zone];
}

/**
 * 获取可见性的显示名称
 */
export function getVisibilityLabel(visibility: DatasetVisibility): string {
  const labels: Record<DatasetVisibility, string> = {
    private: '私有',
    public: '公开',
    team: '团队'
  };
  return labels[visibility];
}

/**
 * 获取同步状态的显示名称
 */
export function getSyncStatusLabel(status: SyncStatus): string {
  const labels: Record<SyncStatus, string> = {
    synced: '已同步',
    syncing: '同步中',
    'not-synced': '未同步',
    failed: '同步失败'
  };
  return labels[status];
}

/**
 * 按可用区筛选数据集
 */
export function filterByAvailabilityZone(
  datasets: Dataset[],
  zone: AvailabilityZone | 'all'
): Dataset[] {
  if (zone === 'all') return datasets;
  return datasets.filter(d => d.availabilityZone === zone);
}

/**
 * 按可见性筛选数据集
 */
export function filterByVisibility(
  datasets: Dataset[],
  visibility: DatasetVisibility | 'all'
): Dataset[] {
  if (visibility === 'all') return datasets;
  return datasets.filter(d => d.visibility === visibility);
}
