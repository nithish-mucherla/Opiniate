import React, { useState, useEffect, useCallback } from "react";
import { Grid } from "@material-ui/core";
import Loader from "../../loader.gif";
import TruffleContract from "@truffle/contract";
import OpinionsContract from "../../contracts/Opinions.json";

function OpinionContainer(props) {
  const [state, setState] = useState({
    isDeployedOnNetwork: false,
    accounts: null,
    opinons: null,
    opinonCount: null,
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
      }
      setState((prevState) => {
        return {
          ...prevState,
          netId: netId,
          opinions: opinions,
          opinionCount: opinionCount.toNumber(),
          isDeployedOnNetwork: true,
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
      return <div>opinions</div>;
    }
    return <div>Not deployed on the current network</div>;
  }
  return <img src={Loader} alt="loader" />;
}

export default OpinionContainer;
