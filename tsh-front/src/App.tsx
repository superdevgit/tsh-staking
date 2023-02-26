import "./App.css";
import Navbar from "./Components/Views/Navbar";
import Home from "./Components/Views/Home";

import Footer from "./Components/Views/Footer";
import { Route, Routes } from "react-router-dom";
import Admin from "./Components/Views/Admin";

import { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletBalanceProvider } from "./hooks/use-wallet-balance";
import { NEXT_PUBLIC_SOLANA_NETWORK } from "./constant/env";
import { Toaster } from 'react-hot-toast';


let WALLETS: any = {
  getPhantomWallet: () => ({ name: "Phantom" }),
  getSolflareWallet: () => ({ name: "Solflare" }),
  getSolletWallet: () => ({ name: "Sollet" }),
  getLedgerWallet: () => ({ name: "Ledger" }),
  getSlopeWallet: () => ({ name: "Slope" }),
  getSolletExtensionWallet: () => ({ name: "SolletExtension" }),
};
if (typeof window !== "undefined") {
  WALLETS = require("@solana/wallet-adapter-wallets");
}
const network = NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork;

const App: React.FC = () => {
  const endpoint = useMemo(() => NEXT_PUBLIC_SOLANA_NETWORK == "mainnet" ? "https://orbital-lingering-pond.solana-mainnet.quiknode.pro/de5c3bde1794fe765c51fe13fc691f39921060db/" : "https://metaplex.devnet.rpcpool.com", []);

  const wallets = useMemo(
    () => [
      WALLETS.getPhantomWallet(),
      WALLETS.getSolflareWallet(),
      WALLETS.getSolletWallet({ network }),
      WALLETS.getLedgerWallet(),
      WALLETS.getSlopeWallet(),
      WALLETS.getSolletExtensionWallet({ network }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletBalanceProvider>
            <div>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/connect" element={<Admin />} />
              </Routes>
              <Footer />
              <Toaster />
            </div>
          </WalletBalanceProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
