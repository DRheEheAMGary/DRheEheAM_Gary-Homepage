/**
 * WordPress REST API 工具模块
 * 基于 JWT Authentication 插件
 */

const WP_BASE = 'https://blog.dreamgary.cn/wp-json';
const COOKIE_DOMAIN = '.dreamgary.cn';

// ==================== Token 管理（localStorage + 跨子域 Cookie） ====================

const TOKEN_KEY = 'wp_jwt_token';

/** 读取 token：优先从共享 Cookie，fallback 到 localStorage */
export function getToken() {
  const cookie = getSharedCookie(TOKEN_KEY);
  if (cookie) {
    // 同步回 localStorage（新标签页首次加载时）
    if (localStorage.getItem(TOKEN_KEY) !== cookie) {
      localStorage.setItem(TOKEN_KEY, cookie);
    }
    return cookie;
  }
  return localStorage.getItem(TOKEN_KEY);
}

/** 写入 token：同时写入 localStorage 和跨子域 Cookie */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  setSharedCookie(TOKEN_KEY, token, 30); // 30天有效
}

/** 清除 token：同时清除 localStorage 和 Cookie */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  deleteSharedCookie(TOKEN_KEY);
}

// ==================== 跨子域 Cookie 工具 ====================

function setSharedCookie(name, value, days) {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; domain=${COOKIE_DOMAIN}; path=/; Secure; SameSite=Lax`;
}

function getSharedCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteSharedCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${COOKIE_DOMAIN}; path=/; Secure; SameSite=Lax`;
}

// ==================== 通用请求 ====================

async function wpFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${WP_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `请求失败 (${res.status})`);
  }

  return res.json();
}

// ==================== 认证 ====================

/** 登录：用户名 + 密码 → JWT token（走 checkin 接口，含邮箱验证检查） */
export async function login(username, password) {
  const res = await fetch(`${WP_BASE}/checkin/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '登录失败' }));
    throw new Error(err.message || '用户名或密码错误');
  }

  const data = await res.json();
  setToken(data.token);

  return {
    token: data.token,
    email: data.user?.email,
    nicename: data.user?.username,
    displayName: data.user?.name,
    avatar: data.user?.avatar,
  };
}

/** 退出登录 */
export function logout() {
  clearToken();
}

/** 注册：用户名 + 邮箱 + 密码 + turnstileToken → 新用户 */
export async function register(username, email, password, turnstileToken) {
  const res = await fetch(`${WP_BASE}/checkin/v1/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, turnstile_token: turnstileToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '注册失败' }));
    throw new Error(err.message || '注册失败，请重试');
  }

  return res.json();
}

/** 验证 Turnstile token */
export async function verifyTurnstile(token) {
  const res = await fetch(`${WP_BASE}/checkin/v1/verify-turnstile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '人机验证失败' }));
    throw new Error(err.message || '人机验证失败');
  }

  return res.json();
}

/** 验证并获取当前用户信息 */
export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    // 先验证 token 是否有效
    await fetch(`${WP_BASE}/jwt-auth/v1/token/validate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (!res.ok) throw new Error('token 失效');
      return res.json();
    });

    // 获取用户信息
    const user = await wpFetch('/wp/v2/users/me');
    return {
      id: user.id,
      name: user.name,
      slug: user.slug,
      avatar: user.avatar_urls?.['96'] || null,
    };
  } catch {
    clearToken();
    return null;
  }
}

// ==================== 打卡数据 ====================

/** 获取所有打卡日期 */
export async function getCheckinDates() {
  const token = getToken();
  if (!token) return [];
  try {
    return await wpFetch('/checkin/v1/dates');
  } catch {
    return [];
  }
}

/** 添加今日打卡日期 */
export async function addCheckinDate(dateStr) {
  return wpFetch('/checkin/v1/dates', {
    method: 'POST',
    body: JSON.stringify({ date: dateStr }),
  });
}

/** 获取今日运势 */
export async function getDailyFortune() {
  const token = getToken();
  if (!token) return null;
  try {
    return await wpFetch('/checkin/v1/fortune');
  } catch {
    return null;
  }
}

/** 保存今日运势 */
export async function saveDailyFortune(fortune) {
  return wpFetch('/checkin/v1/fortune', {
    method: 'POST',
    body: JSON.stringify(fortune),
  });
}
