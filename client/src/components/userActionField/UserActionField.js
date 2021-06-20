import React, { useState } from "react";
import { Grid, TextField } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import "./UserActionField.css";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    "& label.Mui-focused": {
      color: "#ffffff",
      fontFamily: "Lato",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#ffffff",
      fontFamily: "Lato",
    },
  },
});

const UserActionField = (props) => {
  const classes = useStyles();
  const [textField, setTextField] = useState({
    error: "",
    value: "",
    isValid: true,
  });

  const handleChange = (e) => {
    setTextField({ value: e.target.value, error: "", isValid: true });
  };

  const loadUserAccounts = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      props.setState((prevState) => {
        return { ...prevState, accounts: accounts };
      });
    } catch (err) {
      props.setError(err.message);
      props.setState((prevState) => {
        return { ...prevState, accounts: null };
      });
    }
  };

  const Opiniate = async () => {
    if (!textField.value.trim()) {
      setTextField({
        isValid: false,
        value: "",
        error: "Please enter your opinion",
      });
      return;
    }
    try {
      const tx = await props.opinionContractInstance.opiniate(
        textField.value.trim(),
        {
          from: props.accounts[0],
        }
      );
      console.log(tx);
      props.setState((prevState) => {
        return {
          ...prevState,
          opinionCount: prevState.opinionCount + 1,
          opinions: [
            {
              id: prevState.opinionCount + 1,
              author: props.accounts[0],
              opinion: textField.value.trim(),
            },
            ...prevState.opinions,
          ],
        };
      });
      setTextField({ ...textField, value: "" });
    } catch (error) {
      props.setError(
        `Unable to publish the opinion, try again later. ${error.message}`
      );
    }
  };

  return (
    <Grid item className="userActionDisplay">
      {props.accounts ? (
        <>
          <TextField
            label="Your Opinion"
            multiline
            rows={4}
            value={textField.value}
            onChange={(e) => handleChange(e)}
            error={!textField.isValid}
            helperText={textField.error}
            className={classes.root}
          />
          <br />
          <br />
          <Button className="buttonPrimary" onClick={() => Opiniate()}>
            publish
          </Button>
        </>
      ) : (
        <Button className="buttonPrimary" onClick={() => loadUserAccounts()}>
          Connect to Ethereum
        </Button>
      )}
    </Grid>
  );
};

export default UserActionField;
