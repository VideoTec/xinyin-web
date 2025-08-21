interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_WEBAUTHN_HOST: string;
  readonly VITE_SOLANA_PRC_MAINNET_URL: string;
  readonly VITE_SOLANA_PRC_TESTNET_URL: string;
  readonly VITE_SOLANA_PRC_DEVNET_URL: string;
}
