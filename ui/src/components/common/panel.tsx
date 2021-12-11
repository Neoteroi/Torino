/**
 * Common component for loadable partial view,
 * with support for loading / error views.
 */
import React, {Component, ReactElement} from "react";
import Loader from "./loader";
import ErrorPanel from "./error";
import {ApplicationError} from "../../common/errors";

export interface PanelProps {
  loading: boolean;
  loaderClassName?: string;
  error?: ApplicationError | null;
  dismissError?: () => void;
  load?: () => void;
}

export default class Panel extends Component<PanelProps> {
  componentDidMount(): void {
    const props = this.props;
    if (props.loading && !props.error) {
      // enable automatic loading
      if (props.load) {
        props.load();
      }
    }
  }

  render(): ReactElement {
    const {
      children,
      error,
      dismissError,
      loading,
      loaderClassName,
    } = this.props;

    if (loading && !error) {
      return <Loader className={loaderClassName} />;
    }

    if (error) {
      return <ErrorPanel error={error} dismiss={dismissError} />;
    }

    return <React.Fragment>{children}</React.Fragment>;
  }
}
