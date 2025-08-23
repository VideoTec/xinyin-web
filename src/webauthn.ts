import { getData, getErrorMsg } from "./restfullUtils";

const host = import.meta.env.VITE_WEBAUTHN_HOST;

export async function createPasskey(userName: string, displayName: string) {
  const response = await fetch(`${host}/register/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName,
      displayName,
    }),
  });
  if (!response.ok) {
    const errMsg = await getErrorMsg(response);
    throw new Error(errMsg);
  }
  const data = await getData<PublicKeyCredentialCreationOptionsJSON>(response);
  const options = PublicKeyCredential.parseCreationOptionsFromJSON(data);
  const cred = await navigator.credentials.create({
    publicKey: options,
  });
  if (!cred) {
    throw new Error("Failed to create credential");
  }
  return cred as PublicKeyCredential;
}

export async function registerWithPasskey(credential: PublicKeyCredential) {
  const response = await fetch(`${host}/register/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential.toJSON()),
  });
  if (!response.ok) {
    throw new Error(await getErrorMsg(response));
  }
  return await getData<{ userName: string }>(response);
}

export async function getCredForUser(userName?: string) {
  const response = await fetch(`${host}/login/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName: userName || "",
    }),
  });
  if (!response.ok) {
    throw new Error(await getErrorMsg(response));
  }
  const data = await getData<PublicKeyCredentialRequestOptionsJSON>(response);
  const cred = await navigator.credentials.get({
    mediation: "required",
    publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(data),
  });
  if (!cred) {
    throw new Error("没有读取到Passkey");
  }
  return cred as PublicKeyCredential;
}

export async function loginWithCredential(credential: PublicKeyCredential) {
  const response = await fetch(`${host}/login/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential.toJSON()),
  });
  if (!response.ok) {
    throw new Error(await getErrorMsg(response));
  }
  return await getData<{ userName: string; accessToken: string }>(response);
}
