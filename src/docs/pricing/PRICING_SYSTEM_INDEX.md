# 费米集群定价系统完整文档索引 📚

## 🎯 文档概览

本文档集提供了费米集群灵活资源定价系统的完整技术文档，涵盖使用指南、数据库设计、业务逻辑等各个方面。

---

## 📑 文档列表

### 1. 用户使用文档

#### 1.1 [使用指南](../../FLEXIBLE_PRICING_GUIDE.md) 📖
**路径**: `/FLEXIBLE_PRICING_GUIDE.md`

**内容概要**:
- 系统概述和核心特性
- 定价继承规则详解
- 功能操作指南
- 最佳实践和使用场景
- 常见问题解答

**适用人群**: 系统管理员、运维人员

---

#### 1.2 [实施总结](../../README_FLEXIBLE_PRICING.md) 🚀
**路径**: `/README_FLEXIBLE_PRICING.md`

**内容概要**:
- 功能实现总结
- 文件结构说明
- 快速开始指南
- API使用示例
- 功能检查清单

**适用人群**: 开发人员、项目经理

---

### 2. 技术设计文档

#### 2.1 [定价管理逻辑文档](./PRICING_LOGIC_DOCUMENTATION.md) 🧠
**路径**: `/docs/pricing/PRICING_LOGIC_DOCUMENTATION.md`

**内容概要**:
- 定价系统架构
- 定价继承规则算法
- 5种资源类型定价逻辑（GPU/CPU/内存/存储/网络）
- 定价查询算法
- 费用计算逻辑
- 缓存策略
- 特殊场景处理

**适用人群**: 开发人员、架构师

**核心章节**:
- **第1章**: 定价系统架构 - 系统整体设计
- **第2章**: 定价继承规则 - 核心算法逻辑
- **第3章**: 资源类型定价逻辑 - 各类资源定价策略
- **第4章**: 定价查询算法 - 查询优化方案
- **第5章**: 费用计算逻辑 - 费用计算公式
- **第6章**: 缓存策略 - 性能优化
- **第7章**: 特殊场景处理 - 边缘案例

---

#### 2.2 [数据库设计文档](../database/DATABASE_DESIGN_README.md) 🗄️
**路径**: `/docs/database/DATABASE_DESIGN_README.md`

**内容概要**:
- 数据库架构概览
- 7张核心表设计
- 表关系图（ER图）
- 索引设计策略
- 视图设计
- 存储过程设计
- 触发器设计
- 建表步骤
- 数据迁移方案
- 性能优化建议

**适用人群**: 数据库管理员、开发人员

**核心表**:
1. `pricing_rules` - 定价规则表（核心）
2. `pricing_history` - 定价历史表
3. `availability_zones` - 可用区表
4. `resource_pools` - 资源池表
5. `compute_nodes` - 计算节点表
6. `resource_types` - 资源类型表
7. `pricing_cache` - 定价缓存表

---

#### 2.3 [数据库建表脚本](../database/pricing_database_schema.sql) 💾
**路径**: `/docs/database/pricing_database_schema.sql`

**内容概要**:
- 完整的MySQL建表SQL
- 索引创建语句
- 视图创建语句
- 存储过程定义
- 触发器定义
- 初始数据插入

**适用人群**: 数据库管理员

**执行方式**:
```bash
mysql -u root -p fermi_cluster < /docs/database/pricing_database_schema.sql
```

---

### 3. 源码文档

#### 3.1 [定价服务源码](../../services/pricingService.ts) 💻
**路径**: `/services/pricingService.ts`

**内容概要**:
- TypeScript类型定义
- 核心API实现
- 定价查询逻辑
- 费用计算函数
- 模拟数据

**核心接口**:
- `queryPricing()` - 查询资源价格
- `batchQueryPricing()` - 批量查询
- `calculateResourceCost()` - 计算费用
- `getAllPricingRules()` - 获取所有规则
- `savePricingRule()` - 保存规则
- `deletePricingRule()` - 删除规则

---

#### 3.2 [定价管理页面](../../components/pages/FlexiblePricingManagementPage.tsx) 🎨
**路径**: `/components/pages/FlexiblePricingManagementPage.tsx`

**内容概要**:
- React组件实现
- UI交互逻辑
- 表格展示
- 筛选和搜索
- 创建/编辑对话框
- 测试工具

---

## 🗺️ 文档导航

### 按角色导航

#### 👨‍💼 系统管理员
**推荐阅读顺序**:
1. [使用指南](../../FLEXIBLE_PRICING_GUIDE.md) - 了解系统功能
2. [实施总结](../../README_FLEXIBLE_PRICING.md) - 快速开始
3. [数据库设计](../database/DATABASE_DESIGN_README.md) - 理解数据结构

#### 👨‍💻 开发人员
**推荐阅读顺序**:
1. [实施总结](../../README_FLEXIBLE_PRICING.md) - 了解系统架构
2. [定价逻辑文档](./PRICING_LOGIC_DOCUMENTATION.md) - 理解业务逻辑
3. [定价服务源码](../../services/pricingService.ts) - 查看代码实现
4. [数据库设计](../database/DATABASE_DESIGN_README.md) - 理解数据模型

#### 🏗️ 架构师
**推荐阅读顺序**:
1. [定价逻辑文档](./PRICING_LOGIC_DOCUMENTATION.md) - 系统架构设计
2. [数据库设计](../database/DATABASE_DESIGN_README.md) - 数据架构设计
3. [实施总结](../../README_FLEXIBLE_PRICING.md) - 实现细节

#### 🛠️ 数据库管理员
**推荐阅读顺序**:
1. [数据库设计](../database/DATABASE_DESIGN_README.md) - 完整数据库设计
2. [数据库建表脚本](../database/pricing_database_schema.sql) - 执行建表
3. [定价逻辑文档](./PRICING_LOGIC_DOCUMENTATION.md) - 理解业务需求

---

## 📊 核心概念快速参考

### 定价层级

```
节点定价 (node) > 资源池定价 (pool) > 可用区定价 (zone) > 默认定价 (default)
```

### 资源类型

| 类型 | 说明 | 示例 |
|------|------|------|
| gpu | GPU资源 | A100-40GB, V100-32GB |
| cpu | CPU资源 | 核心数 |
| memory | 内存资源 | GB |
| storage | 存储资源 | SSD, HDD |
| network | 网络资源 | 入网/出网流量 |

### 计费周期

| 周期 | 说明 | 适用场景 |
|------|------|----------|
| hourly | 按小时 | GPU, CPU, 内存 |
| daily | 按天 | 临时资源 |
| monthly | 按月 | 存储 |

---

## 🔗 相关链接

### 在线访问

- **定价管理页面**: `http://localhost:5173/pricing-management`
- **支付测试页面**: `http://localhost:5173/payment-test`

### 源码仓库

- **GitHub**: [费米集群项目地址]
- **文档站点**: [在线文档地址]

---

## 📈 版本历史

### v1.0.0 (2024-12-06)
- ✅ 完成四级分层定价系统
- ✅ 实现定价继承算法
- ✅ 完成数据库设计
- ✅ 编写完整技术文档
- ✅ 实现前端管理页面
- ✅ 集成到计费系统

### 下一版本计划 (v1.1.0)
- 🔄 支持批量导入导出
- 📊 增加价格趋势分析
- 🤖 智能定价推荐
- 🔔 价格变更通知
- 📱 移动端适配

---

## 🆘 获取帮助

### 常见问题
详见 [使用指南 - 常见问题](../../FLEXIBLE_PRICING_GUIDE.md#常见问题)

### 技术支持
- **邮件**: support@fermi-cluster.com
- **工单系统**: https://support.fermi-cluster.com
- **文档反馈**: [提交Issue]

### 培训资源
- **视频教程**: [YouTube频道]
- **培训课程**: [在线学习平台]

---

## 📝 文档贡献

### 贡献指南

欢迎对文档提出改进建议！

**贡献方式**:
1. Fork项目仓库
2. 创建特性分支 (`git checkout -b feature/improve-docs`)
3. 提交更改 (`git commit -am 'Improve documentation'`)
4. 推送到分支 (`git push origin feature/improve-docs`)
5. 创建Pull Request

### 文档规范

- 使用Markdown格式
- 代码示例需完整可运行
- 保持语言简洁清晰
- 提供必要的示例和图表
- 及时更新版本信息

---

## 📌 快速跳转

### 最常用文档

1. 🚀 [快速开始](../../README_FLEXIBLE_PRICING.md#快速开始)
2. 📖 [创建定价规则](../../FLEXIBLE_PRICING_GUIDE.md#2-创建定价规则)
3. 🧪 [测试定价查询](../../FLEXIBLE_PRICING_GUIDE.md#5-测试定价查询)
4. 💾 [执行建表脚本](../database/DATABASE_DESIGN_README.md#81-执行顺序)
5. 💻 [API使用示例](../../README_FLEXIBLE_PRICING.md#api使用)

### 核心算法

1. [定价继承算法](./PRICING_LOGIC_DOCUMENTATION.md#2-定价继承规则)
2. [定价查询算法](./PRICING_LOGIC_DOCUMENTATION.md#4-定价查询算法)
3. [费用计算逻辑](./PRICING_LOGIC_DOCUMENTATION.md#5-费用计算逻辑)

### 数据库设计

1. [核心表设计](../database/DATABASE_DESIGN_README.md#2-核心表设计)
2. [索引设计](../database/DATABASE_DESIGN_README.md#4-索引设计)
3. [存储过程](../database/DATABASE_DESIGN_README.md#6-存储过程)

---

## 🎉 结语

感谢使用费米集群灵活资源定价系统！

如果您在使用过程中遇到任何问题，请随时查阅相关文档或联系技术支持团队。

**祝您使用愉快！** 🚀

---

**文档维护**: 费米集群开发团队  
**最后更新**: 2024-12-06  
**文档版本**: v1.0.0  
**反馈邮箱**: docs@fermi-cluster.com
