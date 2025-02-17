import * as web3 from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

export class SolanaHelper {
  async createAssociatedTokenAccount(
    connection: web3.Connection,
    payer: web3.Keypair,
    mintPubkey: web3.PublicKey,
    ownerPubkey: web3.PublicKey
  ): Promise<web3.PublicKey> {
    // Get the associated token account address
    const ata = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);

    // Create the instruction to create ATA
    const ix = createAssociatedTokenAccountInstruction(
      payer.publicKey,
      ata,
      ownerPubkey,
      mintPubkey
    );

    // Create and send transaction
    const tx = new web3.Transaction().add(ix);
    await web3.sendAndConfirmTransaction(connection, tx, [payer]);

    return ata;
  }
}
