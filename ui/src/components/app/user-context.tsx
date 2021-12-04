import React, {Component, ReactElement} from "react";
import {User} from "../../service/user";
import {hasStoredToken, userFromStorage, loginSilent} from "./auth";
import Login from "./login";

export const UserContext = React.createContext<User>(new User());

interface UserContextState {
  user: User | null;
  waiting: boolean;
}

export class UserContextView extends Component<unknown, UserContextState> {
  constructor(props: unknown) {
    super(props);

    const user = userFromStorage();

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
