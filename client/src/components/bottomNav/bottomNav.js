import React from "react";
import { Grid, IconButton } from "@material-ui/core";
import {
  Facebook,
  GitHub,
  Instagram,
  Language,
  LinkedIn,
} from "@material-ui/icons";
import "./bottomNav.css";

function BottomNav(props) {
  return (
    <>
      <Grid container justify="center" className="bottomNav">
        <Grid item>
          <IconButton>
            <a href="https://www.instagram.com/nithish_msn/" rel="noopener">
              <Instagram color="action" />
            </a>
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton>
            <a href="https://www.facebook.com/nithu.mucherla" rel="noopener">
              <Facebook color="action" />
            </a>
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton>
            <a
              href="https://www.linkedin.com/in/sai-nithish-mucherla"
              rel="noopener"
            >
              <LinkedIn color="action" />
            </a>
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton>
            <a href="https://github.com/nithish-mucherla" rel="noopener">
              <GitHub color="action" />
            </a>
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton>
            <a href="https://www.nithish-mucherla.tech" rel="noopener">
              <Language color="action" />
            </a>
          </IconButton>
        </Grid>
      </Grid>
      <Grid container justify="center">
        <p className="credits">Made with &#9829; by Nithish Mucherla</p>
      </Grid>
    </>
  );
}

export default BottomNav;
