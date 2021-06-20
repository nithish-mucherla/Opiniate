import React, { useState, useEffect, useCallback } from "react";
import { Grid } from "@material-ui/core";
import Loader from "../../loader.gif";
import TruffleContract from "@truffle/contract";
import OpinionsContract from "../../contracts/Opinions.json";
import Opinion from "../opinion/Opinion.js";
import "./OpinionContainer.css";
import "../../App.css";
import UserActionField from "../userActionField/UserActionField";

function OpinionContainer(props) {
  const [state, setState] = useState({
    isDeployedOnNetwork: false,
    accounts: null,
    opinions: null,
    opinionCount: null,
    opinionContractInstance: null,
    netId: null,
  });
  const [loading, setLoading] = useState(true);
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

  if (!loading) {
    if (error) return <div className="helperText">{error}</div>;
    if (state.isDeployedOnNetwork) {
      return (
        <Grid container direction="column">
          <UserActionField
            accounts={state.accounts}
            setError={setError}
            setState={setState}
            opinionContractInstance={state.opinionContractInstance}
          />
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
