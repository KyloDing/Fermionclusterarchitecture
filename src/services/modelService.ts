// 模型管理服务
export type AvailabilityZone = 'cn-north-1a' | 'cn-north-1b' | 'cn-east-1a' | 'cn-east-1b' | 'cn-south-1a';
export type ModelVisibility = 'private' | 'public' | 'team';
export type SyncStatus = 'synced' | 'syncing' | 'not-synced' | 'failed';

export interface ModelVersion {
  id: string;
  versionNumber: string;
  uploadTime: string;
  remark: string;
  fileSize: number;
  filePath: string; // 存储在对象存储中的路径
  status: 'uploading' | 'ready' | 'failed';
}

export interface Model {
  id: string;
  name: string;
  type: 'text' | 'image' | 'general';
  latestVersion: string;
  createTime: string;
  updateTime: string;
  remark: string;
  versions: ModelVersion[];
  userId: string;
  availabilityZone: AvailabilityZone;
  visibility: ModelVisibility;
  syncStatus?: SyncStatus;
  syncedZones?: AvailabilityZone[];
}

export interface CreateModelRequest {
  name: string;
  type: 'text' | 'image' | 'general';
  remark?: string;
  file: File;
  availabilityZone: AvailabilityZone;
  visibility: ModelVisibility;
}

export interface AddVersionRequest {
  modelId: string;
  versionNumber: string;
  remark?: string;
  file: File;
}

export interface StartTrainingRequest {
  modelVersionId: string;
  datasetId: string;
  jobName: string;
  parameters?: Record<string, any>;
}

// 模拟数据
let mockModels: Model[] = [
  {
    id: 'model-001',
    name: 'Llama-3-8B',
    type: 'text',
    latestVersion: 'v2',
    createTime: '2025-10-15 14:30:00',
    updateTime: '2025-11-10 09:20:00',
    remark: 'Meta开源的大语言模型，适用于文本生成和对话任务',
    userId: 'user-001',
    availabilityZone: 'cn-north-1a',
    visibility: 'public',
    syncStatus: 'synced',
    syncedZones: ['cn-north-1a', 'cn-north-1b', 'cn-east-1a'],
    versions: [
      {
        id: 'version-001',
        versionNumber: 'v1',
        uploadTime: '2025-10-15 14:30:00',
        remark: '基础版本',
        fileSize: 8589934592, // 8GB
        filePath: 's3://models/llama-3-8b/v1.zip',
        status: 'ready'
      },
      {
        id: 'version-002',
        versionNumber: 'v2',
        uploadTime: '2025-11-10 09:20:00',
        remark: '微调后的版本，在中文数据集上表现更好',
        fileSize: 8589934592,
        filePath: 's3://models/llama-3-8b/v2.zip',
        status: 'ready'
      }
    ]
  },
  {
    id: 'model-002',
    name: 'Stable-Diffusion-XL',
    type: 'image',
    latestVersion: 'v1',
    createTime: '2025-09-20 16:45:00',
    updateTime: '2025-09-20 16:45:00',
    remark: '图像生成模型，支持高分辨率图像生成',
    userId: 'user-001',
    availabilityZone: 'cn-east-1a',
    visibility: 'team',
    syncStatus: 'not-synced',
    syncedZones: ['cn-east-1a'],
    versions: [
      {
        id: 'version-003',
        versionNumber: 'v1',
        uploadTime: '2025-09-20 16:45:00',
        remark: '基础版本',
        fileSize: 6442450944, // 6GB
        filePath: 's3://models/stable-diffusion-xl/v1.zip',
        status: 'ready'
      }
    ]
  },
  {
    id: 'model-003',
    name: 'BERT-Base-Chinese',
    type: 'text',
    latestVersion: 'v3',
    createTime: '2025-08-10 10:00:00',
    updateTime: '2025-11-05 14:15:00',
    remark: '中文BERT模型，适用于文本分类、命名实体识别等任务',
    userId: 'user-001',
    availabilityZone: 'cn-north-1a',
    visibility: 'private',
    syncStatus: 'synced',
    syncedZones: ['cn-north-1a', 'cn-south-1a'],
    versions: [
      {
        id: 'version-004',
        versionNumber: 'v1',
        uploadTime: '2025-08-10 10:00:00',
        remark: '初始版本',
        fileSize: 409600000, // 390MB
        filePath: 's3://models/bert-base-chinese/v1.zip',
        status: 'ready'
      },
      {
        id: 'version-005',
        versionNumber: 'v2',
        uploadTime: '2025-09-15 11:30:00',
        remark: '在金融领域数据集上微调',
        fileSize: 409600000,
        filePath: 's3://models/bert-base-chinese/v2.zip',
        status: 'ready'
      },
      {
        id: 'version-006',
        versionNumber: 'v3',
        uploadTime: '2025-11-05 14:15:00',
        remark: '在医疗领域数据集上微调',
        fileSize: 409600000,
        filePath: 's3://models/bert-base-chinese/v3.zip',
        status: 'ready'
      }
    ]
  },
  {
    id: 'model-004',
    name: 'GPT-2-Chinese',
    type: 'text',
    latestVersion: 'v1',
    createTime: '2025-11-12 13:20:00',
    updateTime: '2025-11-12 13:20:00',
    remark: '中文GPT-2模型，适用于文本生成任务',
    userId: 'user-002',
    availabilityZone: 'cn-north-1b',
    visibility: 'public',
    syncStatus: 'syncing',
    syncedZones: ['cn-north-1b'],
    versions: [
      {
        id: 'version-007',
        versionNumber: 'v1',
        uploadTime: '2025-11-12 13:20:00',
        remark: '基础版本',
        fileSize: 1073741824, // 1GB
        filePath: 's3://models/gpt-2-chinese/v1.zip',
        status: 'ready'
      }
    ]
  },
  {
    id: 'model-005',
    name: 'YOLO-v8',
    type: 'image',
    latestVersion: 'v1',
    createTime: '2025-11-01 09:00:00',
    updateTime: '2025-11-01 09:00:00',
    remark: '目标检测模型，实时性能优异',
    userId: 'user-001',
    availabilityZone: 'cn-south-1a',
    visibility: 'team',
    syncStatus: 'failed',
    syncedZones: ['cn-south-1a'],
    versions: [
      {
        id: 'version-008',
        versionNumber: 'v1',
        uploadTime: '2025-11-01 09:00:00',
        remark: '基础版本',
        fileSize: 2147483648, // 2GB
        filePath: 's3://models/yolo-v8/v1.zip',
        status: 'ready'
      }
    ]
  }
];

// 获取模型列表
export async function getModels(): Promise<Model[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockModels];
}

// 获取模型详情
export async function getModelById(id: string): Promise<Model | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const model = mockModels.find(m => m.id === id);
  return model ? { ...model } : null;
}

// 创建模型（导入模型）
export async function createModel(request: CreateModelRequest): Promise<Model> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newModel: Model = {
    id: `model-${Date.now()}`,
    name: request.name,
    type: request.type,
    latestVersion: 'v1',
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    remark: request.remark || '',
    userId: 'user-001',
    availabilityZone: request.availabilityZone,
    visibility: request.visibility,
    syncStatus: 'synced',
    syncedZones: [request.availabilityZone],
    versions: [
      {
        id: `version-${Date.now()}`,
        versionNumber: 'v1',
        uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        remark: '初始版本',
        fileSize: request.file.size,
        filePath: `s3://models/${request.name.toLowerCase().replace(/\s+/g, '-')}/v1.zip`,
        status: 'uploading'
      }
    ]
  };
  
  mockModels.push(newModel);
  
  // 模拟文件上传完成
  setTimeout(() => {
    const model = mockModels.find(m => m.id === newModel.id);
    if (model && model.versions[0]) {
      model.versions[0].status = 'ready';
    }
  }, 3000);
  
  return newModel;
}

// 添加模型版本
export async function addModelVersion(request: AddVersionRequest): Promise<ModelVersion> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const model = mockModels.find(m => m.id === request.modelId);
  if (!model) {
    throw new Error('模型不存在');
  }
  
  const newVersion: ModelVersion = {
    id: `version-${Date.now()}`,
    versionNumber: request.versionNumber,
    uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    remark: request.remark || '',
    fileSize: request.file.size,
    filePath: `s3://models/${model.name.toLowerCase().replace(/\s+/g, '-')}/${request.versionNumber}.zip`,
    status: 'uploading'
  };
  
  model.versions.push(newVersion);
  model.latestVersion = request.versionNumber;
  model.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // 模拟文件上传完成
  setTimeout(() => {
    const version = model.versions.find(v => v.id === newVersion.id);
    if (version) {
      version.status = 'ready';
    }
  }, 3000);
  
  return newVersion;
}

// 删除模型
export async function deleteModel(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  mockModels = mockModels.filter(m => m.id !== id);
}

// 删除模型版本
export async function deleteModelVersion(modelId: string, versionId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const model = mockModels.find(m => m.id === modelId);
  if (!model) {
    throw new Error('模型不存在');
  }
  
  model.versions = model.versions.filter(v => v.id !== versionId);
  
  // 如果删除了最新版本，更新 latestVersion
  if (model.versions.length > 0) {
    model.latestVersion = model.versions[model.versions.length - 1].versionNumber;
  }
}

// 下载模型版本
export async function downloadModelVersion(versionId: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 在实际实现中，这里应该返回一个预签名的下载URL
  return `https://download.example.com/models/${versionId}`;
}

// 发起训练任务（跳转到训练任务模块）
export async function startTrainingJob(request: StartTrainingRequest): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 在实际实现中，这里应该调用训练任务服务
  // 返回训练任务ID
  return `job-${Date.now()}`;
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// 获取可用区的显示名称
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

// 获取可见性的显示名称
export function getVisibilityLabel(visibility: ModelVisibility): string {
  const labels: Record<ModelVisibility, string> = {
    private: '私有',
    public: '公开',
    team: '团队'
  };
  return labels[visibility];
}

// 获取同步状态的显示名称
export function getSyncStatusLabel(status: SyncStatus): string {
  const labels: Record<SyncStatus, string> = {
    synced: '已同步',
    syncing: '同步中',
    'not-synced': '未同步',
    failed: '同步失败'
  };
  return labels[status];
}

// 按可用区筛选模型
export function filterByAvailabilityZone(
  models: Model[],
  zone: AvailabilityZone | 'all'
): Model[] {
  if (zone === 'all') return models;
  return models.filter(m => m.availabilityZone === zone);
}

// 按可见性筛选模型
export function filterByVisibility(
  models: Model[],
  visibility: ModelVisibility | 'all'
): Model[] {
  if (visibility === 'all') return models;
  return models.filter(m => m.visibility === visibility);
}

// 模拟分片上传
export interface UploadChunkOptions {
  file: File;
  chunkSize?: number;
  onProgress?: (progress: number) => void;
  onComplete?: (filePath: string) => void;
  onError?: (error: Error) => void;
}

export function uploadFileInChunks(options: UploadChunkOptions): { abort: () => void } {
  const {
    file,
    chunkSize = 5 * 1024 * 1024, // 5MB per chunk
    onProgress,
    onComplete,
    onError
  } = options;
  
  let aborted = false;
  let uploadedBytes = 0;
  
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  // 模拟上传过程
  const uploadNextChunk = (chunkIndex: number) => {
    if (aborted) return;
    
    if (chunkIndex >= totalChunks) {
      onComplete?.(`s3://models/${file.name}`);
      return;
    }
    
    // 模拟上传延迟
    setTimeout(() => {
      uploadedBytes += chunkSize;
      const progress = Math.min((uploadedBytes / file.size) * 100, 100);
      onProgress?.(progress);
      
      uploadNextChunk(chunkIndex + 1);
    }, 200);
  };
  
  // 开始上传
  uploadNextChunk(0);
  
  return {
    abort: () => {
      aborted = true;
      onError?.(new Error('Upload aborted'));
    }
  };
}
