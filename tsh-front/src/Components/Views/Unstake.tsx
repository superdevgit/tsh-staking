/* eslint-disable jsx-a11y/alt-text */
import { useState } from "react";
import { Grid, Typography } from "@mui/material";

import Ring from "../assets/Ring.png";
import SelectedRing from "../assets/SelectedRing.png";
import { useMediaQuery } from "react-responsive";


interface UnStakeInterface {
  image: any;
  name: string;
  index: number;
  selected: boolean;
  nft: any;
  handleOrderCollect: (
    e: boolean,
    i: number
  ) => void;
}

const UnStake = (props: UnStakeInterface) => {
  const [select, setSelect] = useState(props.selected);
  //Media Query
  const isTabletOrExtraMobile = useMediaQuery({ query: "(max-width: 900px)" });

  return (
    <Grid
      item
      xl={3}
      lg={4}
      md={6}
      sm={6}
      xs={12}
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "30px",
        cursor: "pointer",
      }}
      key={props.index}
      onClick={() => {
        props.handleOrderCollect(!select, props.index);
        setSelect(!select)
      }}
    >
      <div
        style={{
          backgroundImage: `url(${props.image})`,
          backgroundColor: "rgba(85, 69, 69, 0.5)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "100% 100%",
          position: "relative",
          // paddingRight: "10px",
          width: `${isTabletOrExtraMobile ? "220px" : "150px"}`,
          height: `${isTabletOrExtraMobile ? "245px" : "165px"}`,
          borderTopRightRadius: "30px",
          borderBottomLeftRadius: "30px",
          borderTopLeftRadius: "5px",
        }}
      >
        <div style={{ position: "relative" }}>
          <img
            src={!props.selected ? Ring : SelectedRing}
            height={"20px"}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginLeft: "10px",
              marginTop: "10px",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            background: "rgba(28, 41, 48, 0.56)",
            width: "100%",
            bottom: "0px",
            borderTopLeftRadius: "0px",
            borderBottomLeftRadius: "30px",
            padding: "5px 0px",
          }}
        >
          <Typography
            style={{
              color: "#fff",
              marginLeft: "10px",
              textAlign: "center",
            }}
          >
            {props.name}
          </Typography>
        </div>
      </div>
    </Grid>
  );
};

export default UnStake;
