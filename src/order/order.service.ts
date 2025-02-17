import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateOrderDto } from "./dto";
import { InjectModel } from "@nestjs/mongoose";
import {
  AavTransferStatus,
  Order,
  PaymentStatus,
} from "src/mongoose/schemas/order.schema";
import { Model } from "mongoose";
import { UserDto } from "src/auth/dto";
import { AuthService } from "src/auth/auth.service";
import { PricesHelper } from "src/helpers/prices";
import { HttpService } from "@nestjs/axios";
import { SolanaHelper } from "src/helpers/solana";
import * as web3 from "@solana/web3.js";
import bs58 from "bs58";
import { ConfigService } from "@nestjs/config";
import { createTransferInstruction } from "@solana/spl-token";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { Transaction, Connection, PublicKey, Keypair } from "@solana/web3.js";

@Injectable()
export class OrderService {
  private pricesHelper: PricesHelper;
  private solanaHelper: SolanaHelper;
  constructor(
    @InjectModel(Order.name) private OrderModel: Model<Order>,
    private authService: AuthService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.pricesHelper = new PricesHelper(this.httpService);
    this.solanaHelper = new SolanaHelper();
  }

  async create(user: UserDto, createOrderDto: CreateOrderDto) {
    try {
      const existingUser = await this.authService.findOne({ _id: user.id });

      if (!existingUser) {
        throw new HttpException("User not found", HttpStatus.BAD_REQUEST);
      }

      const order = await this.createOrder({
        user: existingUser,
        wertOrderId: createOrderDto.wertOrderId,
      });

      return order;
    } catch (error) {
      throw new HttpException(
        error?.message || "Internal server error",
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  async findByOrderId(user: UserDto, id: string) {
    const order = await this.findOne({
      wertOrderId: id,
    });

    if (!order) {
      throw new HttpException("Order not found", HttpStatus.BAD_REQUEST);
    }

    return order;
  }

  findAll() {
    return this.OrderModel.find();
  }

  findOne(payload: any) {
    return this.OrderModel.findOne(payload).populate("user");
  }

  update(id: any, updateOrderDto: any) {
    return this.OrderModel.updateOne(
      {
        _id: id,
      },
      updateOrderDto
    );
  }

  async createOrder(payload: any) {
    return this.OrderModel.create(payload);
  }

  async wertWebhook(payload: any) {
    console.log("🚀 ~ OrderService ~ wertWebhook ~ payload:", payload);
    const order = await this.findOne({ wertOrderId: payload?.order?.id });

    if (!order) {
      return "Order not found";
    }

    if (payload?.type === "order_failed") {
      await this.update(order._id, {
        paymentStatus: PaymentStatus.FAILED,
        paymentErrorMessage: payload?.order?.error_code,
        aavTransferStatus: AavTransferStatus.FAILED,
      });
    }

    if (payload?.type === "order_canceled") {
      await this.update(order._id, {
        paymentStatus: PaymentStatus.CANCELLED,
        paymentErrorMessage:
          payload?.order?.error_code || "Order canceled by user",
        aavTransferStatus: AavTransferStatus.FAILED,
      });
    }

    if (payload?.type === "tx_smart_contract_failed") {
      await this.update(order._id, {
        paymentStatus: PaymentStatus.FAILED,
        paymentErrorMessage:
          payload?.order?.error_code ||
          "Transaction failed on chain to transfer USDT",
        aavTransferStatus: AavTransferStatus.FAILED,
      });
    }

    if (payload?.type === "order_complete") {
      let baseAsset = payload?.order?.base;
      let usdtAmount = payload?.order?.base_amount;

      if (baseAsset === "ETH") {
        const ethPriceInUsdt = await this.pricesHelper.getEthPrice();
        // calculate USDT value by multiplying ETH amount with ETH price in USDT
        usdtAmount = +ethPriceInUsdt * +usdtAmount;
      }

      await this.update(order._id, {
        paymentStatus: PaymentStatus.COMPLETED,
        usdtAmount: usdtAmount,
      });

      const wallets = await this.getWalletAssets();
      const presaleInfo: any = await this.getPresaleInfo();
      if (!presaleInfo) {
        await this.update(order._id, {
          aavTransferStatus: AavTransferStatus.FAILED,
          aavTransferErrorMessage: "Failed to fetch presale information",
        });
        return;
      }

      let aavRate = Number(presaleInfo?.pricePerTokenInUsdc) / 1e6;
      if (isNaN(aavRate) || aavRate <= 0) {
        await this.update(order._id, {
          aavTransferStatus: AavTransferStatus.FAILED,
          aavTransferErrorMessage: "Invalid token price configuration",
        });
        return;
      }

      const aavAmount = Number(usdtAmount / aavRate).toFixed(8);
      if (isNaN(Number(aavAmount)) || Number(aavAmount) <= 0) {
        await this.update(order._id, {
          aavTransferStatus: AavTransferStatus.FAILED,
          aavTransferErrorMessage: "Invalid token amount calculation",
        });
        return;
      }

      try {
        const signature = await this.transferToken(
          order.user.walletAddress,
          +aavAmount,
          wallets.tokens[0].mint
        );

        await this.update(order._id, {
          aavTransferStatus: AavTransferStatus.COMPLETED,
          aavTransferedTo: order.user.walletAddress,
          aavTransferHash: signature.signature,
          aavTransferAmount: aavAmount,
          aavTransferFee: signature.estimatedFee,
        });
      } catch (error) {
        await this.update(order._id, {
          aavTransferStatus: AavTransferStatus.FAILED,
          aavTransferErrorMessage:
            error?.message || "Failed to transfer AAV to user wallet",
        });
      }
    }
  }

  async getWalletAssets() {
    try {
      const connection = new web3.Connection(
        this.configService.get("solana.rpcUrl"),
        "confirmed"
      );

      const fromKeypair = web3.Keypair.fromSecretKey(
        bs58.decode(this.configService.get("solana.privateKey"))
      );

      // Get SOL balance
      const solBalance = await connection.getBalance(fromKeypair.publicKey);
      const solBalanceInSol = solBalance / web3.LAMPORTS_PER_SOL;

      // Get all token accounts owned by this wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        fromKeypair.publicKey,
        {
          programId: new web3.PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ), // Token Program ID
        }
      );

      const assets = {
        solana: solBalanceInSol,
        tokens: tokenAccounts.value.map((account) => ({
          mint: account.account.data.parsed.info.mint,
          amount: account.account.data.parsed.info.tokenAmount.uiAmount,
          decimals: account.account.data.parsed.info.tokenAmount.decimals,
        })),
      };

      return assets;
    } catch (error) {
      throw new HttpException(
        error?.message || "Failed to fetch wallet assets",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async transferToken(
    recipientAddress: string,
    amount: number,
    mintAddress: string
  ) {
    try {
      const connection = new web3.Connection(
        this.configService.get("solana.rpcUrl"),
        "confirmed"
      );

      const fromKeypair = web3.Keypair.fromSecretKey(
        bs58.decode(this.configService.get("solana.privateKey"))
      );

      // Check SOL balance first
      const solBalance = await connection.getBalance(fromKeypair.publicKey);
      console.log("🚀 ~ OrderService ~ solBalance:", solBalance);

      if (solBalance < web3.LAMPORTS_PER_SOL * 0.01) {
        // Ensure at least 0.01 SOL for fees
        throw new Error("Insufficient SOL balance for transaction fees");
      }

      // Convert the recipient address to proper Solana address format
      let recipientPublicKey;
      try {
        // Try to create PublicKey directly first
        recipientPublicKey = new web3.PublicKey(recipientAddress);
      } catch (error) {
        // If direct creation fails, try to normalize the address
        try {
          const normalizedAddress = recipientAddress.toLowerCase();
          recipientPublicKey = new web3.PublicKey(normalizedAddress);
        } catch (innerError) {
          throw new Error(
            `Invalid recipient address format: ${recipientAddress}. Please provide a valid Solana address.`
          );
        }
      }

      // Ensure recipient address is a valid PublicKey
      const mintPublicKey = new web3.PublicKey(mintAddress);

      // Get the token account of sender
      const fromTokenAccounts = await connection.getParsedTokenAccountsByOwner(
        fromKeypair.publicKey,
        { mint: mintPublicKey }
      );

      if (fromTokenAccounts.value.length === 0) {
        throw new Error("Sender doesn't have a token account for this mint");
      }

      // Check token balance before transfer
      const fromTokenAccount = fromTokenAccounts.value[0];
      const tokenBalance =
        fromTokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
      const rawTokenBalance =
        fromTokenAccount.account.data.parsed.info.tokenAmount.amount;

      if (Number(rawTokenBalance) < amount) {
        throw new Error(
          `Insufficient token balance. Available: ${tokenBalance}, Requested: ${amount}`
        );
      }

      const fromTokenAccountPubkey = fromTokenAccount.pubkey;

      // Get or create token account for recipient
      let toTokenAccount;
      const toTokenAccounts = await connection.getParsedTokenAccountsByOwner(
        recipientPublicKey,
        { mint: mintPublicKey }
      );

      if (toTokenAccounts.value.length === 0) {
        // Create Associated Token Account for recipient
        const ata = await this.solanaHelper.createAssociatedTokenAccount(
          connection,
          fromKeypair,
          mintPublicKey,
          recipientPublicKey
        );
        toTokenAccount = ata;
      } else {
        toTokenAccount = toTokenAccounts.value[0].pubkey;
      }

      // Get token decimals from the mint account
      const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);
      const decimals = (mintInfo.value?.data as any).parsed.info.decimals;

      // Convert amount to integer considering decimals
      const rawAmount = Math.floor(amount * Math.pow(10, decimals));
      console.log("🚀 ~ OrderService ~ amount:", amount);
      console.log("🚀 ~ OrderService ~ rawAmount:", rawAmount);

      // Create transfer instruction with the raw integer amount
      const transferInstruction = createTransferInstruction(
        fromTokenAccountPubkey,
        toTokenAccount,
        fromKeypair.publicKey,
        rawAmount, // Use the converted integer amount
        [],
        new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      );

      // Create and sign transaction
      const transaction = new web3.Transaction().add(transferInstruction);
      transaction.feePayer = fromKeypair.publicKey;

      const blockHash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockHash.blockhash;

      // Estimate transaction fee before sending
      const { value: fees } = await connection.getFeeForMessage(
        transaction.compileMessage(),
        "confirmed"
      );

      // Sign and send transaction
      const signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [fromKeypair],
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
          maxRetries: 5,
        }
      );

      return {
        signature,
        transaction,
        estimatedFee: fees / web3.LAMPORTS_PER_SOL,
      };
    } catch (error) {
      console.error("Transfer token error:", error);
      // Add more detailed error information
      const errorMessage = error?.message || "Failed to transfer token";
      console.error("Full error details:", {
        message: errorMessage,
        logs: error?.logs,
        errorCode: error?.code,
      });
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getProvider() {
    const connection = new Connection(
      this.configService.get("solana.rpcUrl"),
      "confirmed"
    );

    // Create wallet from private key
    const wallet = {
      publicKey: Keypair.fromSecretKey(
        bs58.decode(this.configService.get("solana.privateKey"))
      ).publicKey,
      signTransaction: async (tx: Transaction) => {
        const keypair = Keypair.fromSecretKey(
          bs58.decode(this.configService.get("solana.privateKey"))
        );
        tx.sign(keypair);
        return tx;
      },
      signAllTransactions: async (txs: Transaction[]) => {
        const keypair = Keypair.fromSecretKey(
          bs58.decode(this.configService.get("solana.privateKey"))
        );
        txs.forEach((tx) => tx.sign(keypair));
        return txs;
      },
    };

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });
    return provider;
  }

  private getProgram() {
    const provider = this.getProvider();
    const idl = {
      version: "0.1.0",
      name: "solana_presale",
      instructions: [
        {
          name: "initializer",
          accounts: [
            { name: "presale", isMut: true, isSigner: false },
            { name: "staking", isMut: true, isSigner: false },
            { name: "presaleTokenAccount", isMut: true, isSigner: false },
            { name: "stakingTokenAccount", isMut: true, isSigner: false },
            { name: "tokenMint", isMut: false, isSigner: false },
            { name: "presaleUsdcAccount", isMut: true, isSigner: false },
            { name: "usdcMint", isMut: true, isSigner: false },
            { name: "signer", isMut: true, isSigner: true },
            { name: "tokenProgram", isMut: false, isSigner: false },
            { name: "systemProgram", isMut: false, isSigner: false },
            { name: "associatedTokenProgram", isMut: false, isSigner: false },
          ],
          args: [
            { name: "startTime", type: "u64" },
            { name: "pricePerTokenInSol", type: "u64" },
            { name: "pricePerTokenInUsdc", type: "u64" },
          ],
        },
        {
          name: "invest",
          accounts: [
            { name: "data", isMut: true, isSigner: false },
            { name: "presale", isMut: true, isSigner: false },
            { name: "from", isMut: true, isSigner: true },
            { name: "signer", isMut: true, isSigner: true },
            { name: "presaleUsdcAccount", isMut: true, isSigner: false },
            { name: "signerUsdcAccount", isMut: true, isSigner: false },
            { name: "usdcMint", isMut: true, isSigner: false },
            { name: "presaleTokenAccount", isMut: true, isSigner: false },
            { name: "signerTokenAccount", isMut: true, isSigner: false },
            { name: "tokenMint", isMut: true, isSigner: false },
            { name: "tokenProgram", isMut: false, isSigner: false },
            { name: "systemProgram", isMut: false, isSigner: false },
            { name: "associatedTokenProgram", isMut: false, isSigner: false },
          ],
          args: [
            { name: "value", type: "u64" },
            { name: "paymentToken", type: "u8" },
          ],
        },
        {
          name: "buyAndStake",
          accounts: [
            { name: "investmentData", isMut: true, isSigner: false },
            { name: "stakingData", isMut: true, isSigner: false },
            { name: "presale", isMut: true, isSigner: false },
            { name: "staking", isMut: true, isSigner: false },
            { name: "from", isMut: true, isSigner: true },
            { name: "signer", isMut: true, isSigner: true },
            { name: "tokenMint", isMut: true, isSigner: false },
            { name: "presaleTokenAccount", isMut: true, isSigner: false },
            { name: "stakingTokenAccount", isMut: true, isSigner: false },
            { name: "signerTokenAccount", isMut: true, isSigner: false },
            { name: "usdcMint", isMut: false, isSigner: false },
            { name: "presaleUsdcAccount", isMut: true, isSigner: false },
            { name: "signerUsdcAccount", isMut: true, isSigner: false },
            { name: "tokenProgram", isMut: false, isSigner: false },
            { name: "systemProgram", isMut: false, isSigner: false },
            { name: "associatedTokenProgram", isMut: false, isSigner: false },
          ],
          args: [
            { name: "value", type: "u64" },
            { name: "paymentToken", type: "u8" },
          ],
        },
        {
          name: "stake",
          accounts: [
            { name: "stakingData", isMut: true, isSigner: false },
            { name: "from", isMut: true, isSigner: true },
            { name: "staking", isMut: true, isSigner: false },
            { name: "stakingTokenAccount", isMut: true, isSigner: false },
            { name: "signerTokenAccount", isMut: true, isSigner: false },
            { name: "signer", isMut: true, isSigner: true },
            { name: "tokenMint", isMut: true, isSigner: false },
            { name: "tokenProgram", isMut: false, isSigner: false },
            { name: "systemProgram", isMut: false, isSigner: false },
            { name: "associatedTokenProgram", isMut: false, isSigner: false },
          ],
          args: [{ name: "amount", type: "u64" }],
        },
        {
          name: "unstakeAndClaimRewards",
          accounts: [
            { name: "stakingData", isMut: true, isSigner: false },
            { name: "from", isMut: true, isSigner: true },
            { name: "staking", isMut: true, isSigner: false },
            { name: "stakingTokenAccount", isMut: true, isSigner: false },
            { name: "signerTokenAccount", isMut: true, isSigner: false },
            { name: "signer", isMut: true, isSigner: true },
            { name: "tokenMint", isMut: true, isSigner: false },
            { name: "tokenProgram", isMut: false, isSigner: false },
            { name: "systemProgram", isMut: false, isSigner: false },
            { name: "associatedTokenProgram", isMut: false, isSigner: false },
          ],
          args: [],
        },
        {
          name: "allowClaiming",
          accounts: [
            { name: "signer", isMut: true, isSigner: true },
            { name: "staking", isMut: true, isSigner: false },
          ],
          args: [{ name: "toggle", type: "bool" }],
        },
        {
          name: "changePrice",
          accounts: [
            { name: "signer", isMut: true, isSigner: true },
            { name: "presale", isMut: true, isSigner: false },
          ],
          args: [
            { name: "solPrice", type: "u64" },
            { name: "usdcPrice", type: "u64" },
          ],
        },
        {
          name: "togglePresale",
          accounts: [
            { name: "signer", isMut: true, isSigner: true },
            { name: "presale", isMut: true, isSigner: false },
          ],
          args: [{ name: "toggle", type: "bool" }],
        },
        {
          name: "updateTokenAddress",
          accounts: [
            { name: "signer", isMut: true, isSigner: true },
            { name: "tokenMint", isMut: false, isSigner: false },
            { name: "presale", isMut: true, isSigner: false },
          ],
          args: [],
        },
        {
          name: "adminWithdrawTokens",
          accounts: [
            { name: "signer", isMut: true, isSigner: true },
            { name: "stakingTokenAccount", isMut: true, isSigner: false },
            { name: "presaleTokenAccount", isMut: true, isSigner: false },
            { name: "presale", isMut: true, isSigner: false },
            { name: "signerTokenAccount", isMut: true, isSigner: false },
            { name: "staking", isMut: true, isSigner: false },
            { name: "tokenMint", isMut: true, isSigner: false },
            { name: "tokenProgram", isMut: false, isSigner: false },
            { name: "systemProgram", isMut: false, isSigner: false },
            { name: "associatedTokenProgram", isMut: false, isSigner: false },
          ],
          args: [],
        },
        {
          name: "adminWithdrawUsdcAndSol",
          accounts: [
            { name: "signer", isMut: true, isSigner: true },
            { name: "presale", isMut: true, isSigner: false },
            { name: "presaleUsdcAccount", isMut: true, isSigner: false },
            { name: "signerUsdcAccount", isMut: true, isSigner: false },
            { name: "usdcMint", isMut: true, isSigner: false },
            { name: "systemProgram", isMut: false, isSigner: false },
            { name: "tokenProgram", isMut: false, isSigner: false },
            { name: "associatedTokenProgram", isMut: false, isSigner: false },
          ],
          args: [],
        },
      ],
      accounts: [
        {
          name: "StakingInfo",
          type: {
            kind: "struct",
            fields: [
              { name: "tokenMint", type: "publicKey" },
              { name: "authority", type: "publicKey" },
              { name: "totalTokensStaked", type: "u64" },
              { name: "totalTokensRewarded", type: "u64" },
              { name: "stakingStartDate", type: "u64" },
              { name: "allowClaiming", type: "bool" },
            ],
          },
        },
        {
          name: "StakingData",
          type: {
            kind: "struct",
            fields: [
              { name: "totalStakingBalance", type: "u64" },
              { name: "stakeDate", type: "u64" },
              { name: "isFirstTime", type: "bool" },
            ],
          },
        },
        {
          name: "PresaleInfo",
          type: {
            kind: "struct",
            fields: [
              { name: "tokenMint", type: "publicKey" },
              { name: "solAmountRaised", type: "u64" },
              { name: "usdcAmountRaised", type: "u64" },
              { name: "totalTokensSold", type: "u64" },
              { name: "startTime", type: "u64" },
              { name: "pricePerTokenInSol", type: "u64" },
              { name: "pricePerTokenInUsdc", type: "u64" },
              { name: "isLive", type: "bool" },
              { name: "isInitialized", type: "bool" },
              { name: "authority", type: "publicKey" },
            ],
          },
        },
        {
          name: "InvestmentData",
          type: {
            kind: "struct",
            fields: [
              { name: "solInvestmentAmount", type: "u64" },
              { name: "usdcInvestmentAmount", type: "u64" },
              { name: "numberOfTokens", type: "u64" },
            ],
          },
        },
      ],
      errors: [
        { code: 6000, name: "InsufficientFunds", msg: "Insufficient funds" },
        { code: 6001, name: "PresaleNotLive", msg: "Presale not live" },
        { code: 6002, name: "PresaleNotStarted", msg: "Presale not started" },
        { code: 6003, name: "Unauthorized", msg: "Unauthorized" },
        { code: 6004, name: "AlreadyInitialized", msg: "AlreadyInitialized" },
        { code: 6005, name: "WrongTime", msg: "WrongTime" },
        { code: 6006, name: "WrongAmount", msg: "WrongAmount" },
        { code: 6007, name: "InvalidToken", msg: "Invalid Token" },
        {
          code: 6008,
          name: "Overflow",
          msg: "Overflow error in reward calculation",
        },
        { code: 6009, name: "ZeroAmount", msg: "Zero staking amount" },
        { code: 6010, name: "StakingNotLive", msg: "Staking not live" },
        { code: 6011, name: "ClaimLocked", msg: "ClaimLocked" },
        { code: 6012, name: "NoRewards", msg: "NoRewards" },
      ],
    };

    if (!idl || !idl.instructions) {
      console.error("IDL content:", idl);
      throw new Error("Invalid IDL configuration");
    }

    const processedIdl = {
      ...idl,
      instructions: idl.instructions.map((ix) => ({
        ...ix,
        discriminant: undefined,
        state: undefined,
      })),
    };

    return new Program(
      processedIdl as any,
      new PublicKey(this.configService.get("solana.programId")),
      provider
    );
  }

  async getPresaleInfo() {
    try {
      const PRESALE_SEED = "solana_presale";
      const program = this.getProgram();
      const [presalePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from(PRESALE_SEED)],
        new PublicKey(this.configService.get("solana.programId"))
      );

      // Add error handling for account fetch
      try {
        const presaleData = await program.account.presaleInfo.fetch(presalePda);
        return presaleData;
      } catch (fetchError) {
        console.error("Error fetching presale account:", fetchError);
        return null;
      }
    } catch (error) {
      console.error("Error in getPresaleInfo:", error);
      return null;
    }
  }
}
