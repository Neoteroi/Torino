import React, {Component, ReactElement} from "react";
import {User} from "../../service/user";
import {ROLES} from "../../service/roles";

export interface AccountProps {
  user: User;
}

export default class Account extends Component<AccountProps> {
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
                  <>
                    <dt>{ROLES[role as keyof typeof ROLES].displayName}</dt>
                    <dd>{ROLES[role as keyof typeof ROLES].description}</dd>
                  </>
                );
              })}
            </dl>
          )}
        </section>
      </div>
    );
  }
}

export function getAccountPage(user: User): () => ReactElement {
  return (): ReactElement => <Account user={user} />;
}
