import AlertPanel, {AlertSeverity} from "../common/alert";
import React, {Component, ReactElement} from "react";
import ServiceSettings from "../../service/settings";
import {i} from "../../locale";
import {logout} from "./auth";

export default class About extends Component {
  async logout(): Promise<void> {
    logout();
  }

  render(): ReactElement {
    return (
      <div className="page">
        <section>
          <h2>About</h2>
          <dl>
            <dt>{i().Info.SystemVersion}</dt>
            <dd>0.0.1</dd>
            <dt>Repository</dt>
            <dd>
              <a href="https://github.com/Neoteroi/Torino">
                https://github.com/Neoteroi/Torino
              </a>
            </dd>
            <dt>API URL</dt>
            <dd>{ServiceSettings.apiURL}</dd>
          </dl>
          <br />
          {ServiceSettings.authEnabled === false && (
            <AlertPanel
              title={i().Info.NoAuthModeTitle}
              message={i().Info.NoAuthModeDescription}
              severity={AlertSeverity.info}
            />
          )}
        </section>
      </div>
    );
  }
}

export function getAboutPage(): () => ReactElement {
  return (): ReactElement => <About />;
}
