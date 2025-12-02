# 费米集群身份认证系统集成说明

## 概述

费米集群平台已集成企业级身份认证中心（基于Keycloak二次开发），提供单点登录（SSO）、OAuth2/OIDC认证、用户名密码登录等多种认证方式。

## 系统架构

```
┌─────────────────┐         OAuth2/OIDC        ┌──────────────────────┐
│  费米集群前端    │ ◄──────────────────────► │  费米集群身份认证中心  │
│  Web Console    │                            │  (Keycloak)          │
└─────────────────┘                            └──────────────────────┘
                                                          ▲
                                                          │
                                                          │ LDAP/AD
                                                          ▼
                                               ┌──────────────────────┐
                                               │  企业目录服务          │
                                               │  (AD/LDAP)           │
                                               └──────────────────────┘
```

## 认证流程

### 1. SSO单点登录（推荐）

**流程说明：**

1. 用户访问费米集群控制台
2. 未登录用户被重定向到登录页面
3. 用户点击"SSO登录"按钮
4. 系统生成PKCE验证码和state参数
5. 重定向到费米集群身份认证中心
6. 用户在认证中心完成身份验证
7. 认证中心回调返回授权码
8. 前端使用授权码交换访问令牌
9. 使用访问令牌获取用户信息
10. 登录成功，进入控制台

**技术细节：**

- **协议**: OAuth 2.0 Authorization Code Flow with PKCE
- **安全机制**: 
  - PKCE (Proof Key for Code Exchange) 防止授权码拦截
  - State参数防止CSRF攻击
  - 令牌存储在localStorage（生产环境建议使用HttpOnly Cookie）
  - 令牌自动刷新机制

**配置参数：**

```typescript
const KEYCLOAK_CONFIG = {
  url: 'https://auth.fermi-cluster.com',          // 认证中心地址
  realm: 'fermi-platform',                         // Realm名称
  clientId: 'fermi-web-console',                   // 客户端ID
  redirectUri: window.location.origin + '/auth/callback',  // 回调地址
};
```

### 2. 用户名密码登录（备用方式）

**流程说明：**

1. 用户在登录页面选择"账号密码"选项卡
2. 输入用户名和密码
3. 前端调用Keycloak的Resource Owner Password Credentials接口
4. 认证成功返回访问令牌
5. 使用访问令牌获取用户信息
6. 登录成功，进入控制台

**演示账号：**

```
用户名: demo
密码: demo123
```

## 代码结构

### 核心文件

```
/services/
  └── authService.ts              # 认证服务层，封装所有认证相关API

/contexts/
  └── AuthContext.tsx             # 认证上下文，管理全局认证状态

/components/pages/
  ├── LoginPage.tsx               # 登录页面
  └── AuthCallbackPage.tsx        # OAuth回调处理页面

/App.tsx                          # 主应用，集成认证流程
```

### 认证服务API

```typescript
// 发起SSO登录
initiateLogin(): Promise<void>

// 处理OAuth回调
handleCallback(code: string, state: string): Promise<AuthTokens>

// 用户名密码登录
loginWithPassword(username: string, password: string): Promise<{ tokens: AuthTokens; user: User }>

// 刷新访问令牌
refreshAccessToken(refreshToken: string): Promise<AuthTokens>

// 获取当前用户信息
getCurrentUser(accessToken: string): Promise<User>

// 登出
logout(idToken?: string): Promise<void>

// 检查是否已登录
isAuthenticated(): boolean
```

### 认证上下文API

```typescript
const { 
  user,              // 当前用户信息
  isLoading,         // 加载状态
  isAuthenticated,   // 是否已登录
  login,             // 登录方法
  logout,            // 登出方法
  refreshUser        // 刷新用户信息
} = useAuth();
```

## 用户数据模型

```typescript
interface User {
  id: string;              // 用户ID
  username: string;        // 用户名
  email: string;          // 邮箱
  name: string;           // 显示名称
  avatar?: string;        // 头像URL
  roles: string[];        // 角色列表
  groups: string[];       // 用户组列表
  organization: string;   // 组织
  department?: string;    // 部门
  title?: string;         // 职位
  phone?: string;         // 电话
  createdAt: string;      // 创建时间
  lastLoginAt: string;    // 最后登录时间
}
```

## 权限管理

### 角色说明

- **admin**: 系统管理员，拥有所有权限
- **developer**: 开发者，可创建和管理自己的资源
- **user**: 普通用户，只读权限
- **operator**: 运维人员，管理集群和节点
- **auditor**: 审计员，查看审计日志

### 用户组

用户可以属于多个用户组，用于：
- 资源权限管理（存储卷、GPU池等）
- 计费分组
- 配额管理

## 令牌管理

### 令牌类型

1. **Access Token**: 访问令牌，用于API调用，有效期1小时
2. **Refresh Token**: 刷新令牌，用于获取新的访问令牌，有效期30天
3. **ID Token**: 身份令牌，包含用户信息，用于登出

### 令牌刷新策略

- 访问令牌过期前5分钟自动刷新
- 刷新失败后重定向到登录页
- 使用Refresh Token获取新的Access Token

### 令牌存储

当前实现使用localStorage存储令牌（开发环境）：

```typescript
localStorage.setItem('access_token', tokens.accessToken);
localStorage.setItem('refresh_token', tokens.refreshToken);
localStorage.setItem('id_token', tokens.idToken);
```

**生产环境建议：**
- 使用HttpOnly Cookie存储Refresh Token
- Access Token存储在内存中
- 实现Token Rotation机制

## 安全考虑

### 已实现

✅ PKCE防止授权码拦截  
✅ State参数防止CSRF攻击  
✅ 令牌过期自动刷新  
✅ 登出时清除所有本地令牌  
✅ HTTPS强制使用（生产环境）  

### 建议增强

⚠️ 实施Content Security Policy (CSP)  
⚠️ 实现请求签名机制  
⚠️ 添加设备指纹识别  
⚠️ 实现多因素认证(MFA)  
⚠️ 令牌绑定到客户端证书  

## Keycloak配置

### Realm设置

```json
{
  "realm": "fermi-platform",
  "displayName": "费米集群平台",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 5
}
```

### Client配置

```json
{
  "clientId": "fermi-web-console",
  "name": "费米集群Web控制台",
  "enabled": true,
  "publicClient": true,
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": true,
  "protocol": "openid-connect",
  "redirectUris": [
    "http://localhost:3000/auth/callback",
    "https://console.fermi-cluster.com/auth/callback"
  ],
  "webOrigins": [
    "http://localhost:3000",
    "https://console.fermi-cluster.com"
  ],
  "attributes": {
    "pkce.code.challenge.method": "S256"
  }
}
```

### Mapper配置

添加以下User Attribute Mappers将企业信息映射到Token：

- `organization` → `organization`
- `department` → `department`
- `title` → `title`
- `phone_number` → `phone_number`

## 与企业AD/LDAP集成

Keycloak支持与企业Active Directory或LDAP集成：

### 配置User Federation

1. 登录Keycloak管理控制台
2. 选择Realm: fermi-platform
3. 进入User Federation → Add provider → ldap
4. 配置LDAP连接参数：

```
Connection URL: ldap://ad.company.com:389
Bind DN: cn=keycloak,ou=ServiceAccounts,dc=company,dc=com
Bind Credential: ********
Users DN: ou=Users,dc=company,dc=com
Username LDAP attribute: sAMAccountName
RDN LDAP attribute: cn
UUID LDAP attribute: objectGUID
User Object Classes: person, organizationalPerson, user
```

5. 测试连接并同步用户

## 开发环境配置

### 环境变量

```bash
# .env.local
VITE_AUTH_URL=https://auth.fermi-cluster.com
VITE_AUTH_REALM=fermi-platform
VITE_AUTH_CLIENT_ID=fermi-web-console
VITE_USE_MOCK_AUTH=true  # 开发环境使用模拟认证
```

### 切换到真实Keycloak

修改 `/services/authService.ts`:

```typescript
const USE_MOCK = false; // 改为false使用真实Keycloak
```

## API调用示例

### 在组件中使用认证

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>未登录</div>;
  }

  return (
    <div>
      <p>欢迎, {user.name}</p>
      <p>角色: {user.roles.join(', ')}</p>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

### 使用访问令牌调用API

```typescript
import { getAccessToken } from '../services/authService';

async function callProtectedAPI() {
  const token = getAccessToken();
  
  const response = await fetch('https://api.fermi-cluster.com/v1/clusters', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
}
```

## 故障排查

### 常见问题

**1. 登录后立即退出**
- 检查Token是否正确存储
- 检查Token有效期设置
- 查看浏览器控制台错误信息

**2. OAuth回调失败**
- 确认Redirect URI配置正确
- 检查State参数验证
- 查看Network面板的请求详情

**3. 令牌刷新失败**
- 检查Refresh Token是否过期
- 确认Keycloak配置允许刷新令牌
- 查看Refresh Token有效期设置

**4. CORS错误**
- 在Keycloak Client配置中添加Web Origins
- 确保后端API配置了正确的CORS策略

## 监控和审计

### 登录事件

所有登录事件会记录到审计日志：
- 登录成功/失败
- 登出事件
- 令牌刷新
- 异常认证尝试

### Keycloak事件监控

在Keycloak管理控制台查看：
- Realm Settings → Events → Event Listeners
- 启用记录所有登录事件
- 配置事件保留策略

## 最佳实践

1. **使用SSO登录** - 优先使用企业SSO，提供更好的安全性和用户体验
2. **令牌安全存储** - 生产环境使用HttpOnly Cookie
3. **定期令牌轮换** - 实施Token Rotation机制
4. **最小权限原则** - 仅授予必要的角色和权限
5. **审计日志** - 记录所有认证和授权事件
6. **多因素认证** - 对敏感操作启用MFA
7. **会话超时** - 设置合理的会话超时时间
8. **密码策略** - 在Keycloak中配置强密码策略

## 参考文档

- [Keycloak官方文档](https://www.keycloak.org/documentation)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)

## 技术支持

如有问题，请联系：
- 邮箱: support@fermi-cluster.com
- 企业微信: 费米集群技术支持群
- 文档: https://docs.fermi-cluster.com
