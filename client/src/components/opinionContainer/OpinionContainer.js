import React, { useState, useEffect, useCallback } from "react";
import { Grid, TextField } from "@material-ui/core";
import Loader from "../../loader.gif";
import TruffleContract from "@truffle/contract";
import OpinionsContract from "../../contracts/Opinions.json";
import Opinion from "../opinion/Opinion.js";
import "./OpinionContainer.css";
import Button from "@material-ui/core/Button";
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

function OpinionContainer(props) {
  const classes = useStyles();
  const [state, setState] = useState({
    isDeployedOnNetwork: false,
    accounts: null,
    opinions: null,
    opinionCount: null,
    opinionContractInstance: null,
    netId: null,
  });
  const [loading, setLoading] = useState(true);
  const [textField, setTextField] = useState({
    error: "",
    value: "",
    isValid: true,
  });

  window.ethereum.on("accountsChanged", (accounts) => {
    setState({ ...state, accounts: accounts });
  });

  window.ethereum.on("chainChanged", (chainId) => {
    (async () => {
      const netId = await props.web3.eth.net.getId();
      if (OpinionsContract.networks[netId]) {
        setLoading(true);
        await loadBlockchainData(netId);
      } else setState({ ...state, isDeployedOnNetwork: false });
    })();
  });

  const loadBlockchainData = useCallback(
    async (netId) => {
      const opinionContract = TruffleContract(OpinionsContract);
      opinionContract.setProvider(props.web3.currentProvider);
      const opinionContractInstance = await opinionContract.deployed();
      const opinionCount = await opinionContractInstance.opinionCount();

      const opinions = [];
      for (let i = opinionCount.toNumber(); i > 0; i--) {
        const opinion = await opinionContractInstance.opinions(i);
        opinions.push({
          id: opinion.id,
          author: opinion.author,
          opinion: opinion.opinion,
        });
      }
      setState((prevState) => {
        return {
          ...prevState,
          netId: netId,
          opinions: opinions,
          opinionCount: opinionCount.toNumber(),
          isDeployedOnNetwork: true,
          opinionContractInstance: opinionContractInstance,
        };
      });
      setLoading(false);
    },
    [props.web3]
  );

  useEffect(() => {
    (async () => {
      const netId = await props.web3.eth.net.getId();
      if (OpinionsContract.networks[netId]) {
        await loadBlockchainData(netId);
      }
    })();
  }, [props.web3, loadBlockchainData]);

  const loadUserAccounts = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setState((prevState) => {
      return { ...prevState, accounts: accounts };
    });
  };

  const Opiniate = async () => {
    if (!textField.value.trim()) {
      setTextField({
        isValid: false,
        value: "",
        error: "Please enter your opinion",
      });
    }
    const tx = await state.opinionContractInstance.opiniate(
      textField.value.trim(),
      {
        from: state.accounts[0],
      }
    );
    if (tx) {
      setState((prevState) => {
        return {
          ...prevState,
          opinionCount: prevState.opinionCount + 1,
          opinions: [
            {
              id: prevState.opinionCount + 1,
              author: state.accounts[0],
              opinion: textField.value.trim(),
            },
            ...prevState.opinions,
          ],
        };
      });
      setTextField({ ...textField, value: "" });
    }
  };

  const handleChange = (e) => {
    setTextField({ value: e.target.value, error: "", isValid: true });
  };

  if (!loading) {
    if (state.isDeployedOnNetwork) {
      return (
        <Grid container direction="column">
          <Grid item className="userActionDisplay">
            {state.accounts ? (
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
              <Button
                className="buttonPrimary"
                onClick={() => loadUserAccounts()}
              >
                Connect to Ethereum
              </Button>
            )}
          </Grid>
          {state.opinions.map((op) => (
            <React.Fragment key={op.id}>
              <Opinion author={op.author} opinion={op.opinion} id={op.id} />
              <hr />
            </React.Fragment>
          ))}
        </Grid>
      );
    }
    return <div>Not deployed on the current network</div>;
  }
  return <img src={Loader} alt="loader" className="loader" />;
}

export default OpinionContainer;
