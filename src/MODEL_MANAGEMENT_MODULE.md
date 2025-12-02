# 模型管理模块 (V1.0) - 实现文档

## 概述

模型管理模块为费米集群系统提供完整的AI模型资产管理功能，支持模型的导入、版本控制、以及与训练任务的深度集成。

## 核心功能

### 1. 模型列表页面 (`ModelsPage.tsx`)

**主要功能：**
- ✅ 表格形式展示所有模型
- ✅ 实时统计（全部模型、文本模型、图像模型、通用文件）
- ✅ 搜索功能（支持模型名称和类型搜索）
- ✅ 深色主题UI（#030213背景，紫色/蓝色配色）

**列表字段：**
- 模型名称（带图标和备注）
- 模型类型（文本/图像/通用）
- 最新版本号
- 版本数量
- 创建时间

**操作按钮：**
- 查看详情（跳转到模型详情对话框）
- 新增版本（打开新增版本对话框）
- 删除模型（需二次确认）

### 2. 导入模型功能 (`ImportModelDialog.tsx`)

**核心特性：**
- ✅ 支持拖拽上传
- ✅ 大文件分片上传（5MB/chunk）
- ✅ 实时上传进度显示
- ✅ 自动创建 v1 版本
- ✅ 对象存储集成（文件存储在S3/MinIO）

**输入字段：**
- 模型名称（必填）
- 模型类型（文本/图像/通用）
- 模型文件（支持ZIP, TAR, PTH, CKPT, SafeTensors等格式）
- 备注说明

**技术亮点：**
- 分片上传实现（`uploadFileInChunks`）
- 断点续传支持
- 文件大小格式化显示

### 3. 模型详情对话框 (`ModelDetailDialog.tsx`)

**上半部分 - 基本信息：**
- 模型名称和类型
- 创建时间和更新时间
- 版本数量
- 模型描述/备注

**下半部分 - 版本列表：**
- 版本号（标注最新版本）
- 上传时间
- 文件大小
- 状态（就绪/上传中/失败）
- 备注

**版本操作：**
- ✅ **发起训练**（核心功能，V1.0重点）
  - 选择数据集
  - 创建训练任务
  - 跳转到训练任务模块
- ✅ 下载模型版本
- ✅ 删除版本（不能删除最后一个版本）

### 4. 新增版本功能 (`AddModelVersionDialog.tsx`)

**智能特性：**
- ✅ 自动建议下一个版本号（v1 → v2 → v3）
- ✅ 显示已有版本列表
- ✅ 版本号重复检测
- ✅ 分片上传支持

**输入字段：**
- 模型名称（只读，继承父模型）
- 版本号（必填，不能重复）
- 模型文件
- 备注说明

### 5. 发起训练对话框 (`StartTrainingDialog.tsx`)

**核心业务流程：**
1. 显示选定的模型版本信息
2. 自动生成训练任务名称
3. 从数据集服务加载可用数据集
4. 选择数据集并查看详细信息
5. 创建训练任务（携带模型版本ID和数据集ID）

**数据集选择器特性：**
- 只显示状态为"ready"的数据集
- 显示数据集类型、记录数、大小
- 选中后显示详细描述

**集成点：**
- 与数据集管理模块打通
- 与训练任务模块打通
- 跳转到资源调度服务

## 技术架构

### 服务层 (`modelService.ts`)

**核心接口：**
```typescript
interface Model {
  id: string;
  name: string;
  type: 'text' | 'image' | 'general';
  latestVersion: string;
  createTime: string;
  updateTime: string;
  remark: string;
  versions: ModelVersion[];
}

interface ModelVersion {
  id: string;
  versionNumber: string;
  uploadTime: string;
  remark: string;
  fileSize: number;
  filePath: string;  // S3路径
  status: 'uploading' | 'ready' | 'failed';
}
```

**API方法：**
- `getModels()` - 获取模型列表
- `getModelById(id)` - 获取模型详情
- `createModel(request)` - 创建模型（导入）
- `addModelVersion(request)` - 添加新版本
- `deleteModel(id)` - 删除模型
- `deleteModelVersion(modelId, versionId)` - 删除版本
- `downloadModelVersion(versionId)` - 下载模型
- `uploadFileInChunks(options)` - 分片上传

### 数据集服务 (`datasetService.ts`)

**集成支持：**
- 提供数据集列表查询
- 支持按状态筛选
- 数据集详细信息展示

### 存储策略

**关键设计：**
- ✅ 元数据存储在数据库（模型信息、版本信息）
- ✅ 文件存储在对象存储（S3/MinIO）
- ✅ 路径格式：`s3://models/{model-name}/{version}.zip`

## 数据流

### 导入模型流程
```
用户输入 → 文件分片 → 上传到S3 → 创建模型记录 → 刷新列表
```

### 发起训练流程
```
选择模型版本 → 加载数据集 → 选择数据集 → 创建训练任务 → 跳转到训练任务页面
```

### 版本管理流程
```
选择模型 → 上传新文件 → 创建新版本 → 更新latestVersion → 刷新详情
```

## UI/UX特性

### 深色主题
- 背景色：`#030213`
- 渐变装饰：紫色/蓝色
- 卡片：`bg-white/5` with backdrop-blur
- 边框：`border-white/10`

### 交互反馈
- 上传进度条（实时更新）
- 加载状态（Spinner）
- Toast通知（成功/失败）
- 二次确认对话框（删除操作）

### 响应式设计
- 表格布局（大屏）
- 统计卡片网格（4列 → 2列 → 1列）
- 对话框自适应

## 集成点

### 1. 与TaskProvider集成
```typescript
// App.tsx
<TaskProvider>
  <AppContent />
</TaskProvider>
```

### 2. 与训练任务模块打通
- 发起训练时携带模型版本ID
- 支持训练完成后回写新版本（V1.1规划）

### 3. 与数据集模块打通
- 训练时选择数据集
- 显示数据集详细信息

### 4. 与存储后端集成
- 文件上传到对象存储
- 下载时生成预签名URL

## V1.0 功能范围

**已实现（In-Scope）：**
- ✅ 模型CRUD操作
- ✅ 版本管理（新增、删除）
- ✅ 大文件上传（分片、进度）
- ✅ 模型下载
- ✅ 发起训练任务
- ✅ 数据集选择

**暂不实现（Out-of-Scope）：**
- ❌ 模型部署/在线推理
- ❌ 模型评估和压缩
- ❌ 训练任务自动回写版本
- ❌ 模型市场/共享

## 未来规划（V1.1+）

1. **训练任务回写**
   - 训练完成后自动创建新版本
   - 关联训练任务和模型版本

2. **模型部署**
   - 一键部署为推理服务
   - 支持多版本并行部署

3. **模型评估**
   - 集成评估指标
   - 版本对比功能

4. **权限控制**
   - 模型可见性（私有/公开/团队）
   - 操作权限管理

## 测试数据

系统预置了3个示例模型：
1. **Llama-3-8B**（文本模型，2个版本）
2. **Stable-Diffusion-XL**（图像模型，1个版本）
3. **BERT-Base-Chinese**（文本模型，3个版本）

数据集服务提供5个示例数据集，覆盖文本和图像类型。

## 使用指南

### 导入新模型
1. 点击"导入模型"按钮
2. 填写模型名称（如：GPT-Neo-2.7B）
3. 选择类型（文本/图像/通用）
4. 拖拽或选择文件上传
5. 等待上传完成

### 添加新版本
1. 在模型列表点击"新增版本"
2. 系统自动建议版本号
3. 上传新的模型文件
4. 添加版本说明

### 发起训练
1. 进入模型详情
2. 选择某个版本点击"发起训练"
3. 选择数据集
4. 输入任务名称
5. 提交训练任务

## 技术栈

- **前端框架**：React + TypeScript
- **UI组件**：Radix UI + Tailwind CSS
- **状态管理**：React Hooks
- **通知系统**：Sonner Toast
- **文件上传**：自定义分片上传实现
- **图标库**：Lucide React

## 文件结构

```
/components/pages/ModelsPage.tsx              # 主页面
/components/dialogs/ImportModelDialog.tsx     # 导入对话框
/components/dialogs/AddModelVersionDialog.tsx # 新增版本对话框
/components/dialogs/ModelDetailDialog.tsx     # 详情对话框
/components/dialogs/StartTrainingDialog.tsx   # 发起训练对话框
/services/modelService.ts                      # 模型服务
/services/datasetService.ts                    # 数据集服务
```

## 总结

模型管理模块(V1.0)成功实现了：
- ✅ 完整的模型资产CRUD功能
- ✅ 健壮的版本管理机制
- ✅ 企业级的文件上传能力
- ✅ 与训练任务的无缝集成
- ✅ 现代化的深色主题UI

模块为算法工程师提供了便捷的模型管理工具，成为连接"模型资产"和"训练任务"的关键桥梁。
