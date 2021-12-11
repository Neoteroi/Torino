import HighlightOff from "@material-ui/icons/HighlightOff";
import React, {Component, ReactElement} from "react";
import {iconBySeverity} from "./alert";
import {ApplicationError, ErrorDetails} from "../../common/errors";
import {Button} from "@material-ui/core";
import {reprError} from "./errors-repr";

export interface ErrorProps {
  error: ApplicationError | any;
  dismiss?: () => void;
}

function reprDetails(data: ErrorDetails | string) {
  if (typeof data === "string") {
    return data;
  }

  return JSON.stringify(data, undefined, 2);
}

export default class ErrorPanel extends Component<ErrorProps> {
  render(): ReactElement {
    const {error, dismiss} = this.props;

    let details = "";
    const {title, message, severity} = reprError(error);

    if (error instanceof ApplicationError && error.data) {
      details = reprDetails(error.data);
    }

    const retry = error.retry;

    return (
      <div className={"alert-panel alert-" + severity}>
        <div className="alert">
          <div className="icon-wrapper">{iconBySeverity(severity)}</div>
          <h2>{title}</h2>
          {dismiss !== undefined ? (
            <Button
              title="Dismiss"
              onClick={() => dismiss()}
              className="dismiss-btn"
            >
              <HighlightOff />
            </Button>
          ) : (
            <React.Fragment></React.Fragment>
          )}
          <p>{message}</p>
          {details && <pre>{details}</pre>}
          {retry !== undefined ? (
            <Button
              className="btn btn-default"
              onClick={() => retry()}
              color="secondary"
            >
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
}
