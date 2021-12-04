import {Button} from "@material-ui/core";
import React, {Component, ReactElement} from "react";

export interface ConfirmButtonsProps {
  cancel: () => void;
  confirm: () => void;
}

export default class ConfirmButtons extends Component<ConfirmButtonsProps> {
  render(): ReactElement {
    return (
      <div className="form-buttons">
        <Button
          onClick={() => this.props.cancel()}
          autoFocus
          className="cancel-button"
        >
          Cancel
        </Button>
        <Button type="submit" className="confirm-button" color="secondary">
          Confirm
        </Button>
      </div>
    );
  }
}
