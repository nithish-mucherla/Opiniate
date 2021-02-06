import React from "react";
import { Grid } from "@material-ui/core";
import Identicon from "identicon.js";
import "./Opinion.css";
export default function Opinion(props) {
  return (
    <Grid
      container
      alignItems="center"
      justify="center"
      id={props.id}
      className="opinion"
    >
      <Grid item sm={3} />

      <Grid item xs={2} sm={2} className="identiconContainer">
        <img
          src={`data:image/png;base64,${new Identicon(
            props.author,
            30
          ).toString()}`}
          alt={props.author}
          className="identicon"
        />
      </Grid>
      <Grid item xs={10} sm={3}>
        <div className="author">{props.author}</div>
      </Grid>

      <Grid item sm={4} />

      <Grid item className="opinionText">
        {props.opinion}
      </Grid>
    </Grid>
  );
}
