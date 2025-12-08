-- ============================================
-- 费米集群 - 折扣系统数据库模型
-- ============================================
-- 版本: v2.0.0
-- 创建日期: 2024-12-07
-- 说明: 支持结构化条件和优先级机制的折扣系统
-- ============================================

-- ============================================
-- 表1: 折扣规则表 (discount_rules)
-- 说明: 存储所有折扣规则，支持复杂条件和多种折扣方式
-- ============================================
CREATE TABLE discount_rules (
    -- 主键
    id VARCHAR(64) PRIMARY KEY COMMENT '折扣规则唯一标识',
    
    -- 基础信息
    name VARCHAR(255) NOT NULL COMMENT '规则名称',
    description VARCHAR(1000) DEFAULT NULL COMMENT '详细说明',
    
    -- 状态管理
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT '状态: DRAFT(草稿), ACTIVE(生效中), INACTIVE(已停用)',
    priority INT NOT NULL DEFAULT 100 COMMENT '优先级（数字越小优先级越高）',
    
    -- 时间管理
    effective_date TIMESTAMP NOT NULL COMMENT '生效时间',
    expiry_date TIMESTAMP DEFAULT NULL COMMENT '失效时间（NULL表示永久有效）',
    
    -- 触发条件（JSON格式）
    conditions JSON NOT NULL COMMENT '触发条件（结构化JSON）',
    /*
    条件示例：
    {
      "targetUserTypes": ["INDIVIDUAL", "ENTERPRISE"],
      "firstOrderOnly": true,
      "targetResourceTypes": ["gpu", "cpu"],
      "targetResourceSpecs": ["A100-80GB", "V100-32GB"],
      "minAmount": 1000.00,
      "minUsageHours": 100,
      "targetZones": ["zone-cd-01", "zone-bj-01"],
      "timeRange": {
        "startHour": 0,
        "endHour": 6
      },
      "minQuantity": 10
    }
    */
    
    -- 折扣动作（JSON格式）
    action JSON NOT NULL COMMENT '折扣动作（结构化JSON）',
    /*
    动作示例：
    {
      "type": "PERCENTAGE",           // PERCENTAGE, FIXED, CAPPED
      "discountRate": 0.9,            // 打9折（type=PERCENTAGE时）
      "fixedDeduction": 100.00,       // 减100元（type=FIXED时）
      "maxDeduction": 200.00,         // 最多减200元（type=CAPPED时）
      "exclusive": false              // 是否互斥（不可与其他折扣叠加）
    }
    */
    
    -- 使用统计
    usage_count INT DEFAULT 0 COMMENT '已使用次数',
    max_usage INT DEFAULT NULL COMMENT '最大使用次数（NULL表示无限制）',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(64) NOT NULL COMMENT '创建人ID',
    updated_by VARCHAR(64) DEFAULT NULL COMMENT '更新人ID',
    
    -- 兼容旧版字段（保留）
    enabled TINYINT(1) DEFAULT NULL COMMENT '启用状态（旧版字段，保留作兼容）',
    discount_type VARCHAR(50) DEFAULT NULL COMMENT '折扣类型（旧版字段）',
    discount_value DECIMAL(12, 4) DEFAULT NULL COMMENT '折扣值（旧版字段）',
    applies_to JSON DEFAULT NULL COMMENT '适用资源（旧版字段）',
    
    -- 索引
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_effective_date (effective_date),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_created_at (created_at),
    
    -- 复合索引（优化查询）
    INDEX idx_status_priority (status, priority),
    INDEX idx_status_effective (status, effective_date, expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='折扣规则表';


-- ============================================
-- 表2: 折扣规则历史表 (discount_rule_history)
-- 说明: 记录折扣规则的所有变更历史（版本快照）
-- ============================================
CREATE TABLE discount_rule_history (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '历史记录ID',
    
    -- 关联信息
    discount_rule_id VARCHAR(64) NOT NULL COMMENT '折扣规则ID',
    version INT NOT NULL COMMENT '版本号',
    
    -- 变更类型
    action_type VARCHAR(20) NOT NULL COMMENT '操作类型: create(创建), update(更新), delete(删除), activate(启用), deactivate(停用)',
    
    -- 快照数据（JSON格式）
    snapshot_data JSON NOT NULL COMMENT '规则快照（完整JSON）',
    
    -- 变更信息
    change_summary VARCHAR(500) DEFAULT NULL COMMENT '变更摘要',
    change_reason VARCHAR(500) DEFAULT NULL COMMENT '变更原因',
    
    -- 审计字段
    action_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    action_by VARCHAR(64) NOT NULL COMMENT '操作人ID',
    action_ip VARCHAR(50) DEFAULT NULL COMMENT '操作IP地址',
    
    -- 索引
    INDEX idx_discount_rule_id (discount_rule_id),
    INDEX idx_version (discount_rule_id, version),
    INDEX idx_action_type (action_type),
    INDEX idx_action_time (action_time),
    INDEX idx_action_by (action_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='折扣规则历史表';


-- ============================================
-- 表3: 折扣使用记录表 (discount_usage_logs)
-- 说明: 记录每次折扣的使用情况
-- ============================================
CREATE TABLE discount_usage_logs (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '使用记录ID',
    
    -- 关联信息
    discount_rule_id VARCHAR(64) NOT NULL COMMENT '折扣规则ID',
    order_id VARCHAR(64) NOT NULL COMMENT '订单ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    
    -- 折扣信息
    original_amount DECIMAL(12, 2) NOT NULL COMMENT '原价',
    discount_amount DECIMAL(12, 2) NOT NULL COMMENT '折扣金额',
    final_amount DECIMAL(12, 2) NOT NULL COMMENT '最终金额',
    
    -- 匹配详情（JSON格式）
    match_details JSON DEFAULT NULL COMMENT '匹配详情',
    /*
    示例：
    {
      "resourceType": "gpu",
      "resourceSpec": "A100-80GB",
      "quantity": 8,
      "duration": 24,
      "zoneId": "zone-cd-01",
      "matchedConditions": {
        "userTypeMatched": true,
        "firstOrderMatched": true,
        "resourceMatched": true,
        "amountMatched": true
      }
    }
    */
    
    -- 时间信息
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
    
    -- 索引
    INDEX idx_discount_rule_id (discount_rule_id),
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_used_at (used_at),
    
    -- 外键
    FOREIGN KEY (discount_rule_id) REFERENCES discount_rules(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='折扣使用记录表';


-- ============================================
-- 表4: 折扣审批流表 (discount_approvals)
-- 说明: 管理敏感折扣规则的审批流程
-- ============================================
CREATE TABLE discount_approvals (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '审批记录ID',
    
    -- 关联信息
    discount_rule_id VARCHAR(64) NOT NULL COMMENT '折扣规则ID',
    
    -- 审批状态
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '审批状态: PENDING(待审批), APPROVED(已批准), REJECTED(已拒绝), CANCELLED(已取消)',
    
    -- 审批信息
    submitted_by VARCHAR(64) NOT NULL COMMENT '提交人ID',
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    
    approver_id VARCHAR(64) DEFAULT NULL COMMENT '审批人ID',
    approved_at TIMESTAMP DEFAULT NULL COMMENT '审批时间',
    
    approval_comments VARCHAR(1000) DEFAULT NULL COMMENT '审批意见',
    
    -- 审批前规则快照
    rule_snapshot JSON NOT NULL COMMENT '规则快照',
    
    -- 索引
    INDEX idx_discount_rule_id (discount_rule_id),
    INDEX idx_approval_status (approval_status),
    INDEX idx_submitted_by (submitted_by),
    INDEX idx_approver_id (approver_id),
    INDEX idx_submitted_at (submitted_at),
    
    -- 外键
    FOREIGN KEY (discount_rule_id) REFERENCES discount_rules(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='折扣审批流表';


-- ============================================
-- 视图: 当前有效折扣规则视图
-- 说明: 只返回当前生效且启用的折扣规则
-- ============================================
CREATE VIEW v_active_discount_rules AS
SELECT 
    dr.*,
    COUNT(DISTINCT dul.id) AS total_usage_count,
    SUM(dul.discount_amount) AS total_saved_amount
FROM discount_rules dr
LEFT JOIN discount_usage_logs dul ON dr.id = dul.discount_rule_id
WHERE dr.status = 'ACTIVE'
  AND dr.effective_date <= NOW()
  AND (dr.expiry_date IS NULL OR dr.expiry_date > NOW())
  AND (dr.max_usage IS NULL OR dr.usage_count < dr.max_usage)
GROUP BY dr.id;


-- ============================================
-- 视图: 折扣效果统计视图
-- 说明: 统计每个折扣规则的使用效果
-- ============================================
CREATE VIEW v_discount_effectiveness AS
SELECT 
    dr.id,
    dr.name,
    dr.status,
    dr.priority,
    COUNT(DISTINCT dul.id) AS usage_count,
    COUNT(DISTINCT dul.user_id) AS unique_users,
    SUM(dul.discount_amount) AS total_discount_amount,
    AVG(dul.discount_amount) AS avg_discount_amount,
    MIN(dul.used_at) AS first_used_at,
    MAX(dul.used_at) AS last_used_at
FROM discount_rules dr
LEFT JOIN discount_usage_logs dul ON dr.id = dul.discount_rule_id
GROUP BY dr.id;


-- ============================================
-- 存储过程: 匹配折扣规则
-- 说明: 根据订单信息和用户信息，匹配符合条件的折扣规则
-- ============================================
DELIMITER //

CREATE PROCEDURE sp_match_discount_rules(
    IN p_user_id VARCHAR(64),
    IN p_user_type VARCHAR(50),
    IN p_is_first_order BOOLEAN,
    IN p_resource_type VARCHAR(20),
    IN p_resource_spec VARCHAR(100),
    IN p_zone_id VARCHAR(64),
    IN p_quantity INT,
    IN p_amount DECIMAL(12, 2),
    IN p_usage_hours INT
)
BEGIN
    DECLARE current_hour INT;
    SET current_hour = HOUR(NOW());
    
    -- 查询符合条件的折扣规则
    SELECT 
        dr.id,
        dr.name,
        dr.priority,
        dr.conditions,
        dr.action,
        dr.usage_count,
        dr.max_usage
    FROM discount_rules dr
    WHERE dr.status = 'ACTIVE'
      AND dr.effective_date <= NOW()
      AND (dr.expiry_date IS NULL OR dr.expiry_date > NOW())
      AND (dr.max_usage IS NULL OR dr.usage_count < dr.max_usage)
      
      -- 用户类型检查
      AND (
          JSON_EXTRACT(dr.conditions, '$.targetUserTypes') IS NULL
          OR JSON_CONTAINS(JSON_EXTRACT(dr.conditions, '$.targetUserTypes'), JSON_QUOTE(p_user_type))
      )
      
      -- 首单检查
      AND (
          JSON_EXTRACT(dr.conditions, '$.firstOrderOnly') IS NULL
          OR (JSON_EXTRACT(dr.conditions, '$.firstOrderOnly') = TRUE AND p_is_first_order = TRUE)
      )
      
      -- 资源类型检查
      AND (
          JSON_EXTRACT(dr.conditions, '$.targetResourceTypes') IS NULL
          OR JSON_CONTAINS(JSON_EXTRACT(dr.conditions, '$.targetResourceTypes'), JSON_QUOTE(p_resource_type))
      )
      
      -- 资源规格检查
      AND (
          JSON_EXTRACT(dr.conditions, '$.targetResourceSpecs') IS NULL
          OR JSON_CONTAINS(JSON_EXTRACT(dr.conditions, '$.targetResourceSpecs'), JSON_QUOTE(p_resource_spec))
      )
      
      -- 地域检查
      AND (
          JSON_EXTRACT(dr.conditions, '$.targetZones') IS NULL
          OR JSON_CONTAINS(JSON_EXTRACT(dr.conditions, '$.targetZones'), JSON_QUOTE(p_zone_id))
      )
      
      -- 金额门槛检查
      AND (
          JSON_EXTRACT(dr.conditions, '$.minAmount') IS NULL
          OR p_amount >= CAST(JSON_EXTRACT(dr.conditions, '$.minAmount') AS DECIMAL(12,2))
      )
      
      -- 使用时长检查
      AND (
          JSON_EXTRACT(dr.conditions, '$.minUsageHours') IS NULL
          OR p_usage_hours >= CAST(JSON_EXTRACT(dr.conditions, '$.minUsageHours') AS SIGNED)
      )
      
      -- 数量检查
      AND (
          JSON_EXTRACT(dr.conditions, '$.minQuantity') IS NULL
          OR p_quantity >= CAST(JSON_EXTRACT(dr.conditions, '$.minQuantity') AS SIGNED)
      )
      
      -- 时段检查
      AND (
          JSON_EXTRACT(dr.conditions, '$.timeRange') IS NULL
          OR (
              current_hour >= CAST(JSON_EXTRACT(dr.conditions, '$.timeRange.startHour') AS SIGNED)
              AND current_hour < CAST(JSON_EXTRACT(dr.conditions, '$.timeRange.endHour') AS SIGNED)
          )
      )
    
    ORDER BY dr.priority ASC;
END //

DELIMITER ;


-- ============================================
-- 存储过程: 应用折扣计算
-- 说明: 根据匹配的折扣规则计算最终金额
-- ============================================
DELIMITER //

CREATE PROCEDURE sp_apply_discount(
    IN p_original_amount DECIMAL(12, 2),
    IN p_discount_rule_id VARCHAR(64),
    OUT p_final_amount DECIMAL(12, 2),
    OUT p_discount_amount DECIMAL(12, 2)
)
BEGIN
    DECLARE v_action_type VARCHAR(20);
    DECLARE v_discount_rate DECIMAL(5, 4);
    DECLARE v_fixed_deduction DECIMAL(12, 2);
    DECLARE v_max_deduction DECIMAL(12, 2);
    DECLARE v_calculated_amount DECIMAL(12, 2);
    DECLARE v_saved_amount DECIMAL(12, 2);
    
    -- 获取折扣动作
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(action, '$.type')),
        CAST(JSON_EXTRACT(action, '$.discountRate') AS DECIMAL(5,4)),
        CAST(JSON_EXTRACT(action, '$.fixedDeduction') AS DECIMAL(12,2)),
        CAST(JSON_EXTRACT(action, '$.maxDeduction') AS DECIMAL(12,2))
    INTO v_action_type, v_discount_rate, v_fixed_deduction, v_max_deduction
    FROM discount_rules
    WHERE id = p_discount_rule_id;
    
    -- 计算折扣
    IF v_action_type = 'PERCENTAGE' THEN
        SET v_calculated_amount = p_original_amount * COALESCE(v_discount_rate, 1.0);
        SET v_saved_amount = p_original_amount - v_calculated_amount;
        
    ELSEIF v_action_type = 'FIXED' THEN
        SET v_saved_amount = COALESCE(v_fixed_deduction, 0);
        SET v_calculated_amount = GREATEST(0, p_original_amount - v_saved_amount);
        
    ELSEIF v_action_type = 'CAPPED' THEN
        SET v_saved_amount = p_original_amount * (1 - COALESCE(v_discount_rate, 1.0));
        SET v_saved_amount = LEAST(v_saved_amount, COALESCE(v_max_deduction, v_saved_amount));
        SET v_calculated_amount = p_original_amount - v_saved_amount;
        
    ELSE
        SET v_calculated_amount = p_original_amount;
        SET v_saved_amount = 0;
    END IF;
    
    -- 返回结果
    SET p_final_amount = v_calculated_amount;
    SET p_discount_amount = v_saved_amount;
END //

DELIMITER ;


-- ============================================
-- 触发器: 记录折扣规则变更历史
-- ============================================
DELIMITER //

-- 创建触发器
CREATE TRIGGER trg_discount_rules_after_insert
AFTER INSERT ON discount_rules
FOR EACH ROW
BEGIN
    INSERT INTO discount_rule_history (
        discount_rule_id,
        version,
        action_type,
        snapshot_data,
        change_summary,
        action_by
    ) VALUES (
        NEW.id,
        1,
        'create',
        JSON_OBJECT(
            'id', NEW.id,
            'name', NEW.name,
            'status', NEW.status,
            'priority', NEW.priority,
            'conditions', NEW.conditions,
            'action', NEW.action
        ),
        '创建折扣规则',
        NEW.created_by
    );
END //

-- 更新触发器
CREATE TRIGGER trg_discount_rules_after_update
AFTER UPDATE ON discount_rules
FOR EACH ROW
BEGIN
    DECLARE next_version INT;
    
    -- 获取下一个版本号
    SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
    FROM discount_rule_history
    WHERE discount_rule_id = NEW.id;
    
    -- 插入历史记录
    INSERT INTO discount_rule_history (
        discount_rule_id,
        version,
        action_type,
        snapshot_data,
        change_summary,
        action_by
    ) VALUES (
        NEW.id,
        next_version,
        CASE 
            WHEN OLD.status != NEW.status AND NEW.status = 'ACTIVE' THEN 'activate'
            WHEN OLD.status != NEW.status AND NEW.status = 'INACTIVE' THEN 'deactivate'
            ELSE 'update'
        END,
        JSON_OBJECT(
            'id', NEW.id,
            'name', NEW.name,
            'status', NEW.status,
            'priority', NEW.priority,
            'conditions', NEW.conditions,
            'action', NEW.action
        ),
        CONCAT('版本 ', next_version, ' 更新'),
        COALESCE(NEW.updated_by, NEW.created_by)
    );
END //

-- 删除触发器
CREATE TRIGGER trg_discount_rules_before_delete
BEFORE DELETE ON discount_rules
FOR EACH ROW
BEGIN
    DECLARE next_version INT;
    
    SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
    FROM discount_rule_history
    WHERE discount_rule_id = OLD.id;
    
    INSERT INTO discount_rule_history (
        discount_rule_id,
        version,
        action_type,
        snapshot_data,
        change_summary,
        action_by
    ) VALUES (
        OLD.id,
        next_version,
        'delete',
        JSON_OBJECT(
            'id', OLD.id,
            'name', OLD.name,
            'status', OLD.status
        ),
        '删除折扣规则',
        OLD.created_by
    );
END //

DELIMITER ;


-- ============================================
-- 初始化数据
-- ============================================

-- 插入示例折扣规则

-- 1. 新用户首单9折
INSERT INTO discount_rules (
    id, name, description, status, priority,
    effective_date, expiry_date,
    conditions, action,
    created_by
) VALUES (
    'disc-newuser-2025',
    '新用户首单9折',
    '新注册用户首次下单可享受9折优惠',
    'ACTIVE',
    10,
    '2025-01-01 00:00:00',
    '2025-12-31 23:59:59',
    JSON_OBJECT(
        'targetUserTypes', JSON_ARRAY('INDIVIDUAL', 'ENTERPRISE'),
        'firstOrderOnly', true
    ),
    JSON_OBJECT(
        'type', 'PERCENTAGE',
        'discountRate', 0.9,
        'exclusive', false
    ),
    'system'
);

-- 2. 夜间时段7折
INSERT INTO discount_rules (
    id, name, description, status, priority,
    effective_date, expiry_date,
    conditions, action,
    created_by
) VALUES (
    'disc-night-2025',
    '夜间时段7折',
    '凌晨00:00-06:00使用GPU享7折优惠',
    'ACTIVE',
    20,
    '2025-01-01 00:00:00',
    NULL,
    JSON_OBJECT(
        'targetResourceTypes', JSON_ARRAY('gpu'),
        'timeRange', JSON_OBJECT('startHour', 0, 'endHour', 6)
    ),
    JSON_OBJECT(
        'type', 'PERCENTAGE',
        'discountRate', 0.7,
        'exclusive', false
    ),
    'system'
);

-- 3. 批量使用85折
INSERT INTO discount_rules (
    id, name, description, status, priority,
    effective_date, expiry_date,
    conditions, action,
    created_by
) VALUES (
    'disc-volume-2025',
    '批量使用85折',
    '单次使用10卡以上GPU享85折',
    'ACTIVE',
    30,
    '2025-01-01 00:00:00',
    NULL,
    JSON_OBJECT(
        'targetResourceTypes', JSON_ARRAY('gpu'),
        'minQuantity', 10
    ),
    JSON_OBJECT(
        'type', 'PERCENTAGE',
        'discountRate', 0.85,
        'exclusive', false
    ),
    'system'
);

-- 4. 企业用户满1000减100
INSERT INTO discount_rules (
    id, name, description, status, priority,
    effective_date, expiry_date,
    conditions, action,
    max_usage,
    created_by
) VALUES (
    'disc-enterprise-2025',
    '企业用户满1000减100',
    '企业用户单笔消费满1000元减100元',
    'ACTIVE',
    40,
    '2025-01-01 00:00:00',
    '2025-06-30 23:59:59',
    JSON_OBJECT(
        'targetUserTypes', JSON_ARRAY('ENTERPRISE'),
        'minAmount', 1000.00
    ),
    JSON_OBJECT(
        'type', 'FIXED',
        'fixedDeduction', 100.00,
        'exclusive', false
    ),
    1000,
    'system'
);

-- 5. 成都可用区优惠（封顶优惠示例）
INSERT INTO discount_rules (
    id, name, description, status, priority,
    effective_date, expiry_date,
    conditions, action,
    created_by
) VALUES (
    'disc-zone-cd-2025',
    '成都可用区优惠',
    '成都可用区A100-80GB 9折，最多减免200元',
    'ACTIVE',
    50,
    '2025-01-01 00:00:00',
    NULL,
    JSON_OBJECT(
        'targetResourceTypes', JSON_ARRAY('gpu'),
        'targetResourceSpecs', JSON_ARRAY('A100-80GB'),
        'targetZones', JSON_ARRAY('zone-cd-01')
    ),
    JSON_OBJECT(
        'type', 'CAPPED',
        'discountRate', 0.9,
        'maxDeduction', 200.00,
        'exclusive', false
    ),
    'system'
);


-- ============================================
-- 索引优化建议
-- ============================================
-- 如果查询性能较慢，可以考虑添加以下额外索引：
-- CREATE INDEX idx_conditions_user_type ON discount_rules((JSON_EXTRACT(conditions, '$.targetUserTypes')));
-- CREATE INDEX idx_action_type ON discount_rules((JSON_EXTRACT(action, '$.type')));
