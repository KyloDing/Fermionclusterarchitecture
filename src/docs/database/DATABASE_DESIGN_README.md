# 费米集群定价系统数据库设计文档 🗄️

## 📋 目录

1. [数据库架构概览](#1-数据库架构概览)
2. [核心表设计](#2-核心表设计)
3. [表关系图](#3-表关系图)
4. [索引设计](#4-索引设计)
5. [视图设计](#5-视图设计)
6. [存储过程](#6-存储过程)
7. [触发器设计](#7-触发器设计)
8. [建表步骤](#8-建表步骤)
9. [数据迁移](#9-数据迁移)
10. [性能优化](#10-性能优化)

---

## 1. 数据库架构概览

### 1.1 架构图

```
┌──────────────────────────────────────────────────────────┐
│              费米集群定价系统数据库架构                    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  核心业务表 (Core Tables)                        │    │
│  │  ├─ pricing_rules (定价规则表) ★★★              │    │
│  │  ├─ availability_zones (可用区表)                │    │
│  │  ├─ resource_pools (资源池表)                    │    │
│  │  └─ compute_nodes (计算节点表)                   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  辅助表 (Supporting Tables)                      │    │
│  │  ├─ pricing_history (定价历史表) ★               │    │
│  │  ├─ pricing_cache (定价缓存表)                   │    │
│  │  └─ resource_types (资源类型定义表)              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  视图 (Views)                                    │    │
│  │  ├─ v_active_pricing_rules (当前有效规则)       │    │
│  │  └─ v_pricing_hierarchy (定价继承链)            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  存储过程 (Stored Procedures)                    │    │
│  │  └─ sp_query_pricing (查询资源价格)             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└──────────────────────────────────────────────────────────┘

★ = 重要度（越多星越重要）
```

### 1.2 表数量统计

| 类型 | 数量 | 说明 |
|------|------|------|
| 核心表 | 4 | pricing_rules, availability_zones, resource_pools, compute_nodes |
| 辅助表 | 3 | pricing_history, pricing_cache, resource_types |
| 视图 | 2 | v_active_pricing_rules, v_pricing_hierarchy |
| 存储过程 | 1 | sp_query_pricing |
| 触发器 | 3 | 定价规则变更自动记录 |

---

## 2. 核心表设计

### 2.1 定价规则表 (pricing_rules) ⭐⭐⭐

**用途**：存储所有资源的定价规则，是整个定价系统的核心表。

#### 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(64) | PRIMARY KEY | 定价规则唯一标识 |
| scope | VARCHAR(20) | NOT NULL | 定价范围: default/zone/pool/node |
| scope_id | VARCHAR(64) | NULL | 范围ID（default时为NULL） |
| scope_name | VARCHAR(255) | NULL | 范围显示名称 |
| resource_type | VARCHAR(20) | NOT NULL | 资源类型: gpu/cpu/memory/storage/network |
| resource_spec | VARCHAR(100) | NULL | 资源规格: A100-40GB, V100等 |
| price_per_unit | DECIMAL(12,4) | NOT NULL | 单价 |
| unit | VARCHAR(50) | NOT NULL | 计费单位 |
| billing_cycle | VARCHAR(20) | NOT NULL | 计费周期: hourly/daily/monthly |
| currency | VARCHAR(10) | DEFAULT 'CNY' | 货币单位 |
| effective_date | TIMESTAMP | NOT NULL | 生效日期 |
| expiry_date | TIMESTAMP | NULL | 失效日期 |
| enabled | TINYINT(1) | DEFAULT 1 | 启用状态 |
| description | VARCHAR(500) | NULL | 描述 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |
| created_by | VARCHAR(64) | NOT NULL | 创建人ID |
| updated_by | VARCHAR(64) | NULL | 更新人ID |

#### 索引设计

```sql
-- 主键索引
PRIMARY KEY (id)

-- 单列索引
INDEX idx_scope (scope)
INDEX idx_scope_id (scope_id)
INDEX idx_resource_type (resource_type)
INDEX idx_resource_spec (resource_spec)
INDEX idx_enabled (enabled)
INDEX idx_effective_date (effective_date)
INDEX idx_expiry_date (expiry_date)

-- 复合索引（优化查询性能）
INDEX idx_scope_resource (scope, resource_type, resource_spec)
INDEX idx_scope_id_resource (scope_id, resource_type, resource_spec)

-- 唯一约束
UNIQUE INDEX uk_pricing_rule (scope, scope_id, resource_type, resource_spec, effective_date)
```

#### 数据示例

```sql
-- 默认GPU定价
INSERT INTO pricing_rules VALUES (
  'default-gpu-a100-40',
  'default',
  NULL,
  NULL,
  'gpu',
  'A100-40GB',
  25.0000,
  '卡·小时',
  'hourly',
  'CNY',
  '2024-01-01 00:00:00',
  NULL,
  1,
  'NVIDIA A100 40GB默认价格',
  '2024-01-01 00:00:00',
  '2024-01-01 00:00:00',
  'system',
  NULL
);

-- 可用区GPU定价（覆盖默认）
INSERT INTO pricing_rules VALUES (
  'zone-gpu-a100-zone001',
  'zone',
  'zone-001',
  '成都可用区A',
  'gpu',
  'A100-40GB',
  23.0000,
  '卡·小时',
  'hourly',
  'CNY',
  '2024-01-01 00:00:00',
  NULL,
  1,
  '成都可用区A100优惠价格',
  '2024-01-01 00:00:00',
  '2024-01-01 00:00:00',
  'admin',
  NULL
);
```

---

### 2.2 定价历史表 (pricing_history)

**用途**：记录定价规则的所有变更历史，用于审计和回溯。

#### 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PRIMARY KEY AUTO_INCREMENT | 历史记录ID |
| pricing_rule_id | VARCHAR(64) | NOT NULL | 定价规则ID |
| action_type | VARCHAR(20) | NOT NULL | 操作类型: create/update/delete |
| old_data | JSON | NULL | 变更前数据 |
| new_data | JSON | NOT NULL | 变更后数据 |
| change_reason | VARCHAR(500) | NULL | 变更原因 |
| action_time | TIMESTAMP | NOT NULL | 操作时间 |
| action_by | VARCHAR(64) | NOT NULL | 操作人ID |
| action_ip | VARCHAR(50) | NULL | 操作IP地址 |

#### 索引设计

```sql
INDEX idx_pricing_rule_id (pricing_rule_id)
INDEX idx_action_type (action_type)
INDEX idx_action_time (action_time)
INDEX idx_action_by (action_by)
```

#### 数据示例

```sql
INSERT INTO pricing_history VALUES (
  1,
  'default-gpu-a100-40',
  'update',
  '{"price_per_unit": 25.0}',
  '{"price_per_unit": 23.0}',
  '成本下降，调整价格',
  '2024-12-06 10:00:00',
  'admin-001',
  '192.168.1.100'
);
```

---

### 2.3 可用区表 (availability_zones)

**用途**：定义系统中的可用区信息，支持按地域定价。

#### 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(64) | PRIMARY KEY | 可用区ID |
| zone_name | VARCHAR(255) | NOT NULL | 可用区名称 |
| zone_code | VARCHAR(50) | NOT NULL | 可用区代码 |
| region | VARCHAR(100) | NOT NULL | 地域 |
| city | VARCHAR(100) | NOT NULL | 城市 |
| datacenter | VARCHAR(255) | NULL | 数据中心名称 |
| datacenter_level | VARCHAR(20) | NULL | 机房等级 |
| cost_factor | DECIMAL(5,4) | DEFAULT 1.0000 | 成本系数 |
| status | VARCHAR(20) | DEFAULT 'active' | 状态 |
| enabled | TINYINT(1) | DEFAULT 1 | 启用状态 |
| description | VARCHAR(500) | NULL | 描述 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

#### 数据示例

```sql
INSERT INTO availability_zones VALUES (
  'zone-001',
  '成都可用区A',
  'CD-A',
  '西南',
  '成都',
  '成都数据中心1',
  'T3',
  0.9200,  -- 成本系数0.92（电力便宜）
  'active',
  1,
  '成都主要可用区，电力成本低',
  '2024-01-01 00:00:00',
  '2024-01-01 00:00:00'
);
```

---

### 2.4 资源池表 (resource_pools)

**用途**：定义系统中的资源池信息，支持按资源池定价。

#### 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(64) | PRIMARY KEY | 资源池ID |
| pool_name | VARCHAR(255) | NOT NULL | 资源池名称 |
| pool_type | VARCHAR(50) | NOT NULL | 资源池类型 |
| zone_id | VARCHAR(64) | NOT NULL | 所属可用区ID |
| resource_type | VARCHAR(20) | NOT NULL | 资源类型 |
| resource_specs | JSON | NULL | 资源规格列表 |
| total_capacity | INT | DEFAULT 0 | 总容量 |
| available_capacity | INT | DEFAULT 0 | 可用容量 |
| performance_level | VARCHAR(20) | NULL | 性能等级 |
| cost_factor | DECIMAL(5,4) | DEFAULT 1.0000 | 成本系数 |
| status | VARCHAR(20) | DEFAULT 'active' | 状态 |
| enabled | TINYINT(1) | DEFAULT 1 | 启用状态 |
| description | VARCHAR(500) | NULL | 描述 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

#### 外键关系

```sql
FOREIGN KEY (zone_id) REFERENCES availability_zones(id)
  ON DELETE RESTRICT 
  ON UPDATE CASCADE
```

#### 数据示例

```sql
INSERT INTO resource_pools VALUES (
  'pool-001',
  '高性能GPU资源池',
  'gpu-pool',
  'zone-001',
  'gpu',
  '["A100-40GB", "A100-80GB", "V100-32GB"]',
  100,
  85,
  'high',
  1.1000,  -- 成本系数1.1（高性能）
  'active',
  1,
  '配置NVMe存储和万兆网络的高性能GPU池',
  '2024-01-01 00:00:00',
  '2024-01-01 00:00:00'
);
```

---

### 2.5 计算节点表 (compute_nodes)

**用途**：定义系统中的计算节点信息，支持按节点定价。

#### 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(64) | PRIMARY KEY | 节点ID |
| node_name | VARCHAR(255) | NOT NULL | 节点名称 |
| node_type | VARCHAR(50) | NOT NULL | 节点类型 |
| zone_id | VARCHAR(64) | NOT NULL | 所属可用区ID |
| pool_id | VARCHAR(64) | NULL | 所属资源池ID |
| hardware_config | JSON | NULL | 硬件配置 |
| gpu_type | VARCHAR(100) | NULL | GPU型号 |
| gpu_count | INT | DEFAULT 0 | GPU数量 |
| cpu_cores | INT | DEFAULT 0 | CPU核心数 |
| memory_gb | INT | DEFAULT 0 | 内存大小(GB) |
| storage_gb | INT | DEFAULT 0 | 存储大小(GB) |
| status | VARCHAR(20) | DEFAULT 'active' | 状态 |
| health_status | VARCHAR(20) | DEFAULT 'healthy' | 健康状态 |
| enabled | TINYINT(1) | DEFAULT 1 | 启用状态 |
| cost_factor | DECIMAL(5,4) | DEFAULT 1.0000 | 成本系数 |
| is_new | TINYINT(1) | DEFAULT 0 | 是否新设备 |
| is_deprecated | TINYINT(1) | DEFAULT 0 | 是否即将下线 |
| description | VARCHAR(500) | NULL | 描述 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

#### 外键关系

```sql
FOREIGN KEY (zone_id) REFERENCES availability_zones(id)
  ON DELETE RESTRICT 
  ON UPDATE CASCADE

FOREIGN KEY (pool_id) REFERENCES resource_pools(id)
  ON DELETE RESTRICT 
  ON UPDATE CASCADE
```

#### 数据示例

```sql
INSERT INTO compute_nodes VALUES (
  'node-001',
  'GPU-Node-001',
  'gpu-node',
  'zone-001',
  'pool-001',
  '{"cpu": "Intel Xeon Gold 6248R", "memory": "DDR4-3200", "storage": "NVMe SSD"}',
  'A100-40GB',
  8,
  64,
  512,
  2000,
  'active',
  'healthy',
  1,
  1.0000,
  1,  -- 新设备
  0,
  '新上线的8卡A100节点',
  '2024-12-01 00:00:00',
  '2024-12-01 00:00:00'
);
```

---

## 3. 表关系图

### 3.1 ER图

```
┌────────────────────────┐
│  availability_zones    │
│  ────────────────────  │
│  PK: id                │
│  zone_name             │
│  region                │
│  cost_factor           │
└───────────┬────────────┘
            │ 1
            │
            │ N
┌───────────▼────────────┐
│  resource_pools        │
│  ────────────────────  │
│  PK: id                │
│  FK: zone_id           │
│  pool_name             │
│  performance_level     │
│  cost_factor           │
└───────────┬────────────┘
            │ 1
            │
            │ N
┌───────────▼────────────┐
│  compute_nodes         │
│  ────────────────────  │
│  PK: id                │
│  FK: zone_id           │
│  FK: pool_id           │
│  node_name             │
│  gpu_type              │
│  cost_factor           │
└────────────────────────┘

┌────────────────────────┐
│  pricing_rules         │◀────┐
│  ────────────────────  │     │
│  PK: id                │     │
│  scope                 │     │ 1
│  scope_id              │     │
│  resource_type         │     │
│  price_per_unit        │     │
└────────────┬───────────┘     │
             │ 1                │
             │                  │
             │ N                │
┌────────────▼───────────┐     │
│  pricing_history       │─────┘
│  ────────────────────  │ N
│  PK: id                │
│  FK: pricing_rule_id   │
│  action_type           │
│  old_data              │
│  new_data              │
└────────────────────────┘
```

### 3.2 关系说明

| 关系 | 类型 | 说明 |
|------|------|------|
| availability_zones → resource_pools | 1:N | 一个可用区包含多个资源池 |
| availability_zones → compute_nodes | 1:N | 一个可用区包含多个计算节点 |
| resource_pools → compute_nodes | 1:N | 一个资源池包含多个计算节点 |
| pricing_rules → pricing_history | 1:N | 一个定价规则有多条历史记录 |

---

## 4. 索引设计

### 4.1 索引策略

#### 主键索引（自动创建）

```sql
-- 所有表的主��都会自动创建主键索引
PRIMARY KEY (id)
```

#### 单列索引

```sql
-- pricing_rules表
CREATE INDEX idx_scope ON pricing_rules(scope);
CREATE INDEX idx_resource_type ON pricing_rules(resource_type);
CREATE INDEX idx_enabled ON pricing_rules(enabled);

-- availability_zones表
CREATE INDEX idx_region ON availability_zones(region);
CREATE INDEX idx_status ON availability_zones(status);

-- resource_pools表
CREATE INDEX idx_pool_type ON resource_pools(pool_type);
CREATE INDEX idx_performance_level ON resource_pools(performance_level);

-- compute_nodes表
CREATE INDEX idx_gpu_type ON compute_nodes(gpu_type);
CREATE INDEX idx_is_new ON compute_nodes(is_new);
```

#### 复合索引

```sql
-- pricing_rules表（优化定价查询）
CREATE INDEX idx_scope_resource 
ON pricing_rules(scope, resource_type, resource_spec);

CREATE INDEX idx_scope_id_resource 
ON pricing_rules(scope_id, resource_type, resource_spec);

-- 全覆盖索引（终极优化）
CREATE INDEX idx_pricing_rules_full 
ON pricing_rules(
  scope, 
  scope_id, 
  resource_type, 
  resource_spec, 
  enabled, 
  effective_date, 
  expiry_date
);
```

#### 唯一索引

```sql
-- pricing_rules表（防止重复定价规则）
CREATE UNIQUE INDEX uk_pricing_rule 
ON pricing_rules(
  scope, 
  scope_id, 
  resource_type, 
  resource_spec, 
  effective_date
);
```

### 4.2 索引选择建议

| 查询场景 | 使用索引 | 说明 |
|----------|----------|------|
| 按scope查询 | idx_scope | 查看某个层级的所有规则 |
| 按资源类型查询 | idx_resource_type | 查看GPU/CPU等所有规则 |
| 定价查询 | idx_scope_resource | 核心查询，使用最频繁 |
| 全表扫描 | idx_pricing_rules_full | 复杂查询优化 |

---

## 5. 视图设计

### 5.1 当前有效定价规则视图

```sql
CREATE VIEW v_active_pricing_rules AS
SELECT 
    pr.*,
    az.zone_name,
    az.region,
    rp.pool_name,
    rp.performance_level,
    cn.node_name,
    cn.gpu_type,
    rt.resource_name,
    rt.category
FROM pricing_rules pr
LEFT JOIN availability_zones az 
  ON pr.scope = 'zone' AND pr.scope_id = az.id
LEFT JOIN resource_pools rp 
  ON pr.scope = 'pool' AND pr.scope_id = rp.id
LEFT JOIN compute_nodes cn 
  ON pr.scope = 'node' AND pr.scope_id = cn.id
LEFT JOIN resource_types rt 
  ON pr.resource_type = rt.resource_type 
  AND pr.resource_spec = rt.resource_spec
WHERE pr.enabled = 1
  AND pr.effective_date <= NOW()
  AND (pr.expiry_date IS NULL OR pr.expiry_date > NOW());
```

**用途**：查询当前生效的所有定价规则，包含关联信息。

### 5.2 定价继承链视图

```sql
CREATE VIEW v_pricing_hierarchy AS
SELECT 
    cn.id AS node_id,
    cn.node_name,
    rp.id AS pool_id,
    rp.pool_name,
    az.id AS zone_id,
    az.zone_name,
    cn.gpu_type AS resource_spec,
    'gpu' AS resource_type,
    -- 实际应用的价格（COALESCE实现继承）
    COALESCE(
        (SELECT price_per_unit FROM pricing_rules 
         WHERE scope='node' AND scope_id=cn.id 
         AND resource_type='gpu' AND resource_spec=cn.gpu_type 
         AND enabled=1 AND effective_date <= NOW() 
         AND (expiry_date IS NULL OR expiry_date > NOW())
         LIMIT 1),
        (SELECT price_per_unit FROM pricing_rules 
         WHERE scope='pool' AND scope_id=rp.id 
         AND resource_type='gpu' AND resource_spec=cn.gpu_type 
         AND enabled=1 AND effective_date <= NOW() 
         AND (expiry_date IS NULL OR expiry_date > NOW())
         LIMIT 1),
        (SELECT price_per_unit FROM pricing_rules 
         WHERE scope='zone' AND scope_id=az.id 
         AND resource_type='gpu' AND resource_spec=cn.gpu_type 
         AND enabled=1 AND effective_date <= NOW() 
         AND (expiry_date IS NULL OR expiry_date > NOW())
         LIMIT 1),
        (SELECT price_per_unit FROM pricing_rules 
         WHERE scope='default' 
         AND resource_type='gpu' AND resource_spec=cn.gpu_type 
         AND enabled=1 AND effective_date <= NOW() 
         AND (expiry_date IS NULL OR expiry_date > NOW())
         LIMIT 1)
    ) AS applied_price
FROM compute_nodes cn
LEFT JOIN resource_pools rp ON cn.pool_id = rp.id
LEFT JOIN availability_zones az ON cn.zone_id = az.id
WHERE cn.enabled = 1 AND cn.gpu_type IS NOT NULL;
```

**用途**：可视化展示每个节点的定价继承关系。

---

## 6. 存储过程

### 6.1 查询资源价格存储过程

```sql
DELIMITER //

CREATE PROCEDURE sp_query_pricing(
    IN p_resource_type VARCHAR(20),
    IN p_resource_spec VARCHAR(100),
    IN p_zone_id VARCHAR(64),
    IN p_pool_id VARCHAR(64),
    IN p_node_id VARCHAR(64),
    IN p_query_date TIMESTAMP
)
BEGIN
    -- 实现定价继承逻辑
    -- 详见 pricing_database_schema.sql
END //

DELIMITER ;
```

**用途**：实现定价查询的核心逻辑，提升查询性能。

**使用示例**：

```sql
CALL sp_query_pricing(
  'gpu',
  'A100-40GB',
  'zone-001',
  'pool-001',
  'node-001',
  NOW()
);
```

---

## 7. 触发器设计

### 7.1 自动记录变更历史

```sql
-- 插入触发器
CREATE TRIGGER trg_pricing_rules_after_insert
AFTER INSERT ON pricing_rules
FOR EACH ROW
BEGIN
    INSERT INTO pricing_history (
        pricing_rule_id,
        action_type,
        new_data,
        action_by
    ) VALUES (
        NEW.id,
        'create',
        JSON_OBJECT(...),
        NEW.created_by
    );
END;

-- 更新触发器
CREATE TRIGGER trg_pricing_rules_after_update
AFTER UPDATE ON pricing_rules
FOR EACH ROW
BEGIN
    INSERT INTO pricing_history (
        pricing_rule_id,
        action_type,
        old_data,
        new_data,
        action_by
    ) VALUES (
        NEW.id,
        'update',
        JSON_OBJECT(...),  -- OLD data
        JSON_OBJECT(...),  -- NEW data
        NEW.updated_by
    );
END;

-- 删除触发器
CREATE TRIGGER trg_pricing_rules_before_delete
BEFORE DELETE ON pricing_rules
FOR EACH ROW
BEGIN
    INSERT INTO pricing_history (
        pricing_rule_id,
        action_type,
        old_data,
        action_by
    ) VALUES (
        OLD.id,
        'delete',
        JSON_OBJECT(...),
        OLD.created_by
    );
END;
```

**用途**：自动记录所有定价规则的变更，无需应用层处理。

---

## 8. 建表步骤

### 8.1 执行顺序

```bash
# 1. 连接数据库
mysql -u root -p fermi_cluster

# 2. 执行建表脚本
source /docs/database/pricing_database_schema.sql

# 3. 验证表结构
SHOW TABLES;
DESC pricing_rules;

# 4. 验证视图
SHOW FULL TABLES WHERE Table_type = 'VIEW';

# 5. 验证存储过程
SHOW PROCEDURE STATUS WHERE Db = 'fermi_cluster';

# 6. 验证触发器
SHOW TRIGGERS;

# 7. 插入初始数据（已包含在脚本中）
SELECT COUNT(*) FROM pricing_rules;
```

### 8.2 分步建表（可选）

如果需要分步执行，按以下顺序：

```sql
-- Step 1: 创建基础表
CREATE TABLE availability_zones (...);
CREATE TABLE resource_types (...);

-- Step 2: 创建关联表
CREATE TABLE resource_pools (...);
CREATE TABLE compute_nodes (...);

-- Step 3: 创建核心表
CREATE TABLE pricing_rules (...);
CREATE TABLE pricing_history (...);
CREATE TABLE pricing_cache (...);

-- Step 4: 创建视图
CREATE VIEW v_active_pricing_rules AS ...;
CREATE VIEW v_pricing_hierarchy AS ...;

-- Step 5: 创建存储过程
CREATE PROCEDURE sp_query_pricing (...);

-- Step 6: 创建触发器
CREATE TRIGGER trg_pricing_rules_after_insert ...;
CREATE TRIGGER trg_pricing_rules_after_update ...;
CREATE TRIGGER trg_pricing_rules_before_delete ...;

-- Step 7: 插入初始数据
INSERT INTO pricing_rules VALUES (...);
```

---

## 9. 数据迁移

### 9.1 从旧表迁移到新表

```sql
-- 假设旧表名为 old_pricing
INSERT INTO pricing_rules (
  id,
  scope,
  resource_type,
  resource_spec,
  price_per_unit,
  unit,
  billing_cycle,
  currency,
  enabled,
  description,
  created_at,
  updated_at,
  created_by
)
SELECT 
  CONCAT('migrated-', old_id),
  'default',  -- 旧数据统一设为默认定价
  resource_type,
  resource_name,
  price,
  unit,
  'hourly',
  'CNY',
  1,
  notes,
  create_time,
  update_time,
  'migration'
FROM old_pricing;
```

### 9.2 数据验证

```sql
-- 检查数据完整性
SELECT scope, COUNT(*) 
FROM pricing_rules 
GROUP BY scope;

-- 检查价格范围
SELECT 
  resource_type,
  MIN(price_per_unit) AS min_price,
  MAX(price_per_unit) AS max_price,
  AVG(price_per_unit) AS avg_price
FROM pricing_rules
GROUP BY resource_type;
```

---

## 10. 性能优化

### 10.1 查询优化建议

```sql
-- 1. 使用EXPLAIN分析查询
EXPLAIN SELECT * FROM pricing_rules 
WHERE scope = 'zone' 
  AND scope_id = 'zone-001' 
  AND resource_type = 'gpu';

-- 2. 确保索引被使用
SHOW INDEX FROM pricing_rules;

-- 3. 优化慢查询
-- 查看慢查询日志
SHOW VARIABLES LIKE 'slow_query_log%';
```

### 10.2 表优化

```sql
-- 分析表
ANALYZE TABLE pricing_rules;

-- 优化表
OPTIMIZE TABLE pricing_rules;

-- 检查表
CHECK TABLE pricing_rules;

-- 修复表
REPAIR TABLE pricing_rules;
```

### 10.3 定期维护任务

```sql
-- 清理过期缓存
DELETE FROM pricing_cache 
WHERE expires_at < NOW();

-- 归档历史数据（保留最近1年）
DELETE FROM pricing_history 
WHERE action_time < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- 更新统计信息
ANALYZE TABLE pricing_rules;
ANALYZE TABLE pricing_history;
```

---

## 📝 总结

### 建表检查清单

- [ ] 执行完整的建表脚本
- [ ] 验证所有表已创建
- [ ] 验证索引已创建
- [ ] 验证外键关系正确
- [ ] 验证视图可用
- [ ] 验证存储过程可用
- [ ] 验证触发器可用
- [ ] 插入初始测试数据
- [ ] 执行测试查询
- [ ] 配置备份策略

### 维护清单

- [ ] 定期清理缓存表
- [ ] 定期归档历史数据
- [ ] 定期更新统计信息
- [ ] 监控慢查询
- [ ] 定期备份数据库

---

**文档版本**: v1.0.0  
**最后更新**: 2024-12-06  
**维护团队**: 费米集群开发团队
