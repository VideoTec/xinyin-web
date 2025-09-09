import type { UserInfo } from '../types/user';
import { post } from './restful-api';
import store from '../store/store';
import { login as loginAction } from '../store/slice-auth';

export async function getMe() {
  try {
    const user = await post<UserInfo>('auth/me');
    store.dispatch(loginAction(user));
  } catch (error) {
    console.log('Error fetching user info:', error);
  }
}
