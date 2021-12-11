import React, {Component, ReactElement} from "react";
import ServiceSettings from "../../service/settings";
import {Button} from "@material-ui/core";
import {logout} from "./auth";
import {ROLES} from "../../service/roles";
import {User} from "../../service/user";
import AlertPanel, {AlertSeverity} from "../common/alert";
import {i} from "../../locale";

export interface AccountProps {
  user: User;
}

export default class Account extends Component<AccountProps> {
  async logout(): Promise<void> {
    logout();
  }

  render(): ReactElement {
    const {user} = this.props;
    return (
      <div className="page">
        <section>
          <h2>Information</h2>
          <dl>
            <dt>User</dt>
            <dd>{user.email}</dd>
          </dl>
        </section>
        <section>
          <h2>Roles</h2>
          {user.roles.length === 0 && <p>You don`t have any specific role.</p>}
          {user.roles.length > 0 && (
            <dl>
              {user.roles.map((role) => {
                return (
                  <React.Fragment key={role}>
                    <dt>{ROLES[role as keyof typeof ROLES].displayName}</dt>
                    <dd>{ROLES[role as keyof typeof ROLES].description}</dd>
                  </React.Fragment>
                );
              })}
            </dl>
          )}
        </section>
        {ServiceSettings.authEnabled === false && (
          <AlertPanel
            title={i().Info.NoAuthModeTitle}
            message={i().Info.NoAuthModeDescription}
            severity={AlertSeverity.info}
          />
        )}
        {ServiceSettings.authEnabled && (
          <section className="log-out-region">
            <Button onClick={() => this.logout()}>Sign-out</Button>
          </section>
        )}
      </div>
    );
  }
}

export function getAccountPage(user: User): () => ReactElement {
  return (): ReactElement => <Account user={user} />;
}
