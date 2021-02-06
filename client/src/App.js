import React, { useState } from "react";
import getWeb3 from "./getWeb3";
import { Grid } from "@material-ui/core";
import Loader from "./loader.gif";

import "./App.css";
import OpinionContainer from "./components/opinionContainer/OpinionContainer";

const App = (props) => {
  const [state, setState] = useState({ web3: null });
  (async () => {
    const web3 = await getWeb3();
    setState({ web3: web3 });
  })();

  const Content = () => {
    if (window.ethereum) {
      return state.web3 ? (
        <OpinionContainer web3={state.web3} />
      ) : (
        <img src={Loader} alt="loader" />
      );
    }
    return <div>Install Metamask or other dapp browsers</div>;
  };
  return (
    <Grid container className="App">
      <Grid item xs={1} />
      <Grid item container xs={10}>
        <Grid item className="headerContainer" xs={12}>
          <h1 className="header">Opiniate</h1>
          <div className="caption">{`<Stay Anonymous>`}</div>
        </Grid>
        <Grid item xs={12}>
          <Content />
        </Grid>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
};

export default App;
