/* eslint-disable jsx-a11y/alt-text */
import { Grid } from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useMediaQuery } from "react-responsive";
import { WalletMultiButton, } from "@solana/wallet-adapter-react-ui";
import WalletBtnImg from '../assets/buttons/connectWallet.png';
import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
const Navbar = () => {
  //Media Quearry
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 950px)" });
  const { publicKey, wallet, disconnect } = useWallet();
  const base58 = useMemo(() => publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58(), [publicKey]);
  const content = useMemo(() => {
    if (!wallet || !base58)
      return null;
    return base58.slice(0, 4) + '..' + base58.slice(-4);
  }, [wallet, base58]);

  return (
    <div>
      <Grid
        container
        justifyContent={"space-between"}
        alignItems={"center"}
        style={{
          padding: "0px 40px",
          background: "rgba(255, 255, 255, 0.26)",
          height: "100px",
          boxShadow: "0px 2px 26px rgba(241, 58, 234, 0.08)",
          width: "90%",
          margin: "0px auto",
          borderWidth: "3px",
          borderStyle: "solid",
          borderColor: "rgba(0, 0, 0, 0.12)",
          borderRadius: "30px",
        }}
      >
        <Grid item xs={3}>
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            <img src={logo} height={"80px"} />
          </Link>
        </Grid>
        {/* {!isTabletOrMobile && (
          <Grid item md={6} className="navbar">
            <li>
              <Link to={""}>Lore</Link>
            </li>
            <li>
              <Link to={""}>Roadmap</Link>
            </li>
            <li>
              <Link to={""}>Team</Link>
            </li>
            <li>
              <Link to={""}>FAQ</Link>
            </li>
            <li>
              <Link to={""}>Stupid Declaration</Link>
            </li>
          </Grid>
        )} */}
        <Grid
          item
          xs={3}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Link style={{ color: "#fff", textDecoration: "none" }} to={""}>
            {/* <Button
              style={{
                background: "#60deff",
                border: "3px solid #fd89ea",
                padding: "2px 10px",
                fontSize: "18px",
                textTransform: "uppercase",
                fontWeight: "bold",
                color: "#000",
                fontFamily: "",
                lineHeight: "20px",
              }}
            >
              Connect <br />
              wallet

            <WalletMultiButton style={{
              background: "#60deff",
              border: "3px solid #fd89ea",
              padding: "2px 10px",
              fontSize: "30px",
              textTransform: "uppercase",
              color: "#000",
              fontFamily: "Boorsok",
              lineHeight: "1",
            }} className="wallet-btn" />

            </Button> */}
            <WalletMultiButton className="wallet-btn"
              style={{ background: 'transparent' }}
            >
              {wallet ? content : <img src={WalletBtnImg} style={{ width: 150 }} />}
            </WalletMultiButton>
          </Link>
        </Grid>
      </Grid>
    </div>
  );
};

export default Navbar;
