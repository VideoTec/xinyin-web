import { post, ApiError, ApiErrorCode } from './restful-api';

export async function createPasskey(userName: string, displayName: string) {
  const credCreationOptionsJson =
    await post<PublicKeyCredentialCreationOptionsJSON>(
      'webauthn/cred-creation-options',
      {
        json: {
          userName,
          displayName,
        },
      }
    );

  const options = PublicKeyCredential.parseCreationOptionsFromJSON(
    credCreationOptionsJson
  );

  // 通知认证器，创建新的Passkey
  const cred = await navigator.credentials.create({
    publicKey: options,
  });

  if (!cred) {
    throw new ApiError('认证器创建Passkey失败', ApiErrorCode.BrowserApiError);
  }

  return cred as PublicKeyCredential;
}

export async function registerWithPasskey(credential: PublicKeyCredential) {
  const user = await post<{ message: string }>(
    'webauthn/register-with-attested-cred',
    {
      json: credential.toJSON(),
    }
  );
  return user;
}

export async function getCredForUser(userName?: string) {
  const optionsJson = await post<PublicKeyCredentialRequestOptionsJSON>(
    'webauthn/cred-request-options',
    {
      json: {
        userName: userName || '',
      },
    }
  );

  // 通知认证器，查询Passkey
  const cred = await navigator.credentials.get({
    mediation: 'required',
    publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(optionsJson),
  });

  if (!cred) {
    throw new ApiError('没有读取到Passkey', ApiErrorCode.BrowserApiError);
  }
  return cred as PublicKeyCredential;
}

export async function loginWithCredential(credential: PublicKeyCredential) {
  return await post<{ message: string }>('webauthn/login-with-assert-cred', {
    json: credential.toJSON(),
  });
}
