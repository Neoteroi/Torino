import React, {Component, ReactElement} from "react";
import {UserContext} from "../app/user-context";
import {User} from "../../service/user";

export interface AuthProps {
  role: string;
}

export default class Auth extends Component<AuthProps> {
  satisfied(user: User): boolean {
    return user.can(this.props.role);
  }

  render(): ReactElement {
    return (
      <UserContext.Consumer>
        {(user) =>
          this.satisfied(user) && (
            <React.Fragment>{this.props.children}</React.Fragment>
          )
        }
      </UserContext.Consumer>
    );
  }
}
