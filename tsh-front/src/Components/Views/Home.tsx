/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
import { useState } from "react";
import { Button, Grid, Paper, Typography } from "@mui/material";
import { createStyles, makeStyles } from '@mui/styles';
import Stake from "./Stake";
import UnStake from "./Unstake"
import { useMediaQuery } from "react-responsive";

import Giraffe from "../assets/Jiraf.png";
import useWalletNfts from "../../hooks/use-wallet-nfts";
import useNftStake from "../../hooks/use-nft-stake";
import Loader from "../Loader/Loader";
import toast from 'react-hot-toast';
import ProgressBar from "../Loader/ProgressBar";
import StableBtnImage from "../assets/buttons/stable.png";
import StableAllBtnImage from "../assets/buttons/stableAll.png";
import StopStablingBtnImage from "../assets/buttons/stopStabling.png";
import StopStablingAllBtnImage from "../assets/buttons/stopStablingAll.png";
import ClaimBtnImage from "../assets/buttons/claim.png";

const useStyles = makeStyles(() => ({
  scrollbar: {
    "&::-webkit-scrollbar": {
      width: 7,
    },
    "&::-webkit-scrollbar-track": {
      marginTop: '10px',
      marginBottom: '10px',
      boxShadow: `inset 0 0 6px rgba(0, 0, 0, 0.3)`,
      borderRadius: '10px',
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "darkgrey",
      borderRadius: '10px',
      outline: `1px solid slategrey`,
    },
  },
}));

const Home = () => {
  const [showLoader, setShowLoader] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [unStackProductIds, setUnStackProduct] = useState<number[]>([]);
  const [stakedProductIds, setStakedProduct] = useState<number[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const {
    isLoading,
    claimAmount,
    claimedAmount,
    dailyReward,
    totalStakedNFT,
    stakeNftList,
    stakeNft,
    unStakeNft,
    claimRewards,
  } = useNftStake();
  const { isLoadingWalletNfts, staked_walletNfts, unstaked_walletNfts,  setStakedWalletNfts, setUnstakedWalletNfts, getWalletNfts } = useWalletNfts();
  const classes = useStyles();

  console.log(staked_walletNfts);
  console.log(unstaked_walletNfts);

  // handlers
  const handleUnstackProduct = (
    e: boolean,
    i: number
  ) => {
    if (e) {
      setUnStackProduct([...unStackProductIds, i]);
    } else {
      setUnStackProduct(unStackProductIds.filter((item) => item !== i));
    }
  };

  const handleStakedProduct = (
    e: boolean,
    i: number
  ) => {
    if (e) {
      setStakedProduct([...stakedProductIds, i]);
    } else {
      setStakedProduct(stakedProductIds.filter((item) => item !== i));
    }
  };

  const handleStake = async () => {
    if (unStackProductIds.length <= 0) {
      toast.error('Select NFTs, please.');
      return
    }
    setShowLoader(true);
    let stakeMode = 0;
    let staking_nfts = [];
    for (let i = 0; i < unStackProductIds.length; i++) {
      staking_nfts.push(unstaked_walletNfts[unStackProductIds[i]]);
    }
    var filtered = unstaked_walletNfts.filter(function (value, index, arr) {
      return (unStackProductIds.indexOf(index) === -1)
    });
    const res = await stakeNftList(stakeMode, staking_nfts);
    if (res === 1) {
      setUnStackProduct([]);
      setUnstakedWalletNfts(filtered);
      setStakedWalletNfts(staked_walletNfts.concat(staking_nfts));
    }
    setShowLoader(false);
  };

  const handleStakeAll = async () => {
    if (unstaked_walletNfts.length <= 0) {
      toast.error('No NFTs.');
      return;
    }
    setShowLoader(true);
    // setLoadingMessage("All Your NFTs are Staking..");
    let stakeMode = 0;
    const res = await stakeNftList(stakeMode, unstaked_walletNfts);
    if (res === 1) {
      setUnStackProduct([]);
      setStakedWalletNfts(staked_walletNfts.concat(unstaked_walletNfts));
      setUnstakedWalletNfts([]);
    }
    setShowLoader(false);
  };

  const handleUnStake = async () => {
    if (stakedProductIds.length <= 0) {
      toast.error('Select NFTs, please');
      return;
    }
    setShowLoader(true);
    // setLoadingMessage("Your NFT is Stop Stabling..");
    let unstaking_nfts = [];
    for (let i = 0; i < stakedProductIds.length; i++) {
      console.log(stakedProductIds[i] + " - " + i);
      unstaking_nfts.push(staked_walletNfts[stakedProductIds[i]]);
    }
    var filtered = staked_walletNfts.filter(function (value, index, arr) {
      return (stakedProductIds.indexOf(index) === -1)
    });

    const res = await unStakeNft(unstaking_nfts);
    if (res === 1) {
      setStakedProduct([]);
      setUnstakedWalletNfts(unstaked_walletNfts.concat(unstaking_nfts));
      setStakedWalletNfts(filtered);
    }
    setShowLoader(false);
  };

  const handleUnStakeAll = async () => {
    if (staked_walletNfts.length <= 0) {
      toast.error('No NFTs.');
      return;
    }
    setShowLoader(true);
    // setLoadingMessage("All Your NFTs are UnStaking..");
    const res = await unStakeNft(staked_walletNfts);
    if (res === 1) {
      setStakedProduct([]);
      setUnstakedWalletNfts(unstaked_walletNfts.concat(staked_walletNfts));
      setStakedWalletNfts([]);
    }
    setShowLoader(false);
  };

  const stopLoader = () => {
    setShowLoader(false);
    setLoadingMessage("");
    setRefreshFlag(!refreshFlag);
  };

  //Media Query
  const isTabletOrExtraMobile = useMediaQuery({ query: "(max-width: 900px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  return (
    <div>
      {(showLoader || isLoading || isLoadingWalletNfts) && <Loader text={loadingMessage} />}
      <ProgressBar bgcolor="#ef6c00" completed={totalStakedNFT * 100 / 10000} />
      <div style={{ margin: "30px auto" }}>
        <Paper
          style={{
            width: "85%",
            display: "flex",
            margin: "0px auto",
            borderRadius: "30px",
            padding: "25px 0px",
            backgroundColor: "rgba(255, 160, 224, 0.3)",
            borderWidth: "3px",
            borderStyle: "solid",
            borderColor: "rgba(0, 0, 0, 0.12)",
            alignItems: "center",
            justifyContent: "space-around",
            flexDirection: `${isMobile ? "column" : "row"}`,
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <Typography style={{ fontFamily: "Boorsok", fontSize: "22px" }}>Balance:</Typography>
            <Typography style={{ fontSize: "16px"}}>{claimAmount} HRSE Points</Typography>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <Typography style={{ fontFamily: "Boorsok", fontSize: "22px" }}>Rate:</Typography>
            <Typography style={{ fontSize: "16px"}}>{dailyReward} HRSE Points / Day</Typography>
          </div>

          <div>
            <Typography style={{ fontFamily: "Boorsok", fontSize: "22px" }}>Earned:</Typography>
            <Typography style={{ fontSize: "16px"}}>{claimedAmount} HRSE Points</Typography>
          </div>
        </Paper>
      </div>
      <Grid
        container
        style={{
          width: "85%",
          margin: "0px auto",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Staked Container */}
        <Grid item md={6}>
          <Grid
            className={classes.scrollbar}
            container
            style={{
              width: "97%",
              // margin: "0px auto",
              backgroundColor: "rgba(255, 160, 224, 0.3)",
              borderStyle: "solid",
              borderWidth: "3px",
              borderColor: "rgba(0, 0, 0, 0.1)",
              padding: "20px 0px",
              borderRadius: "20px",
              height: "650px",
              overflowY: "auto",
            }}
          >
            <Grid
              item
              md={12}
              xs={12}
              display={"flex"}
              justifyContent={"center"}
              style={{
                margin: "15px 0px",
                flexDirection: `${isMobile ? "column" : "row"}`,
                alignItems: "flex-start",
              }}
            >
              <Button
                style={{
                  borderRadius: "25px",
                  padding: 0,
                }}
                onClick={() => {
                  handleStake().then(() => {
                    stopLoader()
                  })
                }}
              >
                <img src={StableBtnImage} width="150" height="50" alt="folder"/>
              </Button>
              <Button
                style={{
                  borderRadius: "25px",
                  padding: 0,
                  marginLeft: "10px"
                }}
                onClick={() => {
                  handleStakeAll().then(() => {
                    stopLoader();
                  })
                }}
              >
                <img src={StableAllBtnImage} width="150" height="50" alt="folder"/>
              </Button>
            </Grid>
            {unstaked_walletNfts.length > 0 ? unstaked_walletNfts.map((nft, idx) => {
              return <Stake key={idx}
                selected={unStackProductIds.indexOf(idx) !== -1}
                nft={nft}
                index={idx}
                image={nft.image}
                name={nft.name}
                handleOrderCollect={handleUnstackProduct} />;
            }) : <div style={{
              padding: "3em 1em",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
              //backgroundColor: "lightblue",
              width: "100%",
              borderRadius: "10px",
              margin: "0 1em"
            }}>{!(showLoader || isLoading || isLoadingWalletNfts) && "No NFTs"}</div>}
          </Grid>
        </Grid>
        {/* Unstaked Container */}

        <Grid item md={6} style={{ marginTop: `${isMobile ? "20px" : "0px"}` }}>
          <Grid
            className={classes.scrollbar}
            container
            style={{
              width: "97%",
              // margin: "0px auto",
              backgroundColor: "rgba(255, 160, 224, 0.3)",
              borderStyle: "solid",
              borderWidth: "3px",
              borderColor: "rgba(0, 0, 0, 0.1)",
              padding: "20px 0px",
              borderRadius: "20px",
              height: "650px",
              overflowY: 'auto'
            }}
          >
            <Grid
              item
              md={12}
              xs={12}
              display={"flex"}
              justifyContent={"center"}
              style={{
                margin: "15px 0px",
                padding: "0px 30px",
                flexDirection: `${isMobile ? "column" : "row"}`,
                alignItems: "flex-start",
              }}
            >
              <Button
                style={{
                  borderRadius: "25px",
                  padding: 0,
                  marginLeft: "10px"
                }}
                onClick={() => {
                  handleUnStake().then(() => {
                    stopLoader();
                  })
                }}
              >
              <img src={StopStablingBtnImage} width="150" height="50" alt="folder"/>
            </Button>
              <Button
                style={{
                  borderRadius: "25px",
                  padding: 0,
                  marginLeft: "10px"
                }}
                onClick={() => {
                  handleUnStakeAll().then(() => {
                    stopLoader()
                  })
                }}
              >
                <img src={StopStablingAllBtnImage} width="150" height="50" alt="folder"/>
              </Button>
              <Button
                style={{
                  borderRadius: "25px",
                  padding: 0,
                  marginLeft: "10px"
                }}
                onClick={() => {
                  setShowLoader(true);
                  // setLoadingMessage("Claiming");
                  claimRewards().then(() => {
                    stopLoader()
                  })
                }}
              >
                <img src={ClaimBtnImage} width="150" height="50" alt="folder"/>
              </Button>
            </Grid>
            {staked_walletNfts.length > 0 ? staked_walletNfts.map((nft, idx) => {
              return <UnStake key={idx}
                selected={stakedProductIds.indexOf(idx) !== -1}
                nft={nft}
                index={idx}
                image={nft.image}
                name={nft.name}
                handleOrderCollect={handleStakedProduct} />;
            }) : <div style={{
              padding: "3em 1em",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
              //backgroundColor: "lightblue",
              width: "100%",
              borderRadius: "10px",
              margin: "0 1em",
            }}>{!(showLoader || isLoading || isLoadingWalletNfts) && "No NFTs"}</div>}
          </Grid>
        </Grid>
      </Grid>
      <div style={{ position: "relative" }}>
        <Grid
          container
          style={{
            width: "85%",
            display: "flex",
            margin: "20px auto",
            borderRadius: "30px",
            padding: "60px 30px",
            backgroundColor: "rgba(255, 160, 224, 0.3)",
            borderStyle: "solid",
            borderWidth: "3px",
            borderColor: "rgba(0, 0, 0, 0.12)",
            position: "relative",
          }}
        >
          <Grid item md={8} xs={12} >
            <Typography
              style={{ color: "#000", fontSize: "22px", fontFamily: "Boorsok" }}
            >
              Stabling Rewards:
            </Typography>
            <br />
            <li>Normal TSH NFT - 24 HRSE Points per day</li>
            <br />
            <li>Epically Stupid TSH NFT - 80 HRSE Points per day</li>
            <br />
            <br />

            <Typography
              style={{ color: "#000", fontSize: "22px", fontFamily: "Boorsok" }}
            >
              Tower Multipliers (for normal TSH NFTs):
            </Typography>
            <br />
            <li>
            Standard Tower - For every 4 TSH NFTs stabled, a multiplier of 1.5 will be applied.
            4 x 24 x 1.5 = 144 HRSE Points Daily
            </li>
            <br />
            <li>
            Tall Tower - For every 6 TSH NFTs stabled, a multiplier of 1.75 will be applied.
            6 x 24 x 1.75 = 252 HRSE Points Daily
            </li>
            <br />
            <li>
            Savanna Tower - For every 8 TSH NFTs stabled, a multiplier of 2 will be applied.
            8 x 24 x 2 = 384 HRSE Points Daily
            </li>
          </Grid>
          {!isTabletOrExtraMobile && (
            <img
              src={Giraffe}
              style={{
                position: "absolute",
                height: "360px",
                bottom: "0px",
                right: "0px",
              }}
            />
          )}
        </Grid>
      </div>
    </div >
  );
};

export default Home;
