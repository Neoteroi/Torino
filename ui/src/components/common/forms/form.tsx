import React, {Component, ReactElement} from "react";
import Loader from "../loader";
import ErrorPanel from "../error";
import {ApplicationError} from "../../../common/errors";

export interface FormProps {
  id?: string;
  className?: string;
  waiting: boolean;
  error?: ApplicationError | null;
  onSubmit: () => void;
  dismissError?: () => void;
}

export default class Form extends Component<FormProps> {
  onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    // note: this is used to conveniently support form submission when
    // the user clicks ENTER
    event.preventDefault();
    event.stopPropagation();
    this.props.onSubmit();
  }

  render(): ReactElement {
    const {id, className, children, error, waiting, dismissError} = this.props;

    return (
      <div id={id} className={className}>
        {waiting && <Loader className="overlay" />}
        <form onSubmit={this.onSubmit.bind(this)}>{children}</form>
        {error && <ErrorPanel error={error} dismiss={dismissError} />}
      </div>
    );
  }
}
