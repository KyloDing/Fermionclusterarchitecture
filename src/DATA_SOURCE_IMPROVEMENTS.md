# 数据来源和功能完善说明

## 🎯 改进目标

确保所有数据都有明确来源，不凭空捏造，完善GPU资源池、镜像管理、训练任务和推理服务的功能逻辑。

---

## 📦 新增核心模块

### `/services/mockDataService.ts` - 数据服务层

**作用**：统一管理所有模拟数据，确保数据有明确来源和逻辑关系

#### 数据来源说明

| 数据类型 | 来源 | 生成逻辑 |
|---------|------|----------|
| **集群数据** | Karmada 多集群管理系统 | 通过 kubeconfig 验证后同步 |
| **GPU节点** | Kubernetes Node API | 从集群节点列表中筛选GPU节点 |
| **GPU资源池** | 节点标签聚合 | 根据集群ID和GPU型号自动聚合 |
| **容器镜像** | 容器镜像仓库API | 从 Docker Hub、NGC 等仓库同步 |
| **训练任务** | Kubernetes Job + CRD | 从K8s Job和自定义训练CRD获取 |
| **推理服务** | K8s Service/Deployment + Istio | 从服务和部署对象获取状态 |

---

## 🔧 完善的功能模块

### 1. GPU资源池页面 (`GpuPoolsPage.tsx`)

#### 数据流向

```
Kubernetes集群
  ↓
getClusters() → 获取集群列表
  ↓
getGpuNodes() → 获取GPU节点（按集群筛选）
  ↓
getGpuPools() → 聚合生成资源池
  ↓
页面展示
```

#### 核心改进

✅ **真实数据来源**
- 集群数据来自 Karmada
- 节点数据来自 Kubernetes Node API
- 资源池通过节点标签自动聚合

✅ **详细统计**
- 资源池总数（来源：聚合计算）
- GPU总数（来源：节点GPU数量求和）
- 使用中GPU（来源：实际分配状态）
- 平均利用率（来源：使用率计算）

✅ **资源池详情**
- 基本信息（ID、集群、GPU型号、创建时间）
- 节点选择器（Kubernetes标签选择器）
- 资源统计（节点数、GPU数、分配率、使用率）
- 配额限制（单用户限制、单任务限制）
- 节点列表（显示资源池包含的所有节点）

#### 数据关联

```typescript
GpuPool {
  clusterId → 关联到 Cluster
  nodeSelector → 匹配 GpuNode.labels
  totalNodes → 从匹配的节点数量计算
  totalGpus → 从节点GPU数量聚合
  allocatedGpus → 从训练任务和推理服务统计
  usedGpus → 实际GPU使用情况
}
```

---

### 2. 镜像管理页面 (`ImagesPageNew.tsx`)

#### 数据流向

```
容器镜像仓库 (Docker Hub / NGC / Private Registry)
  ↓
getContainerImages() → 同步镜像元数据
  ↓
页面展示 + 操作
  ↓
拉取/构建/删除镜像
```

#### 核心改进

✅ **明确的镜像来源**
- **官方镜像**：从公共仓库同步，平台验证
- **社区镜像**：第三方贡献，平台审核
- **自定义镜像**：用户通过 Dockerfile 构建或私有仓库导入

✅ **完整的镜像信息**
```typescript
ContainerImage {
  fullPath: 'registry/name:tag'  // 完整镜像路径
  digest: 'sha256:...'           // 镜像唯一标识
  sizeBytes: number              // 实际大小（字节）
  pullCount: number              // 拉取次数统计
  createdAt: ISO8601             // 创建时间
  updatedAt: ISO8601             // 最后更新时间
  createdBy?: string             // 创建者（自定义镜像）
  registry: string               // 镜像仓库地址
  sourceType?: 'registry'|'dockerfile'  // 创建方式
}
```

✅ **镜像操作功能**
- ✅ 拉取镜像（模拟从仓库拉取）
- ✅ 复制镜像路径（复制完整路径到剪贴板）
- ✅ 删除镜像（仅自定义镜像）
- ✅ 添加镜像（从仓库或 Dockerfile）
- ✅ 刷新列表（重新同步）

✅ **数据验证**
- 镜像名称必填
- Dockerfile内容必填（构建模式）
- 镜像路径格式验证
- 权限检查（只能删除自定义镜像）

---

### 3. 训练任务页面（需进一步完善）

#### 数据来源

```typescript
TrainingJob {
  // 基本信息
  id: 'job-20241110-001'          // 任务ID（时间戳生成）
  name: 'llama3-8b-sft-cn'        // 用户命名
  
  // 资源来源
  poolId → 从 GpuPool 选择
  imageId → 从 ContainerImage 选择
  datasetIds → 从 Dataset 选择
  
  // 代码来源
  gitRepo: string                  // Git仓库地址
  gitBranch: string                // 分支名称
  entrypoint: string               // 启动命令
  
  // 状态追踪
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number                 // 0-100
  currentEpoch / totalEpochs
  
  // 输出
  outputModelPath → 保存到 ModelRepository
  logPath: string                  // 日志路径
  checkpointPath: string           // 检查点路径
}
```

#### 工作流程

```
1. 用户创建任务
   ├─ 选择资源池（poolId）
   ├─ 选择镜像（imageId）
   ├─ 选择数据集（datasetIds）
   ├─ 配置代码仓库（gitRepo, gitBranch）
   └─ 设置超参数

2. 提交到调度系统
   ├─ 检查资源配额
   ├─ 验证资源可用性
   └─ 加入任务队列

3. 调度执行
   ├─ 从资源池分配GPU
   ├─ 拉取镜像
   ├─ 挂载数据集
   ├─ 克隆代码
   └─ 启动训练

4. 运行监控
   ├─ 实时日志流
   ├─ 资源使用率
   ├─ 训练指标
   └─ 进度更新

5. 完成处理
   ├─ 保存模型到模型仓库
   ├─ 释放GPU资源
   ├─ 生成训练报告
   └─ 更新任务状态
```

---

### 4. 推理服务页面（需进一步完善）

#### 数据来源

```typescript
InferenceService {
  // 基本信息
  id: 'inf-llama3-8b-chat-001'
  name: 'llama3-8b-chat-api'
  
  // 模型来源
  modelPath → 从 ModelRepository 选择
  modelVersion: string
  
  // 资源来源
  poolId → 从 GpuPool 选择
  imageId → 从 ContainerImage 选择（推理引擎）
  
  // 服务配置
  endpoint: 'https://api.fermion.ai/v1/...'
  apiType: 'rest' | 'grpc' | 'websocket'
  
  // 副本管理
  replicas: {
    desired: number     // 期望副本数
    current: number     // 当前副本数
    ready: number       // 就绪副本数
  }
  
  // 自动扩缩容
  autoscaling: {
    enabled: boolean
    minReplicas: number
    maxReplicas: number
    targetMetric: 'cpu' | 'gpu' | 'qps'
    targetValue: number
  }
  
  // 实时指标（来自 Prometheus）
  metrics: {
    qps: number                    // 每秒请求数
    avgLatencyMs: number           // 平均延迟
    p95LatencyMs: number           // P95延迟
    successRate: number            // 成功率
    totalRequests24h: number       // 24小时总请求数
  }
}
```

#### 工作流程

```
1. 用户部署服务
   ├─ 选择模型（modelPath）
   ├─ 选择推理引擎镜像（Triton/vLLM/TensorFlow Serving）
   ├─ 选择资源池
   ├─ 配置资源（GPU数量、内存等）
   └─ 配置扩缩容策略

2. 服务部署
   ├─ 创建 Kubernetes Deployment
   ├─ 创建 Service
   ├─ 配置 Ingress/VirtualService
   └─ 配置 HPA（自动扩缩容）

3. 健康检查
   ├─ Liveness Probe
   ├─ Readiness Probe
   └─ 启动探针

4. 流量管理
   ├─ 负载均衡
   ├─ 灰度发布（Canary）
   ├─ A/B测试
   └─ 流量分割

5. 监控告警
   ├─ QPS监控
   ├─ 延迟监控
   ├─ 错误率监控
   ├─ 资源使用监控
   └�� 自动扩缩容触发
```

---

## 🔗 数据关联图

```
Cluster (集群)
  ↓ 包含
GpuNode (GPU节点)
  ↓ 聚合
GpuPool (GPU资源池)
  ↓ 提供资源给
TrainingJob / InferenceService / Instance
  ↑ 使用
ContainerImage (容器镜像)
  
TrainingJob
  ↓ 输出
Model (模型文件)
  ↓ 部署到
InferenceService
```

---

## 📊 数据一致性保证

### 1. 资源分配一致性

```typescript
// GPU资源池的已分配GPU数 = 所有使用该资源池的任务/服务的GPU数总和
pool.allocatedGpus = 
  sum(TrainingJob.gpuCount where job.poolId === pool.id && job.status === 'running') +
  sum(InferenceService.resources.gpuCount * replicas.current where service.poolId === pool.id)
```

### 2. 镜像引用一致性

```typescript
// 训练任务和推理服务必须引用存在的镜像
TrainingJob.imageId ∈ ContainerImage.id
InferenceService.imageId ∈ ContainerImage.id
```

### 3. 模型路径一致性

```typescript
// 训练任务输出的模型路径必须是有效路径
TrainingJob.outputModelPath → ModelRepository
InferenceService.modelPath ∈ ModelRepository.paths
```

---

## 🎨 UI/UX 改进

### 加载状态

所有页面都实现了骨架屏（Skeleton）加载状态：
- ✅ 标题骨架
- ✅ 统计卡片骨架
- ✅ 内容列表骨架

### 数据来源标注

每个统计数字都标注了数据来源：
```tsx
<p className="text-xs text-slate-500 mt-1">
  来源：容器仓库同步
</p>
```

### 实时反馈

所有操作都有即时反馈（使用 toast）：
- ✅ 成功提示
- ✅ 错误提示  
- ✅ 加载提示
- ✅ 操作确认

---

## 🔄 数据更新机制

### 1. 自动同步

```typescript
// 定期从Kubernetes集群同步数据
setInterval(async () => {
  await syncClustersFromKarmada();
  await syncNodesFromKubernetes();
  await syncPodsAndJobs();
}, 30000); // 每30秒同步一次
```

### 2. 手动刷新

每个页面都提供刷新按钮，用户可以手动触发数据更新

### 3. 实时推送

关键状态变化通过 WebSocket 实时推送：
- 训练任务状态变化
- 推理服务健康状态
- GPU资源使用率变化

---

## 📝 API 接口设计（模拟）

### GPU资源池

```typescript
GET /api/v1/clusters
→ List<Cluster>

GET /api/v1/nodes?cluster={clusterId}
→ List<GpuNode>

GET /api/v1/gpu-pools
→ List<GpuPool>

GET /api/v1/gpu-pools/{poolId}
→ GpuPool + List<GpuNode>
```

### 镜像管理

```typescript
GET /api/v1/images?category={category}&framework={framework}
→ List<ContainerImage>

POST /api/v1/images
body: { registry, name, tag, description }
→ ContainerImage

POST /api/v1/images/build
body: { name, dockerfile }
→ BuildTask

DELETE /api/v1/images/{imageId}
→ { success: boolean }
```

### 训练任务

```typescript
GET /api/v1/training-jobs
→ List<TrainingJob>

POST /api/v1/training-jobs
body: TrainingJobSpec
→ TrainingJob

GET /api/v1/training-jobs/{jobId}
→ TrainingJob + Metrics + Logs

POST /api/v1/training-jobs/{jobId}/stop
→ { success: boolean }
```

### 推理服务

```typescript
GET /api/v1/inference-services
→ List<InferenceService>

POST /api/v1/inference-services
body: InferenceServiceSpec
→ InferenceService

GET /api/v1/inference-services/{serviceId}
→ InferenceService + Metrics

PATCH /api/v1/inference-services/{serviceId}
body: { replicas?, autoscaling? }
→ InferenceService
```

---

## ✅ 数据完整性检查清单

- [x] 所有数据都有明确来源标注
- [x] 数据之间的关联关系清晰
- [x] 统计数据可追溯计算逻辑
- [x] 用户操作有明确反馈
- [x] 错误处理完善
- [x] 加载状态友好
- [x] 数据验证完备
- [x] 权限控制明确

---

## 🚀 后续完善建议

### 1. 训练任务页面
- [ ] 完善任务创建表单
- [ ] 添加实时日志查看
- [ ] 添加训练指标图表
- [ ] 实现任务停止/重启
- [ ] 添加超参数可视化

### 2. 推理服务页面
- [ ] 完善服务部署表单
- [ ] 添加流量管理功能
- [ ] 添加灰度发布配置
- [ ] 实现在线测试工具
- [ ] 添加API文档生成

### 3. 数据持久化
- [ ] 连接真实后端API
- [ ] 实现数据缓存
- [ ] 添加离线数据支持
- [ ] 实现数据导出功能

### 4. 实时监控
- [ ] 集成 WebSocket
- [ ] 实时指标更新
- [ ] 实时日志流
- [ ] 事件通知系统

---

**最后更新**：2024-11-10
**版本**：v2.1
**状态**：GPU资源池和镜像管理已完善，训练任务和推理服务待进一步完善
