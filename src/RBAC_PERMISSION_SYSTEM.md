# 费米集群RBAC权限系统文档

## 概述

已为费米集群平台实现了完整的基于角色的访问控制(RBAC)系统，支持多种用户角色，实现细粒度的权限管理和页面/功能访问控制。

---

## 用户角色定义

### 1. 系统管理员 (admin)
**权限范围：完全权限**

- ✅ **平台资源管理**：可以查看和修改所有平台资源（计算节点、GPU池、存储池、存储后端、集群、镜像等）
- ✅ **用户业务资源**：可以查看和管理所有用户的业务资源
- ✅ **费用中心**：可以查看所有用户的费用信息、管理计费配置、定价、折扣、算力券等
- ✅ **监控和调度**：完全的监控和资源调度权限
- ✅ **用户和权限管理**：可以管理用户、角色、用户组、访问控制、审计日志
- ✅ **系统管理**：可以管理系统设置

**登录信息：**
- 用户名：`admin`
- 密码：`admin123`
- 账号名称：系统管理员

---

### 2. 普通用户 (user)
**权限范围：业务资源使用**

- ✅ **平台资源查看**：只能查看平台资源信息，无法修改
- ✅ **用户业务资源**：可以创建和管理自己的业务资源
  - 容器实例
  - 训练任务
  - 推理服务
  - 存储卷
  - SMB共享
  - 文件
  - 数据集
  - 模型
  - 模型评测
  - Pipeline编排
- ✅ **费用中心**：只能查看和管理自己的费用信息
  - 账户余额
  - 订单
  - 账单
  - 发票
  - 政府算力券
- ✅ **监控**：只能查看自己的任务和监控信息
- ❌ **无权限**：无法修改平台资源、无法查看其他用户的资源、无法管理用户和权限

**登录信息：**
- 用户名：`user`
- 密码：`user123`
- 账号名称：张三（算法工程师）

---

### 3. 开发者 (developer)
**权限范围：业务资源使用 + 增强监控**

与普通用户相同，但具有以下增强权限：
- ✅ **增强监控**：可以查看高级监控指标
- ✅ **任务队列查看**：可以查看任务队列状态（但不能管理）
- ✅ **更多平台资源查看**：可以查看存储后端等更详细的平台信息

**登录信息：**
- 用户名：`developer`
- 密码：`dev123`
- 账号名称：李四（高级算法工程师）

---

### 4. 运维人员 (operator)
**权限范围：平台资源管理 + 监控调度**

- ✅ **平台资源管理**：完全的平台资源管理权限（与管理员相同）
- ✅ **监控和调度**：完全的监控和资源调度权限
- ✅ **用户业务资源查看**：可以查看所有用户的业务资源（只读）
- ❌ **无权限**：无法管理用户和权限、无法管理计费配置

**登录信息：**
- 用户名：`operator`
- 密码：`ops123`
- 账号名称：王五（运维工程师）

---

## 权限对比表

| 功能模块 | 管理员 | 普通用户 | 开发者 | 运维人员 |
|---------|--------|---------|--------|---------|
| **平台资源管理** ||||
| 计算节点 | ✅ 管理 | 🔍 只读 | 🔍 只读 | ✅ 管理 |
| GPU池 | ✅ 管理 | 🔍 只读 | 🔍 只读 | ✅ 管理 |
| 存储池 | ✅ 管理 | 🔍 只读 | 🔍 只读 | ✅ 管理 |
| 存储后端 | ✅ 管理 | ❌ 无 | 🔍 只读 | ✅ 管理 |
| 集群管理 | ✅ 管理 | ❌ 无 | ❌ 无 | ✅ 管理 |
| 镜像管理 | ✅ 管理 | 🔍 只读 | 🔍 只读 | ✅ 管理 |
| **用户业务资源** ||||
| 容器实例 | ✅ 所有 | ✅ 自己 | ✅ 自己 | 🔍 所有只读 |
| 训练任务 | ✅ 所有 | ✅ 自己 | ✅ 自己 | 🔍 所有只读 |
| 推理服务 | ✅ 所有 | ✅ 自己 | ✅ 自己 | 🔍 所有只读 |
| 存储卷 | ✅ 所有 | ✅ 自己 | ✅ 自己 | 🔍 所有只读 |
| 数据集 | ✅ 所有 | ✅ 自己 | ✅ 自己 | 🔍 所有只读 |
| 模型 | ✅ 所有 | ✅ 自己 | ✅ 自己 | 🔍 所有只读 |
| **费用中心** ||||
| 账户余额 | ✅ 所有 | ✅ 自己 | ✅ 自己 | ❌ 无 |
| 订单管理 | ✅ 所有 | ✅ 自己 | ✅ 自己 | ❌ 无 |
| 计费配置 | ✅ 管理 | ❌ 无 | ❌ 无 | ❌ 无 |
| 定价管理 | ✅ 管理 | ❌ 无 | ❌ 无 | ❌ 无 |
| 算力券 | ✅ 所有 | ✅ 自己 | ✅ 自己 | ❌ 无 |
| **监控和调度** ||||
| 系统监控 | ✅ 高级 | ✅ 基础 | ✅ 高级 | ✅ 高级 |
| 任务监控 | ✅ 所有 | ✅ 自己 | ✅ 自己 | ✅ 所有 |
| 任务队列 | ✅ 管理 | ❌ 无 | 🔍 只读 | ✅ 管理 |
| 资源调度 | ✅ 管理 | ❌ 无 | ❌ 无 | ✅ 管理 |
| **用户和权限** ||||
| 用户管理 | ✅ 管理 | ❌ 无 | ❌ 无 | ❌ 无 |
| 角色管理 | ✅ 管理 | ❌ 无 | ❌ 无 | ❌ 无 |
| 访问控制 | ✅ 管理 | ❌ 无 | ❌ 无 | ❌ 无 |
| 审计日志 | ✅ 查看 | ❌ 无 | ❌ 无 | ❌ 无 |

图例：
- ✅ 管理 = 完全的查看和修改权限
- ✅ 所有 = 可以查看和管理所有资源
- ✅ 自己 = 只能查看和管理自己创建的资源
- 🔍 只读 = 只能查看，不能修改
- 🔍 所有只读 = 可以查看所有资源，但不能修改
- ❌ 无 = 无任何权限，不可见

---

## 技术实现

### 1. 权限配置 (`/config/permissions.ts`)

定义了：
- **UserRole 枚举**：系统支持的所有角色
- **Permission 枚举**：系统中所有可能的权限
- **RolePermissions 映射**：每个角色拥有的权限列表
- **PagePermissions 配置**：每个页面需要的权限

### 2. 权限Hook (`/hooks/usePermissions.ts`)

提供以下功能：
```typescript
const {
  hasPermission,           // 检查是否有指定权限
  hasAnyPermission,        // 检查是否有任意一个权限
  hasAllPermissions,       // 检查是否有所有权限
  isAdmin,                 // 是否是管理员
  isOperator,              // 是否是运维人员
  isDeveloper,             // 是否是开发者
  isRegularUser,           // 是否是普通用户
  canManageAll,            // 是否可以管理所有资源
  canManageResource,       // 是否可以管理特定资源
} = usePermissions();
```

### 3. 权限保护组件 (`/components/PermissionGuard.tsx`)

提供三种保护组件：

#### PermissionGuard
保护需要特定权限才能访问的内容
```tsx
<PermissionGuard permission={Permission.MANAGE_USERS}>
  <Button>编辑用户</Button>
</PermissionGuard>
```

#### PermissionButton
根据权限显示/隐藏按钮
```tsx
<PermissionButton permission={Permission.CREATE_INSTANCES}>
  <Button>创建实例</Button>
</PermissionButton>
```

#### ResourcePermission
根据资源所有权显示/隐藏操作
```tsx
<ResourcePermission 
  resourceType="instances" 
  resourceOwnerId={instance.ownerId}
>
  <Button>删除</Button>
</ResourcePermission>
```

### 4. 身份认证服务更新 (`/services/authService.ts`)

添加了4个测试账号，每个账号具有不同的角色：
- admin - 系统管理员
- user - 普通用户
- developer - 开发者
- operator - 运维人员

### 5. 登录页面更新 (`/components/pages/LoginPage.tsx`)

添加了快速登录按钮，可以一键切换不同角色的账号进行测试。

### 6. 侧边栏菜单过滤 (`/components/AppSidebar.tsx`)

侧边栏菜单现在会根据用户权限动态显示：
- 无权限的菜单项不会显示
- 无任何可见项的菜单组不会显示
- 管理员可以看到所有菜单
- 普通用户只能看到业务相关菜单

---

## 使用指南

### 快速测试不同角色

1. **测试系统管理员权限**
   ```
   登录账号：admin / admin123
   预期结果：
   - 可以看到所有菜单项
   - 可以访问用户管理、角色管理等
   - 可以管理平台资源（计算节点、GPU池等）
   - 可以查看和管理所有用户的资源
   ```

2. **测试普通用户权限**
   ```
   登录账号：user / user123
   预期结果：
   - 只能看到业务相关菜单
   - 无法看到"算力资源"、"资源调度"、"用户与权限"等管理类菜单
   - 只能管理自己创建的资源
   - 只能查看自己的费用信息
   ```

3. **测试开发者权限**
   ```
   登录账号：developer / dev123
   预期结果：
   - 与普通用户类似
   - 可以看到更多监控信息
   - 可以查看任务队列（但不能管理）
   ```

4. **测试运维人员权限**
   ```
   登录账号：operator / ops123
   预期结果：
   - 可以管理平台资源
   - 可以查看所有用户的业务资源（只读）
   - 可以管理监控和调度
   - 无法管理用户和权限
   ```

---

## 页面级权限控制

### 实现方式

在App.tsx的路由配置中使用PermissionGuard：

```tsx
<Route 
  path="/users" 
  element={
    <PermissionGuard 
      permission={Permission.VIEW_USERS}
      redirectTo="/dashboard"
    >
      <UsersManagementPage />
    </PermissionGuard>
  } 
/>
```

### 受保护的管理员专属页面

以下页面只有管理员可以访问：
- `/users` - 用户管理
- `/roles` - 角色管理
- `/user-groups` - 用户组管理
- `/access-control` - 访问控制
- `/audit-logs` - 审计日志
- `/billing-config` - 计费配置
- `/pricing-management` - 定价管理
- `/discount-management` - 折扣管理
- `/billing-rules` - 计费规则

### 受保护的运维人员页面

以下页面运维人员和管理员可以访问：
- `/compute-nodes` - 计算节点
- `/gpu-pools` - GPU资源池
- `/storage-pools` - 存储池
- `/storage-backends` - 存储后端
- `/clusters` - 集群管理
- `/scheduling` - 调度中心
- `/task-queues` - 任务队列

---

## 功能级权限控制

### 按钮和操作权限

在页面中使用PermissionButton保护操作按钮：

```tsx
// 只有管理员可以看到"创建计算节点"按钮
<PermissionButton permission={Permission.MANAGE_COMPUTE_NODES}>
  <Button onClick={createNode}>创建计算节点</Button>
</PermissionButton>

// 只有管理员可以看到"编辑定价"按钮
<PermissionButton permission={Permission.MANAGE_PRICING}>
  <Button onClick={editPricing}>编辑定价</Button>
</PermissionButton>
```

### 资源所有权权限

使用ResourcePermission保护资源操作：

```tsx
// 只有资源所有者或管理员可以看到"删除"按钮
<ResourcePermission 
  resourceType="instances" 
  resourceOwnerId={instance.ownerId}
>
  <Button onClick={() => deleteInstance(instance.id)}>删除</Button>
</ResourcePermission>
```

---

## 数据过滤

### 后端过滤（推荐）

在后端API中根据用户角色过滤数据：

```typescript
// 普通用户只能看到自己的资源
if (user.roles.includes('user') && !user.roles.includes('admin')) {
  resources = resources.filter(r => r.ownerId === user.id);
}

// 管理员可以看到所有资源
if (user.roles.includes('admin')) {
  // 返回所有资源
}
```

### 前端过滤（辅助）

在前端显示时也可以过滤：

```typescript
const { canManageAll, user } = usePermissions();

const visibleResources = canManageAll('instances') 
  ? allInstances 
  : allInstances.filter(i => i.ownerId === user?.id);
```

---

## 权限扩展

### 添加新角色

1. 在`/config/permissions.ts`中添加新角色：
```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  DEVELOPER = 'developer',
  OPERATOR = 'operator',
  NEW_ROLE = 'new_role', // 新角色
}
```

2. 为新角色配置权限：
```typescript
export const RolePermissions: Record<UserRole, Permission[]> = {
  // ...
  [UserRole.NEW_ROLE]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_INSTANCES,
    // ... 其他权限
  ],
};
```

3. 在authService.ts中添加测试账号。

### 添加新权限

1. 在`Permission`枚举中添加新权限：
```typescript
export enum Permission {
  // ...
  NEW_FEATURE_VIEW = 'new_feature_view',
  NEW_FEATURE_MANAGE = 'new_feature_manage',
}
```

2. 将新权限分配给相应的角色。

3. 在页面或组件中使用新权限：
```tsx
<PermissionGuard permission={Permission.NEW_FEATURE_VIEW}>
  <NewFeatureComponent />
</PermissionGuard>
```

---

## 安全注意事项

### 前端权限控制的局限性

⚠️ **重要**：前端权限控制仅用于改善用户体验，隐藏用户无权访问的功能。

**安全规则：**
1. ✅ 前端权限控制 = UI展示控制
2. ✅ 后端权限验证 = 真正的安全保障
3. ❌ 永远不要仅依赖前端权限控制
4. ✅ 所有敏感操作必须在后端验证权限

### 推荐的安全实践

1. **API层权限验证**
   ```typescript
   // 后端API示例
   app.delete('/api/instances/:id', authenticate, authorize(['admin', 'owner']), async (req, res) => {
     // 删除实例
   });
   ```

2. **资源所有权验证**
   ```typescript
   // 检查用户是否是资源所有者或管理员
   if (resource.ownerId !== user.id && !user.roles.includes('admin')) {
     throw new ForbiddenError();
   }
   ```

3. **敏感数据过滤**
   ```typescript
   // 根据用户角色返回不同的数据
   if (!user.roles.includes('admin')) {
     delete response.sensitiveField;
   }
   ```

---

## 常见问题

### Q1: 用户可以绕过前端权限限制吗？

**A**: 可以。前端代码可以被修改或绕过。这就是为什么必须在后端也实现权限验证。前端权限控制只是为了提供更好的用户体验。

### Q2: 如何处理多角色用户？

**A**: 系统支持用户拥有多个角色。权限是多个角色权限的并集。例如，一个用户同时具有`user`和`developer`角色，将拥有两个角色的所有权限。

### Q3: 如何测试权限系统？

**A**: 
1. 使用提供的测试账号登录不同角色
2. 检查菜单显示是否正确
3. 尝试访问受保护的页面
4. 测试功能按钮的显示/隐藏
5. 测试资源操作权限

### Q4: 可以动态修改用户权限吗？

**A**: 可以。修改用户的角色后，需要用户重新登录以获取新的权限。在生产环境中，可以实现权限缓存刷新机制。

### Q5: 如何实现更细粒度的权限控制？

**A**: 可以：
1. 添加更多的Permission枚举值
2. 使用基于资源的权限控制（ABAC）
3. 实现组织/部门级别的权限隔离
4. 添加数据行级别的权限控制

---

## 测试检查清单

- [ ] 管理员可以看到所有菜单项
- [ ] 普通用户看不到管理类菜单
- [ ] 普通用户无法访问`/users`等管理页面
- [ ] 普通用户只能看到自己的资源
- [ ] 管理员可以看到所有用户的资源
- [ ] 操作按钮根据权限正确显示/隐藏
- [ ] 无权限时显示友好的提示信息
- [ ] 不同角色登录后Toast显示正确的角色信息
- [ ] 侧边栏菜单根据角色动态变化
- [ ] 运维人员可以管理平台资源但无法管理用户
- [ ] 开发者可以看到高级监控但无法管理调度

---

## 下一步计划

### 短期 (v1.1)
- [ ] 为每个页面添加PermissionGuard保护
- [ ] 为关键操作按钮添加权限控制
- [ ] 实现资源所有权过滤
- [ ] 添加权限拒绝的友好提示页面

### 中期 (v2.0)
- [ ] 实现基于组织的权限隔离
- [ ] 添加部门级别的资源访问控制
- [ ] 实现更细粒度的操作权限
- [ ] 添加权限审计日志

### 长期 (v3.0)
- [ ] 实现动态权限配置
- [ ] 支持自定义角色和权限
- [ ] 实现基于属性的访问控制(ABAC)
- [ ] 添加权限策略引擎

---

## 相关文档

- [权限配置](/config/permissions.ts)
- [权限Hook文档](/hooks/usePermissions.ts)
- [权限保护组件](/components/PermissionGuard.tsx)
- [身份认证服务](/services/authService.ts)

---

## 版本信息

- **功能版本**: v1.0
- **创建日期**: 2024-11-28
- **最后更新**: 2024-11-28
- **状态**: ✅ 已完成基础实现
