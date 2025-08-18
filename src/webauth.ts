export function isUserAuthenticated(): boolean {
  // Implement your authentication logic here
  return true; // Placeholder return value
}

const host = import.meta.env.VITE_WEBAUTHN_HOST;
// const host = "http://localhost:8787";

export function register() {
  fetch(`${host}/register/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Use-Name": "Xinyin13",
      "X-Use-Display-Name": "xinyin13@example.com",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(async (data) => {
      console.log("register Challenge received:", data);
      const options = PublicKeyCredential.parseCreationOptionsFromJSON(data);
      const credential = await navigator.credentials.create({
        publicKey: options,
      });
      if (credential) {
        registerPK(credential as PublicKeyCredential);
      }
    })
    .catch((error) => {
      console.error("Registration failed:", error);
    });
}

function registerPK(credential: PublicKeyCredential) {
  fetch(`${host}/register/verify`, {
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
      // const pkJSON = JSON.stringify(data);
      console.log("Registration successful:", data);
    })
    .catch((error) => {
      console.error("Registration failed:", error);
    });
}

export function login() {
  fetch(`${host}/login/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
