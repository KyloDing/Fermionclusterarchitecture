-- ============================================
-- 费米集群 - 灵活资源定价系统数据库模型
-- ============================================
-- 版本: v1.0.0
-- 创建日期: 2024-12-06
-- 说明: 支持四级分层定价（默认/可用区/资源池/节点）
-- ============================================

-- ============================================
-- 表1: 定价规则表 (pricing_rules)
-- 说明: 存储所有资源的定价规则，支持分层定价
-- ============================================
CREATE TABLE pricing_rules (
    -- 主键
    id VARCHAR(64) PRIMARY KEY COMMENT '定价规则唯一标识',
    
    -- 定价范围（层级）
    scope VARCHAR(20) NOT NULL COMMENT '定价范围: default(默认), zone(可用区), pool(资源池), node(节点)',
    scope_id VARCHAR(64) DEFAULT NULL COMMENT '范围ID: zone_id, pool_id, 或 node_id (scope=default时为NULL)',
    scope_name VARCHAR(255) DEFAULT NULL COMMENT '范围显示名称，便于识别',
    
    -- 资源信息
    resource_type VARCHAR(20) NOT NULL COMMENT '资源类型: gpu, cpu, memory, storage, network',
    resource_spec VARCHAR(100) DEFAULT NULL COMMENT '资源规格: A100-40GB, V100-32GB, SSD, HDD等',
    
    -- 价格信息
    price_per_unit DECIMAL(12, 4) NOT NULL COMMENT '单价（保留4位小数）',
    unit VARCHAR(50) NOT NULL COMMENT '计费单位: 卡·小时, 核·小时, GB·小时, GB·月等',
    billing_cycle VARCHAR(20) NOT NULL COMMENT '计费周期: hourly(按小时), daily(按天), monthly(按月)',
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT '货币单位: CNY, USD等',
    
    -- 生效时间
    effective_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生效日期',
    expiry_date TIMESTAMP DEFAULT NULL COMMENT '失效日期（NULL表示永久有效）',
    
    -- 状态
    enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '启用状态: 1-启用, 0-禁用',
    
    -- 描述信息
    description VARCHAR(500) DEFAULT NULL COMMENT '定价规则描述',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(64) NOT NULL COMMENT '创建人ID',
    updated_by VARCHAR(64) DEFAULT NULL COMMENT '更新人ID',
    
    -- 索引
    INDEX idx_scope (scope),
    INDEX idx_scope_id (scope_id),
    INDEX idx_resource_type (resource_type),
    INDEX idx_resource_spec (resource_spec),
    INDEX idx_enabled (enabled),
    INDEX idx_effective_date (effective_date),
    INDEX idx_expiry_date (expiry_date),
    
    -- 复合索引（优化查询性能）
    INDEX idx_scope_resource (scope, resource_type, resource_spec),
    INDEX idx_scope_id_resource (scope_id, resource_type, resource_spec),
    UNIQUE INDEX uk_pricing_rule (scope, scope_id, resource_type, resource_spec, effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源定价规则表';


-- ============================================
-- 表2: 定价历史表 (pricing_history)
-- 说明: 记录定价规则的变更历史，用于审计和回溯
-- ============================================
CREATE TABLE pricing_history (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '历史记录ID',
    
    -- 关联信息
    pricing_rule_id VARCHAR(64) NOT NULL COMMENT '定价规则ID',
    
    -- 变更类型
    action_type VARCHAR(20) NOT NULL COMMENT '操作类型: create(创建), update(更新), delete(删除), enable(启用), disable(禁用)',
    
    -- 变更前后数据（JSON格式）
    old_data JSON DEFAULT NULL COMMENT '变更前的数据（JSON格式）',
    new_data JSON NOT NULL COMMENT '变更后的数据（JSON格式）',
    
    -- 变更原因
    change_reason VARCHAR(500) DEFAULT NULL COMMENT '变更原因',
    
    -- 审计字段
    action_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    action_by VARCHAR(64) NOT NULL COMMENT '操作人ID',
    action_ip VARCHAR(50) DEFAULT NULL COMMENT '操作IP地址',
    
    -- 索引
    INDEX idx_pricing_rule_id (pricing_rule_id),
    INDEX idx_action_type (action_type),
    INDEX idx_action_time (action_time),
    INDEX idx_action_by (action_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='定价规则变更历史表';


-- ============================================
-- 表3: 资源类型定义表 (resource_types)
-- 说明: 定义系统支持的资源类型和规格
-- ============================================
CREATE TABLE resource_types (
    -- 主键
    id VARCHAR(64) PRIMARY KEY COMMENT '资源类型ID',
    
    -- 资源类型信息
    resource_type VARCHAR(20) NOT NULL COMMENT '资源类型: gpu, cpu, memory, storage, network',
    resource_spec VARCHAR(100) NOT NULL COMMENT '资源规格: A100-40GB, V100-32GB等',
    resource_name VARCHAR(255) NOT NULL COMMENT '资源显示名称',
    
    -- 资源分类
    category VARCHAR(50) DEFAULT NULL COMMENT '资源分类: 高性能GPU, 推理GPU, 通用CPU等',
    manufacturer VARCHAR(100) DEFAULT NULL COMMENT '制造商: NVIDIA, AMD, Intel等',
    
    -- 资源参数（JSON格式）
    specifications JSON DEFAULT NULL COMMENT '详细规格参数（JSON格式）',
    
    -- 默认计费单位
    default_unit VARCHAR(50) NOT NULL COMMENT '默认计费单位',
    default_billing_cycle VARCHAR(20) NOT NULL COMMENT '默认计费周期',
    
    -- 状态
    enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '启用状态: 1-启用, 0-禁用',
    
    -- 描述
    description VARCHAR(500) DEFAULT NULL COMMENT '资源描述',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    INDEX idx_resource_type (resource_type),
    INDEX idx_category (category),
    INDEX idx_enabled (enabled),
    UNIQUE INDEX uk_resource (resource_type, resource_spec)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源类型定义表';


-- ============================================
-- 表4: 可用区表 (availability_zones)
-- 说明: 定义系统中的可用区信息
-- ============================================
CREATE TABLE availability_zones (
    -- 主键
    id VARCHAR(64) PRIMARY KEY COMMENT '可用区ID',
    
    -- 可用区信息
    zone_name VARCHAR(255) NOT NULL COMMENT '可用区名称',
    zone_code VARCHAR(50) NOT NULL COMMENT '可用区代码',
    
    -- 地理位置
    region VARCHAR(100) NOT NULL COMMENT '地域: 成都, 北京, 上海等',
    city VARCHAR(100) NOT NULL COMMENT '城市',
    
    -- 机房信息
    datacenter VARCHAR(255) DEFAULT NULL COMMENT '数据中心名称',
    datacenter_level VARCHAR(20) DEFAULT NULL COMMENT '机房等级: T3, T4等',
    
    -- 成本系数
    cost_factor DECIMAL(5, 4) NOT NULL DEFAULT 1.0000 COMMENT '成本系数（基于默认价格的倍数）',
    
    -- 状态
    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active(活跃), maintenance(维护), offline(下线)',
    enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '启用状态: 1-启用, 0-禁用',
    
    -- 描述
    description VARCHAR(500) DEFAULT NULL COMMENT '可用区描述',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    INDEX idx_zone_code (zone_code),
    INDEX idx_region (region),
    INDEX idx_status (status),
    INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='可用区表';


-- ============================================
-- 表5: 资源池表 (resource_pools)
-- 说明: 定义系统中的资源池信息
-- ============================================
CREATE TABLE resource_pools (
    -- 主键
    id VARCHAR(64) PRIMARY KEY COMMENT '资源池ID',
    
    -- 资源池信息
    pool_name VARCHAR(255) NOT NULL COMMENT '资源池名称',
    pool_type VARCHAR(50) NOT NULL COMMENT '资源池类型: gpu-pool, cpu-pool, storage-pool等',
    
    -- 关联信息
    zone_id VARCHAR(64) NOT NULL COMMENT '所属可用区ID',
    
    -- 资源池配置
    resource_type VARCHAR(20) NOT NULL COMMENT '资源类型: gpu, cpu, memory, storage',
    resource_specs JSON DEFAULT NULL COMMENT '资源规格列表（JSON数组）',
    
    -- 容量信息
    total_capacity INT NOT NULL DEFAULT 0 COMMENT '总容量',
    available_capacity INT NOT NULL DEFAULT 0 COMMENT '可用容量',
    
    -- 性能等级
    performance_level VARCHAR(20) DEFAULT NULL COMMENT '性能等级: high(高性能), standard(标准), low(低成本)',
    
    -- 成本系数
    cost_factor DECIMAL(5, 4) NOT NULL DEFAULT 1.0000 COMMENT '成本系数（基于可用区价格的倍数）',
    
    -- 状态
    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active(活跃), maintenance(维护), offline(下线)',
    enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '启用状态: 1-启用, 0-禁用',
    
    -- 描述
    description VARCHAR(500) DEFAULT NULL COMMENT '资源池描述',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    INDEX idx_zone_id (zone_id),
    INDEX idx_pool_type (pool_type),
    INDEX idx_resource_type (resource_type),
    INDEX idx_performance_level (performance_level),
    INDEX idx_status (status),
    INDEX idx_enabled (enabled),
    
    -- 外键
    FOREIGN KEY (zone_id) REFERENCES availability_zones(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源池表';


-- ============================================
-- 表6: 计算节点表 (compute_nodes)
-- 说明: 定义系统中的计算节点信息
-- ============================================
CREATE TABLE compute_nodes (
    -- 主键
    id VARCHAR(64) PRIMARY KEY COMMENT '节点ID',
    
    -- 节点信息
    node_name VARCHAR(255) NOT NULL COMMENT '节点名称',
    node_type VARCHAR(50) NOT NULL COMMENT '节点类型: gpu-node, cpu-node, storage-node',
    
    -- 关联信息
    zone_id VARCHAR(64) NOT NULL COMMENT '所属可用区ID',
    pool_id VARCHAR(64) DEFAULT NULL COMMENT '所属资源池ID',
    
    -- 硬件配置（JSON格式）
    hardware_config JSON DEFAULT NULL COMMENT '硬件配置（JSON格式）',
    
    -- 资源信息
    gpu_type VARCHAR(100) DEFAULT NULL COMMENT 'GPU型号',
    gpu_count INT DEFAULT 0 COMMENT 'GPU数量',
    cpu_cores INT DEFAULT 0 COMMENT 'CPU核心数',
    memory_gb INT DEFAULT 0 COMMENT '内存大小（GB）',
    storage_gb INT DEFAULT 0 COMMENT '存储大小（GB）',
    
    -- 状态
    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active(活跃), maintenance(维护), offline(下线)',
    health_status VARCHAR(20) NOT NULL DEFAULT 'healthy' COMMENT '健康状态: healthy(健康), warning(警告), critical(严重)',
    enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '启用状态: 1-启用, 0-禁用',
    
    -- 成本系数
    cost_factor DECIMAL(5, 4) NOT NULL DEFAULT 1.0000 COMMENT '成本系数（基于资源池价格的倍数）',
    
    -- 特殊标记
    is_new TINYINT(1) DEFAULT 0 COMMENT '是否新设备: 1-是, 0-否',
    is_deprecated TINYINT(1) DEFAULT 0 COMMENT '是否即将下线: 1-是, 0-否',
    
    -- 描述
    description VARCHAR(500) DEFAULT NULL COMMENT '节点描述',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    INDEX idx_zone_id (zone_id),
    INDEX idx_pool_id (pool_id),
    INDEX idx_node_type (node_type),
    INDEX idx_gpu_type (gpu_type),
    INDEX idx_status (status),
    INDEX idx_health_status (health_status),
    INDEX idx_enabled (enabled),
    INDEX idx_is_new (is_new),
    INDEX idx_is_deprecated (is_deprecated),
    
    -- 外键
    FOREIGN KEY (zone_id) REFERENCES availability_zones(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (pool_id) REFERENCES resource_pools(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='计算节点表';


-- ============================================
-- 表7: 定价查询缓存表 (pricing_cache)
-- 说明: 缓存定价查询结果，提升查询性能
-- ============================================
CREATE TABLE pricing_cache (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '缓存ID',
    
    -- 查询条件（哈希值）
    query_hash VARCHAR(64) NOT NULL COMMENT '查询条件的哈希值',
    
    -- 查询条件（JSON格式）
    query_params JSON NOT NULL COMMENT '查询参数（JSON格式）',
    
    -- 查询结果（JSON格式）
    result_data JSON NOT NULL COMMENT '查询结果（JSON格式）',
    
    -- 缓存信息
    cached_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '缓存时间',
    expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
    hit_count INT NOT NULL DEFAULT 0 COMMENT '命中次数',
    
    -- 索引
    UNIQUE INDEX uk_query_hash (query_hash),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='定价查询缓存表';


-- ============================================
-- 视图: 当前有效定价规则视图
-- 说明: 只返回当前生效且启用的定价规则
-- ============================================
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
LEFT JOIN availability_zones az ON pr.scope = 'zone' AND pr.scope_id = az.id
LEFT JOIN resource_pools rp ON pr.scope = 'pool' AND pr.scope_id = rp.id
LEFT JOIN compute_nodes cn ON pr.scope = 'node' AND pr.scope_id = cn.id
LEFT JOIN resource_types rt ON pr.resource_type = rt.resource_type AND pr.resource_spec = rt.resource_spec
WHERE pr.enabled = 1
  AND pr.effective_date <= NOW()
  AND (pr.expiry_date IS NULL OR pr.expiry_date > NOW());


-- ============================================
-- 视图: 定价继承链视图
-- 说明: 显示完整的定价继承关系
-- ============================================
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
    -- 节点级定价
    (SELECT price_per_unit FROM pricing_rules 
     WHERE scope='node' AND scope_id=cn.id AND resource_type='gpu' AND resource_spec=cn.gpu_type 
     AND enabled=1 AND effective_date <= NOW() AND (expiry_date IS NULL OR expiry_date > NOW())
     LIMIT 1) AS node_price,
    -- 资源池级定价
    (SELECT price_per_unit FROM pricing_rules 
     WHERE scope='pool' AND scope_id=rp.id AND resource_type='gpu' AND resource_spec=cn.gpu_type 
     AND enabled=1 AND effective_date <= NOW() AND (expiry_date IS NULL OR expiry_date > NOW())
     LIMIT 1) AS pool_price,
    -- 可用区级定价
    (SELECT price_per_unit FROM pricing_rules 
     WHERE scope='zone' AND scope_id=az.id AND resource_type='gpu' AND resource_spec=cn.gpu_type 
     AND enabled=1 AND effective_date <= NOW() AND (expiry_date IS NULL OR expiry_date > NOW())
     LIMIT 1) AS zone_price,
    -- 默认定价
    (SELECT price_per_unit FROM pricing_rules 
     WHERE scope='default' AND resource_type='gpu' AND resource_spec=cn.gpu_type 
     AND enabled=1 AND effective_date <= NOW() AND (expiry_date IS NULL OR expiry_date > NOW())
     LIMIT 1) AS default_price,
    -- 实际应用的价格
    COALESCE(
        (SELECT price_per_unit FROM pricing_rules 
         WHERE scope='node' AND scope_id=cn.id AND resource_type='gpu' AND resource_spec=cn.gpu_type 
         AND enabled=1 AND effective_date <= NOW() AND (expiry_date IS NULL OR expiry_date > NOW())
         LIMIT 1),
        (SELECT price_per_unit FROM pricing_rules 
         WHERE scope='pool' AND scope_id=rp.id AND resource_type='gpu' AND resource_spec=cn.gpu_type 
         AND enabled=1 AND effective_date <= NOW() AND (expiry_date IS NULL OR expiry_date > NOW())
         LIMIT 1),
        (SELECT price_per_unit FROM pricing_rules 
         WHERE scope='zone' AND scope_id=az.id AND resource_type='gpu' AND resource_spec=cn.gpu_type 
         AND enabled=1 AND effective_date <= NOW() AND (expiry_date IS NULL OR expiry_date > NOW())
         LIMIT 1),
        (SELECT price_per_unit FROM pricing_rules 
         WHERE scope='default' AND resource_type='gpu' AND resource_spec=cn.gpu_type 
         AND enabled=1 AND effective_date <= NOW() AND (expiry_date IS NULL OR expiry_date > NOW())
         LIMIT 1)
    ) AS applied_price
FROM compute_nodes cn
LEFT JOIN resource_pools rp ON cn.pool_id = rp.id
LEFT JOIN availability_zones az ON cn.zone_id = az.id
WHERE cn.enabled = 1 AND cn.gpu_type IS NOT NULL;


-- ============================================
-- 存储过程: 查询资源价格
-- 说明: 实现定价继承逻辑，返回实际应用的价格
-- ============================================
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
    DECLARE v_price DECIMAL(12, 4);
    DECLARE v_unit VARCHAR(50);
    DECLARE v_billing_cycle VARCHAR(20);
    DECLARE v_currency VARCHAR(10);
    DECLARE v_applied_scope VARCHAR(20);
    DECLARE v_applied_rule_id VARCHAR(64);
    
    -- 1. 尝试查找节点级价格
    IF p_node_id IS NOT NULL THEN
        SELECT price_per_unit, unit, billing_cycle, currency, scope, id
        INTO v_price, v_unit, v_billing_cycle, v_currency, v_applied_scope, v_applied_rule_id
        FROM pricing_rules
        WHERE scope = 'node'
          AND scope_id = p_node_id
          AND resource_type = p_resource_type
          AND (resource_spec = p_resource_spec OR resource_spec IS NULL)
          AND enabled = 1
          AND effective_date <= p_query_date
          AND (expiry_date IS NULL OR expiry_date > p_query_date)
        ORDER BY resource_spec IS NOT NULL DESC, effective_date DESC
        LIMIT 1;
    END IF;
    
    -- 2. 如果没有节点级价格，查找资源池级价格
    IF v_price IS NULL AND p_pool_id IS NOT NULL THEN
        SELECT price_per_unit, unit, billing_cycle, currency, scope, id
        INTO v_price, v_unit, v_billing_cycle, v_currency, v_applied_scope, v_applied_rule_id
        FROM pricing_rules
        WHERE scope = 'pool'
          AND scope_id = p_pool_id
          AND resource_type = p_resource_type
          AND (resource_spec = p_resource_spec OR resource_spec IS NULL)
          AND enabled = 1
          AND effective_date <= p_query_date
          AND (expiry_date IS NULL OR expiry_date > p_query_date)
        ORDER BY resource_spec IS NOT NULL DESC, effective_date DESC
        LIMIT 1;
    END IF;
    
    -- 3. 如果没有资源池级价格，查找可用区级价格
    IF v_price IS NULL AND p_zone_id IS NOT NULL THEN
        SELECT price_per_unit, unit, billing_cycle, currency, scope, id
        INTO v_price, v_unit, v_billing_cycle, v_currency, v_applied_scope, v_applied_rule_id
        FROM pricing_rules
        WHERE scope = 'zone'
          AND scope_id = p_zone_id
          AND resource_type = p_resource_type
          AND (resource_spec = p_resource_spec OR resource_spec IS NULL)
          AND enabled = 1
          AND effective_date <= p_query_date
          AND (expiry_date IS NULL OR expiry_date > p_query_date)
        ORDER BY resource_spec IS NOT NULL DESC, effective_date DESC
        LIMIT 1;
    END IF;
    
    -- 4. 如果没有可用区级价格，使用默认价格
    IF v_price IS NULL THEN
        SELECT price_per_unit, unit, billing_cycle, currency, scope, id
        INTO v_price, v_unit, v_billing_cycle, v_currency, v_applied_scope, v_applied_rule_id
        FROM pricing_rules
        WHERE scope = 'default'
          AND resource_type = p_resource_type
          AND (resource_spec = p_resource_spec OR resource_spec IS NULL)
          AND enabled = 1
          AND effective_date <= p_query_date
          AND (expiry_date IS NULL OR expiry_date > p_query_date)
        ORDER BY resource_spec IS NOT NULL DESC, effective_date DESC
        LIMIT 1;
    END IF;
    
    -- 返回结果
    SELECT 
        v_price AS price_per_unit,
        v_unit AS unit,
        v_billing_cycle AS billing_cycle,
        v_currency AS currency,
        v_applied_scope AS applied_scope,
        v_applied_rule_id AS applied_rule_id,
        p_resource_type AS resource_type,
        p_resource_spec AS resource_spec;
END //

DELIMITER ;


-- ============================================
-- 触发器: 记录定价规则变更历史
-- ============================================
DELIMITER //

-- 插入触发器
CREATE TRIGGER trg_pricing_rules_after_insert
AFTER INSERT ON pricing_rules
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
        'create',
        NULL,
        JSON_OBJECT(
            'id', NEW.id,
            'scope', NEW.scope,
            'scope_id', NEW.scope_id,
            'resource_type', NEW.resource_type,
            'resource_spec', NEW.resource_spec,
            'price_per_unit', NEW.price_per_unit,
            'unit', NEW.unit,
            'billing_cycle', NEW.billing_cycle,
            'enabled', NEW.enabled
        ),
        NEW.created_by
    );
END //

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
        JSON_OBJECT(
            'id', OLD.id,
            'scope', OLD.scope,
            'scope_id', OLD.scope_id,
            'resource_type', OLD.resource_type,
            'resource_spec', OLD.resource_spec,
            'price_per_unit', OLD.price_per_unit,
            'unit', OLD.unit,
            'billing_cycle', OLD.billing_cycle,
            'enabled', OLD.enabled
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'scope', NEW.scope,
            'scope_id', NEW.scope_id,
            'resource_type', NEW.resource_type,
            'resource_spec', NEW.resource_spec,
            'price_per_unit', NEW.price_per_unit,
            'unit', NEW.unit,
            'billing_cycle', NEW.billing_cycle,
            'enabled', NEW.enabled
        ),
        COALESCE(NEW.updated_by, NEW.created_by)
    );
END //

-- 删除触发器
CREATE TRIGGER trg_pricing_rules_before_delete
BEFORE DELETE ON pricing_rules
FOR EACH ROW
BEGIN
    INSERT INTO pricing_history (
        pricing_rule_id,
        action_type,
        old_data,
        new_data,
        action_by
    ) VALUES (
        OLD.id,
        'delete',
        JSON_OBJECT(
            'id', OLD.id,
            'scope', OLD.scope,
            'scope_id', OLD.scope_id,
            'resource_type', OLD.resource_type,
            'resource_spec', OLD.resource_spec,
            'price_per_unit', OLD.price_per_unit,
            'unit', OLD.unit,
            'billing_cycle', OLD.billing_cycle,
            'enabled', OLD.enabled
        ),
        NULL,
        OLD.created_by
    );
END //

DELIMITER ;


-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认GPU定价
INSERT INTO pricing_rules (id, scope, resource_type, resource_spec, price_per_unit, unit, billing_cycle, currency, enabled, description, created_by) VALUES
('default-gpu-a100-40', 'default', 'gpu', 'A100-40GB', 25.0000, '卡·小时', 'hourly', 'CNY', 1, 'NVIDIA A100 40GB默认价格', 'system'),
('default-gpu-a100-80', 'default', 'gpu', 'A100-80GB', 35.0000, '卡·小时', 'hourly', 'CNY', 1, 'NVIDIA A100 80GB默认价格', 'system'),
('default-gpu-v100', 'default', 'gpu', 'V100-32GB', 18.0000, '卡·小时', 'hourly', 'CNY', 1, 'NVIDIA V100 32GB默认价格', 'system'),
('default-gpu-t4', 'default', 'gpu', 'T4-16GB', 8.0000, '卡·小时', 'hourly', 'CNY', 1, 'NVIDIA T4 16GB默认价格', 'system');

-- 插入默认CPU定价
INSERT INTO pricing_rules (id, scope, resource_type, price_per_unit, unit, billing_cycle, currency, enabled, description, created_by) VALUES
('default-cpu', 'default', 'cpu', 0.5000, '核·小时', 'hourly', 'CNY', 1, 'CPU核心默认价格', 'system');

-- 插入默认内存定价
INSERT INTO pricing_rules (id, scope, resource_type, price_per_unit, unit, billing_cycle, currency, enabled, description, created_by) VALUES
('default-memory', 'default', 'memory', 0.1000, 'GB·小时', 'hourly', 'CNY', 1, '内存默认价格', 'system');

-- 插入默认存储定价
INSERT INTO pricing_rules (id, scope, resource_type, resource_spec, price_per_unit, unit, billing_cycle, currency, enabled, description, created_by) VALUES
('default-storage-ssd', 'default', 'storage', 'SSD', 0.5000, 'GB·月', 'monthly', 'CNY', 1, 'SSD存储默认价格', 'system'),
('default-storage-hdd', 'default', 'storage', 'HDD', 0.2000, 'GB·月', 'monthly', 'CNY', 1, 'HDD存储默认价格', 'system');

-- 插入默认网络定价
INSERT INTO pricing_rules (id, scope, resource_type, resource_spec, price_per_unit, unit, billing_cycle, currency, enabled, description, created_by) VALUES
('default-network-egress', 'default', 'network', 'egress', 0.8000, 'GB', 'hourly', 'CNY', 1, '出网流量默认价格', 'system'),
('default-network-ingress', 'default', 'network', 'ingress', 0.0000, 'GB', 'hourly', 'CNY', 1, '入网流量默认价格（免费）', 'system');


-- ============================================
-- 索引优化建议
-- ============================================
-- 如果查询性能较慢，可以考虑添加以下额外索引：
-- CREATE INDEX idx_pricing_rules_full ON pricing_rules(scope, scope_id, resource_type, resource_spec, enabled, effective_date, expiry_date);
-- CREATE INDEX idx_pricing_cache_expires ON pricing_cache(expires_at) WHERE expires_at > NOW();
