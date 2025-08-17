export function isUserAuthenticated(): boolean {
  // Implement your authentication logic here
  return true; // Placeholder return value
}

export function register() {
  fetch("https://solana.wangxiang.work/register/challenge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Use-Name": "Xinyin11",
      "X-Use-Display-Name": "xinyin11@example.com",
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
  fetch("https://solana.wangxiang.work/register/verify", {
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
