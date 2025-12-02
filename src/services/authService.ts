/**
 * 身份认证服务
 * 集成费米集群身份认证中心（基于Keycloak）
 */

// 用户信息接口
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
  groups: string[];
  organization: string;
  department?: string;
  title?: string;
  phone?: string;
  createdAt: string;
  lastLoginAt: string;
}

// 认证令牌接口
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: string;
}

// Keycloak配置
const KEYCLOAK_CONFIG = {
  url: 'https://auth.fermi-cluster.com', // 费米集群身份认证中心地址
  realm: 'fermi-platform', // Realm名称
  clientId: 'fermi-web-console', // 客户端ID
  redirectUri: window.location.origin + '/auth/callback',
};

// 模拟环境配置（开发/测试使用）
const USE_MOCK = true; // 生产环境设置为false

// ============= OAuth2/OIDC认证流程 =============

/**
 * 生成PKCE验证码
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * 生成PKCE挑战码
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Base64 URL编码
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * 生成随机状态值
 */
function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * 发起SSO登录
 */
export async function initiateLogin(): Promise<void> {
  if (USE_MOCK) {
    // 模拟环境直接跳转到回调
    window.location.href = '/auth/callback?code=mock_code&state=mock_state';
    return;
  }

  // 生成PKCE参数
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // 保存到sessionStorage
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);

  // 构建授权URL
  const authUrl = new URL(`${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/auth`);
  authUrl.searchParams.set('client_id', KEYCLOAK_CONFIG.clientId);
  authUrl.searchParams.set('redirect_uri', KEYCLOAK_CONFIG.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);

  // 跳转到Keycloak登录页面
  window.location.href = authUrl.toString();
}

/**
 * 处理OAuth回调
 */
export async function handleCallback(code: string, state: string): Promise<AuthTokens> {
  if (USE_MOCK) {
    // 模拟环境返回假令牌
    return {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      idToken: 'mock_id_token_' + Date.now(),
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  // 验证state
  const savedState = sessionStorage.getItem('oauth_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter');
  }

  // 获取code verifier
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  if (!codeVerifier) {
    throw new Error('Missing code verifier');
  }

  // 清理sessionStorage
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('oauth_state');

  // 交换授权码获取令牌
  const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: KEYCLOAK_CONFIG.redirectUri,
      client_id: KEYCLOAK_CONFIG.clientId,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange authorization code');
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

/**
 * 刷新访问令牌
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  if (USE_MOCK) {
    return {
      accessToken: 'mock_access_token_refreshed_' + Date.now(),
      refreshToken: refreshToken,
      idToken: 'mock_id_token_refreshed_' + Date.now(),
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: KEYCLOAK_CONFIG.clientId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(accessToken: string): Promise<User> {
  if (USE_MOCK) {
    // 从token中解析用户ID（简单模拟）
    // 在真实环境中，会从JWT token中解析
    const userId = accessToken.split('_')[2] || 'user-admin-001';
    
    // 根据用户ID返回对应的用户信息
    // 这里为了简化，直接返回管理员信息
    // 实际登录时会从 loginWithPassword 获取正确的用户信息
    return {
      id: 'user-admin-001',
      username: 'admin',
      email: 'admin@fermi-cluster.com',
      name: '系统管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      roles: ['admin', 'user'],
      groups: ['系统管理组'],
      organization: '费米科技',
      department: '信息技术部',
      title: '系统管理员',
      phone: '138****0001',
      createdAt: '2024-01-15T10:00:00Z',
      lastLoginAt: new Date().toISOString(),
    };
  }

  const userInfoUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/userinfo`;
  const response = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();

  // 将Keycloak用户信息映射到应用用户模型
  return {
    id: data.sub,
    username: data.preferred_username,
    email: data.email,
    name: data.name,
    avatar: data.picture,
    roles: data.realm_access?.roles || [],
    groups: data.groups || [],
    organization: data.organization || '',
    department: data.department,
    title: data.title,
    phone: data.phone_number,
    createdAt: data.created_at || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
}

/**
 * 登出
 */
export async function logout(idToken?: string): Promise<void> {
  // 清除本地存储
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('user');
  localStorage.removeItem('token_expires_at');
  
  if (USE_MOCK) {
    return;
  }

  // 跳转到Keycloak登出端点
  if (idToken) {
    const logoutUrl = new URL(`${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout`);
    logoutUrl.searchParams.set('id_token_hint', idToken);
    logoutUrl.searchParams.set('post_logout_redirect_uri', window.location.origin);
    window.location.href = logoutUrl.toString();
  } else {
    window.location.href = '/';
  }
}

/**
 * 保存认证信息到本地存储
 */
export function saveAuthTokens(tokens: AuthTokens): void {
  localStorage.setItem('access_token', tokens.accessToken);
  localStorage.setItem('refresh_token', tokens.refreshToken);
  localStorage.setItem('id_token', tokens.idToken);
  localStorage.setItem('token_expires_at', (Date.now() + tokens.expiresIn * 1000).toString());
}

/**
 * 获取保存的访问令牌
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * 获取保存的刷新令牌
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

/**
 * 获取保存的ID令牌
 */
export function getIdToken(): string | null {
  return localStorage.getItem('id_token');
}

/**
 * 检查令牌是否过期
 */
export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem('token_expires_at');
  if (!expiresAt) return true;
  return Date.now() >= parseInt(expiresAt);
}

/**
 * 保存用户信息
 */
export function saveUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * 获取保存的用户信息
 */
export function getSavedUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  try {
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken() && !isTokenExpired();
}

// ============= 用户名密码登录（备用方式） =============

/**
 * 用户名密码登录
 */
export async function loginWithPassword(
  username: string,
  password: string
): Promise<{ tokens: AuthTokens; user: User }> {
  if (USE_MOCK) {
    // 模拟登录验证
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // 测试账号列表
    const testAccounts = {
      // 系统管理员账号
      admin: {
        password: 'admin123',
        user: {
          id: 'user-admin-001',
          username: 'admin',
          email: 'admin@fermi-cluster.com',
          name: '系统管理员',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          roles: ['admin', 'user'],
          groups: ['系统管理组'],
          organization: '费米科技',
          department: '信息技术部',
          title: '系统管理员',
          phone: '138****0001',
          createdAt: '2024-01-01T00:00:00Z',
          lastLoginAt: new Date().toISOString(),
        },
      },
      
      // 普通用户账号
      user: {
        password: 'user123',
        user: {
          id: 'user-regular-001',
          username: 'user',
          email: 'user@fermi-cluster.com',
          name: '张三',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
          roles: ['user'],
          groups: ['AI算法团队'],
          organization: '费米科技',
          department: '人工智能研究院',
          title: '算法工程师',
          phone: '138****0002',
          createdAt: '2024-02-01T00:00:00Z',
          lastLoginAt: new Date().toISOString(),
        },
      },
      
      // 开发者账号
      developer: {
        password: 'dev123',
        user: {
          id: 'user-dev-001',
          username: 'developer',
          email: 'developer@fermi-cluster.com',
          name: '李四',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer',
          roles: ['developer', 'user'],
          groups: ['AI算法团队', '深度学习组'],
          organization: '费米科技',
          department: '人工智能研究院',
          title: '高级算法工程师',
          phone: '138****0003',
          createdAt: '2024-01-15T00:00:00Z',
          lastLoginAt: new Date().toISOString(),
        },
      },
      
      // 运维人员账号
      operator: {
        password: 'ops123',
        user: {
          id: 'user-ops-001',
          username: 'operator',
          email: 'operator@fermi-cluster.com',
          name: '王五',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=operator',
          roles: ['operator', 'user'],
          groups: ['运维团队'],
          organization: '费米科技',
          department: '信息技术部',
          title: '运维工程师',
          phone: '138****0004',
          createdAt: '2024-01-20T00:00:00Z',
          lastLoginAt: new Date().toISOString(),
        },
      },
      
      // 演示账号（保留原有账号）
      demo: {
        password: 'demo123',
        user: {
          id: 'user-demo',
          username: 'demo',
          email: 'demo@fermi-cluster.com',
          name: '演示账号',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
          roles: ['user', 'developer'],
          groups: ['演示团队'],
          organization: '费米科技',
          department: '技术部',
          title: '开发工程师',
          phone: '138****9999',
          createdAt: '2024-01-01T00:00:00Z',
          lastLoginAt: new Date().toISOString(),
        },
      },
    };
    
    // 验证账号密码
    const account = testAccounts[username as keyof typeof testAccounts];
    
    if (account && password === account.password) {
      const tokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        idToken: 'mock_id_token_' + Date.now(),
        expiresIn: 3600,
        tokenType: 'Bearer',
      };

      return { tokens, user: account.user };
    } else {
      throw new Error('用户名或密码错误');
    }
  }

  // 调用Keycloak的Resource Owner Password Credentials流程
  const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: username,
      password: password,
      client_id: KEYCLOAK_CONFIG.clientId,
      scope: 'openid profile email',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || '登录失败');
  }

  const data = await response.json();

  const tokens: AuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };

  // 获取用户信息
  const user = await getCurrentUser(tokens.accessToken);

  return { tokens, user };
}
