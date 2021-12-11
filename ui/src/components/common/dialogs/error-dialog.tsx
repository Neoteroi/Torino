import React, {Component, ReactElement} from "react";
import {reprError} from "../errors-repr";
import GenericDialog from "./generic-dialog";

export interface ErrorDialogProps {
  error: any;
  close: () => void;
}

export default class ErrorDialog extends Component<ErrorDialogProps> {
  render(): ReactElement {
    const info = reprError(this.props.error);
    return (
      <GenericDialog
        title={info.title}
        className={info.severity}
        buttons={[
          {
            id: "close",
            label: "Close",
            onClick: () => {
              this.props.close();
            },
          },
        ]}
        open={true}
        description={info.message}
        close={() => {
          this.props.close();
        }}
      />
    );
  }
}
