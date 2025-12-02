# 数据集与存储卷集成工作流

## 🎯 核心业务场景

费米集群平台支持灵活的数据集管理和数据处理工作流，用户可以：

1. **从存储卷构建数据集** - 将存储卷中的目录注册为平台数据集
2. **在开发环境中挂载数据集** - 以只读方式使用平台数据集进行训练
3. **数据扩增与持久化** - 在开发环境中处理数据并保存到存储卷
4. **循环迭代** - 将处理后的数据再次注册为新版本数据集

---

## 📋 完整工作流程

### 场景一：从存储卷创建数据集

**适用场景**：您已经在存储卷中准备好数据，希望将其注册为平台数据集供训练使用

**操作步骤**：

1. **进入数据集管理页面**
   - 导航：侧边栏 → 数据管理 → 数据集管理

2. **点击"从存储卷创建"按钮**
   - 位置：页面右上角

3. **三步向导流程**：

   **步骤 1：选择存储卷**
   - 从列表中选择包含数据的存储卷
   - 显示存储卷容量、类型、使用率等信息
   
   **步骤 2：浏览并选择目录**
   - 浏览存储卷的目录结构
   - 支持搜索功能快速定位
   - 双击进入子目录，点击选择目标目录
   - 选中的目录会高亮显示
   
   **步骤 3：配置数据集信息**
   - 数据集名称（必填）
   - 数据类型：文本/图像/音频/视频/混合
   - 描述信息
   - 可用区选择
   - 可见性：私有/团队/组织/公开

4. **创建完成**
   - 系统将存储卷目录注册为数据集
   - 数据集状态变为"就绪"后可用于训练

**技术实现**：
```
数据集记录 → 指向存储卷路径
├── dataset_id: ds-xxx
├── source_type: "volume"
├── source_volume_id: vol-xxx
├── source_path: /datasets/imagenet-2024
└── mount_mode: "readonly"
```

---

### 场景二：在开发环境中使用和扩增数据集

**适用场景**：使用平台已有数据集进行数据扩增、预处理或生成新数据集

**操作步骤**：

1. **创建开发环境实例**
   - 导航：计算资源 → 实例管理 → 创建实例
   - 选择实例类型：开发环境

2. **配置数据挂载（存储挂载 Tab）**：

   **挂载平台数据集**（只读）：
   - 点击"挂载数据集"按钮
   - 选择要使用的数据集
   - 配置挂载路径（如 `/datasets/source`）
   - 系统自动设置为只读模式
   - 用途：作为原始数据输入
   
   **挂载工作存储卷**（读写）：
   - 点击"挂载存储卷"按钮
   - 选择或创建工作存储卷
   - 配置挂载路径（如 `/workspace/output`）
   - 设置为读写模式
   - 用途：保存处理后的数据

3. **实例配置示例**：
   ```
   挂载点 #1 [数据集]
   ├── 类型：数据集
   ├── 数据源：ImageNet-2024 (v3)
   ├── 挂载路径：/datasets/imagenet
   ├── 权限：只读
   └── 说明：原始训练数据
   
   挂载点 #2 [存储卷]
   ├── 类型：存储卷
   ├── 数据源：my-augmented-data (500GB)
   ├── 挂载路径：/workspace/output
   ├── 权限：读写
   └── 说明：保存扩增后的数据
   ```

4. **启动实例并进行数据处理**：
   ```python
   # 示例：数据扩增脚本
   import os
   from torchvision import transforms
   from PIL import Image
   
   # 读取原始数据集（只读）
   source_dir = '/datasets/imagenet'
   
   # 输出到工作存储卷（读写）
   output_dir = '/workspace/output/augmented-v1'
   os.makedirs(output_dir, exist_ok=True)
   
   # 数据扩增处理
   transform = transforms.Compose([
       transforms.RandomHorizontalFlip(),
       transforms.RandomRotation(15),
       transforms.ColorJitter(0.2, 0.2, 0.2),
       transforms.RandomResizedCrop(224),
   ])
   
   # 处理并保存
   for img_file in os.listdir(source_dir):
       img = Image.open(os.path.join(source_dir, img_file))
       augmented = transform(img)
       augmented.save(os.path.join(output_dir, f'aug_{img_file}'))
   ```

---

### 场景三：将处理后的数据注册为新数据集

**操作步骤**：

1. **数据处理完成后**
   - 确认数据已保存到存储卷的特定目录
   - 例如：`vol-002:/workspace/output/augmented-v1`

2. **创建新数据集**
   - 返回数据集管理页面
   - 点击"从存储卷创建"
   - 选择工作存储卷
   - 导航到处理后的数据目录
   - 配置新数据集信息

3. **数据集命名建议**：
   ```
   原始数据集：ImageNet-2024
   扩增数据集：ImageNet-2024-Augmented-v1
   混合数据集：ImageNet-2024-Mixed
   自定义数据集：MyCustomDataset-2024
   ```

---

## 🔄 完整工作流示例

### 示例：图像分类数据集扩增

**目标**：基于 ImageNet-2024 数据集创建扩增版本

**步骤**：

1. **准备阶段**
   ```
   已有资源：
   - 平台数据集：ImageNet-2024 (160GB, 128万张图片)
   - 工作存储卷：work-storage (500GB SSD)
   ```

2. **创建开发环境**
   ```
   实例配置：
   - 镜像：PyTorch 2.1.0 + CUDA 12.1
   - GPU：1x NVIDIA A100
   - CPU：8核
   - 内存：32GB
   
   数据挂载：
   - /datasets/imagenet → ImageNet-2024 (只读)
   - /workspace → work-storage (读写)
   ```

3. **执行数据扩增**
   ```bash
   # SSH 进入开发环境
   ssh dev-instance-001
   
   # 运行扩增脚本
   python augment_dataset.py \
     --input /datasets/imagenet \
     --output /workspace/augmented \
     --augmentations flip,rotate,color \
     --multiplier 3
   
   # 结果：
   # /workspace/augmented/
   # ├── train/
   # │   ├── class_001/
   # │   ├── class_002/
   # │   └── ...
   # └── val/
   ```

4. **注册新数据集**
   ```
   数据集管理 → 从存储卷创建
   - 存储卷：work-storage
   - 目录：/workspace/augmented
   - 名称：ImageNet-2024-Augmented-3x
   - 类型：图像数据
   - 描述：基于 ImageNet-2024 进行 3 倍数据扩增
   ```

5. **使用新数据集训练**
   ```
   训练任务配置：
   - 数据集：ImageNet-2024-Augmented-3x (v1)
   - 模型：ResNet-50
   - 预期效果：更好的泛化能力
   ```

---

## 💡 最佳实践

### 存储卷组织建议

```
work-storage/
├── raw/                    # 原始数据（可选）
├── processed/              # 处理后的数据
│   ├── dataset-v1/
│   ├── dataset-v2/
│   └── dataset-v3/
├── experiments/            # 实验数据
│   ├── exp-001/
│   └── exp-002/
└── models/                 # 模型输出
    ├── checkpoints/
    └── final/
```

### 数据集版本管理

1. **语义化版本**：
   - v1.0：初始版本
   - v1.1：小规模修正
   - v2.0：大规模更新

2. **描述性命名**：
   - `ImageNet-2024-Augmented-v1` ✅
   - `ImageNet-2024-Filtered-v1` ✅
   - `dataset-new` ❌

3. **使用标签**：
   - 标签：`扩增`、`清洗`、`原始`、`生产`

### 权限设置建议

| 挂载类型 | 推荐权限 | 使用场景 |
|---------|---------|---------|
| 平台数据集 | 只读 | 训练、验证、测试 |
| 临时工作卷 | 读写 | 数据处理、实验 |
| 模型输出卷 | 读写 | 保存训练结果 |
| 共享数据卷 | 只读 | 多人协作读取 |

### 性能优化建议

1. **选择合适的存储类型**：
   - SSD：频繁随机访问（小文件数据集）
   - HDD：顺序读取（大型视频数据集）

2. **数据预处理**：
   - 在开发环境中一次性处理
   - 处理后的数据保存为新数据集
   - 训练时直接使用处理后的数据集

3. **并行处理**：
   - 使用多 GPU 实例进行数据处理
   - 利用数据加载的并行能力

---

## 🛠️ 技术架构

### 数据挂载机制

```yaml
开发环境实例:
  containers:
    - name: workspace
      image: pytorch/pytorch:2.1.0
      volumeMounts:
        # 数据集挂载（只读）
        - name: dataset-imagenet
          mountPath: /datasets/imagenet
          readOnly: true
        # 存储卷挂载（读写）
        - name: work-volume
          mountPath: /workspace
          readOnly: false
  
  volumes:
    # 数据集卷（指向存储后端）
    - name: dataset-imagenet
      persistentVolumeClaim:
        claimName: dataset-imagenet-v3-pvc
        readOnly: true
    # 工作卷
    - name: work-volume
      persistentVolumeClaim:
        claimName: work-storage-pvc
        readOnly: false
```

### 数据流向图

```
┌─────────────────┐
│  平台数据集      │
│  ImageNet-2024  │
│  (只读)         │
└────────┬────────┘
         │ 挂载到
         ↓
┌─────────────────┐      ┌─────────────────┐
│  开发环境实例    │─────→│  工作存储卷      │
│                 │ 写入  │  (读写)         │
│  - 数据扩增     │      │                 │
│  - 数据清洗     │      │  /augmented/    │
│  - 特征提取     │      │  /processed/    │
└─────────────────┘      └────────┬────────┘
                                  │ 注册为
                                  ↓
                         ┌─────────────────┐
                         │  新数据集        │
                         │  Augmented-v1   │
                         │  (只读)         │
                         └─────────────────┘
```

---

## 📊 使用场景对照表

| 场景 | 数据来源 | 处理方式 | 输出位置 | 后续操作 |
|-----|---------|---------|---------|---------|
| 上传新数据 | 本地文件 | 直接上传 | 平台数据集 | 用于训练 |
| 从卷创建 | 存储卷目录 | 注册引用 | 平台数据集 | 用于训练 |
| 数据扩增 | 平台数据集 | 开发环境处理 | 工作存储卷 | 注册为新数据集 |
| 数据清洗 | 平台数据集 | 开发环境处理 | 工作存储卷 | 注册为新数据集 |
| 合成数据 | 无（生成） | 开发环境生成 | 工作存储卷 | 注册为新数据集 |
| 模型推理 | 平台数据集 | 训练任务 | 工作存储卷 | 下载结果 |

---

## 🔐 安全与权限

### 数据集访问控制

1. **可见性级别**：
   - **私有**：仅创建者可见
   - **团队**：团队成员可见
   - **组织**：组织内可见
   - **公开**：所有用户可见

2. **挂载权限**：
   - 平台数据集：强制只读（保护数据完整性）
   - 存储卷：可配置读写权限

3. **审计日志**：
   - 记录数据集创建、访问、删除操作
   - 记录挂载配置变更

---

## 🎓 常见问题

**Q: 数据集和存储卷有什么区别？**

A: 
- **数据集**：平台管理的标准化数据资源，支持版本控制、权限管理、跨区同步，主要用于训练任务
- **存储卷**：用户的持久化存储空间，更灵活，可读写，用于日常工作数据

**Q: 为什么数据集挂载是只读的？**

A: 
- 保护数据完整性，防止训练过程误修改
- 支持多个实例同时使用同一数据集
- 如需修改，应在存储卷中处理后注册为新版本

**Q: 如何选择 SSD 还是 HDD 存储？**

A:
- **SSD**：小文件多、随机读取（图像分类数据集）
- **HDD**：大文件、顺序读取（视频数据集、大型语料库）

**Q: 数据集可以跨可用区使用吗？**

A: 
- 是的，平台支持跨可用区数据集同步
- 首次使用需要等待同步完成
- 建议在同可用区使用以获得最佳性能

---

## 📞 支持

如有问题，请联系：
- 技术支持：support@fermi.com
- 文档中心：https://docs.fermi.com
- 工单系统：平台内置工单功能
