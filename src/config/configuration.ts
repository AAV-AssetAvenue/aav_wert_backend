export default () => ({
  environment: process.env.ENVIRONMENT || "development",
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    jwtSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  },
  solana: {
    privateKey: process.env.WALLET_PRIVATE_KEY,
    rpcUrl: process.env.SOLANA_RPC_URL,
    programId: process.env.SOLANA_PROGRAM_ID,
  },
});