import { useState } from "react";
import { Button, Grid } from "@mui/material";
import "react-dropdown/style.css";
import { AiOutlinePlus } from "react-icons/ai";
import HelperDropdown from "./HelperDropdown";

const RewardStaking = () => {
  //Add More Function
  const [add, setAdd] = useState([{ id: 0 }, { id: 1 }]);

  const Addmore = () => {
    setAdd([...add, { id: add.length }]);
  };
  // Remove Function
  const removeTodo = (ind: any) => {
    const remove = add.filter((todo) => {
      return todo.id !== ind;
    });
    setAdd(remove);
  };
  return (
    <Grid
      item
      style={{
        width: "80%",
        display: "block",
        margin: "20px auto",
        background:
          "linear-gradient(90deg, rgba(70, 165, 255, 0.26) 0%, rgba(74, 176, 255, 0.1976) 0%, rgba(198, 40, 247, 0.2132) 104.87%)",
        borderRadius: "15px",
        padding: "10px 20px",
      }}
    >
      {add.map((val, ind) => {
        return <HelperDropdown removeTodo={removeTodo} ind={ind} />;
      })}
      <Grid
        item
        style={{
          display: "flex",
          justifyContent: "end",
          padding: "20px 0px",
        }}
      >
        <Button
          style={{
            color: "#fff",
            background: "rgba(255, 255, 255, 0.36)",
            borderRadius: "46px",
            padding: "8px 20px",
          }}
        >
          Save
        </Button>
        <Button
          style={{
            color: "#fff",
            background:
              "linear-gradient(90deg, #46A5FF 0%, rgba(74, 176, 255, 0.76) 0%, rgba(198, 40, 247, 0.82) 104.87%)",
            borderRadius: "46px",
            padding: "8px 20px",
            marginLeft: "10px",
          }}
          onClick={Addmore}
        >
          <AiOutlinePlus />
          Add More
        </Button>
      </Grid>
    </Grid>
  );
};

export default RewardStaking;
