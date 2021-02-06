import React, { useState, useEffect, useCallback } from "react";
import { Grid } from "@material-ui/core";
import Loader from "../../loader.gif";
import TruffleContract from "@truffle/contract";
import OpinionsContract from "../../contracts/Opinions.json";
import Opinion from "../opinion/Opinion.js";

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

  if (!loading) {
    if (state.isDeployedOnNetwork) {
      return (
        <Grid container direction="column">
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
