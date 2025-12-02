/**
 * Pipeline 编排服务
 * 基于 Kubeflow Pipelines 实现从数据预处理到模型部署的流程化编排
 */

// ============= 类型定义 =============

export type PipelineStatus = 'draft' | 'running' | 'completed' | 'failed' | 'paused';
export type StepType = 
  | 'data-preparation'    // 数据预处理
  | 'data-augmentation'   // 数据增强
  | 'model-training'      // 模型训练
  | 'model-evaluation'    // 模型评测
  | 'model-optimization'  // 模型优化
  | 'model-deployment'    // 模型部署
  | 'custom';             // 自定义步骤

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// Pipeline 步骤
export interface PipelineStep {
  id: string;
  name: string;
  type: StepType;
  description?: string;
  
  // 位置（用于可视化）
  position: {
    x: number;
    y: number;
  };
  
  // 依赖关系
  dependencies: string[]; // 依赖的步骤ID列表
  
  // 配置
  config: {
    image?: string; // 容器镜像
    command?: string[];
    args?: string[];
    env?: Record<string, string>;
    resources?: {
      cpuCores: number;
      memoryGB: number;
      gpuCount?: number;
      gpuType?: string;
    };
  };
  
  // 输入输出
  inputs?: {
    name: string;
    type: 'dataset' | 'model' | 'config' | 'artifact';
    source?: string; // 来源步骤ID或外部路径
  }[];
  outputs?: {
    name: string;
    type: 'dataset' | 'model' | 'metrics' | 'artifact';
    path: string;
  }[];
  
  // 执行信息
  status?: StepStatus;
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs?: string;
  error?: string;
}

// Pipeline 定义
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  version: string;
  status: PipelineStatus;
  
  // 步骤
  steps: PipelineStep[];
  
  // 全局配置
  config: {
    timeout?: number; // 超时时间（分钟）
    retryPolicy?: {
      maxRetries: number;
      backoff: 'linear' | 'exponential';
    };
    notifications?: {
      email?: string[];
      webhook?: string;
    };
  };
  
  // 调度配置
  schedule?: {
    enabled: boolean;
    cron?: string; // cron 表达式
    timezone?: string;
  };
  
  // 元数据
  category: 'training' | 'inference' | 'data-processing' | 'end-to-end';
  tags: string[];
  isTemplate: boolean;
  
  // 统计信息
  runCount: number;
  successCount: number;
  failureCount: number;
  
  // 时间信息
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
}

// Pipeline 运行记录
export interface PipelineRun {
  id: string;
  pipelineId: string;
  pipelineName: string;
  version: string;
  status: PipelineStatus;
  
  // 触发信息
  trigger: 'manual' | 'scheduled' | 'api';
  triggeredBy: string;
  
  // 步骤执行状态
  stepStatuses: Record<string, StepStatus>;
  currentStep?: string;
  
  // 时间信息
  startTime: string;
  endTime?: string;
  duration?: number;
  
  // 资源使用
  resourceUsage?: {
    cpuHours: number;
    memoryGBHours: number;
    gpuHours?: number;
  };
  
  // 成本
  cost?: number;
  
  // 输出
  outputs?: {
    models?: string[];
    datasets?: string[];
    metrics?: Record<string, any>;
    artifacts?: string[];
  };
  
  // 日志
  logs?: string;
  error?: string;
}

// Pipeline 模板
export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: 'training' | 'inference' | 'data-processing' | 'end-to-end';
  icon: string;
  
  // 模板内容
  pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  
  // 参数
  parameters?: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    label: string;
    description?: string;
    default?: any;
    options?: string[];
    required: boolean;
  }[];
  
  // 元数据
  isBuiltin: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
}

// ============= Mock 数据 =============

const mockPipelines: Pipeline[] = [
  {
    id: 'pipeline-001',
    name: 'Qwen2-7B 微调流水线',
    description: '完整的 Qwen2-7B 模型微调流程，包括数据预处理、模型训练、评测和部署',
    version: 'v1.2.0',
    status: 'completed',
    steps: [
      {
        id: 'step-data-prep',
        name: '数据预处理',
        type: 'data-preparation',
        description: '清洗和格式化训练数据',
        position: { x: 100, y: 100 },
        dependencies: [],
        config: {
          image: 'registry.fermilab.com/data-processor:v1.0',
          command: ['python', 'preprocess.py'],
          resources: {
            cpuCores: 8,
            memoryGB: 32,
          },
        },
        inputs: [
          { name: 'raw_data', type: 'dataset', source: 'dataset-raw-001' },
        ],
        outputs: [
          { name: 'processed_data', type: 'dataset', path: '/output/processed' },
        ],
        status: 'completed',
        startTime: '2024-11-14T08:00:00Z',
        endTime: '2024-11-14T08:15:00Z',
        duration: 900,
      },
      {
        id: 'step-augmentation',
        name: '数据增强',
        type: 'data-augmentation',
        description: '对训练数据进行增强',
        position: { x: 300, y: 100 },
        dependencies: ['step-data-prep'],
        config: {
          image: 'registry.fermilab.com/data-augmentor:v1.0',
          resources: {
            cpuCores: 4,
            memoryGB: 16,
          },
        },
        status: 'completed',
        startTime: '2024-11-14T08:15:00Z',
        endTime: '2024-11-14T08:30:00Z',
        duration: 900,
      },
      {
        id: 'step-training',
        name: '模型训练',
        type: 'model-training',
        description: '使用 LoRA 微调 Qwen2-7B',
        position: { x: 500, y: 100 },
        dependencies: ['step-augmentation'],
        config: {
          image: 'registry.fermilab.com/llm-trainer:v2.0',
          command: ['python', 'train.py'],
          args: ['--model=qwen2-7b', '--method=lora', '--epochs=3'],
          resources: {
            cpuCores: 16,
            memoryGB: 64,
            gpuCount: 4,
            gpuType: 'NVIDIA A100',
          },
        },
        outputs: [
          { name: 'trained_model', type: 'model', path: '/output/model' },
          { name: 'training_metrics', type: 'metrics', path: '/output/metrics.json' },
        ],
        status: 'completed',
        startTime: '2024-11-14T08:30:00Z',
        endTime: '2024-11-14T11:30:00Z',
        duration: 10800,
      },
      {
        id: 'step-evaluation',
        name: '模型评测',
        type: 'model-evaluation',
        description: '在测试集上评估模型性能',
        position: { x: 700, y: 100 },
        dependencies: ['step-training'],
        config: {
          image: 'registry.fermilab.com/model-evaluator:v1.0',
          resources: {
            cpuCores: 8,
            memoryGB: 32,
            gpuCount: 1,
            gpuType: 'NVIDIA A100',
          },
        },
        status: 'completed',
        startTime: '2024-11-14T11:30:00Z',
        endTime: '2024-11-14T12:00:00Z',
        duration: 1800,
      },
      {
        id: 'step-deployment',
        name: '模型部署',
        type: 'model-deployment',
        description: '将模型部署到推理服务',
        position: { x: 900, y: 100 },
        dependencies: ['step-evaluation'],
        config: {
          image: 'registry.fermilab.com/model-deployer:v1.0',
          resources: {
            cpuCores: 4,
            memoryGB: 16,
          },
        },
        status: 'completed',
        startTime: '2024-11-14T12:00:00Z',
        endTime: '2024-11-14T12:10:00Z',
        duration: 600,
      },
    ],
    config: {
      timeout: 360,
      retryPolicy: {
        maxRetries: 2,
        backoff: 'exponential',
      },
      notifications: {
        email: ['user@example.com'],
      },
    },
    category: 'training',
    tags: ['qwen', 'lora', 'finetuning'],
    isTemplate: false,
    runCount: 12,
    successCount: 10,
    failureCount: 2,
    createdBy: '张三',
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-11-14T12:10:00Z',
    lastRunAt: '2024-11-14T08:00:00Z',
  },
  {
    id: 'pipeline-002',
    name: '图像分类模型训练',
    description: 'ResNet-50 图像分类模型的完整训练流程',
    version: 'v1.0.0',
    status: 'running',
    steps: [
      {
        id: 'step-img-prep',
        name: '图像预处理',
        type: 'data-preparation',
        position: { x: 100, y: 100 },
        dependencies: [],
        config: {
          image: 'registry.fermilab.com/image-processor:v1.0',
          resources: { cpuCores: 8, memoryGB: 32 },
        },
        status: 'completed',
      },
      {
        id: 'step-img-train',
        name: '模型训练',
        type: 'model-training',
        position: { x: 300, y: 100 },
        dependencies: ['step-img-prep'],
        config: {
          image: 'registry.fermilab.com/cv-trainer:v1.0',
          resources: {
            cpuCores: 16,
            memoryGB: 64,
            gpuCount: 2,
            gpuType: 'NVIDIA A100',
          },
        },
        status: 'running',
        startTime: '2024-11-14T14:00:00Z',
      },
      {
        id: 'step-img-eval',
        name: '模型评测',
        type: 'model-evaluation',
        position: { x: 500, y: 100 },
        dependencies: ['step-img-train'],
        config: {
          resources: { cpuCores: 8, memoryGB: 32, gpuCount: 1 },
        },
        status: 'pending',
      },
    ],
    config: {
      timeout: 480,
    },
    category: 'training',
    tags: ['vision', 'resnet', 'classification'],
    isTemplate: false,
    runCount: 3,
    successCount: 2,
    failureCount: 0,
    createdBy: '李四',
    createdAt: '2024-11-10T14:00:00Z',
    updatedAt: '2024-11-14T14:30:00Z',
    lastRunAt: '2024-11-14T14:00:00Z',
  },
];

const mockRuns: PipelineRun[] = [
  {
    id: 'run-001',
    pipelineId: 'pipeline-001',
    pipelineName: 'Qwen2-7B 微调流水线',
    version: 'v1.2.0',
    status: 'completed',
    trigger: 'manual',
    triggeredBy: '张三',
    stepStatuses: {
      'step-data-prep': 'completed',
      'step-augmentation': 'completed',
      'step-training': 'completed',
      'step-evaluation': 'completed',
      'step-deployment': 'completed',
    },
    startTime: '2024-11-14T08:00:00Z',
    endTime: '2024-11-14T12:10:00Z',
    duration: 15000,
    resourceUsage: {
      cpuHours: 48,
      memoryGBHours: 256,
      gpuHours: 12,
    },
    cost: 128.50,
    outputs: {
      models: ['qwen2-7b-finetuned-v1'],
      metrics: {
        accuracy: 0.92,
        loss: 0.15,
      },
    },
  },
];

const mockTemplates: PipelineTemplate[] = [
  {
    id: 'template-llm-finetuning',
    name: '大语言模型微调',
    description: '通用的大语言模型微调流水线模板，支持 LoRA、QLoRA 等方法',
    category: 'training',
    icon: '🤖',
    pipeline: {
      name: '',
      description: '',
      version: 'v1.0.0',
      status: 'draft',
      steps: [
        {
          id: 'step-1',
          name: '数据预处理',
          type: 'data-preparation',
          position: { x: 100, y: 100 },
          dependencies: [],
          config: { resources: { cpuCores: 8, memoryGB: 32 } },
        },
        {
          id: 'step-2',
          name: '模型训练',
          type: 'model-training',
          position: { x: 300, y: 100 },
          dependencies: ['step-1'],
          config: { resources: { cpuCores: 16, memoryGB: 64, gpuCount: 4 } },
        },
        {
          id: 'step-3',
          name: '模型评测',
          type: 'model-evaluation',
          position: { x: 500, y: 100 },
          dependencies: ['step-2'],
          config: { resources: { cpuCores: 8, memoryGB: 32, gpuCount: 1 } },
        },
      ],
      config: {},
      category: 'training',
      tags: [],
      isTemplate: true,
      runCount: 0,
      successCount: 0,
      failureCount: 0,
    },
    parameters: [
      {
        name: 'model_name',
        type: 'select',
        label: '基座模型',
        description: '选择要微调的基座模型',
        options: ['Qwen2-7B', 'Llama-3-8B', 'GLM-4-9B'],
        required: true,
      },
      {
        name: 'dataset_id',
        type: 'string',
        label: '训练数据集',
        description: '选择训练数据集ID',
        required: true,
      },
      {
        name: 'learning_rate',
        type: 'number',
        label: '学习率',
        default: 0.0001,
        required: false,
      },
    ],
    isBuiltin: true,
    usageCount: 245,
    rating: 4.8,
    tags: ['llm', 'finetuning', 'popular'],
  },
  {
    id: 'template-cv-training',
    name: '计算机视觉模型训练',
    description: '图像分类、目标检测等CV模型的训练流水线',
    category: 'training',
    icon: '🖼️',
    pipeline: {
      name: '',
      description: '',
      version: 'v1.0.0',
      status: 'draft',
      steps: [],
      config: {},
      category: 'training',
      tags: [],
      isTemplate: true,
      runCount: 0,
      successCount: 0,
      failureCount: 0,
    },
    parameters: [],
    isBuiltin: true,
    usageCount: 123,
    rating: 4.5,
    tags: ['cv', 'vision', 'popular'],
  },
];

// ============= API 函数 =============

export const getPipelines = async (): Promise<Pipeline[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPipelines), 500);
  });
};

export const getPipeline = async (id: string): Promise<Pipeline | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pipeline = mockPipelines.find(p => p.id === id);
      resolve(pipeline || null);
    }, 300);
  });
};

export const createPipeline = async (data: Partial<Pipeline>): Promise<Pipeline> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPipeline: Pipeline = {
        id: `pipeline-${Date.now()}`,
        name: data.name || '未命名流水线',
        description: data.description || '',
        version: data.version || 'v1.0.0',
        status: 'draft',
        steps: data.steps || [],
        config: data.config || {},
        category: data.category || 'training',
        tags: data.tags || [],
        isTemplate: false,
        runCount: 0,
        successCount: 0,
        failureCount: 0,
        createdBy: '当前用户',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPipelines.unshift(newPipeline);
      resolve(newPipeline);
    }, 800);
  });
};

export const updatePipeline = async (id: string, data: Partial<Pipeline>): Promise<Pipeline | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pipeline = mockPipelines.find(p => p.id === id);
      if (pipeline) {
        Object.assign(pipeline, data, { updatedAt: new Date().toISOString() });
        resolve(pipeline);
      } else {
        resolve(null);
      }
    }, 500);
  });
};

export const deletePipeline = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockPipelines.findIndex(p => p.id === id);
      if (index > -1) {
        mockPipelines.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

export const runPipeline = async (id: string): Promise<PipelineRun> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pipeline = mockPipelines.find(p => p.id === id);
      if (pipeline) {
        pipeline.status = 'running';
        pipeline.runCount++;
        pipeline.lastRunAt = new Date().toISOString();
        
        const run: PipelineRun = {
          id: `run-${Date.now()}`,
          pipelineId: id,
          pipelineName: pipeline.name,
          version: pipeline.version,
          status: 'running',
          trigger: 'manual',
          triggeredBy: '当前用户',
          stepStatuses: {},
          startTime: new Date().toISOString(),
        };
        mockRuns.unshift(run);
        resolve(run);
      }
    }, 800);
  });
};

export const getPipelineRuns = async (pipelineId?: string): Promise<PipelineRun[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (pipelineId) {
        resolve(mockRuns.filter(r => r.pipelineId === pipelineId));
      } else {
        resolve(mockRuns);
      }
    }, 300);
  });
};

export const getPipelineTemplates = async (): Promise<PipelineTemplate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTemplates), 300);
  });
};

export const createPipelineFromTemplate = async (
  templateId: string,
  params: Record<string, any>
): Promise<Pipeline> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const template = mockTemplates.find(t => t.id === templateId);
      if (template) {
        const newPipeline: Pipeline = {
          ...template.pipeline,
          id: `pipeline-${Date.now()}`,
          name: params.name || template.name,
          description: params.description || template.description,
          createdBy: '当前用户',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockPipelines.unshift(newPipeline);
        resolve(newPipeline);
      }
    }, 800);
  });
};

// ============= 工具函数 =============

export const getStatusConfig = (status: PipelineStatus) => {
  const configs = {
    draft: {
      label: '草稿',
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      iconColor: 'text-slate-600',
    },
    running: {
      label: '运行中',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600',
    },
    completed: {
      label: '已完成',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    failed: {
      label: '失败',
      color: 'bg-red-50 text-red-700 border-red-200',
      iconColor: 'text-red-600',
    },
    paused: {
      label: '已暂停',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-600',
    },
  };
  return configs[status];
};

export const getStepTypeLabel = (type: StepType): string => {
  const labels: Record<StepType, string> = {
    'data-preparation': '数据预处理',
    'data-augmentation': '数据增强',
    'model-training': '模型训练',
    'model-evaluation': '模型评测',
    'model-optimization': '模型优化',
    'model-deployment': '模型部署',
    'custom': '自定义',
  };
  return labels[type];
};

export const getStepTypeIcon = (type: StepType): string => {
  const icons: Record<StepType, string> = {
    'data-preparation': '📊',
    'data-augmentation': '🔄',
    'model-training': '🎯',
    'model-evaluation': '📈',
    'model-optimization': '⚡',
    'model-deployment': '🚀',
    'custom': '⚙️',
  };
  return icons[type];
};

export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
};
