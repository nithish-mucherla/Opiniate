import React, { useState, useEffect, useCallback } from "react";
import { Grid, TextField } from "@material-ui/core";
import Loader from "../../loader.gif";
import TruffleContract from "@truffle/contract";
import OpinionsContract from "../../contracts/Opinions.json";
import Opinion from "../opinion/Opinion.js";
import "./OpinionContainer.css";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import "../../App.css";

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
  const [error, setError] = useState("");
  window.ethereum.on("accountsChanged", (accountss) => {
    setState((prevState) => {
      return { ...prevState, accounts: accountss.length ? accountss : null };
    });
  });

  window.ethereum.on("chainChanged", (chainId) => {
    (async () => {
      try {
        const netId = await props.web3.eth.net.getId();
        console.log("hi");
        setLoading(true);
        if (OpinionsContract.networks[netId]) {
          try {
            await loadBlockchainData(netId);
          } catch (err) {
            setError("Unable to process the blockchain data, try again later.");
          }
        } else {
          setState({ ...state, isDeployedOnNetwork: false });
        }
        setLoading(false);
      } catch (err) {
        setError(
          "Unable to connect to the selected network, try switching to other networks."
        );
      }
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
      try {
        const netId = await props.web3.eth.net.getId();
        if (OpinionsContract.networks[netId]) {
          try {
            await loadBlockchainData(netId);
          } catch (err) {
            setError("Unable to process the blockchain data, try again later.");
          }
        } else {
          setState((prevState) => {
            return { ...prevState, isDeployedOnNetwork: false };
          });
          setLoading(false);
        }
      } catch (err) {
        setError(
          `Unable to detect any default local-networks. Please switch to other network and refresh the page`
        );
        setLoading(false);
      }
    })();
  }, [props.web3, loadBlockchainData]);

  const loadUserAccounts = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setState((prevState) => {
        return { ...prevState, accounts: accounts };
      });
    } catch (err) {
      setError(err.message);
      setState((prevState) => {
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
      const tx = await state.opinionContractInstance.opiniate(
        textField.value.trim(),
        {
          from: state.accounts[0],
        }
      );
      console.log(tx);
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
    } catch (error) {
      setError(
        `Unable to publish the opinion, try again later. ${error.message}`
      );
    }
  };

  const handleChange = (e) => {
    setTextField({ value: e.target.value, error: "", isValid: true });
  };

  if (!loading) {
    if (error) return <div className="helperText">{error}</div>;
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
    return (
      <div className="helperText">
        Smart contract not deployed on the current network! Try switching to
        other networks.
      </div>
    );
  }
  return <img src={Loader} alt="loader" className="loader" />;
}

export default OpinionContainer;
