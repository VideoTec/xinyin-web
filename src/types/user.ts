/**
 * 用户相关类型定义
 */
export interface UserInfo {
  userId: string;
  userName: string;
  displayName: string;
}

/**
 * 认证状态
 */
export interface AuthState {
  user: UserInfo | null;
  status: 'idle' | 'loggedIn' | 'loggedOut';
}
