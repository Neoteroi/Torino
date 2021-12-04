import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import React, {ReactElement} from "react";
import {login} from "./auth";
import {User} from "../../service/user";

export interface LoginProps {
  onLogin: (user: User) => void;
}

export default class Login extends React.Component<LoginProps> {
  onLoginClick(): void {
    login().then((user) => {
      this.props.onLogin(user);
    });
  }

  render(): ReactElement {
    return (
      <Grid container component="main" className="login-screen">
        <CssBaseline />
        <Grid item xs={false} sm={4} md={7} className="login-image" />
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
        >
          <div className="login-paper jss3">
            <div className="login-form">
              <Button variant="contained" onClick={() => this.onLoginClick()}>
                Sign in
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
    );
  }
}
