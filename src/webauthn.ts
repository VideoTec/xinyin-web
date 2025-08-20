import { getData, getErrorMsg } from "./restfullUtils";

const host = import.meta.env.VITE_WEBAUTHN_HOST;

export async function createPasskey(userName: string, displayName: string) {
  const response = await fetch(`${host}/register/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Use-Name": userName,
      "X-Use-Display-Name": displayName,
    },
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
    const errMsg = await getErrorMsg(response);
    throw new Error(errMsg);
  }
  return await getData<{ userName: string }>(response);
}

export function login(userName?: string) {
  fetch(`${host}/login/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Use-Name": userName || "",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(async (data) => {
      console.log("Challenge received:", data);
      const options = PublicKeyCredential.parseRequestOptionsFromJSON(data);
      const credential = await navigator.credentials.get({
        mediation: "required",
        publicKey: options,
      });
      if (credential) {
        console.log("get Credential:", credential);
        loginPK(credential as PublicKeyCredential);
      }
    })
    .catch((error) => {
      console.error("Login failed:", error);
    });
}

function loginPK(credential: PublicKeyCredential) {
  fetch(`${host}/login/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential.toJSON()),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then(async (data) => {
      console.log("Login successful:", data);
    })
    .catch((error) => {
      console.error("Login failed:", error.message);
    });
}
