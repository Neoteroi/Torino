import React, {Component, ReactElement} from "react";
import {User} from "../../service/user";
import {ROLES} from "../../service/roles";
import {Button} from "@material-ui/core";
import {logout} from "./auth";

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
            <dt>Email</dt>
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
        <section className="log-out-region">
          <Button onClick={() => this.logout()}>Sign-out</Button>
        </section>
      </div>
    );
  }
}

export function getAccountPage(user: User): () => ReactElement {
  return (): ReactElement => <Account user={user} />;
}
