import getMuiTheme from "./components/theme";
import Layout from "./components/app/layout";
import React from "react";
import {CssBaseline, ThemeProvider} from "@material-ui/core";
import {ServicesContextView} from "./components/app/services-context";
import "./styles/global.scss";
import {LocaleContextView} from "./components/app/locale-context";
import {vocabulary} from "./locale";
import {UserContext, UserContextView} from "./components/app/user-context";

function App(): React.ReactElement {
  return (
    <ThemeProvider theme={getMuiTheme(false)}>
      <CssBaseline />
      <LocaleContextView locale={vocabulary}>
        <ServicesContextView>
          <UserContextView>
            <UserContext.Consumer>
              {(user) => <Layout user={user} />}
            </UserContext.Consumer>
          </UserContextView>
        </ServicesContextView>
      </LocaleContextView>
    </ThemeProvider>
  );
}

export default App;
