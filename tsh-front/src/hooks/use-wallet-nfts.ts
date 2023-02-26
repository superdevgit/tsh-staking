/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import * as anchor from "@project-serum/anchor";
import { getNftsForOwner, getNftsForOwner1 } from '../utils/candy-machine';
import useWalletBalance from './use-wallet-balance';
import { NEXT_PUBLIC_SOLANA_NETWORK } from '../constant/env';
import { printLog } from '../utils/utility';

const connection = new anchor.web3.Connection(NEXT_PUBLIC_SOLANA_NETWORK == "mainnet" ? "https://orbital-lingering-pond.solana-mainnet.quiknode.pro/de5c3bde1794fe765c51fe13fc691f39921060db/" : "https://metaplex.devnet.rpcpool.com");

const useWalletNfts = () => {
  const [balance] = useWalletBalance();
  const wallet = useWallet();
  const [isLoadingWalletNfts, setIsLoadingWalletNfts] = useState(false);
  const [staked_walletNfts, setStakedWalletNfts] = useState<Array<any>>([]);
  const [unstaked_walletNfts, setUnstakedWalletNfts ] = useState<Array<any>>([]);

  useEffect(() => {
    getWalletNfts()
  }, [wallet, balance])
  const getWalletNfts = async () => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }
    printLog('loading nfts from wallet')
    setIsLoadingWalletNfts(true);
    const nftsForOwner = await getNftsForOwner1(wallet.publicKey);
    // const nftsForOwner = await getNftsForOwner(connection, wallet.publicKey);
    let stakedNfts = [];
    let unstakedNfts = []
    
    for(let i = 0; i < nftsForOwner.length; i++)
    {
      const accountInfo = await connection.getParsedAccountInfo(nftsForOwner[i].account);
      //@ts-ignore
      if(accountInfo.value?.data.parsed.info.state === 'frozen')
      {
        stakedNfts.push(nftsForOwner[i]);
      }
      else
      {
        unstakedNfts.push(nftsForOwner[i]);
      } 
    }

    setStakedWalletNfts(stakedNfts);
    setUnstakedWalletNfts(unstakedNfts);
    setIsLoadingWalletNfts(false);
  }

  return { isLoadingWalletNfts, staked_walletNfts, unstaked_walletNfts, setStakedWalletNfts, setUnstakedWalletNfts, getWalletNfts };
}

export default useWalletNfts;