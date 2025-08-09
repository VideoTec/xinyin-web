export function isUserAuthenticated(): boolean {
  // Implement your authentication logic here
  return true; // Placeholder return value
}

export function register() {
  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
    {
      challenge: new Uint8Array([
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      ]),
      rp: {
        name: "示例网站",
      },
      user: {
        id: new Uint8Array([1, 2, 3, 4]),
        name: "user@localhost",
        displayName: "user",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "preferred",
        residentKey: "preferred",
      },
      timeout: 60000,
    };

  navigator.credentials
    .create({ publicKey: publicKeyCredentialCreationOptions })
    .then((credential) => {
      // 将凭证发送到服务器
      console.log("凭证:", credential);
    })
    .catch((error) => console.error("注册失败:", error));
}
