import React, {Component, ReactElement} from "react";
import {User, RootUser} from "../../service/user";
import {hasStoredToken, userFromStorage, loginSilent} from "./auth";
import Login from "./login";
import ServiceSettings from "../../service/settings";

export const UserContext = React.createContext<User>(new User());

interface UserContextState {
  user: User | null;
  waiting: boolean;
}

function getInitialUser(): User | null {
  if (!ServiceSettings.authEnabled) {
    // The SPA is configured to use an API that does not use authentication or
    // authorization.
    // When authentication and authorization are disabled, the application can
    // be run in express mode, which requires only a storage account connection
    // string and nothing more.
    // A valid use case for this is when a docker container is started locally,
    // configuring only a storage connection string. This provides gallery
    // and virtual file system functionalities, with the help of a SQLite db.
    return new RootUser();
  }
  return userFromStorage();
}

export class UserContextView extends Component<unknown, UserContextState> {
  constructor(props: unknown) {
    super(props);

    const user = getInitialUser();

    if (user !== null && user.isExpired()) {
      // try to obtain a token silently, if there is the possibility
      if (hasStoredToken()) {
        this.trySilentLogin(user);
      }

      this.state = {
        user: null,
        waiting: true,
      };
      return;
    }

    this.state = {
      user,
      waiting: false,
    };
  }

  trySilentLogin(user: User): void {
    const hint = user.options?.preferred_username;

    if (!hint) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state = {
        user: null,
        waiting: false,
      };
      return;
    }
    loginSilent(hint).then(
      (user) => {
        // eslint-disable-next-line no-console
        console.info("Obtained a new token silently");
        this.setState({
          user,
          waiting: false,
        });
      },
      () => {
        this.setState({
          waiting: false,
        });
      }
    );
  }

  onLogin(user: User): void {
    this.setState({
      user,
    });
  }

  render(): ReactElement {
    const {user, waiting} = this.state;

    if (waiting) {
      return <></>;
    }

    if (user === null) {
      return <Login onLogin={(user) => this.onLogin(user)} />;
    }

    return (
      <UserContext.Provider value={user}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}
