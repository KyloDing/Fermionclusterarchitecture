/**
 * 模型评测服务
 * 提供模型评测任务的创建、管理和结果分析功能
 */

// ============= 类型定义 =============

export type EvaluationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type EvaluationTaskType = 'benchmark' | 'custom' | 'comparison';
export type ModelType = 'llm' | 'vlm' | 'embedding' | 'classification';

// 评测指标类型
export interface EvaluationMetric {
  id: string;
  name: string;
  displayName: string;
  category: 'performance' | 'quality' | 'efficiency' | 'safety';
  description: string;
  unit?: string;
  higherIsBetter: boolean;
}

// 评测数据集
export interface EvaluationDataset {
  id: string;
  name: string;
  description: string;
  type: 'qa' | 'generation' | 'classification' | 'reasoning' | 'coding' | 'multilingual';
  language: string[];
  sampleCount: number;
  size: number; // MB
  source: 'builtin' | 'custom' | 'imported';
  createdAt: string;
  tags: string[];
}

// 评测结果
export interface EvaluationResult {
  metricId: string;
  metricName: string;
  value: number;
  unit?: string;
  rank?: number; // 在对比评测中的排名
  percentile?: number; // 百分位
}

// 评测任务
export interface EvaluationTask {
  id: string;
  name: string;
  description: string;
  type: EvaluationTaskType;
  status: EvaluationStatus;
  
  // 模型信息
  modelId: string;
  modelName: string;
  modelVersion: string;
  modelType: ModelType;
  
  // 对比模型（用于对比评测）
  comparisonModels?: {
    modelId: string;
    modelName: string;
    modelVersion: string;
  }[];
  
  // 评测配置
  datasets: string[]; // 数据集ID列表
  metrics: string[]; // 指标ID列表
  config: {
    batchSize: number;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
  };
  
  // 计算资源
  computeConfig: {
    gpuType: string;
    gpuCount: number;
    memoryGB: number;
    storageGB: number;
  };
  
  // 执行信息
  startTime?: string;
  endTime?: string;
  duration?: number; // 秒
  progress: number; // 0-100
  
  // 结果
  results?: EvaluationResult[];
  overallScore?: number; // 综合评分
  
  // 报告
  reportUrl?: string;
  
  // 元数据
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// 评测模板
export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'domain-specific' | 'safety' | 'efficiency';
  modelTypes: ModelType[];
  datasets: string[];
  metrics: string[];
  config: any;
  isBuiltin: boolean;
  usageCount: number;
}

// 评测排行榜
export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  metricId: string;
  modelType: ModelType;
  entries: {
    rank: number;
    modelId: string;
    modelName: string;
    score: number;
    evaluationId: string;
    submittedAt: string;
    organization?: string;
  }[];
  updatedAt: string;
}

// ============= Mock 数据 =============

const mockMetrics: EvaluationMetric[] = [
  {
    id: 'metric-accuracy',
    name: 'accuracy',
    displayName: '准确率',
    category: 'quality',
    description: '模型预测正确的样本占总样本的比例',
    unit: '%',
    higherIsBetter: true,
  },
  {
    id: 'metric-bleu',
    name: 'bleu',
    displayName: 'BLEU Score',
    category: 'quality',
    description: '机器翻译质量评估指标',
    higherIsBetter: true,
  },
  {
    id: 'metric-rouge',
    name: 'rouge',
    displayName: 'ROUGE Score',
    category: 'quality',
    description: '文本摘要质量评估指标',
    higherIsBetter: true,
  },
  {
    id: 'metric-perplexity',
    name: 'perplexity',
    displayName: '困惑度',
    category: 'quality',
    description: '语言模型的困惑度，越低越好',
    higherIsBetter: false,
  },
  {
    id: 'metric-latency',
    name: 'latency',
    displayName: '推理延迟',
    category: 'efficiency',
    description: '单次推理的平均延迟',
    unit: 'ms',
    higherIsBetter: false,
  },
  {
    id: 'metric-throughput',
    name: 'throughput',
    displayName: '吞吐量',
    category: 'efficiency',
    description: '每秒处理的请求数',
    unit: 'req/s',
    higherIsBetter: true,
  },
  {
    id: 'metric-toxicity',
    name: 'toxicity',
    displayName: '毒性检测',
    category: 'safety',
    description: '生成内容的毒性评分',
    unit: '%',
    higherIsBetter: false,
  },
  {
    id: 'metric-bias',
    name: 'bias',
    displayName: '偏见检测',
    category: 'safety',
    description: '模型输出的偏见程度',
    higherIsBetter: false,
  },
];

const mockDatasets: EvaluationDataset[] = [
  {
    id: 'dataset-mmlu',
    name: 'MMLU',
    description: 'Massive Multitask Language Understanding - 大规模多任务语言理解基准',
    type: 'qa',
    language: ['en'],
    sampleCount: 15908,
    size: 256,
    source: 'builtin',
    createdAt: '2024-01-15T08:00:00Z',
    tags: ['benchmark', 'reasoning', 'knowledge'],
  },
  {
    id: 'dataset-ceval',
    name: 'C-Eval',
    description: '中文综合能力评估基准，覆盖52个学科',
    type: 'qa',
    language: ['zh'],
    sampleCount: 13948,
    size: 198,
    source: 'builtin',
    createdAt: '2024-01-15T08:00:00Z',
    tags: ['benchmark', 'chinese', 'reasoning'],
  },
  {
    id: 'dataset-humaneval',
    name: 'HumanEval',
    description: 'Python代码生成能力评估',
    type: 'coding',
    language: ['python'],
    sampleCount: 164,
    size: 12,
    source: 'builtin',
    createdAt: '2024-01-15T08:00:00Z',
    tags: ['coding', 'benchmark'],
  },
  {
    id: 'dataset-gsm8k',
    name: 'GSM8K',
    description: '小学数学应用题数据集',
    type: 'reasoning',
    language: ['en'],
    sampleCount: 8500,
    size: 45,
    source: 'builtin',
    createdAt: '2024-01-15T08:00:00Z',
    tags: ['math', 'reasoning', 'benchmark'],
  },
  {
    id: 'dataset-truthfulqa',
    name: 'TruthfulQA',
    description: '评估模型生成真实准确答案的能力',
    type: 'qa',
    language: ['en'],
    sampleCount: 817,
    size: 8,
    source: 'builtin',
    createdAt: '2024-01-15T08:00:00Z',
    tags: ['truthfulness', 'safety'],
  },
];

const mockTasks: EvaluationTask[] = [
  {
    id: 'eval-001',
    name: 'Qwen2-7B 综合评测',
    description: '对 Qwen2-7B 模型进行全面的能力评估，包括中英文理解、推理和代码生成',
    type: 'benchmark',
    status: 'completed',
    modelId: 'model-qwen2-7b',
    modelName: 'Qwen2-7B-Instruct',
    modelVersion: 'v1.0',
    modelType: 'llm',
    datasets: ['dataset-mmlu', 'dataset-ceval', 'dataset-humaneval'],
    metrics: ['metric-accuracy', 'metric-latency', 'metric-throughput'],
    config: {
      batchSize: 8,
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
    },
    computeConfig: {
      gpuType: 'NVIDIA A100',
      gpuCount: 1,
      memoryGB: 40,
      storageGB: 100,
    },
    startTime: '2024-11-14T09:00:00Z',
    endTime: '2024-11-14T11:30:00Z',
    duration: 9000,
    progress: 100,
    results: [
      { metricId: 'metric-accuracy', metricName: '准确率', value: 78.5, unit: '%' },
      { metricId: 'metric-latency', metricName: '推理延迟', value: 45, unit: 'ms' },
      { metricId: 'metric-throughput', metricName: '吞吐量', value: 120, unit: 'req/s' },
    ],
    overallScore: 82.3,
    reportUrl: '/reports/eval-001.pdf',
    createdBy: '张三',
    createdAt: '2024-11-14T08:00:00Z',
    updatedAt: '2024-11-14T11:30:00Z',
    tags: ['qwen', 'benchmark', 'production'],
  },
  {
    id: 'eval-002',
    name: 'GLM-4 vs Qwen2 对比评测',
    description: '对比 GLM-4 和 Qwen2 在中文任务上的表现',
    type: 'comparison',
    status: 'running',
    modelId: 'model-glm4-9b',
    modelName: 'GLM-4-9B',
    modelVersion: 'v1.0',
    modelType: 'llm',
    comparisonModels: [
      { modelId: 'model-qwen2-7b', modelName: 'Qwen2-7B', modelVersion: 'v1.0' },
    ],
    datasets: ['dataset-ceval', 'dataset-gsm8k'],
    metrics: ['metric-accuracy', 'metric-perplexity'],
    config: {
      batchSize: 4,
      temperature: 0.7,
      maxTokens: 2048,
    },
    computeConfig: {
      gpuType: 'NVIDIA A100',
      gpuCount: 2,
      memoryGB: 80,
      storageGB: 200,
    },
    startTime: '2024-11-14T14:00:00Z',
    progress: 65,
    createdBy: '李四',
    createdAt: '2024-11-14T13:00:00Z',
    updatedAt: '2024-11-14T15:30:00Z',
    tags: ['comparison', 'chinese'],
  },
  {
    id: 'eval-003',
    name: 'Llama-3-8B 安全性评测',
    description: '评估 Llama-3-8B 模型的安全性和偏见问题',
    type: 'custom',
    status: 'pending',
    modelId: 'model-llama3-8b',
    modelName: 'Llama-3-8B-Instruct',
    modelVersion: 'v1.0',
    modelType: 'llm',
    datasets: ['dataset-truthfulqa'],
    metrics: ['metric-toxicity', 'metric-bias'],
    config: {
      batchSize: 16,
      temperature: 1.0,
      maxTokens: 1024,
    },
    computeConfig: {
      gpuType: 'NVIDIA A100',
      gpuCount: 1,
      memoryGB: 40,
      storageGB: 50,
    },
    progress: 0,
    createdBy: '王五',
    createdAt: '2024-11-14T16:00:00Z',
    updatedAt: '2024-11-14T16:00:00Z',
    tags: ['safety', 'llama'],
  },
];

const mockTemplates: EvaluationTemplate[] = [
  {
    id: 'template-general-llm',
    name: '通用大语言模型评测',
    description: '全面评估大语言模型的理解、生成和推理能力',
    category: 'general',
    modelTypes: ['llm'],
    datasets: ['dataset-mmlu', 'dataset-ceval', 'dataset-gsm8k'],
    metrics: ['metric-accuracy', 'metric-perplexity', 'metric-latency'],
    config: { batchSize: 8, temperature: 0.7 },
    isBuiltin: true,
    usageCount: 156,
  },
  {
    id: 'template-coding',
    name: '代码生成能力评测',
    description: '评估模型的代码理解和生成能力',
    category: 'domain-specific',
    modelTypes: ['llm'],
    datasets: ['dataset-humaneval'],
    metrics: ['metric-accuracy'],
    config: { batchSize: 4, temperature: 0.2 },
    isBuiltin: true,
    usageCount: 89,
  },
  {
    id: 'template-safety',
    name: '安全性评测',
    description: '评估模型的安全性、毒性和偏见',
    category: 'safety',
    modelTypes: ['llm', 'vlm'],
    datasets: ['dataset-truthfulqa'],
    metrics: ['metric-toxicity', 'metric-bias'],
    config: { batchSize: 16, temperature: 1.0 },
    isBuiltin: true,
    usageCount: 45,
  },
];

// ============= API 函数 =============

export const getEvaluationTasks = async (): Promise<EvaluationTask[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTasks), 500);
  });
};

export const getEvaluationTask = async (id: string): Promise<EvaluationTask | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task = mockTasks.find(t => t.id === id);
      resolve(task || null);
    }, 300);
  });
};

export const createEvaluationTask = async (data: Partial<EvaluationTask>): Promise<EvaluationTask> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTask: EvaluationTask = {
        id: `eval-${Date.now()}`,
        name: data.name || '未命名评测',
        description: data.description || '',
        type: data.type || 'benchmark',
        status: 'pending',
        modelId: data.modelId || '',
        modelName: data.modelName || '',
        modelVersion: data.modelVersion || 'v1.0',
        modelType: data.modelType || 'llm',
        datasets: data.datasets || [],
        metrics: data.metrics || [],
        config: data.config || { batchSize: 8 },
        computeConfig: data.computeConfig || {
          gpuType: 'NVIDIA A100',
          gpuCount: 1,
          memoryGB: 40,
          storageGB: 100,
        },
        progress: 0,
        createdBy: '当前用户',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: data.tags || [],
      };
      mockTasks.unshift(newTask);
      resolve(newTask);
    }, 800);
  });
};

export const cancelEvaluationTask = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task = mockTasks.find(t => t.id === id);
      if (task) {
        task.status = 'cancelled';
        task.updatedAt = new Date().toISOString();
      }
      resolve();
    }, 500);
  });
};

export const deleteEvaluationTask = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockTasks.findIndex(t => t.id === id);
      if (index > -1) {
        mockTasks.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

export const getEvaluationMetrics = async (): Promise<EvaluationMetric[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockMetrics), 300);
  });
};

export const getEvaluationDatasets = async (): Promise<EvaluationDataset[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDatasets), 300);
  });
};

export const getEvaluationTemplates = async (): Promise<EvaluationTemplate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTemplates), 300);
  });
};

// ============= 工具函数 =============

export const getStatusConfig = (status: EvaluationStatus) => {
  const configs = {
    pending: {
      label: '等待中',
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
    cancelled: {
      label: '已取消',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-600',
    },
  };
  return configs[status];
};

export const getTaskTypeLabel = (type: EvaluationTaskType): string => {
  const labels = {
    benchmark: '基准评测',
    custom: '自定义评测',
    comparison: '对比评测',
  };
  return labels[type];
};

export const getModelTypeLabel = (type: ModelType): string => {
  const labels = {
    llm: '大语言模型',
    vlm: '视觉语言模型',
    embedding: '嵌入模型',
    classification: '分类模型',
  };
  return labels[type];
};

export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`;
  } else {
    return `${secs}秒`;
  }
};
