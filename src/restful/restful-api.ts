import ky, { type Options, HTTPError, TimeoutError } from 'ky';
import store from '../store/store';
import { logout as logoutAction } from '../store/slice-auth';

interface RestfulError {
  /** error message */
  errMsg: string;
  /** error code in the function, which throw the error */
  code: number;
  /** function name, which throw the error */
  fName: string;
  /** http response status code */
  statusCode: number;
  /** RESTful API path */
  path: string;
}

export enum ApiErrorCode {
  Unknown = 1000,
  Network = 1001,
  Timeout = 1002,
  RestfulError = 1003,
  BrowserApiError = 1004,
  RefreshTokenError = 1005,
  SolanaRpcError = 2001,
}

export class ApiError extends Error {
  code: ApiErrorCode;

  constructor(message: string, code: ApiErrorCode) {
    super(message);
    this.code = code;
  }

  static fromAnyError(error: unknown) {
    if (error instanceof ApiError) {
      return error;
    }
    const message = (error as Error)?.message || 'Unknown error';
    return new ApiError(message, ApiErrorCode.Unknown);
  }

  static fromRestfulError(err: RestfulError) {
    const message = err.errMsg || 'Restful API error without errMsg';
    return new ApiError(message, ApiErrorCode.RestfulError);
  }

  toString() {
    return `ApiError: ${this.message} (code: ${this.code})`;
  }
}

const api = ky.create({
  prefixUrl: import.meta.env.VITE_WEBAUTHN_HOST,
  credentials: 'include',
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          await refreshToken();
          return ky(request, options);
        }
        return response;
      },
    ],
  },
});

const refreshToken = (() => {
  let refreshing: Promise<{ msg: string }> | undefined;

  return function () {
    if (!refreshing) {
      refreshing = ky
        .post(import.meta.env.VITE_WEBAUTHN_HOST + '/token/refresh', {
          credentials: 'include',
        })
        .json<{ msg: string }>()
        .then((data) => {
          return data;
        })
        .catch(async (error) => {
          if (error instanceof HTTPError) {
            const restfulError = await error.response.json<RestfulError>();
            if (restfulError.statusCode === 401) {
              // refresh token also expired
              store.dispatch(logoutAction());
            }
            throw new ApiError(
              restfulError.errMsg,
              ApiErrorCode.RefreshTokenError
            );
          }
          throw ApiError.fromAnyError(error);
        })
        .finally(() => {
          refreshing = undefined;
        });
    }
    return refreshing;
  };
})();

async function request<T>(url: string, options?: Options) {
  try {
    return await api(url, options).json<T>();
  } catch (error) {
    if (error instanceof HTTPError) {
      const restfulError = await error.response.json<RestfulError>();
      throw ApiError.fromRestfulError(restfulError);
    } else if (error instanceof TimeoutError) {
      throw new ApiError('请求超时', ApiErrorCode.Timeout);
    } else if (error instanceof TypeError) {
      throw new ApiError(
        '网络异常，请检查您的网络连接，或稍后重试。',
        ApiErrorCode.Network
      );
    } else {
      throw ApiError.fromAnyError(error);
    }
  }
}

export function post<T>(url: string, options?: Options) {
  return request<T>(url, {
    method: 'POST',
    ...options,
  });
}
