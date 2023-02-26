
import * as anchor from '@project-serum/anchor';
import {Wallet} from '@project-serum/anchor';
import { Commitment, ConnectionConfig } from '@solana/web3.js';
import { DADDYSTAKING_IDL } from './contract';
const { PublicKey, Keypair, Connection, SystemProgram } = anchor.web3;

const DEV_KEY = [110,43,101,113,219,111,48,196,84,120,170,65,67,17,190,134,47,126,156,140,49,102,164,187,243,182,153,137,239,90,150,209,228,229,251,205,83,26,246,232,70,65,62,49,231,221,163,229,195,28,225,212,239,54,63,131,255,26,252,143,154,53,27,51];
const MAIN_KEY = [110,43,101,113,219,111,48,196,84,120,170,65,67,17,190,134,47,126,156,140,49,102,164,187,243,182,153,137,239,90,150,209,228,229,251,205,83,26,246,232,70,65,62,49,231,221,163,229,195,28,225,212,239,54,63,131,255,26,252,143,154,53,27,51];

const DEV_ENV = {
  CLUSTER_API: 'https://api.devnet.solana.com',
  PROGRAM_ID: 'CZDNp3c2VPHXmcpd9GpU8dBaTFQayLSgdcefLyd8JfbK',
  ADMIN: DEV_KEY 
};

const MAIN_ENV = {
  CLUSTER_API: 'https://orbital-lingering-pond.solana-mainnet.quiknode.pro/de5c3bde1794fe765c51fe13fc691f39921060db/',
  PROGRAM_ID: 'CZDNp3c2VPHXmcpd9GpU8dBaTFQayLSgdcefLyd8JfbK',
  ADMIN: MAIN_KEY 
};

const ENV = MAIN_ENV;
const GLOBAL_AUTHORITY_SEED = "global-authority-1";

(async () => {

  const seed = Uint8Array.from(ENV.ADMIN.slice(0, 32));
  const UPDATE_AUTHORITY = Keypair.fromSeed(seed);

  
  const connection = new Connection(ENV.CLUSTER_API, {
    skipPreflight: true,
    preflightCommitment: 'confirmed' as Commitment,
  } as ConnectionConfig );

  const provider = new anchor.Provider(connection, new Wallet(UPDATE_AUTHORITY), {
    skipPreflight: true,
    preflightCommitment: 'confirmed' as Commitment,
  } as ConnectionConfig);
  const program = new anchor.Program(DADDYSTAKING_IDL, new PublicKey(ENV.PROGRAM_ID), provider);

  const [globalAuthority, globalBump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const result = await program.rpc.initialize(
    {
    accounts: {
      globalAuthority: globalAuthority,
      owner: provider.wallet.publicKey, // Admin wallet
      systemProgram: SystemProgram.programId
    }
  })
  console.log('result', result);
})()